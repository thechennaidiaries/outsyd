/**
 * GET /api/events/booking/[ref]/status
 *
 * Polling endpoint used by the return page to check booking confirmation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    req: NextRequest,
    { params }: { params: { ref: string } }
) {
    const { ref } = params

    const { data, error } = await supabase
        .from('event_bookings')
        .select('booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status')
        .eq('booking_reference', ref)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
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
