/**
 * POST /api/vendor/events/[id]/submit
 *
 * Vendor submits their event for Outsyd review.
 * approval_status: draft/rejected → submitted
 * Outsyd then approves in Supabase → approved + booking_enabled = true
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify vendor owns this event
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 403 })

    const { data: event } = await supabase
        .from('events')
        .select('id, title, approval_status')
        .eq('id', id)
        .eq('vendor_id', vendor.id)
        .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Only draft or rejected events can be submitted
    if (!['draft', 'rejected'].includes(event.approval_status)) {
        return NextResponse.json(
            { error: `Event is already ${event.approval_status}. Cannot resubmit.` },
            { status: 400 }
        )
    }

    // Must have at least one active tier before submitting
    const { count } = await supabase
        .from('event_tiers')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', id)
        .eq('is_active', true)

    if (!count || count === 0) {
        return NextResponse.json(
            { error: 'Add at least one ticket tier before submitting for review.' },
            { status: 400 }
        )
    }

    const { error } = await supabase
        .from('events')
        .update({ approval_status: 'submitted' })
        .eq('id', id)

    if (error) {
        console.error('[vendor/events/submit]', error)
        return NextResponse.json({ error: 'Failed to submit event' }, { status: 500 })
    }

    console.log(`[vendor/events/submit] Event ${id} (${event.title}) submitted for review`)
    return NextResponse.json({ success: true, approval_status: 'submitted' })
}
