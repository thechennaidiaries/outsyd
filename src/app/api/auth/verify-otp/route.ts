/**
 * POST /api/auth/verify-otp
 *
 * Verifies the OTP, creates/finds the user, sets a session cookie.
 * Also back-links any historical guest bookings to the user's account.
 *
 * Body: { phone, otp, name? }
 * Response: { success, userId, isNewUser, name }
 *   - name: the user's stored name (null for brand-new users with no name yet)
 *     Used by the booking page to auto-fill the name field.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createSessionToken } from '@/lib/session'

const COOKIE_NAME = 'outsyd_session'
const MAX_AGE     = 60 * 60 * 24 * 30  // 30 days

export async function POST(req: NextRequest) {
    // ── 1. Parse body ────────────────────────────────────────────────────────
    let phone: string, otp: string, name: string | undefined
    try {
        const body = await req.json()
        phone = body.phone?.trim()
        otp   = body.otp?.trim()
        name  = body.name?.trim() || undefined
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!phone || !otp) {
        return NextResponse.json({ error: 'phone and otp are required' }, { status: 400 })
    }

    // ── 2. Find latest valid OTP for this phone ──────────────────────────────
    const { data: otpRecord, error: fetchError } = await supabase
        .from('otp_verifications')
        .select('id, otp, attempts, expires_at, verified')
        .eq('phone_number', phone)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (fetchError || !otpRecord) {
        return NextResponse.json(
            { error: 'Code expired or not found. Please request a new one.' },
            { status: 400 }
        )
    }

    // ── 3. Check attempt limit ───────────────────────────────────────────────
    if (otpRecord.attempts >= 5) {
        return NextResponse.json(
            { error: 'Too many incorrect attempts. Please request a new code.' },
            { status: 429 }
        )
    }

    // ── 4. Increment attempts ────────────────────────────────────────────────
    await supabase
        .from('otp_verifications')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id)

    // ── 5. Verify code ───────────────────────────────────────────────────────
    if (otpRecord.otp !== otp) {
        const attemptsLeft = 5 - (otpRecord.attempts + 1)
        return NextResponse.json(
            { error: `Incorrect code. ${attemptsLeft > 0 ? `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.` : 'No attempts remaining.'}` },
            { status: 400 }
        )
    }

    // ── 6. Mark OTP as verified (prevent replay) ─────────────────────────────
    await supabase
        .from('otp_verifications')
        .update({ verified: true })
        .eq('id', otpRecord.id)

    // ── 7. Upsert user ───────────────────────────────────────────────────────
    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('outsyd_users')
        .select('id, phone_number, name')
        .eq('phone_number', phone)
        .single()

    const isNewUser = !existingUser

    let userId: string
    let userName: string | undefined

    if (existingUser) {
        userId   = existingUser.id
        userName = existingUser.name ?? name
        // Update name if provided and not yet set
        if (name && !existingUser.name) {
            await supabase
                .from('outsyd_users')
                .update({ name, updated_at: new Date().toISOString() })
                .eq('id', existingUser.id)
        }
    } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
            .from('outsyd_users')
            .insert({ phone_number: phone, name: name ?? null })
            .select('id, name')
            .single()

        if (createError || !newUser) {
            console.error('[verify-otp] User create error:', createError)
            return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 })
        }

        userId   = newUser.id
        userName = newUser.name ?? undefined
    }

    // ── 8. Create session JWT + set cookie ────────────────────────────────────────
    const token = await createSessionToken({ userId, phone, name: userName })

    const response = NextResponse.json({
        success:   true,
        userId,
        isNewUser,
        name:      userName ?? null,   // booking page uses this to auto-fill the name field
    })

    response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   MAX_AGE,
        path:     '/',
    })

    // ── 9. Back-link any orphaned paid guest bookings to this user account ──────
    // Handles users who previously booked as guests and are now logging in.
    // Safe to fire-and-forget (non-critical, doesn't affect the login response).
    supabase
        .from('event_bookings')
        .update({ user_id: userId })
        .eq('customer_phone', phone)
        .eq('payment_status', 'paid')
        .is('user_id', null)
        .then(({ error }) => {
            if (error) console.error('[verify-otp] Back-link bookings error:', error)
        })

    console.log(`[verify-otp] ${isNewUser ? 'New user created' : 'Existing user logged in'}: ${phone}`)
    return response
}
