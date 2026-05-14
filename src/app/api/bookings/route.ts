/**
 * POST /api/bookings
 *
 * Flow:
 *   1. Parse & validate request body
 *   2. Fetch activity (confirms it exists + gets place_name, city_id)
 *   3. Fetch place (gets response_timeout_minutes + phone_number)
 *   4. Generate booking_reference + response_deadline
 *   5. Insert into bookings table
 *   6. Send WhatsApp notification to vendor via WaSender
 *   7. Return booking_reference to frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateBookingReference, calculateResponseDeadline } from '@/lib/booking-utils'
import { sendWhatsApp, vendorBookingMessage } from '@/lib/wasender'
import type { CreateBookingPayload } from '@/data/bookings'

// ── Validation helpers ───────────────────────────────────────────────────────

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/

function isValidDate(dateStr: string): boolean {
    const d = new Date(dateStr)
    return !isNaN(d.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/) !== null
}

function isFutureDate(dateStr: string): boolean {
    // Compare in IST — booking_date is a calendar date, not a timestamp
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
    return dateStr >= today
}

function validatePayload(body: any): { valid: boolean; error?: string } {
    if (!body.activity_id || typeof body.activity_id !== 'string') {
        return { valid: false, error: 'activity_id is required' }
    }
    if (!body.customer_name || typeof body.customer_name !== 'string' || body.customer_name.trim().length < 2) {
        return { valid: false, error: 'customer_name must be at least 2 characters' }
    }
    if (!body.customer_phone || !PHONE_REGEX.test(body.customer_phone)) {
        return { valid: false, error: 'customer_phone must be in international format (e.g. +919876543210)' }
    }
    if (body.customer_email && typeof body.customer_email === 'string') {
        // Basic email check — optional field
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
            return { valid: false, error: 'customer_email format is invalid' }
        }
    }
    if (!body.booking_date || !isValidDate(body.booking_date)) {
        return { valid: false, error: 'booking_date must be a valid date in YYYY-MM-DD format' }
    }
    if (!isFutureDate(body.booking_date)) {
        return { valid: false, error: 'booking_date cannot be in the past' }
    }
    if (!body.time_slot || typeof body.time_slot !== 'string' || body.time_slot.trim().length === 0) {
        return { valid: false, error: 'time_slot is required' }
    }
    if (!body.people_count || typeof body.people_count !== 'number' || body.people_count < 1 || !Number.isInteger(body.people_count)) {
        return { valid: false, error: 'people_count must be a positive integer' }
    }
    return { valid: true }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // ── 1. Parse body ────────────────────────────────────────────────────────
    let body: CreateBookingPayload
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // ── 2. Validate ──────────────────────────────────────────────────────────
    const validation = validatePayload(body)
    if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // ── 3. Fetch activity from Supabase ──────────────────────────────────────
    const { data: activity, error: activityError } = await supabase
        .from('activities')
        .select('id, title, place_id, city_id, booking_enabled, available_slots, group_size_min, group_size_max')
        .eq('id', body.activity_id)
        .single()

    if (activityError || !activity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (!activity.booking_enabled) {
        return NextResponse.json({ error: 'Booking is not available for this activity' }, { status: 403 })
    }

    // Validate time_slot is one of the activity's available slots
    if (activity.available_slots && Array.isArray(activity.available_slots)) {
        if (!activity.available_slots.includes(body.time_slot)) {
            return NextResponse.json(
                { error: `Invalid time_slot. Available slots: ${activity.available_slots.join(', ')}` },
                { status: 400 }
            )
        }
    }

    // Validate group size constraints if set
    if (activity.group_size_min && body.people_count < activity.group_size_min) {
        return NextResponse.json(
            { error: `Minimum group size for this activity is ${activity.group_size_min}` },
            { status: 400 }
        )
    }
    if (activity.group_size_max && body.people_count > activity.group_size_max) {
        return NextResponse.json(
            { error: `Maximum group size for this activity is ${activity.group_size_max}` },
            { status: 400 }
        )
    }

    // ── 4. Fetch place from Supabase ─────────────────────────────────────────
    const { data: place, error: placeError } = await supabase
        .from('places')
        .select('name, city_id, booking_enabled, response_timeout_minutes, phone_number')
        .eq('name', activity.place_id)
        .eq('city_id', activity.city_id)
        .single()

    if (placeError || !place) {
        return NextResponse.json({ error: 'Associated place not found' }, { status: 404 })
    }

    if (!place.booking_enabled) {
        return NextResponse.json({ error: 'Booking is not enabled for this venue' }, { status: 403 })
    }

    // ── 5. Generate booking_reference + response_deadline ────────────────────
    const bookingReference = generateBookingReference()
    // Response deadline — hardcoded to 48 hours (2880 min).
    // Intentionally ignores place.response_timeout_minutes which defaults to 30 in the DB.
    const responseDeadline = calculateResponseDeadline(2880)

    // ── 6. Insert booking into Supabase ──────────────────────────────────────
    const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
            booking_reference: bookingReference,
            activity_id: body.activity_id,
            place_name: place.name,
            city_id: activity.city_id,
            customer_name: body.customer_name.trim(),
            customer_phone: body.customer_phone,
            customer_email: body.customer_email || null,
            booking_date: body.booking_date,
            time_slot: body.time_slot,
            people_count: body.people_count,
            status: 'pending_vendor',
            booking_source: 'web',
            response_deadline: responseDeadline,
        })
        .select('id, booking_reference, status, response_deadline')
        .single()

    if (insertError) {
        // Catch duplicate booking (same phone + activity + date)
        if (insertError.code === '23505') {
            return NextResponse.json(
                { error: 'A booking request for this activity on this date already exists for your number.' },
                { status: 409 }
            )
        }
        console.error('[POST /api/bookings] Insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 })
    }

    // ── 7. Send WhatsApp to vendor ────────────────────────────────────────────
    // Non-blocking: a notification failure must NOT fail the booking itself.
    console.log(`[POST /api/bookings] place.phone_number = "${place.phone_number}" for place "${place.name}"`)
    console.log(`[POST /api/bookings] WASENDER_API_KEY set: ${!!process.env.WASENDER_API_KEY}`)

    if (place.phone_number) {
        const baseUrl = `${req.headers.get('x-forwarded-proto') ?? 'https'}://${req.headers.get('host')}`
        const message = vendorBookingMessage({
            bookingRef: booking.booking_reference,
            activityTitle: activity.title,
            customerName: body.customer_name.trim(),
            customerPhone: body.customer_phone,
            bookingDate: body.booking_date,
            timeSlot: body.time_slot,
            peopleCount: body.people_count,
            baseUrl,
        })
        console.log(`[POST /api/bookings] Sending WhatsApp to ${place.phone_number}...`)
        const waResult = await sendWhatsApp(place.phone_number, message)
        console.log(`[POST /api/bookings] WaSender result for ${booking.booking_reference}:`, JSON.stringify(waResult))
        if (!waResult.success) {
            console.error(`[POST /api/bookings] WhatsApp failed:`, waResult.error)
        }
    } else {
        console.warn(
            `[POST /api/bookings] No phone_number set for place "${place.name}" — skipping WhatsApp notification`
        )
    }

    // ── 8. Return success ────────────────────────────────────────────────────
    return NextResponse.json(
        {
            success: true,
            booking_reference: booking.booking_reference,
            status: booking.status,
            message: 'Your booking request has been submitted. You will receive a confirmation shortly.',
        },
        { status: 201 }
    )
}
