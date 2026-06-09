/**
 * POST /api/events/[eventId]/create-order
 *
 * Requires an authenticated session (OTP verified in Step 2 of booking).
 *
 * Flow:
 * 1. Auth check — 401 if no session
 * 2. Validate event is approved + booking_enabled
 * 3. For each line item: validate tier + capacity
 * 4. Calculate fees (summed across all line items)
 * 5. Create one pending event_booking row per line item (shared booking_reference)
 * 6. Create a single Cashfree order for the combined total
 * 7. Return paymentSessionId to frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { calculateFees } from '@/lib/payment/fee'
import { createCashfreeOrder } from '@/lib/payment/cashfree'

// ── Booking reference generator: EVT-YYYYMMDD-XXXX ────────────────────────────
function generateBookingRef(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `EVT-${date}-${rand}`
}

interface LineItem {
    tierId: string
    quantity: number
}

export async function POST(
    req: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const { eventId } = params
    const host     = req.headers.get('host') ?? 'outsyd.in'
    const protocol = host.startsWith('localhost') ? 'http' : 'https'
    const baseUrl  = process.env.NEXT_PUBLIC_BASE_URL ?? `${protocol}://${host}`

    // ── Parse body ────────────────────────────────────────────────────────────
    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { lineItems, customerName, customerPhone } = body as {
        lineItems: LineItem[]
        customerName: string
        customerPhone: string
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
        return NextResponse.json({ error: 'lineItems array is required' }, { status: 400 })
    }

    if (!customerName || !customerPhone) {
        return NextResponse.json(
            { error: 'customerName and customerPhone are required' },
            { status: 400 }
        )
    }

    // Validate each line item quantity
    for (const item of lineItems) {
        if (!item.tierId || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 10) {
            return NextResponse.json(
                { error: `Each line item must have a valid tierId and quantity between 1 and 10` },
                { status: 400 }
            )
        }
    }
    const totalQty = lineItems.reduce((sum, item) => sum + item.quantity, 0)
    if (totalQty > 20) {
        return NextResponse.json({ error: 'Total ticket quantity cannot exceed 20' }, { status: 400 })
    }

    // ── Require authenticated session ──────────────────────────────────────────
    const session = await getSession()
    if (!session) {
        return NextResponse.json(
            { error: 'You must verify your phone number before booking.' },
            { status: 401 }
        )
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

    // ── Fetch + validate all tiers ────────────────────────────────────────────
    const tierIds = lineItems.map(item => item.tierId)
    const { data: tiersData } = await supabase
        .from('event_tiers')
        .select('id, title, price, capacity, is_active')
        .in('id', tierIds)
        .eq('event_id', eventId)

    if (!tiersData || tiersData.length !== tierIds.length) {
        return NextResponse.json({ error: 'One or more tiers not found for this event' }, { status: 404 })
    }

    const tierMap = new Map(tiersData.map(t => [t.id, t]))

    for (const item of lineItems) {
        const tier = tierMap.get(item.tierId)
        if (!tier || !tier.is_active) {
            return NextResponse.json({ error: `Tier ${item.tierId} not found or not available` }, { status: 404 })
        }
    }

    // ── Capacity check (per tier) ─────────────────────────────────────────────
    for (const item of lineItems) {
        const tier = tierMap.get(item.tierId)!
        if (tier.capacity !== null) {
            const { data: soldData } = await supabase
                .from('event_bookings')
                .select('quantity')
                .eq('tier_id', item.tierId)
                .eq('payment_status', 'paid')

            const soldCount = (soldData ?? []).reduce((sum, r) => sum + r.quantity, 0)
            if (soldCount + item.quantity > tier.capacity) {
                return NextResponse.json(
                    { error: `Only ${tier.capacity - soldCount} seats remaining for "${tier.title}"` },
                    { status: 409 }
                )
            }
        }
    }

    // ── Calculate fees (summed across all line items) ─────────────────────────
    let totalAmountPaid = 0
    const feeBreakdowns = lineItems.map(item => {
        const tier = tierMap.get(item.tierId)!
        const fees = calculateFees({
            tierPriceInPaise:    tier.price,
            quantity:            item.quantity,
            serviceFeePercent:   Number(event.service_fee_pct),
            feeAbsorbedByVendor: event.fee_absorbed_by_vendor,
            coupon:              null,
        })
        totalAmountPaid += fees.amountPaid
        return { item, tier, fees }
    })

    // ── Generate shared booking reference ─────────────────────────────────────
    const bookingRef = generateBookingRef()

    // ── Create one pending booking row per line item ───────────────────────────
    const bookingInserts = feeBreakdowns.map(({ item, tier, fees }) => ({
        booking_reference:  bookingRef,
        event_id:           eventId,
        tier_id:            tier.id,
        vendor_id:          event.vendor_id,
        event_title:        event.title,
        event_date:         new Date(event.date + 'T00:00:00+05:30').toISOString(),
        event_venue:        event.venue ?? null,
        tier_title:         tier.title,
        user_id:            session.userId,
        customer_name:      customerName,
        customer_phone:     customerPhone,
        customer_email:     null,
        quantity:           item.quantity,
        base_amount:        fees.baseAmount,
        service_fee_amount: fees.serviceFeeAmount,
        discount_amount:    fees.discountAmount,
        amount_paid:        fees.amountPaid,
        coupon_code:        null,
        payment_provider:   'cashfree',
        payment_status:     'pending',
        booking_status:     'confirmed',
    }))

    const { error: bookingError } = await supabase
        .from('event_bookings')
        .insert(bookingInserts)

    if (bookingError) {
        console.error('[create-order] Booking insert error:', bookingError)
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    // ── Create single Cashfree order for combined total ───────────────────────
    const cfResult = await createCashfreeOrder({
        orderId:        bookingRef,
        amountInPaise:  totalAmountPaid,
        customerName,
        customerPhone,
        customerEmail:  undefined,
        returnUrl:      `${baseUrl}/events/booking/${bookingRef}/return?order_id={order_id}`,
        notifyUrl:      `${baseUrl}/api/webhooks/cashfree`,
        eventTitle:     event.title,
    })

    if (!cfResult.success) {
        // Clean up pending bookings so they don't orphan permanently
        await supabase.from('event_bookings').delete().eq('booking_reference', bookingRef)
        return NextResponse.json({ error: cfResult.error }, { status: 502 })
    }

    // ── Save Cashfree order ID to all booking rows for this reference ─────────
    await supabase
        .from('event_bookings')
        .update({ cf_order_id: cfResult.cfOrderId })
        .eq('booking_reference', bookingRef)

    return NextResponse.json({
        bookingRef,
        paymentSessionId: cfResult.paymentSessionId,
        amountPaid:       totalAmountPaid,
        breakdown: {
            lineItems: feeBreakdowns.map(({ tier, item, fees }) => ({
                tierTitle:        tier.title,
                quantity:         item.quantity,
                baseAmount:       fees.baseAmount,
                serviceFeeAmount: fees.serviceFeeAmount,
                amountPaid:       fees.amountPaid,
            })),
            totalAmountPaid,
        },
    })
}
