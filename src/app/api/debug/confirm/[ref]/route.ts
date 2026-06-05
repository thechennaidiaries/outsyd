/**
 * GET /api/debug/confirm/[ref]
 * Runs the full confirmation flow and returns every step's result.
 * DELETE before going to production.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyCashfreeOrder } from '@/lib/payment/cashfree'

export async function GET(
    req: NextRequest,
    { params }: { params: { ref: string } }
) {
    const { ref } = params
    const log: Record<string, any> = { ref }

    // Step 1: Fetch booking
    const { data: booking, error: fetchError } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, payment_status, booking_status, cf_payment_id, customer_phone')
        .eq('booking_reference', ref)
        .single()

    log.step1_fetch = { booking, error: fetchError }

    if (fetchError || !booking) {
        return NextResponse.json({ ...log, verdict: 'BOOKING_NOT_FOUND' })
    }

    if (booking.payment_status !== 'pending') {
        return NextResponse.json({ ...log, verdict: `ALREADY_${booking.payment_status.toUpperCase()}` })
    }

    // Step 2: Check Cashfree
    const cf = await verifyCashfreeOrder(ref)
    log.step2_cashfree = cf

    if (!cf || cf.status !== 'PAID') {
        return NextResponse.json({ ...log, verdict: 'CASHFREE_NOT_PAID' })
    }

    // Step 3: Direct DB update
    const { data: updateData, error: updateError, count } = await supabase
        .from('event_bookings')
        .update({
            payment_status: 'paid',
            cf_payment_id:  cf.cfPaymentId,
            booking_status: 'confirmed',
            updated_at:     new Date().toISOString(),
        })
        .eq('id', booking.id)
        .eq('payment_status', 'pending')
        .select()

    log.step3_update = { data: updateData, error: updateError, count }

    // Step 4: Re-fetch to confirm
    const { data: refetched } = await supabase
        .from('event_bookings')
        .select('payment_status, booking_status, cf_payment_id')
        .eq('booking_reference', ref)
        .single()

    log.step4_refetch = refetched

    return NextResponse.json({
        ...log,
        verdict: refetched?.payment_status === 'paid' ? '✅ CONFIRMED' : '❌ UPDATE_FAILED',
    })
}
