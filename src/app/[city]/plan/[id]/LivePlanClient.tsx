'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Share2, Plus, ChevronUp, ChevronDown, X,
    Check, Calendar, MapPin, Loader2, Wifi, Footprints, Search, Bookmark,
} from 'lucide-react'
import { getActivitiesByCity } from '@/data/activities'
import { getEventsByCity } from '@/data/events'
import { getCityBySlug } from '@/data/cities'
import { getWalksByCity } from '@/data/walks'
import { useSavedItems } from '@/hooks/useSavedItems'
import { notFound } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Plan {
    id: string
    name: string
    date: string
    city: string
    activities: string[]
    updated_at: string
}

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'loading'

function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
}

// ── Sync status indicator ─────────────────────────────────────────────────────

function SyncIndicator({ status }: { status: SyncStatus }) {
    const config = {
        synced: { color: '#22c55e', label: 'Synced', pulse: false },
        syncing: { color: '#f59e0b', label: 'Syncing…', pulse: true },
        offline: { color: '#ef4444', label: 'Offline', pulse: false },
        loading: { color: '#f59e0b', label: 'Loading…', pulse: true },
    }
    const { color, label, pulse } = config[status]

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: color, display: 'block', flexShrink: 0,
                animation: pulse ? 'syncPulse 1.5s ease-in-out infinite' : 'none',
            }} />
            {label}
        </div>
    )
}

// ── Plan activity card ────────────────────────────────────────────────────────

type PlanEntry =
    | {
        id: string
        type: 'activity'
        title: string
        image: string
        href: string
        meta: string
        badge?: string
        removeId: string
    }
    | {
        id: string
        type: 'walk'
        title: string
        image: string
        href: string
        meta: string
        badge?: string
        removeId: string
    }
    | {
        id: string
        type: 'event'
        title: string
        image: string
        href: string
        meta: string
        badge?: string
        removeId: string
    }

function PlanItemCard({
    item, index, total, onMoveUp, onMoveDown, onRemove,
}: {
    item: PlanEntry
    index: number
    total: number
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '12px 14px',
            transition: 'border-color 0.2s',
        }}>
            {/* Step number */}
            <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: 'var(--accent)',
            }}>
                {index + 1}
            </div>

            {/* Thumbnail */}
            <Link href={item.href} style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', display: 'block', position: 'relative' }}>
                <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }}
                />
                {item.badge && (
                    <div style={{
                        position: 'absolute',
                        top: 6,
                        left: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: item.type === 'event' ? 'rgba(255,107,0,0.92)' : 'rgba(0,0,0,0.7)',
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 800,
                    }}>
                        {item.type === 'walk' ? <Footprints size={8} /> : item.type === 'event' ? <Calendar size={8} /> : null}
                        {item.badge}
                    </div>
                )}
            </Link>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={item.href} style={{ textDecoration: 'none' }}>
                    <p style={{
                        fontSize: 14, fontWeight: 700, color: 'var(--text)',
                        lineHeight: 1.3, marginBottom: 5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                        {item.title}
                    </p>
                </Link>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-3)', fontWeight: 500,
                }}>
                    <MapPin size={10} style={{ flexShrink: 0 }} />
                    {item.meta}
                </span>
            </div>

            {/* Reorder + remove controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <button
                    onClick={onMoveUp} disabled={index === 0}
                    aria-label="Move up"
                    style={{
                        width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                        background: 'transparent',
                        color: index === 0 ? 'var(--text-3)' : 'var(--text-2)',
                        cursor: index === 0 ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                ><ChevronUp size={14} /></button>

                <button
                    onClick={onMoveDown} disabled={index === total - 1}
                    aria-label="Move down"
                    style={{
                        width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
                        background: 'transparent',
                        color: index === total - 1 ? 'var(--text-3)' : 'var(--text-2)',
                        cursor: index === total - 1 ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                ><ChevronDown size={14} /></button>

                <button
                    onClick={onRemove}
                    aria-label="Remove"
                    style={{
                        width: 30, height: 30, borderRadius: 8,
                        border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.07)',
                        color: '#f87171', cursor: 'pointer', marginLeft: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                    }}
                ><X size={13} /></button>
            </div>
        </div>
    )
}

// ── Share button ──────────────────────────────────────────────────────────────

function SharePlanButton({ planName }: { planName: string }) {
    const [state, setState] = useState<'idle' | 'copied'>('idle')

    async function handleShare() {
        const url = window.location.href
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({ title: planName, text: `Check out my plan — "${planName}"`, url })
                return
            } catch { /* user cancelled */ }
        }
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            const inp = document.createElement('input')
            inp.value = url
            document.body.appendChild(inp); inp.select(); document.execCommand('copy'); document.body.removeChild(inp)
        }
        setState('copied')
        setTimeout(() => setState('idle'), 2200)
    }

    const copied = state === 'copied'
    return (
        <button
            onClick={handleShare}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 100, flexShrink: 0,
                background: copied ? 'rgba(255,107,0,0.10)' : 'transparent',
                border: `1.5px solid ${copied ? 'var(--accent)' : 'rgba(255,107,0,0.5)'}`,
                color: 'var(--accent)', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.22s ease',
            }}
        >
            {copied ? <Check size={14} strokeWidth={2.5} /> : <Share2 size={14} />}
            {copied ? 'Copied!' : 'Share'}
        </button>
    )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function LivePlanClient({ planId }: { planId: string }) {
    const params = useParams()
    const router = useRouter()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    const cityActivities = getActivitiesByCity(city.id)
    const cityWalks = getWalksByCity(city.id)
    const cityEvents = getEventsByCity(city.id)
    const { savedItems } = useSavedItems()

    // ── Picker data ───────────────────────────────────────────────────────
    type PickerItem = { id: string; type: 'activity' | 'walk' | 'event'; title: string; image: string; area: string; slug: string; category: string }
    const pickerPool: PickerItem[] = [
        ...cityEvents.map(e => ({ id: `event-${e.id}`, type: 'event' as const, title: e.title, image: e.image ?? '', area: e.address ?? e.venue ?? '', slug: e.slug, category: 'Events' })),
        ...cityWalks.map(w => ({ id: `walk-${w.id}`, type: 'walk' as const, title: w.title, image: w.image, area: w.area, slug: w.slug, category: 'Walks' })),
        ...cityActivities.map(a => ({ id: a.id ?? '', type: 'activity' as const, title: a.title, image: a.image ?? '', area: a.area ?? '', slug: a.slug, category: 'Activities' })),
    ]
    const savedPoolIds = savedItems
        .filter(si => si.citySlug === citySlug)
        .map(si => pickerPool.find(p => p.type === si.type && p.slug === si.slug)?.id)
        .filter(Boolean) as string[]
    const savedPool = pickerPool.filter(p => savedPoolIds.includes(p.id))
    const pickerCategories = ['Saved', 'Events', 'Walks', 'Activities']

    // ── State ─────────────────────────────────────────────────────────────
    const [plan, setPlan] = useState<Plan | null>(null)
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')
    const [showModal, setShowModal] = useState(false)
    const [notFound404, setNotFound404] = useState(false)
    const [pickerSearch, setPickerSearch] = useState('')
    const [pickerCategory, setPickerCategory] = useState<string>(savedPool.length > 0 ? 'Saved' : 'Events')

    // Track whether we're currently pushing an update (to skip poll conflicts)
    const isMutatingRef = useRef(false)
    const failCountRef = useRef(0)

    // ── Fetch plan from server ────────────────────────────────────────────
    const fetchPlan = useCallback(async () => {
        // Don't overwrite local state while we're in the middle of a mutation
        if (isMutatingRef.current) return

        try {
            const res = await fetch(`/api/plans/${planId}`)
            if (res.status === 404) {
                setNotFound404(true)
                return
            }
            if (!res.ok) throw new Error('fetch failed')

            const data: Plan = await res.json()
            failCountRef.current = 0
            setSyncStatus('synced')

            // Only update state if the server data is newer
            setPlan(prev => {
                if (!prev) return data
                if (data.updated_at !== prev.updated_at) return data
                return prev
            })
        } catch {
            failCountRef.current++
            if (failCountRef.current >= 3) setSyncStatus('offline')
        }
    }, [planId])

    // ── Initial fetch ─────────────────────────────────────────────────────
    useEffect(() => {
        fetchPlan()
    }, [fetchPlan])

    // ── Polling — every 3 seconds ─────────────────────────────────────────
    useEffect(() => {
        const interval = setInterval(fetchPlan, 3000)
        return () => clearInterval(interval)
    }, [fetchPlan])

    // ── Mutate plan on server ─────────────────────────────────────────────
    const updateActivities = useCallback(async (newActivities: string[]) => {
        if (!plan) return

        // Optimistic update
        isMutatingRef.current = true
        setSyncStatus('syncing')
        setPlan(prev => prev ? { ...prev, activities: newActivities } : prev)

        try {
            const res = await fetch(`/api/plans/${planId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activities: newActivities }),
            })

            if (!res.ok) throw new Error('patch failed')

            const updated: Plan = await res.json()
            setPlan(updated)
            setSyncStatus('synced')
            failCountRef.current = 0
        } catch {
            // Revert optimistic update by re-fetching
            setSyncStatus('offline')
            await fetchPlan()
        } finally {
            isMutatingRef.current = false
        }
    }, [plan, planId, fetchPlan])

    // ── Activity mutations ────────────────────────────────────────────────
    function addActivity(id: string) {
        if (!plan || plan.activities.includes(id) || plan.activities.length >= 10) return
        updateActivities([...plan.activities, id])
        setShowModal(false)
    }

    function removeActivity(id: string) {
        if (!plan) return
        updateActivities(plan.activities.filter(a => a !== id))
    }

    function moveActivity(index: number, dir: 'up' | 'down') {
        if (!plan) return
        const arr = [...plan.activities]
        const swap = dir === 'up' ? index - 1 : index + 1
        if (swap < 0 || swap >= arr.length) return
            ;[arr[index], arr[swap]] = [arr[swap], arr[index]]
        updateActivities(arr)
    }

    // ── Loading state ─────────────────────────────────────────────────────
    if (notFound404) {
        return (
            <main style={{
                minHeight: '100vh', background: 'var(--bg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 24,
            }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
                <h1 style={{
                    fontSize: 24, fontWeight: 800, color: 'var(--text)',
                    letterSpacing: '-0.03em', marginBottom: 10,
                }}>Plan not found</h1>
                <p style={{ fontSize: 15, color: 'var(--text-3)', marginBottom: 28, textAlign: 'center', lineHeight: 1.6 }}>
                    This plan may have expired or the link is incorrect.
                </p>
                <Link href={`/${citySlug}/plan`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '14px 28px', borderRadius: 100,
                    background: 'var(--accent)', color: 'white',
                    fontSize: 14, fontWeight: 700, textDecoration: 'none',
                }}>
                    <ArrowLeft size={14} /> Create a new plan
                </Link>
            </main>
        )
    }

    if (!plan) {
        return (
            <main style={{
                minHeight: '100vh', background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                }}>
                    <Loader2
                        size={28}
                        color="var(--accent)"
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                    <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>
                        Loading plan…
                    </p>
                </div>
            </main>
        )
    }

    // ── Board view ────────────────────────────────────────────────────────
    const planItems: PlanEntry[] = plan.activities
        .map(itemId => {
            if (itemId.startsWith('walk-')) {
                const walk = cityWalks.find(entry => `walk-${entry.id}` === itemId)
                if (!walk) return null

                return {
                    id: itemId,
                    type: 'walk' as const,
                    title: walk.title,
                    image: walk.image,
                    href: `/${citySlug}/walks/${walk.slug}`,
                    meta: walk.area,
                    badge: 'Crawl',
                    removeId: itemId,
                }
            }

            if (itemId.startsWith('event-')) {
                const event = cityEvents.find(entry => `event-${entry.id}` === itemId)
                if (!event) return null

                return {
                    id: itemId,
                    type: 'event' as const,
                    title: event.title,
                    image: event.image ?? '',
                    href: `/${citySlug}/events/${event.slug}`,
                    meta: [event.venue, event.address].filter(Boolean).join(' · ') || event.address || event.venue || 'Event',
                    badge: 'Event',
                    removeId: itemId,
                }
            }

            const activity = cityActivities.find(entry => entry.id === itemId)
            if (!activity) return null

            return {
                id: itemId,
                type: 'activity' as const,
                title: activity.title,
                image: activity.image ?? '',
                href: `/${citySlug}/activities/${activity.slug}`,
                meta: [activity.location, activity.area].filter(Boolean).join(' · ') || activity.area || activity.location || 'Activity',
                removeId: itemId,
            }
        })
        .filter(Boolean) as PlanEntry[]

    return (
        <>
            <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

                {/* ── Sticky header ── */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'rgba(10,10,14,0.88)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{
                        maxWidth: 800, margin: '0 auto',
                        padding: '0 24px', height: 68,
                        display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                        {/* Back */}
                        <button
                            onClick={() => router.push(`/${citySlug}/plan`)}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 14px', borderRadius: 100,
                                background: 'transparent', border: '1px solid var(--border)',
                                color: 'var(--text-2)', fontSize: 13, fontWeight: 600,
                                cursor: 'pointer', flexShrink: 0,
                                transition: 'all 0.2s',
                            }}
                        >
                            <ArrowLeft size={14} /> New Plan
                        </button>

                        {/* Title + sync */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: 8, marginBottom: 2,
                            }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                }}>Live Plan</p>
                                <SyncIndicator status={syncStatus} />
                            </div>
                            <h1 style={{
                                fontSize: 16, fontWeight: 800, color: 'var(--text)',
                                letterSpacing: '-0.025em',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {plan.name}
                            </h1>
                        </div>

                        {/* Share */}
                        <SharePlanButton planName={plan.name} />
                    </div>
                </div>

                {/* ── Board content ── */}
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 120px' }}>

                    {/* Live collaboration banner */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 'var(--radius)',
                        padding: '12px 16px',
                        marginBottom: 20,
                        fontSize: 13, color: 'rgba(34,197,94,0.9)', fontWeight: 600,
                    }}>
                        <Wifi size={15} style={{ flexShrink: 0 }} />
                        <span>
                            This plan is <strong>live</strong> — anyone with the link can add activities and changes sync automatically.
                        </span>
                    </div>

                    {/* Date banner */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)', padding: '16px 20px',
                        marginBottom: 28,
                    }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Calendar size={20} color="var(--accent)" />
                        </div>
                        <div>
                            <p style={{
                                fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3,
                            }}>Plan Date</p>
                            <p style={{
                                fontSize: 18, fontWeight: 800, color: 'var(--text)',
                                letterSpacing: '-0.03em', lineHeight: 1.2,
                            }}>
                                {formatDateDisplay(plan.date)}
                            </p>
                        </div>
                    </div>

                    {/* Activity list */}
                    {planItems.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '64px 24px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            border: '1.5px dashed var(--border)',
                        }}>
                            <div style={{ fontSize: 44, marginBottom: 16 }}>🗺️</div>
                            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.025em' }}>
                                Nothing added yet
                            </p>
                            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                                Hit <strong style={{ color: 'var(--accent)' }}>Add to Plan</strong> below to start building this plan together
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {planItems.map((item, i) => (
                                <PlanItemCard
                                    key={item.id}
                                    item={item}
                                    index={i}
                                    total={planItems.length}
                                    onMoveUp={() => moveActivity(i, 'up')}
                                    onMoveDown={() => moveActivity(i, 'down')}
                                    onRemove={() => removeActivity(item.removeId)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add activity button / full notice */}
                    {plan.activities.length < 10 ? (
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                width: '100%', padding: '18px',
                                marginTop: planItems.length > 0 ? 10 : 20,
                                borderRadius: 'var(--radius)',
                                background: 'transparent',
                                border: '2px dashed rgba(255,107,0,0.4)',
                                color: 'var(--accent)', fontSize: 15, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            <Plus size={18} />
                            Add to Plan
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,107,0,0.6)', marginLeft: 4 }}>
                                ({plan.activities.length}/10)
                            </span>
                        </button>
                    ) : (
                        <div style={{
                            marginTop: 14, padding: '14px',
                            background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.22)',
                            borderRadius: 'var(--radius)', textAlign: 'center',
                            fontSize: 13, color: 'var(--accent)', fontWeight: 600, letterSpacing: '-0.01em',
                        }}>
                            🎉 Plan full (10/10) — ready to share!
                        </div>
                    )}

                    {/* Bottom share nudge */}
                    {planItems.length > 0 && (
                        <div style={{
                            marginTop: 40, paddingTop: 32,
                            borderTop: '1px solid var(--border)',
                            textAlign: 'center',
                        }}>
                            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>
                                Happy with the plan? Share it with your crew! 👇
                            </p>
                            <SharePlanButton planName={plan.name} />
                        </div>
                    )}
                </div>
            </main>

            {/* Activity picker modal */}
            {showModal && (() => {
                const addedIds = plan.activities
                const isFull = addedIds.length >= 10
                const catItems = pickerCategory === 'Saved' ? savedPool : pickerPool.filter(p => p.category === pickerCategory)
                const pickerFiltered = catItems.filter(item => {
                    const q = pickerSearch.toLowerCase()
                    return !q || item.title.toLowerCase().includes(q) || item.area.toLowerCase().includes(q)
                })
                return (
                    <>
                        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
                        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                            <div style={{ width: '100%', maxWidth: 720, maxHeight: '88vh', background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', flexDirection: 'column', pointerEvents: 'auto', boxShadow: '0 -24px 80px rgba(0,0,0,0.7)', animation: 'slideUpSheet 0.28s cubic-bezier(0.32,0.72,0,1) both' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} /></div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 20px 0', flexShrink: 0 }}>
                                    <div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.035em', lineHeight: 1.2 }}>Pick your activities, events and walks</h2>
                                        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{addedIds.length} / 10 added to plan</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', flexShrink: 0, marginTop: 2 }}><X size={16} /></button>
                                </div>
                                <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                                        <input type="text" placeholder="Search by name, area…" value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} autoFocus
                                            style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
                                    {pickerCategories.map(cat => {
                                        if (cat === 'Saved' && savedPool.length === 0) return null
                                        const isActive = pickerCategory === cat
                                        return (
                                            <button key={cat} onClick={() => setPickerCategory(cat)}
                                                style={{ padding: '7px 16px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0, background: isActive ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`, color: isActive ? 'white' : 'var(--text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                {cat === 'Saved' && <Bookmark size={11} />}
                                                {cat === 'Saved' ? 'Your Saved Things' : cat}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div style={{ padding: '10px 20px 2px', flexShrink: 0 }}>
                                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{pickerFiltered.length} {pickerFiltered.length === 1 ? 'result' : 'results'}</p>
                                </div>
                                <div style={{ overflowY: 'auto', padding: '10px 20px 40px', flex: 1 }}>
                                    {pickerFiltered.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>
                                            {pickerCategory === 'Saved' ? 'No saved items yet — save activities from the explore page!' : 'No items match your search'}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
                                            {pickerFiltered.map(item => {
                                                const isAdded = addedIds.includes(item.id)
                                                const disabled = isAdded || isFull
                                                return (
                                                    <div key={item.id} onClick={() => !disabled && addActivity(item.id)}
                                                        style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', borderRadius: 14, border: `1.5px solid ${isAdded ? 'rgba(255,107,0,0.45)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s, opacity 0.2s', opacity: isFull && !isAdded ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer' }}>
                                                        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', flexShrink: 0 }}>
                                                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            {item.type === 'walk' && <div style={{ position: 'absolute', top: 6, left: 6, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}><Footprints size={8} /> Crawl</div>}
                                                            {item.type === 'event' && <div style={{ position: 'absolute', top: 6, left: 6, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,107,0,0.88)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 9, fontWeight: 700, color: '#fff' }}><Calendar size={8} /> Event</div>}
                                                            {isAdded && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,107,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(255,107,0,0.6)' }}><Check size={17} color="white" strokeWidth={2.5} /></div></div>}
                                                        </div>
                                                        <div style={{ padding: '10px 10px 11px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 700, color: isAdded ? 'var(--text-2)' : 'var(--text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</p>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}><MapPin size={9} style={{ flexShrink: 0 }} />{item.area}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )
            })()}

            {/* Animations */}
            <style>{`
                @keyframes syncPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideUpSheet {
                    from { transform: translateY(100%); opacity: 0.6; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </>
    )
}
