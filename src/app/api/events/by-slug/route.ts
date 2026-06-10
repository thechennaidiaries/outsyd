/**
 * GET /api/events/by-slug?city=chennai&slug=comedy-night-abc123
 *
 * Returns event + tiers for the checkout page.
 * Only returns if booking_enabled = true.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const city = searchParams.get('city')
    const slug = searchParams.get('slug')

    if (!city || !slug) {
        return NextResponse.json({ error: 'city and slug are required' }, { status: 400 })
    }

    const { data: event } = await supabase
        .from('events')
        .select('id, title, date, time, venue, image, service_fee_pct, fee_absorbed_by_vendor, refund_policy, approval_status, booking_enabled')
        .eq('city_id', city)
        .eq('slug', slug)
        .single()

    if (!event || !event.booking_enabled || event.approval_status !== 'approved') {
        return NextResponse.json({ error: 'Event not found or booking unavailable' }, { status: 404 })
    }

    const { data: tiers } = await supabase
        .from('event_tiers')
        .select('id, title, price, capacity, is_active')
        .eq('event_id', event.id)
        .eq('is_active', true)
        .order('price', { ascending: true })

    return NextResponse.json({ event, tiers: tiers ?? [] })
}
