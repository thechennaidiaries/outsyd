import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'

/**
 * GET /api/events/[eventId]/check-booking
 *
 * Checks if the currently logged-in user already has a paid booking for this event.
 * Used to prevent accidental duplicate bookings.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { eventId: string } }
) {
    const { eventId } = params

    const session = await getSession()
    if (!session || !session.phone) {
        return NextResponse.json({ booked: false })
    }

    try {
        const { data: booking, error } = await supabase
            .from('event_bookings')
            .select('booking_reference')
            .eq('event_id', eventId)
            .eq('customer_phone', session.phone)
            .eq('payment_status', 'paid')
            .limit(1)
            .maybeSingle()

        if (error) {
            console.error('[check-booking] Database error:', error)
            return NextResponse.json({ error: 'Database error checking booking status' }, { status: 500 })
        }

        if (booking) {
            return NextResponse.json({ booked: true, bookingRef: booking.booking_reference })
        }

        return NextResponse.json({ booked: false })
    } catch (err) {
        console.error('[check-booking] Exception checking booking:', err)
        return NextResponse.json({ error: 'Internal server error checking booking status' }, { status: 500 })
    }
}
