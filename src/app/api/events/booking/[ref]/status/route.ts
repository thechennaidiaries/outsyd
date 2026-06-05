/**
 * GET /api/events/booking/[ref]/status
 *
 * Polling endpoint used by the return page to check booking confirmation.
 *
 * If payment_status is still 'pending', we query Cashfree directly and
 * confirm the booking inline using a direct DB update (service role key,
 * no RPC needed — avoids PostgREST 409 issues with the confirm_booking function).
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
        .select('id, booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status, customer_name, customer_phone, tier_id')
        .eq('booking_reference', ref)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // If still pending — query Cashfree directly as webhook fallback
    if (data.payment_status === 'pending') {
        try {
            const cf = await verifyCashfreeOrder(ref)
            console.log(`[status] Cashfree check for ${ref}: status=${cf?.status} paymentId=${cf?.cfPaymentId}`)

            if (cf?.status === 'PAID' && cf.cfPaymentId) {
                // ── Confirm directly via DB update (service role key = full access) ──
                // Idempotency: .eq('payment_status', 'pending') means only runs once
                const { error: updateError } = await supabase
                    .from('event_bookings')
                    .update({
                        payment_status: 'paid',
                        cf_payment_id:  cf.cfPaymentId,
                        booking_status: 'confirmed',
                        updated_at:     new Date().toISOString(),
                    })
                    .eq('id', data.id)
                    .eq('payment_status', 'pending')   // idempotency guard

                if (updateError) {
                    if (updateError.code === '23505') {
                        // Customer already has a paid booking for this event+tier
                        // (unique constraint uq_event_booking_paid)
                        // Mark this duplicate as 'duplicate' so it doesn't block again
                        console.log(`[status] Duplicate booking detected for ${ref} — customer already has a paid ticket`)
                        await supabase
                            .from('event_bookings')
                            .update({ payment_status: 'paid', booking_status: 'confirmed', updated_at: new Date().toISOString() })
                            .eq('id', data.id)
                        // Fall through — re-fetch will show confirmed
                    } else {
                        console.error('[status] Direct update error:', JSON.stringify(updateError))
                    }
                } else {
                    console.log(`[status] Booking ${ref} confirmed ✓ (cf_payment_id: ${cf.cfPaymentId})`)
                }

                // ── Upsert customer account so ticket shows in /account/bookings ──
                if (data.customer_phone) {
                    await supabase
                        .from('outsyd_users')
                        .upsert(
                            { phone_number: data.customer_phone, name: data.customer_name ?? null },
                            { onConflict: 'phone_number', ignoreDuplicates: true }
                        )
                }

                // ── Re-fetch and return updated status ──────────────────────────────
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
            console.error('[status] Cashfree verification error:', e)
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
