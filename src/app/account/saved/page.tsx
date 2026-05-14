'use client'

/**
 * /account/saved — Fast version.
 * Single API call to /api/account/saves which returns full card data.
 * No more loading all activities/events/walks client-side.
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

const TAB_NAV = [
    { label: '📋 Bookings', href: '/account/bookings' },
    { label: '❤️ Saved',   href: '/account/saved'    },
    { label: '⚙️ Settings', href: '/account/settings' },
]

type SavedItem = { type: string; citySlug: string; slug: string }

type ResolvedItem =
    | { type: 'activity'; data: Activity; savedItem: SavedItem }
    | { type: 'walk';     data: Walk;     savedItem: SavedItem }
    | { type: 'event';    data: Event;    savedItem: SavedItem }

export default function AccountSavedPage() {
    const [items, setItems]     = useState<ResolvedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')

    useEffect(() => {
        // Single call — API returns full mapped data, no need to fetch all
        Promise.all([
            fetch('/api/account/saves').then(r => r.json()),
            fetch('/api/auth/me').then(r => r.json()),
        ]).then(([savesJson, meJson]) => {
            if (meJson.user?.name) setUserName(meJson.user.name)
            const resolved = (savesJson.items ?? []).filter((i: any) => i.data !== null) as ResolvedItem[]
            setItems(resolved)
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

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
                        {userName ? `${userName}'s collection · ` : ''}{items.length} {items.length === 1 ? 'item' : 'items'}
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

                {/* Card grid — identical design to /saved page */}
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
                                <button
                                    onClick={() => {
                                        window.location.href = `/${item.savedItem.citySlug}/plan?add=${item.type}:${item.data.slug}`
                                    }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', padding: '11px 16px', marginTop: 8,
                                        background: 'transparent',
                                        border: '1.5px solid rgba(255,107,0,0.35)', borderRadius: 12,
                                        color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,107,0,0.08)' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                                >
                                    <CalendarPlus size={14} />
                                    Add to Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    )
}
