'use client'

/**
 * /account/saved — Optimistic fast loading version.
 *
 * Strategy:
 * 1. Read localStorage immediately (zero wait) → show skeleton placeholders
 * 2. Fetch /api/account/saves in background → swap in real cards when ready
 *
 * This makes the page feel as fast as /saved while still showing DB data.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, CalendarPlus } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import EventCard from '@/components/EventCard'
import WalkCard from '@/components/WalkCard'
import type { Activity } from '@/data/activities'
import type { Event } from '@/data/events'
import type { Walk } from '@/data/walks'
import { getSavedItems } from '@/lib/saved-items'

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

// ── Skeleton card ──────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div style={{
            borderRadius: 'var(--radius)', overflow: 'hidden',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
        }}>
            <div style={{ height: 200, background: 'var(--bg-elevated)' }} />
            <div style={{ padding: '14px 16px' }}>
                <div style={{ height: 12, width: '60%', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 18, width: '85%', background: 'var(--bg-elevated)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 12, width: '40%', background: 'var(--bg-elevated)', borderRadius: 6 }} />
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountSavedPage() {
    // Step 1: Read localStorage immediately — zero wait
    const [localItems, setLocalItems] = useState<SavedItem[]>([])
    const [resolvedItems, setResolvedItems] = useState<ResolvedItem[] | null>(null) // null = loading
    const [userName, setUserName] = useState('')

    useEffect(() => {
        // Immediately show count from localStorage
        const local = getSavedItems()
        setLocalItems(local)

        // Fetch full data from API in background
        Promise.all([
            fetch('/api/account/saves').then(r => r.json()),
            fetch('/api/auth/me').then(r => r.json()),
        ]).then(([savesJson, meJson]) => {
            if (meJson.user?.name) setUserName(meJson.user.name)
            const resolved = (savesJson.items ?? []).filter((i: any) => i.data !== null) as ResolvedItem[]
            setResolvedItems(resolved)
            // If DB has more items than localStorage (e.g. new device), update local count too
            if (resolved.length > local.length) {
                setLocalItems(resolved.map(r => r.savedItem))
            }
        }).catch(() => {
            setResolvedItems([]) // show empty state on error
        })
    }, [])

    // How many skeletons to show while loading
    const skeletonCount = localItems.length
    const isLoading = resolvedItems === null

    // Display count: use DB count if loaded, else localStorage count
    const displayCount = resolvedItems !== null ? resolvedItems.length : localItems.length

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
                        {userName ? `${userName}'s collection · ` : ''}{displayCount} {displayCount === 1 ? 'item' : 'items'}
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

                {/* Skeleton grid — shows immediately using localStorage count */}
                {isLoading && skeletonCount > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {Array.from({ length: skeletonCount }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}

                {/* Empty state — only show once loaded and truly empty */}
                {!isLoading && resolvedItems.length === 0 && (
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

                {/* Real card grid — swaps in when API responds */}
                {!isLoading && resolvedItems.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {resolvedItems.map(item => (
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

                {/* Empty localStorage but loading (new device) — generic skeleton */}
                {isLoading && skeletonCount === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </main>
    )
}
