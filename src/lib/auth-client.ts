/**
 * Client-side auth state helper.
 * Sets/clears a localStorage flag so the Navbar can know auth state
 * INSTANTLY (synchronously) without waiting for /api/auth/me.
 *
 * This is NOT a security mechanism — the real session lives in the
 * httpOnly JWT cookie. This flag is just for UI routing purposes.
 */

const AUTH_FLAG_KEY = 'outsyd_authed'

export function markLoggedIn(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_FLAG_KEY, '1')
    }
}

export function markLoggedOut(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_FLAG_KEY)
    }
}

/** Synchronous — no await, no flash. */
export function isClientLoggedIn(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(AUTH_FLAG_KEY) === '1'
}
