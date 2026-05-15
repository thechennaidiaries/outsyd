/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */

import { NextResponse } from 'next/server'

const COOKIE_NAME = 'outsyd_session'

export async function POST() {
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, '', {
        httpOnly: true,
        maxAge:   0,
        path:     '/',
    })
    return response
}
