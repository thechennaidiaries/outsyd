/**
 * PUT    /api/vendor/events/[id]/tiers/[tid]  — update tier
 * DELETE /api/vendor/events/[id]/tiers/[tid]  — delete tier
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

async function verifyTierOwnership(userId: string, eventId: string, tierId: string) {
    const { data: vendor } = await supabase
        .from('vendors').select('id').eq('owner_user_id', userId).single()
    if (!vendor) return null

    const { data: event } = await supabase
        .from('events').select('id, approval_status').eq('id', eventId).eq('vendor_id', vendor.id).single()
    if (!event) return null

    const { data: tier } = await supabase
        .from('event_tiers').select('*').eq('id', tierId).eq('event_id', eventId).single()
    if (!tier) return null

    return { event, tier }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string; tid: string } }
) {
    const { id, tid } = params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ownership = await verifyTierOwnership(session.userId, id, tid)
    if (!ownership) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const updateData: Record<string, any> = {}
    if (body.title !== undefined)         updateData.title     = body.title.trim()
    if (body.priceInRupees !== undefined)  updateData.price     = Math.round(Number(body.priceInRupees) * 100)
    if (body.capacity !== undefined)       updateData.capacity  = body.capacity ? Number(body.capacity) : null
    if (body.isActive !== undefined)       updateData.is_active = body.isActive

    const { data: tier, error } = await supabase
        .from('event_tiers')
        .update(updateData)
        .eq('id', tid)
        .select('*')
        .single()

    if (error) {
        console.error('[vendor/tiers PUT]', error)
        return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
    }

    return NextResponse.json({ tier })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; tid: string } }
) {
    const { id, tid } = params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ownership = await verifyTierOwnership(session.userId, id, tid)
    if (!ownership) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })

    const { error } = await supabase.from('event_tiers').delete().eq('id', tid)
    if (error) {
        console.error('[vendor/tiers DELETE]', error)
        return NextResponse.json({ error: 'Failed to delete tier' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
