'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Activity } from '@/data/activities'
import type { Walk } from '@/data/walks'
import type { Event } from '@/data/events'
import type { City } from '@/data/cities'
import { fetchCityBySlug, fetchActivitiesByCity, fetchWalksByCity, fetchEventsByCity } from '@/lib/supabase-data'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, X, ArrowRight, RefreshCw, Footprints } from 'lucide-react'
import SaveItemButton from '@/components/SaveItemButton'

// Unified type for both activities and walks in the surprise deck
interface SurpriseItem {
    id: string
    type: 'activity' | 'walk' | 'event'
    title: string
    image: string
    location: string    // venue name
    area: string        // neighbourhood / area
    tags: string[]
    slug: string
    date?: string       // for events: display date
    time?: string       // for events: display time
}

/* ── helpers ─────────────────────────────────────────────────────── */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

const THRESHOLD = 90   // px needed to commit a swipe

/* ── Page ────────────────────────────────────────────────────────── */
export default function SurprisePage() {
    const router = useRouter()
    const params = useParams()
    const citySlug = params.city as string

    const [city, setCity] = useState<City | null>(null)
    const [cityActivities, setCityActivities] = useState<Activity[]>([])
    const [cityWalks, setCityWalks] = useState<Walk[]>([])
    const [cityEvents, setCityEvents] = useState<Event[]>([])
    const [dataLoaded, setDataLoaded] = useState(false)

    // Build a unified pool of activities + walks + events
    function buildPool(activities: Activity[], walks: Walk[], events: Event[]): SurpriseItem[] {
        const activityItems: SurpriseItem[] = activities
            .filter(a => a.image && a.slug) // only include activities with image and slug
            .map(a => ({
                id: `activity-${a.id}`,
                type: 'activity',
                title: a.title,
                image: a.image!,
                location: a.location ?? a.area ?? '',
                area: a.area ?? '',
                tags: a.tags ?? [],
                slug: a.slug!,
            }))
        const walkItems: SurpriseItem[] = walks.map(w => ({
            id: `walk-${w.id}`,
            type: 'walk',
            title: w.title,
            image: w.image,
            location: w.area,
            area: w.area,
            tags: ['Crawl'],
            slug: w.slug,
        }))
        const eventItems: SurpriseItem[] = events
            .filter(e => e.image) // only include events with images
            .map(e => {
                const dateObj = new Date(e.date + 'T00:00:00')
                const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    month: 'short', day: 'numeric', weekday: 'short',
                })
                return {
                    id: `event-${e.id}`,
                    type: 'event' as const,
                    title: e.title,
                    image: e.image!,
                    location: e.venue ?? e.address ?? '',
                    area: e.address ?? '',
                    tags: e.categories ?? [],
                    slug: e.slug,
                    date: formattedDate,
                    time: e.time,
                }
            })
        return shuffle([...activityItems, ...walkItems, ...eventItems])
    }

    const [deck, setDeck] = useState<SurpriseItem[]>([])
    const [idx, setIdx] = useState(0)
    const [offset, setOffset] = useState(0)
    const [dragging, setDragging] = useState(false)
    const [flying, setFlying] = useState<'left' | 'right' | null>(null)
    const [imgErr, setImgErr] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    const startX = useRef(0)

    // Show onboarding hints only once per session
    useEffect(() => {
        if (!sessionStorage.getItem('surprise-onboarded')) {
            setShowOnboarding(true)
        }
    }, [])

    // Mark onboarding complete as soon as "swipe right" hint appears (idx 2)
    // so if user navigates away via right-swipe, it's already persisted
    useEffect(() => {
        if (showOnboarding && idx >= 2) {
            sessionStorage.setItem('surprise-onboarded', '1')
        }
        if (showOnboarding && idx >= 3) {
            setShowOnboarding(false)
        }
    }, [idx, showOnboarding])

    const item = deck[idx]
    const isDone = idx >= deck.length

    /* ── drag logic ─────────────────────────────────────────────── */
    const onStart = (x: number) => {
        if (flying) return
        startX.current = x
        setDragging(true)
    }
    const onMove = (x: number) => {
        if (!dragging || flying) return
        setOffset(x - startX.current)
    }
    const onEnd = () => {
        if (!dragging) return
        setDragging(false)
        if (Math.abs(offset) >= THRESHOLD) {
            const dir = offset > 0 ? 'right' : 'left'
            setFlying(dir)
            setOffset(dir === 'right' ? 700 : -700)
            setTimeout(() => {
                if (dir === 'right') {
                    const route = item.type === 'walk'
                        ? `/${citySlug}/walks/${item.slug}`
                        : item.type === 'event'
                        ? `/${citySlug}/events/${item.slug}`
                        : `/${citySlug}/activities/${item.slug}`
                    router.push(route)
                } else {
                    setImgErr(false)
                    setIdx(i => i + 1)
                    setFlying(null)
                    setOffset(0)
                }
            }, 380)
        } else {
            setOffset(0)
        }
    }

    // Load data and shuffle on client only — avoids hydration mismatch from Math.random()
    useEffect(() => {
        async function loadData() {
            const [cityData, activities, walks, events] = await Promise.all([
                fetchCityBySlug(citySlug),
                fetchActivitiesByCity(citySlug),
                fetchWalksByCity(citySlug),
                fetchEventsByCity(citySlug),
            ])
            if (cityData) setCity(cityData)
            setCityActivities(activities)
            setCityWalks(walks)
            setCityEvents(events)
            setDeck(buildPool(activities, walks, events))
            setDataLoaded(true)
        }
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [citySlug])

    const onReset = () => { setDeck(buildPool(cityActivities, cityWalks, cityEvents)); setIdx(0); setOffset(0); setFlying(null); setImgErr(false) }

    // Return nothing until deck is ready (avoids hydration mismatch)
    if (!dataLoaded || deck.length === 0) return null

    // Derived visuals
    const rotate = offset * 0.06
    const swipeLeft = Math.min(1, Math.max(0, -offset / THRESHOLD))
    const swipeRight = Math.min(1, Math.max(0, offset / THRESHOLD))

    /* ── All done screen ─────────────────────────────────────────── */
    if (isDone) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 20,
                background: 'var(--bg)', padding: '24px',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: 64 }}>🎉</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
                    You've seen it all!
                </h2>
                <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 280 }}>
                    No more surprises left. Start over to discover again.
                </p>
                <button onClick={onReset} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', borderRadius: 100,
                    background: 'linear-gradient(135deg, #FF6B00, #FF8533)',
                    color: 'white', fontSize: 15, fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 24px rgba(255,107,0,0.35)',
                }}>
                    <RefreshCw size={16} /> Start over
                </button>
            </div>
        )
    }

    /* ── Main ────────────────────────────────────────────────────── */
    return (
        <div style={{
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'var(--bg)',
            userSelect: 'none',
            overflow: 'hidden',
        }}>

            {/* ── Top spacer for fixed header logo ── */}
            <div style={{ flexShrink: 0, height: 80 }} />

            {/* ── Headline ───────────────────────── */}
            <div style={{ textAlign: 'center', flexShrink: 0, padding: '8px 24px 16px' }}>
                <h1 style={{
                    fontFamily: "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontSize: 'clamp(17px, 5vw, 22px)',
                    fontWeight: 500,
                    color: '#ffffff',
                    lineHeight: 1.1,
                    letterSpacing: '0em',
                    marginBottom: 10,
                    whiteSpace: 'nowrap',
                }}>
                    Can’t decide where to go?
                </h1>
                <p style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'clamp(24px, 7vw, 34px)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    lineHeight: 1,
                    paddingRight: 6,
                }}>
                    Swipe &amp; Go where it takes you
                </p>
            </div>

            {/* ── Card area — fills remaining viewport height ── */}
            <div style={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 24px',
                paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
            }}>
                {/* ── Stacked cards ────────────────────────────────────── */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 360,
                    flex: 1,
                    minHeight: 0,
                    maxHeight: 580,
                }}>

                    {/* Cards behind (depth effect) */}
                    {[2, 1].map(depth => {
                        const behindIdx = idx + depth
                        if (behindIdx >= deck.length) return null
                        const behind = deck[behindIdx]
                        return (
                            <div key={behind.id} style={{
                                position: 'absolute', inset: 0,
                                borderRadius: 24,
                                transform: `scale(${1 - depth * 0.04}) translateY(${depth * 14}px)`,
                                zIndex: 0,
                                overflow: 'hidden',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                            }}>
                                <img
                                    src={behind.image}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, filter: 'blur(2px)' }}
                                />
                            </div>
                        )
                    })}

                    {/* Active card */}
                    <div
                        style={{
                            position: 'absolute', inset: 0,
                            borderRadius: 24, overflow: 'hidden',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            zIndex: 10,
                            transform: `translateX(${offset}px) rotate(${rotate}deg)`,
                            transition: dragging ? 'none' : flying ? 'transform 0.38s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
                            cursor: dragging ? 'grabbing' : 'grab',
                            touchAction: 'none',
                            willChange: 'transform',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
                        }}
                        onMouseDown={e => onStart(e.clientX)}
                        onMouseMove={e => onMove(e.clientX)}
                        onMouseUp={onEnd}
                        onMouseLeave={() => { if (dragging) onEnd() }}
                        onTouchStart={e => onStart(e.touches[0].clientX)}
                        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX) }}
                        onTouchEnd={onEnd}
                    >
                        {/* Image */}
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {!imgErr ? (
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    draggable={false}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                                    onError={() => setImgErr(true)}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                                    {item.type === 'walk' ? '🚶' : item.type === 'event' ? '🎪' : '📍'}
                                </div>
                            )}

                            {/* Gradient */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.9) 100%)',
                            }} />

                            {/* Onboarding: Swipe left hint — first 2 cards */}
                            {showOnboarding && idx < 2 && (
                                <div style={{
                                    position: 'absolute', top: 16, left: 14,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    pointerEvents: 'none', zIndex: 20,
                                }}>
                                    <span style={{
                                        fontSize: 22, display: 'inline-block',
                                        color: '#ffffff',
                                        animation: 'swipeHintLeft 1s ease-in-out infinite',
                                        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                    }}>←</span>
                                    <span style={{
                                        fontFamily: "'Caveat', cursive",
                                        color: '#ffffff', fontSize: 18, fontWeight: 700,
                                        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                        lineHeight: 1.1,
                                    }}>swipe left to skip</span>
                                </div>
                            )}

                            {/* Onboarding: Swipe right hint — card 3, then mark as done */}
                            {showOnboarding && idx === 2 && (
                                <div style={{
                                    position: 'absolute', top: 16, right: 14,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    pointerEvents: 'none', zIndex: 20,
                                }}>
                                    <span style={{
                                        fontFamily: "'Caveat', cursive",
                                        color: '#4ade80', fontSize: 18, fontWeight: 700,
                                        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                        lineHeight: 1.1,
                                    }}>swipe right to know more</span>
                                    <span style={{
                                        fontSize: 22, display: 'inline-block',
                                        color: '#4ade80',
                                        animation: 'swipeHintRight 1s ease-in-out infinite',
                                        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                                    }}>→</span>
                                </div>
                            )}

                            {/* Inline keyframes for swipe hint animations */}
                            <style>{`
                                @keyframes swipeHintLeft {
                                    0%, 100% { transform: translateX(0); }
                                    50% { transform: translateX(-8px); }
                                }
                                @keyframes swipeHintRight {
                                    0%, 100% { transform: translateX(0); }
                                    50% { transform: translateX(8px); }
                                }
                            `}</style>

                            <div style={{ position: 'absolute', top: 16, right: 14, zIndex: 25 }}>
                                <SaveItemButton type={item.type} slug={item.slug} citySlug={citySlug} compact iconOnly />
                            </div>

                            {/* SKIP label — left swipe indicator */}
                            <div style={{
                                position: 'absolute', top: 24, left: 20,
                                padding: '8px 16px', borderRadius: 10,
                                border: '3px solid #f87171',
                                color: '#f87171', fontSize: 20, fontWeight: 900,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                opacity: swipeLeft,
                                transform: `rotate(-12deg)`,
                                transition: 'opacity 0.1s',
                                pointerEvents: 'none',
                            }}>
                                SKIP
                            </div>

                            {/* EXPLORE label — right swipe indicator */}
                            <div style={{
                                position: 'absolute', top: 24, right: 20,
                                padding: '8px 16px', borderRadius: 10,
                                border: '3px solid #4ade80',
                                color: '#4ade80', fontSize: 20, fontWeight: 900,
                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                opacity: swipeRight,
                                transform: `rotate(12deg)`,
                                transition: 'opacity 0.1s',
                                pointerEvents: 'none',
                            }}>
                                GO!
                            </div>

                            {/* Title + Location */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px 22px' }}>
                                {/* Badge: area for activities/walks, date for events */}
                                {item.type === 'event' ? (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 100,
                                            background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
                                            color: '#c4b5fd', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                        }}>
                                            <Calendar size={9} />
                                            {item.date}{item.time ? ` · ${item.time}` : ''}
                                        </span>
                                    </div>
                                ) : item.area ? (
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 100,
                                            background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)',
                                            color: '#FF9A3C', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                        }}>
                                            <MapPin size={9} />
                                            {item.area}
                                        </span>
                                    </div>
                                ) : null}
                                <p style={{
                                    fontSize: 17, fontWeight: 800, color: '#fff',
                                    lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.02em',
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                }}>
                                    {item.title}
                                </p>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                                    {item.type === 'event' ? <Calendar size={11} /> : <MapPin size={11} />} {item.location}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Desktop action buttons ── */}
                <div className="hidden md:flex" style={{ flexShrink: 0, gap: 20, paddingTop: 20, alignItems: 'center' }}>
                    {/* Skip */}
                    <button
                        onClick={() => {
                            setFlying('left')
                            setOffset(-700)
                            setTimeout(() => { setImgErr(false); setIdx(i => i + 1); setFlying(null); setOffset(0) }, 380)
                        }}
                        style={{
                            width: 62, height: 62, borderRadius: '50%',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        }}
                        className="hover:border-red-400/50 hover:bg-red-400/10"
                    >
                        <X size={24} color="#f87171" />
                    </button>

                    {/* Counter */}
                    <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, minWidth: 60, textAlign: 'center' }}>
                        {idx + 1} / {deck.length}
                    </span>

                    {/* Explore */}
                    <button
                        onClick={() => {
                            setFlying('right')
                            setOffset(700)
                            const route = item.type === 'walk'
                                ? `/${citySlug}/walks/${item.slug}`
                                : item.type === 'event'
                                ? `/${citySlug}/events/${item.slug}`
                                : `/${citySlug}/activities/${item.slug}`
                            setTimeout(() => router.push(route), 380)
                        }}
                        style={{
                            width: 62, height: 62, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF6B00, #FF8533)',
                            border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s ease',
                            boxShadow: '0 4px 24px rgba(255,107,0,0.4)',
                        }}
                        className="hover:shadow-[0_6px_32px_rgba(255,107,0,0.55)] hover:-translate-y-0.5"
                    >
                        <ArrowRight size={24} color="white" />
                    </button>
                </div>
            </div>
        </div>
    )
}
