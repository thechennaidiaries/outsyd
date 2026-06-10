import { NextResponse } from 'next/server'

export async function GET() {
    const opsPhone = process.env.OUTSYD_OPS_PHONE ?? 'not set'
    return NextResponse.json({
        OUTSYD_OPS_PHONE: opsPhone,
        rawLength: opsPhone.length,
        hasApiKey: !!process.env.WASENDER_API_KEY,
    })
}

export const dynamic = 'force-dynamic'
