/**
 * GET /api/test-whatsapp?to=+919876543210
 *
 * Quick test endpoint to verify WaSender is working.
 * Remove or protect this route before going to production.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsApp } from '@/lib/wasender'

export async function GET(req: NextRequest) {
    const to = req.nextUrl.searchParams.get('to')

    if (!to) {
        return NextResponse.json({ error: 'Missing ?to=+91XXXXXXXXXX param' }, { status: 400 })
    }

    console.log(`[test-whatsapp] Sending test message to ${to}`)
    console.log(`[test-whatsapp] WASENDER_API_KEY set: ${!!process.env.WASENDER_API_KEY}`)

    const result = await sendWhatsApp(to, `✅ WaSender test from Outsyd — ${new Date().toISOString()}`)

    console.log(`[test-whatsapp] Result:`, result)

    return NextResponse.json({
        to,
        apiKeySet: !!process.env.WASENDER_API_KEY,
        result,
    })
}
