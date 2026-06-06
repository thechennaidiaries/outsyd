/**
 * POST /api/auth/send-otp
 *
 * Generates a 6-digit OTP, stores it, sends it to the user's
 * WhatsApp number via WaSender.
 *
 * Body: { phone, context?: 'login' | 'booking' }
 * - context defaults to 'login'
 * - 'booking' sends a booking-specific message
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsApp } from '@/lib/wasender'

const PHONE_REGEX = /^\+[1-9]\d{6,14}$/
const OTP_EXPIRY_MINUTES = 10

export async function POST(req: NextRequest) {
    // ── 1. Parse + validate ──────────────────────────────────────────────────
    let phone: string
    let context: 'login' | 'booking' = 'login'
    try {
        const body = await req.json()
        phone   = body.phone?.trim()
        if (body.context === 'booking') context = 'booking'
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!phone || !PHONE_REGEX.test(phone)) {
        return NextResponse.json(
            { error: 'Phone number must be in international format (e.g. +919876543210)' },
            { status: 400 }
        )
    }

    // ── 2. Rate limit — max 3 OTPs per number per 10 minutes ────────────────
    const { count } = await supabase
        .from('otp_verifications')
        .select('id', { count: 'exact', head: true })
        .eq('phone_number', phone)
        .gt('created_at', new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000).toISOString())

    if ((count ?? 0) >= 3) {
        return NextResponse.json(
            { error: 'Too many codes sent. Please wait a few minutes before trying again.' },
            { status: 429 }
        )
    }

    // ── 3. Generate OTP ──────────────────────────────────────────────────────
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    // ── 4. Store OTP ─────────────────────────────────────────────────────────
    const { error: insertError } = await supabase
        .from('otp_verifications')
        .insert({ phone_number: phone, otp, expires_at: expiresAt })

    if (insertError) {
        console.error('[send-otp] Insert error:', insertError)
        return NextResponse.json({ error: 'Failed to generate code. Please try again.' }, { status: 500 })
    }

    // ── 5. Send via WaSender ─────────────────────────────────────────────────
    const message = context === 'booking'
        ? [
            `🎟️ *Your Outsyd booking code: ${otp}*`,
            ``,
            `Enter this code to confirm your identity and proceed with your booking.`,
            `Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
          ].join('\n')
        : [
            `🔐 *Your Outsyd verification code: ${otp}*`,
            ``,
            `Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
          ].join('\n')

    const waResult = await sendWhatsApp(phone, message)
    if (!waResult.success) {
        console.error('[send-otp] WaSender error:', waResult.error)
        return NextResponse.json(
            { error: 'Could not send WhatsApp message. Please check your number and try again.' },
            { status: 500 }
        )
    }

    console.log(`[send-otp] OTP sent to ${phone}`)
    return NextResponse.json({ success: true, message: `Verification code sent to ${phone}` })
}
