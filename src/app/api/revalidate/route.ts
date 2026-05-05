import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * On-demand cache revalidation endpoint.
 *
 * Usage:
 *   GET /api/revalidate?secret=YOUR_SECRET&path=/chennai/activities
 *   GET /api/revalidate?secret=YOUR_SECRET&path=/
 *   GET /api/revalidate?secret=YOUR_SECRET&path=/chennai/activities/bowling-at-striker-zone
 *
 * Set REVALIDATE_SECRET in your Vercel environment variables (and .env.local).
 * Never share or commit the secret.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const path = req.nextUrl.searchParams.get('path')

  // ── Auth check ──────────────────────────────────────────────────
  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET env variable is not set on this server.' },
      { status: 500 }
    )
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Path check ──────────────────────────────────────────────────
  if (!path || !path.startsWith('/')) {
    return NextResponse.json(
      { error: 'Missing or invalid "path" query param. Must start with /.' },
      { status: 400 }
    )
  }

  // ── Revalidate ──────────────────────────────────────────────────
  revalidatePath(path)

  return NextResponse.json({
    revalidated: true,
    path,
    timestamp: new Date().toISOString(),
  })
}
