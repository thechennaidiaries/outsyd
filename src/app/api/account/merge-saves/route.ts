/**
 * POST /api/account/merge-saves
 *
 * Called client-side immediately after OTP verification.
 * Reads the user's anonymous localStorage saves and inserts
 * them into the saved_activities table, then the client clears localStorage.
 *
 * Body: {
 *   userId: string,
 *   items: Array<{ type: string, slug: string, citySlug: string }>
 * }
 *
 * Uses ON CONFLICT DO NOTHING — safe to call multiple times.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    let userId: string
    let items: Array<{ type: string; slug: string; citySlug: string }>

    try {
        const body = await req.json()
        userId = body.userId
        items  = body.items ?? []
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!userId || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ merged: 0 })
    }

    // Build rows — activity_id uses a composite key: "type:citySlug:slug"
    // This keeps the TEXT activity_id unique and human-readable.
    const rows = items
        .filter(item => item.type && item.slug && item.citySlug)
        .map(item => ({
            user_id:     userId,
            activity_id: `${item.type}:${item.citySlug}:${item.slug}`,
        }))

    if (rows.length === 0) {
        return NextResponse.json({ merged: 0 })
    }

    const { error } = await supabase
        .from('saved_activities')
        .upsert(rows, { onConflict: 'user_id,activity_id', ignoreDuplicates: true })

    if (error) {
        console.error('[merge-saves] Upsert error:', error)
        return NextResponse.json({ error: 'Failed to merge saves' }, { status: 500 })
    }

    console.log(`[merge-saves] Merged ${rows.length} items for user ${userId}`)
    return NextResponse.json({ merged: rows.length })
}
