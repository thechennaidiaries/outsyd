/**
 * Middleware — protects /account/* routes.
 * Redirects unauthenticated users to the home page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/session'

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (pathname.startsWith('/account')) {
        const token = req.cookies.get('outsyd_session')?.value

        if (!token) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        const session = await verifySessionToken(token)
        if (!session) {
            // Token invalid or expired — clear cookie and redirect
            const response = NextResponse.redirect(new URL('/', req.url))
            response.cookies.set('outsyd_session', '', { maxAge: 0, path: '/' })
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/account/:path*'],
}
