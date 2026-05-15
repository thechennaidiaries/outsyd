/**
 * GET /api/account/saves
 *
 * Returns saved items for the logged-in user as plain SavedItem[].
 * Used by useSavedItems hook to hydrate localStorage on every page load
 * so isSaved() / tick marks work across all card components.
 *
 * Returns 401 if not logged in (silently ignored by hook).
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ items: [] }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('saved_activities')
        .select('activity_id')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[GET /api/account/saves] Error:', error)
        return NextResponse.json({ items: [] }, { status: 500 })
    }

    // Parse "type:citySlug:slug" → plain SavedItem shape the hook expects
    const items = (data ?? [])
        .map(row => {
            const parts = row.activity_id.split(':')
            if (parts.length !== 3) return null
            const [type, citySlug, slug] = parts
            return { type, citySlug, slug }
        })
        .filter(Boolean)

    return NextResponse.json({ items })
}
