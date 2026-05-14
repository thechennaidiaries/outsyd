/**
 * /account/saved — Server component (same pattern as /account/bookings).
 * Supabase queries run on the server before HTML is sent to the browser.
 * Zero client-side loading waterfall.
 */

import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActivityCard from '@/components/ActivityCard'
import EventCard from '@/components/EventCard'
import WalkCard from '@/components/WalkCard'
import type { Activity } from '@/data/activities'
import type { Event } from '@/data/events'
import type { Walk } from '@/data/walks'

// ── Field mappers (mirror of supabase-data.ts private fns) ────────────────────

function mapActivity(r: any): Activity {
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
function mapEvent(r: any): Event {
    return {
        id: r.id, slug: r.slug, title: r.title, description: r.description,
        cityId: r.city_id, venue: r.venue, address: r.address,
        mapsLink: r.maps_link, bookingLink: r.booking_link, image: r.image,
        date: r.date, time: r.time, categories: r.categories || [],
        pricingType: r.pricing_type, pricing: r.pricing, status: r.status,
    }
}
function mapWalk(r: any): Walk {
    return {
        id: r.id, slug: r.slug, title: r.title, cityId: r.city_id,
        area: r.area, image: r.image, mapsLink: r.maps_link,
        places: r.places || [],
    }
}

type ParsedSave = { type: string; citySlug: string; slug: string }
type ResolvedItem =
    | { type: 'activity'; data: Activity; savedItem: ParsedSave }
    | { type: 'walk';     data: Walk;     savedItem: ParsedSave }
    | { type: 'event';    data: Event;    savedItem: ParsedSave }

const TAB_NAV = [
    { label: '📋 Bookings', href: '/account/bookings' },
    { label: '❤️ Saved',   href: '/account/saved'    },
    { label: '⚙️ Settings', href: '/account/settings' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SavedPage() {
    const session = await getSession()
    if (!session) redirect('/')

    // 1. Fetch saved activity_ids
    const { data: savedRows } = await supabase
        .from('saved_activities')
        .select('activity_id')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    const parsed: ParsedSave[] = (savedRows ?? [])
        .map(row => {
            const parts = row.activity_id.split(':')
            if (parts.length !== 3) return null
            const [type, citySlug, slug] = parts
            return { type, citySlug, slug }
        })
        .filter(Boolean) as ParsedSave[]

    // 2. Batch fetch only the needed slugs — parallel queries
    const activitySlugs = parsed.filter(p => p.type === 'activity').map(p => p.slug)
    const eventSlugs    = parsed.filter(p => p.type === 'event').map(p => p.slug)
    const walkSlugs     = parsed.filter(p => p.type === 'walk').map(p => p.slug)

    const [activitiesRes, eventsRes, walksRes] = await Promise.all([
        activitySlugs.length > 0 ? supabase.from('activities').select('*').in('slug', activitySlugs) : { data: [] },
        eventSlugs.length    > 0 ? supabase.from('events').select('*').in('slug', eventSlugs)       : { data: [] },
        walkSlugs.length     > 0 ? supabase.from('walks').select('*').in('slug', walkSlugs)         : { data: [] },
    ])

    const activitiesMap = new Map((activitiesRes.data ?? []).map((r: any) => [r.slug, mapActivity(r)]))
    const eventsMap     = new Map((eventsRes.data    ?? []).map((r: any) => [r.slug, mapEvent(r)]))
    const walksMap      = new Map((walksRes.data     ?? []).map((r: any) => [r.slug, mapWalk(r)]))

    // 3. Resolve to typed items (filter out any missing)
    const items: ResolvedItem[] = parsed
        .map(p => {
            if (p.type === 'activity') {
                const data = activitiesMap.get(p.slug)
                return data ? { type: 'activity' as const, data, savedItem: p } : null
            }
            if (p.type === 'event') {
                const data = eventsMap.get(p.slug)
                return data ? { type: 'event' as const, data, savedItem: p } : null
            }
            const data = walksMap.get(p.slug)
            return data ? { type: 'walk' as const, data, savedItem: p } : null
        })
        .filter(Boolean) as ResolvedItem[]

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 100 }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 120px' }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <Link href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                        ← Back to Outsyd
                    </Link>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>
                        My Saved
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
                        {session.name ? `${session.name}'s collection · ` : ''}{items.length} {items.length === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {/* Tab nav */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                    {TAB_NAV.map(tab => {
                        const active = tab.href === '/account/saved'
                        return (
                            <Link key={tab.href} href={tab.href} style={{
                                padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                textDecoration: 'none',
                                background: active ? 'var(--accent)' : 'var(--bg-card)',
                                color: active ? '#000' : 'var(--text-3)',
                                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                            }}>
                                {tab.label}
                            </Link>
                        )
                    })}
                </div>

                {/* Empty state */}
                {items.length === 0 && (
                    <div style={{
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                        background: 'var(--bg-card)', padding: '48px 24px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 14 }}>🤍</div>
                        <p style={{ margin: 0, color: 'var(--text)', fontWeight: 700 }}>Nothing saved yet</p>
                        <p style={{ margin: '8px 0 24px', color: 'var(--text-3)', fontSize: 14 }}>
                            Tap Save on any activity, event, or walk and it will appear here.
                        </p>
                        <Link href="/chennai/activities" style={{
                            padding: '12px 24px', borderRadius: 'var(--radius)',
                            background: 'var(--accent)', color: '#000',
                            fontWeight: 700, fontSize: 14, textDecoration: 'none',
                        }}>
                            Explore Activities
                        </Link>
                    </div>
                )}

                {/* Card grid — client card components render fine from server pages */}
                {items.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {items.map(item => (
                            <div key={`${item.type}-${item.data.slug}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                {item.type === 'activity' ? (
                                    <ActivityCard activity={item.data} citySlug={item.savedItem.citySlug} />
                                ) : item.type === 'walk' ? (
                                    <WalkCard walk={item.data} citySlug={item.savedItem.citySlug} />
                                ) : (
                                    <EventCard event={item.data} citySlug={item.savedItem.citySlug} />
                                )}
                                <Link
                                    href={`/${item.savedItem.citySlug}/plan?add=${item.type}:${item.data.slug}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', padding: '11px 16px', marginTop: 8,
                                        border: '1.5px solid rgba(255,107,0,0.35)', borderRadius: 12,
                                        color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                                        textDecoration: 'none',
                                    }}
                                >
                                    📅 Add to Plan
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Saved — Outsyd',
}
