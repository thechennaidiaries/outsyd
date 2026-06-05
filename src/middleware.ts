/**
 * Middleware — handles two concerns:
 *
 * 1. SUBDOMAIN ROUTING
 *    Detects vendors.outsyd.in (or vendors.localhost for local dev)
 *    and rewrites all requests to /vendor-portal/* internally.
 *
 * 2. ROUTE PROTECTION
 *    - /account/* → requires outsyd_session (customer auth)
 *    - /vendor-portal/* → requires outsyd_session + vendor profile
 *      (vendor check happens in /api/vendor/me, not here — keeps middleware fast)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/session'

// Detect vendor subdomain in both prod and local dev
function isVendorSubdomain(req: NextRequest): boolean {
    const host = req.headers.get('host') ?? ''
    return host.startsWith('vendors.')
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // ── 1. Vendor subdomain routing ──────────────────────────────────────────
    if (isVendorSubdomain(req)) {
        // Rewrite: vendors.outsyd.in/dashboard → /vendor-portal/dashboard
        // Don't rewrite: API routes, Next.js internals, customer-facing event pages, or already-prefixed paths
        if (
            !pathname.startsWith('/vendor-portal') &&
            !pathname.startsWith('/api/') &&
            !pathname.startsWith('/_next/') &&
            !pathname.startsWith('/events/')   // booking return page lives here
        ) {
            const rewrittenUrl = req.nextUrl.clone()
            rewrittenUrl.pathname = `/vendor-portal${pathname === '/' ? '/dashboard' : pathname}`
            return NextResponse.rewrite(rewrittenUrl)
        }
    }

    // ── 2. Customer account protection ───────────────────────────────────────
    if (pathname.startsWith('/account')) {
        const token = req.cookies.get('outsyd_session')?.value
        if (!token) {
            return NextResponse.redirect(new URL('/', req.url))
        }
        const session = await verifySessionToken(token)
        if (!session) {
            const response = NextResponse.redirect(new URL('/', req.url))
            response.cookies.set('outsyd_session', '', { maxAge: 0, path: '/' })
            return response
        }
    }

    // ── 3. Vendor portal protection ───────────────────────────────────────────
    // Allow login and signup through unauthenticated
    if (pathname.startsWith('/vendor-portal') &&
        !pathname.startsWith('/vendor-portal/login') &&
        !pathname.startsWith('/vendor-portal/signup')) {

        const token = req.cookies.get('outsyd_session')?.value
        if (!token) {
            // Redirect to vendor login
            const loginUrl = req.nextUrl.clone()
            loginUrl.pathname = '/vendor-portal/login'
            return NextResponse.redirect(loginUrl)
        }
        const session = await verifySessionToken(token)
        if (!session) {
            const response = NextResponse.redirect(
                new URL('/vendor-portal/login', req.url)
            )
            response.cookies.set('outsyd_session', '', { maxAge: 0, path: '/' })
            return response
        }
        // Note: vendor profile check (pending_approval vs active) is done
        // inside each page via /api/vendor/me — not here, to keep middleware fast
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/account/:path*',
        '/vendor-portal/:path*',
        // Match all paths for subdomain detection (excluding static assets)
        '/((?!_next/static|_next/image|favicon.ico|apple-icon.png).*)',
    ],
}
