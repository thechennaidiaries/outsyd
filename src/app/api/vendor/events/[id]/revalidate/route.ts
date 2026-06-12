/**
 * POST /api/vendor/events/[id]/revalidate
 *
 * Vendor triggers manual revalidation (cache refresh) for their live event.
 * Verifies session and vendor ownership before running revalidatePath.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Get active vendor details for the logged-in user
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor || vendor.status !== 'active') {
        return NextResponse.json({ error: 'Vendor not found or not active' }, { status: 403 })
    }

    // 2. Fetch event details, ensuring it belongs to this vendor
    const { data: event } = await supabase
        .from('events')
        .select('id, title, city_id, slug, approval_status')
        .eq('id', id)
        .eq('vendor_id', vendor.id)
        .single()

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // 3. Purge Next.js cache for the event detail page
    const eventPath = `/${event.city_id}/events/${event.slug}`
    try {
        revalidatePath(eventPath)
        console.log(`[revalidate] Purged cache for path: ${eventPath}`)
        return NextResponse.json({ success: true, path: eventPath })
    } catch (err: any) {
        console.error(`[revalidate] Failed to purge cache for path: ${eventPath}`, err)
        return NextResponse.json({ error: 'Failed to refresh cache' }, { status: 500 })
    }
}
