/**
 * POST /api/webhooks/cashfree
 *
 * Handles Cashfree payment webhook.
 * - Verifies signature
 * - Calls confirm_booking RPC (atomic, idempotent)
 * - On success: sends WhatsApp to customer + ops (2 numbers)
 * - On over_capacity: flags for manual refund
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyCashfreeWebhook } from '@/lib/payment/cashfree'
import { sendWhatsApp } from '@/lib/wasender'

// ── WhatsApp message templates ────────────────────────────────────────────────

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

// ── Webhook handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // ── 1. Read raw body (must be before parsing) ─────────────────────────────
    const rawBody = await req.text()
    const signature = req.headers.get('x-webhook-signature') ?? ''
    const timestamp  = req.headers.get('x-webhook-timestamp') ?? ''

    // ── 2. Verify signature ───────────────────────────────────────────────────
    if (!verifyCashfreeWebhook(rawBody, signature, timestamp)) {
        console.warn('[webhook/cashfree] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let event: any
    try { event = JSON.parse(rawBody) } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventType   = event.type           // e.g. 'PAYMENT_SUCCESS_WEBHOOK'
    const orderData   = event.data?.order
    const paymentData = event.data?.payment

    // ── 3. Only process success events ───────────────────────────────────────
    if (eventType !== 'PAYMENT_SUCCESS_WEBHOOK') {
        return NextResponse.json({ received: true, skipped: eventType })
    }

    const cfOrderId   = orderData?.order_id           // this is our booking_reference
    const cfPaymentId = paymentData?.cf_payment_id?.toString()

    if (!cfOrderId || !cfPaymentId) {
        return NextResponse.json({ error: 'Missing order_id or payment_id' }, { status: 400 })
    }

    // ── 4. Find all bookings for this Cashfree order ──────────────────────────
    const { data: bookings } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_id, event_title, event_date, event_venue, tier_title, quantity, amount_paid, customer_name, customer_phone')
        .or(`booking_reference.eq.${cfOrderId},booking_reference.like.${cfOrderId}-%,cf_order_id.eq.${cfOrderId}`)

    const booking = bookings?.find(b => b.booking_reference === cfOrderId)

    if (!booking) {
        console.error(`[webhook/cashfree] Booking not found for order: ${cfOrderId}`)
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // ── 5. Call confirm_booking RPC (atomic + idempotent) ────────────────────
    const { data: rpcResult, error: rpcError } = await supabase
        .rpc('confirm_booking', {
            p_booking_id:    booking.id,
            p_cf_payment_id: cfPaymentId,
        })

    if (rpcError) {
        console.error('[webhook/cashfree] RPC error:', rpcError)
        return NextResponse.json({ error: 'Failed to confirm booking' }, { status: 500 })
    }

    console.log(`[webhook/cashfree] confirm_booking result: ${rpcResult} for ${cfOrderId}`)

    // ── 6. Handle RPC results ─────────────────────────────────────────────────
    if (rpcResult === 'over_capacity') {
        // TODO: trigger Cashfree refund
        return NextResponse.json({ result: 'over_capacity', action: 'manual_refund_required' })
    }

    if (rpcResult === 'already_processed') {
        return NextResponse.json({ result: 'already_processed' })
    }

    if (rpcResult !== 'confirmed') {
        return NextResponse.json({ result: rpcResult })
    }

    // ── 6b. Bulk-confirm any extra line-item rows (same order) ───────────────
    // For multi-tier orders, the primary row (EVT-...) is confirmed via RPC above.
    // Extra rows (EVT-...-2, EVT-...-3) need to be marked paid via a bulk update.
    await supabase
        .from('event_bookings')
        .update({
            payment_status: 'paid',
            cf_payment_id:  cfPaymentId,
            booking_status: 'confirmed',
        })
        .like('booking_reference', `${cfOrderId}-%`)
        .eq('payment_status', 'pending')

    // ── 7. Upsert customer account ────────────────────────────────────────────
    // Creates account if new, ignores if already exists — same as activity booking flow
    await supabase
        .from('outsyd_users')
        .upsert(
            { phone_number: booking.customer_phone, name: booking.customer_name ?? null },
            { onConflict: 'phone_number', ignoreDuplicates: true }
        )

    // ── 8. Send WhatsApp notifications (confirmed only) ───────────────────────
    const msgData = {
        bookingRef:   booking.booking_reference,
        eventTitle:   booking.event_title,
        eventDate:    booking.event_date,
        eventVenue:   booking.event_venue,
        tierTitle:    booking.tier_title,
        quantity:     booking.quantity,
        amountPaid:   bookings ? bookings.reduce((sum, b) => sum + b.amount_paid, 0) : booking.amount_paid,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
        tickets:      bookings ? bookings.map(b => ({ tierTitle: b.tier_title, quantity: b.quantity })) : [],
    }

    // Customer confirmation
    await sendWhatsApp(booking.customer_phone, customerEventConfirmation(msgData))

    // Vendor — per-event phone or fallback to vendor profile phone
    try {
        console.log('[webhook/cashfree] Resolving vendor phone for event_id:', booking.event_id)
        const { data: eventRow, error: eventErr } = await supabase
            .from('events')
            .select('event_phone, vendor_id')
            .eq('id', booking.event_id)
            .single()

        if (eventErr) {
            console.error('[webhook/cashfree] Event fetch error:', eventErr)
        }

        let eventPhone = eventRow?.event_phone?.trim() || null
        console.log('[webhook/cashfree] Event event_phone:', eventPhone, 'vendor_id:', eventRow?.vendor_id)

        if (!eventPhone && eventRow?.vendor_id) {
            console.log('[webhook/cashfree] Event phone empty, falling back to vendor profile phone for vendor_id:', eventRow.vendor_id)
            const { data: vendorRow, error: vendorErr } = await supabase
                .from('vendors')
                .select('phone')
                .eq('id', eventRow.vendor_id)
                .single()
            if (vendorErr) {
                console.error('[webhook/cashfree] Vendor profile fetch error:', vendorErr)
            }
            eventPhone = vendorRow?.phone?.trim() || null
            console.log('[webhook/cashfree] Vendor profile phone:', eventPhone)
        }

        console.log('[webhook/cashfree] Final resolved vendor phone:', eventPhone)

        if (eventPhone) {
            const res = await sendWhatsApp(eventPhone, opsEventNotification(msgData))
            console.log('[webhook/cashfree] Vendor WhatsApp notification result:', res)
        } else {
            console.warn('[webhook/cashfree] No vendor phone resolved. Skipping notification.')
        }
    } catch (e) {
        console.error('[webhook/cashfree] Vendor WhatsApp notification failed:', e)
    }

    console.log(`[webhook/cashfree] Booking ${booking.booking_reference} confirmed ✓`)
    return NextResponse.json({ result: 'confirmed' })
}
