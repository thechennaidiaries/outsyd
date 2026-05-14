/**
 * PATCH /api/account/settings
 * Updates the user's name.
 * Reads session cookie server-side.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let name: string
    try {
        const body = await req.json()
        name = body.name?.trim()
    } catch {
        return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    if (!name || name.length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }

    const { error } = await supabase
        .from('outsyd_users')
        .update({ name, updated_at: new Date().toISOString() })
        .eq('id', session.userId)

    if (error) {
        console.error('[PATCH /api/account/settings] Error:', error)
        return NextResponse.json({ error: 'Failed to update name' }, { status: 500 })
    }

    return NextResponse.json({ success: true, name })
}
