'use client'

/**
 * /account/saved — Saved items page for logged-in users.
 * Fetches saved items from DB, resolves full data, renders using proper card components.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Bookmark, CalendarPlus } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import EventCard from '@/components/EventCard'
import WalkCard from '@/components/WalkCard'
import type { Activity } from '@/data/activities'
import type { Event } from '@/data/events'
import type { Walk } from '@/data/walks'
import { fetchAllActivities, fetchAllEvents, fetchAllWalks } from '@/lib/supabase-data'
import type { SavedItem } from '@/lib/saved-items'

const TAB_NAV = [
    { label: '📋 Bookings', href: '/account/bookings' },
    { label: '❤️ Saved',   href: '/account/saved'    },
    { label: '⚙️ Settings', href: '/account/settings' },
]

type ResolvedItem =
    | { type: 'activity'; data: Activity; savedItem: SavedItem }
    | { type: 'walk';     data: Walk;     savedItem: SavedItem }
    | { type: 'event';    data: Event;    savedItem: SavedItem }

export default function AccountSavedPage() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([])
    const [allActivities, setAllActivities] = useState<Activity[]>([])
    const [allEvents, setAllEvents]         = useState<Event[]>([])
    const [allWalks, setAllWalks]           = useState<Walk[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<{ name?: string; phone_number: string } | null>(null)

    useEffect(() => {
        async function load() {
            // Parallel: fetch session + saved items from DB + all card data
            const [meRes, savesRes, activities, events, walks] = await Promise.all([
                fetch('/api/auth/me').then(r => r.json()),
                fetch('/api/account/saves').then(r => r.json()),
                fetchAllActivities(),
                fetchAllEvents(),
                fetchAllWalks(),
            ])

            if (meRes.user) setUser(meRes.user)

            const dbItems: SavedItem[] = Array.isArray(savesRes.items) ? savesRes.items : []
            setSavedItems(dbItems)
            setAllActivities(activities)
            setAllEvents(events)
            setAllWalks(walks)
            setLoading(false)
        }
        load()
    }, [])

    // Resolve saved items to full card data
    const resolved: ResolvedItem[] = savedItems
        .map(item => {
            if (item.type === 'activity') {
                const data = allActivities.find(a => a.slug === item.slug && a.cityId === item.citySlug)
                if (!data) return null
                return { type: 'activity' as const, data, savedItem: item }
            }
            if (item.type === 'walk') {
                const data = allWalks.find(w => w.slug === item.slug && w.cityId === item.citySlug)
                if (!data) return null
                return { type: 'walk' as const, data, savedItem: item }
            }
            const data = allEvents.find(e => e.slug === item.slug && e.cityId === item.citySlug)
            if (!data) return null
            return { type: 'event' as const, data, savedItem: item }
        })
        .filter(Boolean) as ResolvedItem[]

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        )
    }

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
                        {user?.name ? `${user.name}'s collection · ` : ''}{savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} saved
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
                {savedItems.length === 0 && (
                    <div style={{
                        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                        background: 'var(--bg-card)', padding: '48px 24px', textAlign: 'center',
                    }}>
                        <Bookmark size={28} style={{ margin: '0 auto 14px', color: 'var(--accent)' }} />
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

                {/* Card grid — same layout as /saved */}
                {resolved.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {resolved.map(item => (
                            <div key={`${item.type}-${item.data.slug}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                {item.type === 'activity' ? (
                                    <ActivityCard activity={item.data} citySlug={item.savedItem.citySlug} />
                                ) : item.type === 'walk' ? (
                                    <WalkCard walk={item.data} citySlug={item.savedItem.citySlug} />
                                ) : (
                                    <EventCard event={item.data} citySlug={item.savedItem.citySlug} />
                                )}
                                <button
                                    onClick={() => {
                                        window.location.href = `/${item.savedItem.citySlug}/plan?add=${item.type}:${item.data.slug}`
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', padding: '11px 16px', marginTop: 8,
                                        background: 'transparent',
                                        border: '1.5px solid rgba(255,107,0,0.35)',
                                        borderRadius: 12,
                                        color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                        letterSpacing: '-0.01em',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,0,0.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,0,0.55)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,107,0,0.35)' }}
                                >
                                    <CalendarPlus size={14} />
                                    Add to Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Items with no matching card data (slug not found) */}
                {resolved.length < savedItems.length && (
                    <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-3)' }}>
                        {savedItems.length - resolved.length} saved item(s) could not be displayed — they may have been removed.
                    </p>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    )
}
