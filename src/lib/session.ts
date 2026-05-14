/**
 * Session management — signed JWT stored in httpOnly cookie.
 * Uses `jose` (Edge-compatible, no Node crypto dependency).
 *
 * SESSION_SECRET must be at least 32 characters.
 * Generate one with: openssl rand -base64 32
 */

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'outsyd_session'
const MAX_AGE     = 60 * 60 * 24 * 30  // 30 days in seconds

export interface SessionPayload {
    userId: string
    phone:  string
    name?:  string
}

function getKey(): Uint8Array {
    const secret = process.env.SESSION_SECRET
    if (!secret) throw new Error('SESSION_SECRET environment variable is not set')
    return new TextEncoder().encode(secret)
}

// ── Create a signed JWT ───────────────────────────────────────────────────────

export async function createSessionToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(getKey())
}

// ── Verify a JWT and return the payload ──────────────────────────────────────

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getKey())
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}

// ── Read session from cookie (server components / route handlers) ────────────

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifySessionToken(token)
}
