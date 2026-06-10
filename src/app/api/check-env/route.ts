import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? 'not set',
        NODE_ENV: process.env.NODE_ENV ?? 'not set',
        VERCEL_ENV: process.env.VERCEL_ENV ?? 'not set',
        hasWasenderApiKey: !!process.env.WASENDER_API_KEY,
        wasenderApiKeyLength: process.env.WASENDER_API_KEY?.length ?? 0,
    })
}

export const dynamic = 'force-dynamic'
