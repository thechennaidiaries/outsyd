/**
 * GET    /api/vendor/events/[id]  — get single event (with tiers)
 * PUT    /api/vendor/events/[id]  — update event
 * DELETE /api/vendor/events/[id]  — delete event (draft/rejected only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

async function getVendorAndEvent(userId: string, eventId: string) {
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('owner_user_id', userId)
        .single()

    if (!vendor || vendor.status !== 'active') return { error: 'Vendor not found or not active', status: 403 }

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('vendor_id', vendor.id)   // ensures vendor owns this event
        .single()

    if (!event) return { error: 'Event not found', status: 404 }

    return { vendor, event }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await getVendorAndEvent(session.userId, id)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

    // Also fetch tiers
    const { data: tiers } = await supabase
        .from('event_tiers')
        .select('*')
        .eq('event_id', id)
        .order('price', { ascending: true })

    return NextResponse.json({ event: result.event, tiers: tiers ?? [] })
}

// ── PUT ───────────────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await getVendorAndEvent(session.userId, id)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
        .from('events')
        .update({
            title:                  body.title,
            description:            body.description ?? null,
            venue:                  body.venue ?? null,
            address:                body.address ?? null,
            maps_link:              body.mapsLink ?? null,
            image:                  body.image ?? null,
            date:                   body.date,
            time:                   body.time ?? null,
            city_id:                body.cityId,
            categories:             body.categories ?? [],
            pricing_type:           body.pricingType ?? 'paid',
            pricing:                body.pricing ?? null,
            event_phone:            body.eventPhone ?? null,
            service_fee_pct:        body.serviceFeePercent ?? 5.00,
            fee_absorbed_by_vendor: body.feeAbsorbedByVendor ?? false,
            refund_policy:          body.refundPolicy ?? null,
            // Reset approval to draft if re-edited after rejection (so they can resubmit)
            approval_status:        result.event.approval_status === 'rejected' ? 'draft' : result.event.approval_status,
        })
        .eq('id', id)
        .select('id, slug, title, approval_status')
        .single()

    if (error) {
        console.error('[vendor/events PUT]', error)
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ event: updated })
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await getVendorAndEvent(session.userId, id)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })

    // Only allow delete of draft/rejected events
    const deletable = ['draft', 'rejected']
    if (!deletable.includes(result.event.approval_status)) {
        return NextResponse.json(
            { error: 'Only draft or rejected events can be deleted. Contact Outsyd to cancel a live event.' },
            { status: 403 }
        )
    }

    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) {
        console.error('[vendor/events DELETE]', error)
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
