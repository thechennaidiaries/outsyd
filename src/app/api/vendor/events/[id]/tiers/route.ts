/**
 * GET  /api/vendor/events/[id]/tiers  — list all tiers for event
 * POST /api/vendor/events/[id]/tiers  — add a new tier
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

async function verifyOwnership(userId: string, eventId: string) {
    const { data: vendor } = await supabase
        .from('vendors').select('id').eq('owner_user_id', userId).single()
    if (!vendor) return null

    const { data: event } = await supabase
        .from('events').select('id, approval_status').eq('id', eventId).eq('vendor_id', vendor.id).single()
    if (!event) return null

    return { vendorId: vendor.id, event }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ownership = await verifyOwnership(session.userId, id)
    if (!ownership) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { data: tiers, error } = await supabase
        .from('event_tiers')
        .select('*')
        .eq('event_id', id)
        .order('price', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 })
    return NextResponse.json({ tiers: tiers ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ownership = await verifyOwnership(session.userId, id)
    if (!ownership) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { title, priceInRupees, capacity } = body
    if (!title || priceInRupees === undefined) {
        return NextResponse.json({ error: 'title and priceInRupees are required' }, { status: 400 })
    }

    const priceInPaise = Math.round(Number(priceInRupees) * 100)
    if (priceInPaise < 0) {
        return NextResponse.json({ error: 'Price cannot be negative' }, { status: 400 })
    }

    const { data: tier, error } = await supabase
        .from('event_tiers')
        .insert({
            event_id:  id,
            title:     title.trim(),
            price:     priceInPaise,
            capacity:  capacity ? Number(capacity) : null,
            is_active: true,
        })
        .select('*')
        .single()

    if (error) {
        console.error('[vendor/tiers POST]', error)
        return NextResponse.json({ error: 'Failed to add tier' }, { status: 500 })
    }

    return NextResponse.json({ tier }, { status: 201 })
}
