'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Share2, Plus, ChevronUp, ChevronDown, X,
    Check, Calendar, MapPin, Loader2, Wifi, WifiOff,
} from 'lucide-react'
import { getActivitiesByCity, ACTIVITIES } from '@/data/activities'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import ActivityPickerModal from '@/components/ActivityPickerModal'

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

function PlanActivityCard({
    activity, index, total, onMoveUp, onMoveDown, onRemove, citySlug,
}: {
    activity: typeof ACTIVITIES[0]
    index: number
    total: number
    onMoveUp: () => void
    onMoveDown: () => void
    onRemove: () => void
    citySlug: string
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
            <Link href={`/${citySlug}/activities/${activity.slug}`} style={{ flexShrink: 0, borderRadius: 10, overflow: 'hidden', display: 'block' }}>
                <img
                    src={activity.image}
                    alt={activity.title}
                    style={{ width: 64, height: 64, objectFit: 'cover', display: 'block' }}
                />
            </Link>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <Link href={`/${citySlug}/activities/${activity.slug}`} style={{ textDecoration: 'none' }}>
                    <p style={{
                        fontSize: 14, fontWeight: 700, color: 'var(--text)',
                        lineHeight: 1.3, marginBottom: 5,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                        {activity.title}
                    </p>
                </Link>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 12, color: 'var(--text-3)', fontWeight: 500,
                }}>
                    <MapPin size={10} style={{ flexShrink: 0 }} />
                    {activity.location} · {activity.area}
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

    // ── State ─────────────────────────────────────────────────────────────
    const [plan, setPlan] = useState<Plan | null>(null)
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')
    const [showModal, setShowModal] = useState(false)
    const [notFound404, setNotFound404] = useState(false)

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
    const planActivities = plan.activities
        .map(id => cityActivities.find(a => a.id === id))
        .filter(Boolean) as typeof ACTIVITIES

    return (
        <>
            <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

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
                    {planActivities.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '64px 24px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            border: '1.5px dashed var(--border)',
                        }}>
                            <div style={{ fontSize: 44, marginBottom: 16 }}>🗺️</div>
                            <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.025em' }}>
                                No activities yet
                            </p>
                            <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                                Hit <strong style={{ color: 'var(--accent)' }}>Add Activity</strong> below to start building this plan together
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {planActivities.map((activity, i) => (
                                <PlanActivityCard
                                    key={activity.id}
                                    activity={activity}
                                    index={i}
                                    total={planActivities.length}
                                    onMoveUp={() => moveActivity(i, 'up')}
                                    onMoveDown={() => moveActivity(i, 'down')}
                                    onRemove={() => removeActivity(activity.id ?? '')}
                                    citySlug={citySlug}
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
                                marginTop: planActivities.length > 0 ? 10 : 20,
                                borderRadius: 'var(--radius)',
                                background: 'transparent',
                                border: '2px dashed rgba(255,107,0,0.4)',
                                color: 'var(--accent)', fontSize: 15, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s ease',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            <Plus size={18} />
                            Add Activity
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
                    {planActivities.length > 0 && (
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
            {showModal && (
                <ActivityPickerModal
                    addedIds={plan.activities}
                    onAdd={addActivity}
                    onClose={() => setShowModal(false)}
                    cityId={city.id}
                />
            )}

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
            `}</style>
        </>
    )
}
