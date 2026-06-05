/**
 * POST /api/events/[eventId]/create-order
 *
 * Flow:
 * 1. Validate event is approved + booking_enabled
 * 2. Validate tier + capacity
 * 3. Validate coupon (if provided)
 * 4. Calculate fees
 * 5. Create pending event_booking row
 * 6. Create Cashfree order
 * 7. Return paymentSessionId to frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { calculateFees } from '@/lib/payment/fee'
import { createCashfreeOrder } from '@/lib/payment/cashfree'
import type { EventCoupon } from '@/data/vendors'

// ── Booking reference generator: EVT-YYYYMMDD-XXXX ────────────────────────────
function generateBookingRef(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `EVT-${date}-${rand}`
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://outsyd.in'

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { tierId, quantity = 1, customerName, customerPhone, customerEmail, couponCode } = body

    if (!tierId || !customerName || !customerPhone) {
        return NextResponse.json(
            { error: 'tierId, customerName, and customerPhone are required' },
            { status: 400 }
        )
    }

    if (quantity < 1 || quantity > 10) {
        return NextResponse.json({ error: 'Quantity must be between 1 and 10' }, { status: 400 })
    }

    // ── Fetch event ───────────────────────────────────────────────────────────
    const { data: event } = await supabase
        .from('events')
        .select('id, title, date, venue, vendor_id, approval_status, booking_enabled, service_fee_pct, fee_absorbed_by_vendor, event_phone')
        .eq('id', eventId)
        .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    if (event.approval_status !== 'approved' || !event.booking_enabled) {
        return NextResponse.json({ error: 'Booking is not available for this event' }, { status: 400 })
    }

    // ── Fetch tier ────────────────────────────────────────────────────────────
    const { data: tier } = await supabase
        .from('event_tiers')
        .select('id, title, price, capacity, is_active')
        .eq('id', tierId)
        .eq('event_id', eventId)
        .single()

    if (!tier || !tier.is_active) {
        return NextResponse.json({ error: 'Tier not found or not available' }, { status: 404 })
    }

    // ── Capacity check ────────────────────────────────────────────────────────
    if (tier.capacity !== null) {
        const { data: soldData } = await supabase
            .from('event_bookings')
            .select('quantity')
            .eq('tier_id', tierId)
            .eq('payment_status', 'paid')

        const soldCount = (soldData ?? []).reduce((sum, r) => sum + r.quantity, 0)
        if (soldCount + quantity > tier.capacity) {
            return NextResponse.json(
                { error: `Only ${tier.capacity - soldCount} seats remaining for this tier` },
                { status: 409 }
            )
        }
    }

    // ── Coupon validation ─────────────────────────────────────────────────────
    let coupon: EventCoupon | null = null
    if (couponCode) {
        const { data: c } = await supabase
            .from('event_coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('active', true)
            .single()

        if (!c) {
            return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
        }

        // Check expiry
        if (c.end_at && new Date(c.end_at) < new Date()) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
        }

        // Check usage limit dynamically
        if (c.usage_limit !== null) {
            const { count } = await supabase
                .from('event_bookings')
                .select('id', { count: 'exact', head: true })
                .eq('coupon_code', c.code)
                .eq('payment_status', 'paid')

            if ((count ?? 0) >= c.usage_limit) {
                return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
            }
        }

        // Check coupon is for this vendor / event
        if (c.vendor_id !== event.vendor_id) {
            return NextResponse.json({ error: 'Coupon is not valid for this event' }, { status: 400 })
        }
        if (c.event_id && c.event_id !== eventId) {
            return NextResponse.json({ error: 'Coupon is not valid for this event' }, { status: 400 })
        }

        coupon = c as EventCoupon
    }

    // ── Calculate fees ────────────────────────────────────────────────────────
    const fees = calculateFees({
        tierPriceInPaise:    tier.price,
        quantity,
        serviceFeePercent:   Number(event.service_fee_pct),
        feeAbsorbedByVendor: event.fee_absorbed_by_vendor,
        coupon,
    })

    // ── Get session (optional — guest checkout allowed) ───────────────────────
    const session = await getSession()

    // ── Generate booking reference ────────────────────────────────────────────
    const bookingRef = generateBookingRef()

    // ── Create pending booking ────────────────────────────────────────────────
    const { data: booking, error: bookingError } = await supabase
        .from('event_bookings')
        .insert({
            booking_reference:  bookingRef,
            event_id:           eventId,
            tier_id:            tierId,
            vendor_id:          event.vendor_id,
            event_title:        event.title,
            event_date:         new Date(event.date + 'T00:00:00+05:30').toISOString(),
            event_venue:        event.venue ?? null,
            tier_title:         tier.title,
            user_id:            session?.userId ?? null,
            customer_name:      customerName,
            customer_phone:     customerPhone,
            customer_email:     customerEmail ?? null,
            quantity,
            base_amount:        fees.baseAmount,
            service_fee_amount: fees.serviceFeeAmount,
            discount_amount:    fees.discountAmount,
            amount_paid:        fees.amountPaid,
            coupon_code:        coupon?.code ?? null,
            payment_provider:   'cashfree',
            payment_status:     'pending',
            booking_status:     'confirmed',
        })
        .select('id')
        .single()

    if (bookingError || !booking) {
        console.error('[create-order] Booking insert error:', bookingError)
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // ── Create Cashfree order ─────────────────────────────────────────────────
    const cfResult = await createCashfreeOrder({
        orderId:        bookingRef,
        amountInPaise:  fees.amountPaid,
        customerName,
        customerPhone,
        customerEmail,
        returnUrl:      `${baseUrl}/events/booking/${bookingRef}/return?order_id={order_id}`,
        notifyUrl:      `${baseUrl}/api/webhooks/cashfree`,
        eventTitle:     event.title,
    })

    if (!cfResult.success) {
        // Clean up pending booking so it doesn't orphan permanently
        await supabase.from('event_bookings').delete().eq('id', booking.id)
        return NextResponse.json({ error: cfResult.error }, { status: 502 })
    }

    // ── Save Cashfree order ID to booking ─────────────────────────────────────
    await supabase
        .from('event_bookings')
        .update({ cf_order_id: cfResult.cfOrderId })
        .eq('id', booking.id)

    return NextResponse.json({
        bookingRef,
        paymentSessionId: cfResult.paymentSessionId,
        amountPaid:       fees.amountPaid,
        breakdown: {
            baseAmount:       fees.baseAmount,
            discountAmount:   fees.discountAmount,
            serviceFeeAmount: fees.serviceFeeAmount,
            amountPaid:       fees.amountPaid,
        },
    })
}
