/**
 * GET /api/events/booking/[ref]/status
 *
 * Polling endpoint used by the return page to check booking confirmation.
 *
 * If payment_status is still 'pending', we also query Cashfree directly
 * to check the order status and confirm the booking inline — this handles
 * cases where the webhook is delayed or missed (common in sandbox).
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyCashfreeOrder } from '@/lib/payment/cashfree'

export async function GET(
    req: NextRequest,
    { params }: { params: { ref: string } }
) {
    const { ref } = params

    const { data, error } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status')
        .eq('booking_reference', ref)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If still pending — query Cashfree directly as webhook fallback
    if (data.payment_status === 'pending') {
        try {
            const cf = await verifyCashfreeOrder(ref)
            if (cf?.status === 'PAID' && cf.cfPaymentId) {
                // Trigger confirm_booking RPC inline
                const { data: rpcResult, error: rpcError } = await supabase.rpc('confirm_booking', {
                    p_booking_id:    data.id,
                    p_cf_payment_id: cf.cfPaymentId,
                })
                if (rpcError) {
                    console.error('[status] confirm_booking RPC error:', JSON.stringify(rpcError))
                } else {
                    console.log('[status] confirm_booking result:', rpcResult)
                }

                // Upsert customer account (same as activity booking flow)
                // so the ticket shows up in /account/bookings
                const { data: booking } = await supabase
                    .from('event_bookings')
                    .select('customer_name, customer_phone')
                    .eq('id', data.id)
                    .single()

                if (booking?.customer_phone) {
                    await supabase
                        .from('outsyd_users')
                        .upsert(
                            { phone_number: booking.customer_phone, name: booking.customer_name ?? null },
                            { onConflict: 'phone_number', ignoreDuplicates: true }
                        )
                }

                // Re-fetch updated status
                const { data: updated } = await supabase
                    .from('event_bookings')
                    .select('booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status')
                    .eq('booking_reference', ref)
                    .single()
                if (updated) {
                    return NextResponse.json({
                        bookingRef:    updated.booking_reference,
                        eventTitle:    updated.event_title,
                        eventDate:     updated.event_date,
                        eventVenue:    updated.event_venue,
                        tierTitle:     updated.tier_title,
                        quantity:      updated.quantity,
                        amountPaid:    updated.amount_paid,
                        paymentStatus: updated.payment_status,
                        bookingStatus: updated.booking_status,
                    })
                }
            }
        } catch (e) {
            // Swallow — just return the current DB status
            console.warn('[booking/status] Cashfree order check failed:', e)
        }
    }

    return NextResponse.json({
        bookingRef:    data.booking_reference,
        eventTitle:    data.event_title,
        eventDate:     data.event_date,
        eventVenue:    data.event_venue,
        tierTitle:     data.tier_title,
        quantity:      data.quantity,
        amountPaid:    data.amount_paid,
        paymentStatus: data.payment_status,
        bookingStatus: data.booking_status,
    })
}
