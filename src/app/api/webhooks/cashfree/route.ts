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
    eventVenue?: string; tierTitle: string; quantity: number; amountPaid: number
}): string {
    const date = new Date(b.eventDate).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
    const amount = `₹${(b.amountPaid / 100).toLocaleString('en-IN')}`
    return [
        `🎟 *Booking Confirmed — Outsyd*`,
        ``,
        `Hey! Your tickets are booked. See you there! 🎉`,
        ``,
        `*Event:* ${b.eventTitle}`,
        `*Date:* ${date}`,
        b.eventVenue ? `*Venue:* ${b.eventVenue}` : null,
        `*Tier:* ${b.tierTitle}`,
        `*Tickets:* ${b.quantity}`,
        `*Amount Paid:* ${amount}`,
        ``,
        `*Booking Ref:* ${b.bookingRef}`,
        ``,
        `_Show this message at the venue if asked. — Outsyd_`,
    ].filter(Boolean).join('\n')
}

function opsEventNotification(b: {
    bookingRef: string; eventTitle: string; eventDate: string
    eventVenue?: string; tierTitle: string; quantity: number; amountPaid: number
    customerName: string; customerPhone: string
}): string {
    const date = new Date(b.eventDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
    const amount = `₹${(b.amountPaid / 100).toLocaleString('en-IN')}`
    return [
        `💸 *New Event Booking — Outsyd*`,
        ``,
        `*Ref:* ${b.bookingRef}`,
        `*Event:* ${b.eventTitle}`,
        `*Date:* ${date}`,
        b.eventVenue ? `*Venue:* ${b.eventVenue}` : null,
        ``,
        `*Customer:* ${b.customerName}`,
        `*Phone:* ${b.customerPhone}`,
        `*Tier:* ${b.tierTitle} × ${b.quantity}`,
        `*Amount:* ${amount}`,
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

    // ── 4. Find booking by booking_reference ─────────────────────────────────
    const { data: booking } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_id, event_title, event_date, event_venue, tier_title, quantity, amount_paid, customer_name, customer_phone, event_phone')
        .eq('booking_reference', cfOrderId)
        .single()

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
        // TODO: trigger Cashfree refund + notify ops
        const opsPhone = process.env.OUTSYD_OPS_PHONE
        if (opsPhone) {
            await sendWhatsApp(opsPhone,
                `⚠️ *Over Capacity — Refund Needed*\n\nRef: ${booking.booking_reference}\nEvent: ${booking.event_title}\nCustomer: ${booking.customer_name} (${booking.customer_phone})\n\nPayment succeeded but event is full. Please issue refund manually.`
            )
        }
        return NextResponse.json({ result: 'over_capacity', action: 'manual_refund_required' })
    }

    if (rpcResult === 'already_processed') {
        return NextResponse.json({ result: 'already_processed' })
    }

    if (rpcResult !== 'confirmed') {
        return NextResponse.json({ result: rpcResult })
    }

    // ── 7. Send WhatsApp notifications (confirmed only) ───────────────────────
    const msgData = {
        bookingRef:   booking.booking_reference,
        eventTitle:   booking.event_title,
        eventDate:    booking.event_date,
        eventVenue:   booking.event_venue,
        tierTitle:    booking.tier_title,
        quantity:     booking.quantity,
        amountPaid:   booking.amount_paid,
        customerName: booking.customer_name,
        customerPhone: booking.customer_phone,
    }

    // Customer confirmation
    await sendWhatsApp(booking.customer_phone, customerEventConfirmation(msgData))

    // Ops — fixed number always gets it
    const opsPhone = process.env.OUTSYD_OPS_PHONE
    if (opsPhone) {
        await sendWhatsApp(opsPhone, opsEventNotification(msgData))
    }

    // Ops — per-event phone (if different from fixed)
    const eventPhone = booking.event_phone ?? null
    if (eventPhone && eventPhone !== opsPhone) {
        await sendWhatsApp(eventPhone, opsEventNotification(msgData))
    }

    console.log(`[webhook/cashfree] Booking ${booking.booking_reference} confirmed ✓`)
    return NextResponse.json({ result: 'confirmed' })
}
