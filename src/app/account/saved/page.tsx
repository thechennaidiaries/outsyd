/**
 * /account/saved — Saved activities page (server component).
 * Fetches saved items from DB, looks up activity metadata from Supabase.
 */

import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ActivityMeta {
    slug: string
    title: string
    image?: string
    area?: string
    city_id: string
    pricing_per_person?: number
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SavedPage() {
    const session = await getSession()
    if (!session) redirect('/')

    // Fetch saved activity_ids for this user
    const { data: savedRows } = await supabase
        .from('saved_activities')
        .select('activity_id, created_at')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    // Parse composite keys → { type, citySlug, slug }
    type ParsedSave = { type: string; citySlug: string; slug: string }
    const parsed: ParsedSave[] = (savedRows ?? [])
        .map(row => {
            const parts = row.activity_id.split(':')
            if (parts.length !== 3) return null
            const [type, citySlug, slug] = parts
            return { type, citySlug, slug }
        })
        .filter(Boolean) as ParsedSave[]

    // Fetch activity metadata for all saved activity slugs
    const activitySlugs = parsed.filter(p => p.type === 'activity').map(p => p.slug)
    let activities: ActivityMeta[] = []

    if (activitySlugs.length > 0) {
        const { data } = await supabase
            .from('activities')
            .select('slug, title, image, area, city_id, pricing_per_person')
            .in('slug', activitySlugs)
        activities = (data ?? []) as ActivityMeta[]
    }

    const activityMap = new Map(activities.map(a => [a.slug, a]))

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <Link href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                    ← Back to Outsyd
                </Link>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                    My Account
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {parsed.length} {parsed.length === 1 ? 'item' : 'items'} saved
                </p>
            </div>

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { label: '📋 Bookings', href: '/account/bookings', active: false },
                    { label: '❤️ Saved',   href: '/account/saved',    active: true  },
                    { label: '⚙️ Settings', href: '/account/settings', active: false },
                ].map(tab => (
                    <Link key={tab.href} href={tab.href} style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        textDecoration: 'none',
                        background: tab.active ? 'var(--accent)' : 'var(--bg-card)',
                        color: tab.active ? '#000' : 'var(--text-3)',
                        border: `1px solid ${tab.active ? 'var(--accent)' : 'var(--border)'}`,
                    }}>
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Empty state */}
            {parsed.length === 0 && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🤍</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                        Nothing saved yet
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
                        Tap the heart on any activity to save it here.
                    </div>
                    <Link href="/chennai/activities" style={{
                        padding: '12px 24px', borderRadius: 'var(--radius)',
                        background: 'var(--accent)', color: '#000',
                        fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    }}>
                        Explore Activities
                    </Link>
                </div>
            )}

            {/* Saved activities grid */}
            {parsed.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {parsed.map(({ type, citySlug, slug }) => {
                        if (type === 'activity') {
                            const act = activityMap.get(slug)
                            if (!act) return null
                            return (
                                <Link
                                    key={`${type}:${citySlug}:${slug}`}
                                    href={`/${act.city_id}/activities/${slug}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{
                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius)', overflow: 'hidden',
                                        display: 'flex', gap: 0,
                                        transition: 'border-color 0.2s',
                                    }}>
                                        {/* Thumbnail */}
                                        {act.image && (
                                            <div style={{ width: 96, height: 88, flexShrink: 0, overflow: 'hidden' }}>
                                                <img
                                                    src={act.image}
                                                    alt={act.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                        {/* Info */}
                                        <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
                                                {type}
                                            </div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {act.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 8 }}>
                                                {act.area && <span>📍 {act.area}</span>}
                                                {act.pricing_per_person && <span>₹{act.pricing_per_person}/person</span>}
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px 14px 14px 0', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ fontSize: 18 }}>❤️</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }

                        // Walk / event — basic card
                        return (
                            <div key={`${type}:${citySlug}:${slug}`} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: '14px 16px',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>
                                        {type}
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{slug}</div>
                                </div>
                                <span style={{ fontSize: 18 }}>❤️</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Saved — Outsyd',
}
