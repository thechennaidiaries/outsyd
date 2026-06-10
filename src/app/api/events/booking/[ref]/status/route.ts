/**
 * GET /api/events/booking/[ref]/status
 *
 * Polling endpoint used by the return page to check booking confirmation.
 *
 * If payment_status is still 'pending', we query Cashfree directly and
 * confirm the booking inline using a direct DB update (service role key,
 * no RPC needed). Also sends WhatsApp confirmation — the webhook fallback
 * for sandbox where Cashfree webhooks don't fire reliably.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyCashfreeOrder } from '@/lib/payment/cashfree'
import { sendWhatsApp } from '@/lib/wasender'

// ── WhatsApp message templates (same as webhook) ──────────────────────────────

function customerEventConfirmation(b: {
    bookingRef: string; eventTitle: string; eventDate: string
    eventVenue?: string; tierTitle?: string; quantity?: number; amountPaid: number
    tickets?: Array<{ tierTitle: string; quantity: number }>
}): string {
    const date = new Date(b.eventDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const amount = `₹${(b.amountPaid / 100).toLocaleString('en-IN')}`

    const ticketDetails = b.tickets && b.tickets.length > 0
        ? b.tickets.map(t => `• ${t.tierTitle} × ${t.quantity}`).join('\n')
        : `• ${b.tierTitle} × ${b.quantity}`

    return [
        `🎟 *Booking Confirmed — Outsyd*`,
        ``,
        `Hey! Your tickets are booked. See you there! 🎉`,
        ``,
        `*Event:* ${b.eventTitle}`,
        `*Date:* ${date}`,
        b.eventVenue ? `*Venue:* ${b.eventVenue}` : null,
        ``,
        `*Tickets:*`,
        ticketDetails,
        ``,
        `*Amount Paid:* ${amount}`,
        ``,
        `*Booking Ref:* ${b.bookingRef}`,
        ``,
        `_Show this message at the venue if asked. — Outsyd_`,
    ].filter(Boolean).join('\n')
}

function opsEventNotification(b: {
    bookingRef: string; eventTitle: string; eventDate: string
    eventVenue?: string; tierTitle?: string; quantity?: number; amountPaid: number
    customerName: string; customerPhone: string
    tickets?: Array<{ tierTitle: string; quantity: number }>
}): string {
    const date = new Date(b.eventDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
    const amount = `₹${(b.amountPaid / 100).toLocaleString('en-IN')}`

    const ticketDetails = b.tickets && b.tickets.length > 0
        ? b.tickets.map(t => `• ${t.tierTitle} × ${t.quantity}`).join('\n')
        : `• ${b.tierTitle} × ${b.quantity}`

    return [
        `📋 *New Booking — Outsyd*`,
        ``,
        `*Event:* ${b.eventTitle}`,
        `*Date:* ${date}`,
        b.eventVenue ? `*Venue:* ${b.eventVenue}` : null,
        ``,
        `*Tickets:*`,
        ticketDetails,
        ``,
        `*Amount:* ${amount}`,
        ``,
        `*Customer:* ${b.customerName}`,
        `*Phone:* ${b.customerPhone}`,
        `*Ref:* ${b.bookingRef}`,
    ].filter(Boolean).join('\n')
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
    req: NextRequest,
    { params }: { params: { ref: string } }
) {
    const { ref } = params

    const { data: bookings, error } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_id, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status, customer_name, customer_phone, tier_id, cf_order_id')
        .or(`booking_reference.eq.${ref},booking_reference.like.${ref}-%,cf_order_id.eq.${ref}`)

    const data = bookings?.find(b => b.booking_reference === ref)

    if (error || !data) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If still pending — query Cashfree directly as webhook fallback
    if (data.payment_status === 'pending') {
        try {
            const cf = await verifyCashfreeOrder(ref)
            console.log(`[status] Cashfree check for ${ref}: status=${cf?.status} paymentId=${cf?.cfPaymentId}`)

            // ── Terminal failure states — mark immediately ─────────────────────
            const FAILED_STATUSES = ['EXPIRED', 'FAILED', 'USER_DROPPED', 'CANCELLED']
            if (cf?.status && FAILED_STATUSES.includes(cf.status)) {
                console.log(`[status] Booking ${ref} failed — Cashfree: ${cf.status}`)
                await supabase
                    .from('event_bookings')
                    .update({
                        payment_status: 'failed',
                        booking_status: 'cancelled',
                        updated_at:     new Date().toISOString(),
                    })
                    .or(`booking_reference.eq.${ref},booking_reference.like.${ref}-%,cf_order_id.eq.${ref}`)
                    .eq('payment_status', 'pending')   // idempotency guard
                return NextResponse.json({
                    bookingRef:    data.booking_reference,
                    paymentStatus: 'failed',
                    bookingStatus: 'cancelled',
                })
            }

            if (cf?.status === 'PAID' && cf.cfPaymentId) {
                // ── Confirm directly via DB update ────────────────────────────
                const { error: updateError } = await supabase
                    .from('event_bookings')
                    .update({
                        payment_status: 'paid',
                        cf_payment_id:  cf.cfPaymentId,
                        booking_status: 'confirmed',
                        updated_at:     new Date().toISOString(),
                    })
                    .or(`booking_reference.eq.${ref},booking_reference.like.${ref}-%,cf_order_id.eq.${ref}`)
                    .eq('payment_status', 'pending')   // idempotency guard

                if (updateError) {
                    if (updateError.code === '23505') {
                        // There is already a paid booking for this customer/event/tier.
                        // Find and return that booking so the user sees "You're in!"
                        console.log(`[status] 23505 for ${ref} — returning existing paid booking`)
                        const { data: existingPaid } = await supabase
                            .from('event_bookings')
                            .select('booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status')
                            .eq('tier_id', data.tier_id)
                            .eq('customer_phone', data.customer_phone)
                            .eq('payment_status', 'paid')
                            .single()

                        if (existingPaid) {
                            return NextResponse.json({
                                bookingRef:    existingPaid.booking_reference,
                                eventTitle:    existingPaid.event_title,
                                eventDate:     existingPaid.event_date,
                                eventVenue:    existingPaid.event_venue,
                                tierTitle:     existingPaid.tier_title,
                                quantity:      existingPaid.quantity,
                                amountPaid:    existingPaid.amount_paid,
                                paymentStatus: 'paid',
                                bookingStatus: 'confirmed',
                            })
                        }
                    } else {
                        console.error('[status] Update error:', JSON.stringify(updateError))
                    }
                } else {
                    console.log(`[status] Booking ${ref} confirmed ✓`)

                    // ── Send WhatsApp notifications ───────────────────────────
                    // Must be awaited — Vercel serverless kills unawaited promises
                    // after the response is sent.
                    const msgData = {
                        bookingRef:    data.booking_reference,
                        eventTitle:    data.event_title,
                        eventDate:     data.event_date,
                        eventVenue:    data.event_venue,
                        tierTitle:     data.tier_title,
                        quantity:      data.quantity,
                        amountPaid:    bookings ? bookings.reduce((sum, b) => sum + b.amount_paid, 0) : data.amount_paid,
                        customerName:  data.customer_name,
                        customerPhone: data.customer_phone,
                        tickets:       bookings ? bookings.map(b => ({ tierTitle: b.tier_title, quantity: b.quantity })) : [],
                    }

                    // Customer confirmation
                    if (data.customer_phone) {
                        try {
                            const r = await sendWhatsApp(data.customer_phone, customerEventConfirmation(msgData))
                            console.log('[status] Customer WhatsApp result:', r)
                        } catch (e) {
                            console.error('[status] Customer WhatsApp error:', e)
                        }
                    }

                    // Vendor — per-event phone or fallback to vendor profile phone
                    try {
                        const { data: eventData } = await supabase
                            .from('events')
                            .select('event_phone, vendor_id')
                            .eq('id', data.event_id)
                            .single()
                        
                        let eventPhone = eventData?.event_phone?.trim() || null
                        if (!eventPhone && eventData?.vendor_id) {
                            const { data: vendorData } = await supabase
                                .from('vendors')
                                .select('phone')
                                .eq('id', eventData.vendor_id)
                                .single()
                            eventPhone = vendorData?.phone?.trim() || null
                        }

                        if (eventPhone) {
                            await sendWhatsApp(eventPhone, opsEventNotification(msgData))
                        }
                    } catch (e) {
                        console.error('[status] Vendor WhatsApp error:', e)
                    }
                }

                // ── Upsert customer account ───────────────────────────────────
                if (data.customer_phone) {
                    await supabase
                        .from('outsyd_users')
                        .upsert(
                            { phone_number: data.customer_phone, name: data.customer_name ?? null },
                            { onConflict: 'phone_number', ignoreDuplicates: true }
                        )
                }

                // ── Re-fetch and return updated status ────────────────────────
                const { data: updatedBookings } = await supabase
                    .from('event_bookings')
                    .select('booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status')
                    .or(`booking_reference.eq.${ref},booking_reference.like.${ref}-%,cf_order_id.eq.${ref}`)

                const updated = updatedBookings?.find(b => b.booking_reference === ref)

                if (updated && updatedBookings) {
                    const totalAmountPaid = updatedBookings.reduce((sum, b) => sum + b.amount_paid, 0)
                    const totalQty = updatedBookings.reduce((sum, b) => sum + b.quantity, 0)
                    return NextResponse.json({
                        bookingRef:    updated.booking_reference,
                        eventTitle:    updated.event_title,
                        eventDate:     updated.event_date,
                        eventVenue:    updated.event_venue,
                        tierTitle:     updated.tier_title,
                        quantity:      totalQty,
                        amountPaid:    totalAmountPaid,
                        paymentStatus: updated.payment_status,
                        bookingStatus: updated.booking_status,
                        tickets:       updatedBookings.map(b => ({
                            tierTitle:  b.tier_title,
                            quantity:   b.quantity,
                            amountPaid: b.amount_paid,
                        })),
                    })
                }
            }
        } catch (e) {
            console.error('[status] Cashfree verification error:', e)
        }
    }

    const totalAmountPaid = bookings ? bookings.reduce((sum, b) => sum + b.amount_paid, 0) : data.amount_paid
    const totalQty = bookings ? bookings.reduce((sum, b) => sum + b.quantity, 0) : data.quantity
    return NextResponse.json({
        bookingRef:    data.booking_reference,
        eventTitle:    data.event_title,
        eventDate:     data.event_date,
        eventVenue:    data.event_venue,
        tierTitle:     data.tier_title,
        quantity:      totalQty,
        amountPaid:    totalAmountPaid,
        paymentStatus: data.payment_status,
        bookingStatus: data.booking_status,
        tickets:       bookings ? bookings.map(b => ({
            tierTitle:  b.tier_title,
            quantity:   b.quantity,
            amountPaid: b.amount_paid,
        })) : [],
    })
}
