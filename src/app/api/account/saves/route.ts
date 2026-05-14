/**
 * GET /api/account/saves
 *
 * Returns saved items for the logged-in user WITH full card metadata.
 * Does targeted slug-based queries — only fetches exactly what the user saved.
 * Much faster than loading all activities/events/walks client-side.
 *
 * Response: {
 *   items: Array<{
 *     savedItem: { type, citySlug, slug },
 *     data: Activity | Event | Walk | null
 *   }>
 * }
 */

import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ items: [] }, { status: 401 })
    }

    // 1. Get saved activity_ids for this user
    const { data: savedRows, error } = await supabase
        .from('saved_activities')
        .select('activity_id, created_at')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    if (error || !savedRows?.length) {
        return NextResponse.json({ items: [] })
    }

    // 2. Parse composite keys → { type, citySlug, slug }
    type Parsed = { type: string; citySlug: string; slug: string }
    const parsed: Parsed[] = savedRows
        .map(row => {
            const parts = row.activity_id.split(':')
            if (parts.length !== 3) return null
            const [type, citySlug, slug] = parts
            return { type, citySlug, slug }
        })
        .filter(Boolean) as Parsed[]

    if (parsed.length === 0) return NextResponse.json({ items: [] })

    // 3. Group slugs by type for targeted batch queries
    const activitySlugs = parsed.filter(p => p.type === 'activity').map(p => p.slug)
    const eventSlugs    = parsed.filter(p => p.type === 'event').map(p => p.slug)
    const walkSlugs     = parsed.filter(p => p.type === 'walk').map(p => p.slug)

    // 4. Fetch ONLY the needed rows in parallel (much faster than fetchAll*)
    const [activitiesRes, eventsRes, walksRes] = await Promise.all([
        activitySlugs.length > 0
            ? supabase.from('activities').select('*').in('slug', activitySlugs)
            : Promise.resolve({ data: [] }),
        eventSlugs.length > 0
            ? supabase.from('events').select('*').in('slug', eventSlugs)
            : Promise.resolve({ data: [] }),
        walkSlugs.length > 0
            ? supabase.from('walks').select('*').in('slug', walkSlugs)
            : Promise.resolve({ data: [] }),
    ])

    // Build lookup maps for O(1) resolution
    const activitiesMap = new Map((activitiesRes.data ?? []).map((r: any) => [r.slug, r]))
    const eventsMap     = new Map((eventsRes.data    ?? []).map((r: any) => [r.slug, r]))
    const walksMap      = new Map((walksRes.data     ?? []).map((r: any) => [r.slug, r]))

    // Map raw DB rows → camelCase shape expected by ActivityCard/EventCard/WalkCard
    function mapActivity(r: any) {
        return {
            id: r.id, slug: r.slug, title: r.title, description: r.description,
            location: r.location, area: r.area, image: r.image,
            locationLink: r.location_link, address: r.address, timings: r.timings,
            tags: r.tags || [], bookingLink: r.booking_link,
            bookingEnabled: r.booking_enabled ?? false,
            pricingType: r.pricing_type, pricing: r.pricing,
            cityId: r.city_id, placeId: r.place_id, addedDate: r.added_date,
        }
    }
    function mapEvent(r: any) {
        return {
            id: r.id, slug: r.slug, title: r.title, description: r.description,
            cityId: r.city_id, venue: r.venue, address: r.address,
            mapsLink: r.maps_link, bookingLink: r.booking_link, image: r.image,
            date: r.date, time: r.time, categories: r.categories || [],
            pricingType: r.pricing_type, pricing: r.pricing, status: r.status,
        }
    }
    function mapWalk(r: any) {
        return {
            id: r.id, slug: r.slug, title: r.title, cityId: r.city_id,
            area: r.area, image: r.image, mapsLink: r.maps_link,
            places: r.places || [],
        }
    }

    // 5. Resolve each saved item to its full mapped data
    const items = parsed.map(p => {
        let data = null
        if (p.type === 'activity') {
            const raw = activitiesMap.get(p.slug)
            data = raw ? mapActivity(raw) : null
        } else if (p.type === 'event') {
            const raw = eventsMap.get(p.slug)
            data = raw ? mapEvent(raw) : null
        } else if (p.type === 'walk') {
            const raw = walksMap.get(p.slug)
            data = raw ? mapWalk(raw) : null
        }
        return { savedItem: p, data }
    })

    return NextResponse.json({ items })
}
