/**
 * POST /api/account/save-item    — add one item to saved_activities
 * DELETE /api/account/save-item  — remove one item from saved_activities
 *
 * Reads the session cookie server-side to get userId.
 * Returns 401 silently if not logged in (client falls back to localStorage).
 *
 * Body: { type: string, slug: string, citySlug: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

function buildActivityId(type: string, citySlug: string, slug: string): string {
    return `${type}:${citySlug}:${slug}`
}

// ── POST — save item ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let type: string, slug: string, citySlug: string
    try {
        const body = await req.json()
        type     = body.type?.trim()
        slug     = body.slug?.trim()
        citySlug = body.citySlug?.trim()
    } catch {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    if (!type || !slug || !citySlug) {
        return NextResponse.json({ error: 'type, slug, citySlug are required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('saved_activities')
        .upsert(
            { user_id: session.userId, activity_id: buildActivityId(type, citySlug, slug) },
            { onConflict: 'user_id,activity_id', ignoreDuplicates: true }
        )

    if (error) {
        console.error('[save-item POST] Error:', error)
        return NextResponse.json({ error: 'Failed to save item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// ── DELETE — remove item ──────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let type: string, slug: string, citySlug: string
    try {
        const body = await req.json()
        type     = body.type?.trim()
        slug     = body.slug?.trim()
        citySlug = body.citySlug?.trim()
    } catch {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    if (!type || !slug || !citySlug) {
        return NextResponse.json({ error: 'type, slug, citySlug are required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('saved_activities')
        .delete()
        .eq('user_id', session.userId)
        .eq('activity_id', buildActivityId(type, citySlug, slug))

    if (error) {
        console.error('[save-item DELETE] Error:', error)
        return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
