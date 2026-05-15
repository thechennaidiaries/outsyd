/**
 * GET /api/cron/escalate
 *
 * Runs every 5 minutes via Vercel Cron.
 * Finds pending_vendor bookings that have passed their response_deadline,
 * updates them to 'manual_followup', and sends a WhatsApp alert to ops.
 *
 * Protected by CRON_SECRET — set in Vercel environment variables.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsApp, opsEscalationMessage } from '@/lib/wasender'

export async function GET(req: NextRequest) {

    // ── Auth: only Vercel Cron (or manual with secret) can call this ──────────
    const authHeader = req.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Find all expired pending_vendor bookings ───────────────────────────────
    const { data: expiredBookings, error: fetchError } = await supabase
        .from('bookings')
        .select(`
            id,
            booking_reference,
            activity_id,
            place_name,
            city_id,
            customer_name,
            customer_phone,
            booking_date,
            time_slot,
            people_count,
            response_deadline
        `)
        .eq('status', 'pending_vendor')
        .lt('response_deadline', new Date().toISOString())

    if (fetchError) {
        console.error('[cron/escalate] Fetch error:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch expired bookings' }, { status: 500 })
    }

    if (!expiredBookings || expiredBookings.length === 0) {
        return NextResponse.json({ escalated: 0, message: 'No expired bookings found' })
    }

    const opsPhone = process.env.OUTSYD_OPS_PHONE
    const results: { ref: string; success: boolean }[] = []

    for (const booking of expiredBookings) {

        // ── 1. Update status to manual_followup ──────────────────────────────
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'manual_followup',
                internal_notes: `Auto-escalated at ${new Date().toISOString()} — vendor did not respond within deadline`,
            })
            .eq('id', booking.id)

        if (updateError) {
            console.error(`[cron/escalate] Failed to update booking ${booking.booking_reference}:`, updateError)
            results.push({ ref: booking.booking_reference, success: false })
            continue
        }

        // ── 2. Fetch place to get vendor phone ───────────────────────────────
        const { data: place } = await supabase
            .from('places')
            .select('phone_number')
            .eq('name', booking.place_name)
            .eq('city_id', booking.city_id)
            .single()

        // ── 3. Fetch activity title ──────────────────────────────────────────
        const { data: activity } = await supabase
            .from('activities')
            .select('title')
            .eq('id', booking.activity_id)
            .single()

        // ── 4. Send WhatsApp to ops ──────────────────────────────────────────
        if (opsPhone) {
            const message = opsEscalationMessage({
                bookingRef: booking.booking_reference,
                activityTitle: activity?.title ?? 'Unknown activity',
                placeName: booking.place_name,
                customerName: booking.customer_name,
                customerPhone: booking.customer_phone,
                bookingDate: booking.booking_date,
                timeSlot: booking.time_slot,
                peopleCount: booking.people_count,
                vendorPhone: place?.phone_number,
            })
            await sendWhatsApp(opsPhone, message)
        } else {
            console.warn('[cron/escalate] OUTSYD_OPS_PHONE not set — skipping ops notification')
        }

        results.push({ ref: booking.booking_reference, success: true })
        console.log(`[cron/escalate] Escalated booking ${booking.booking_reference}`)
    }

    return NextResponse.json({
        escalated: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        bookings: results,
    })
}
