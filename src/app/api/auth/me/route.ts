/**
 * POST /api/auth/logout — clears the session cookie
 * GET  /api/auth/me     — returns the current user
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSession } from '@/lib/session'

const COOKIE_NAME = 'outsyd_session'

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ user: null })
    }

    const { data: user } = await supabase
        .from('users')
        .select('id, phone_number, name, created_at')
        .eq('id', session.userId)
        .single()

    return NextResponse.json({ user })
}
