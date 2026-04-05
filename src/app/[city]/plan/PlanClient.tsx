'use client'
import { useSearchParams, useParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Share2, Plus, ChevronUp, ChevronDown, X,
    Check, Calendar, MapPin,
} from 'lucide-react'
import { getActivitiesByCity, ACTIVITIES } from '@/data/activities'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import ActivityPickerModal from '@/components/ActivityPickerModal'

// ─── Types & encoding ────────────────────────────────────────────────────────

interface Plan {
    name: string
    date: string        // "YYYY-MM-DD"
    activities: string[] // ordered activity IDs
}

function encodePlan(plan: Plan): string {
    return encodeURIComponent(btoa(JSON.stringify(plan)))
}

function decodePlan(encoded: string): Plan | null {
    try {
        const obj = JSON.parse(atob(decodeURIComponent(encoded)))
        if (
            obj &&
            typeof obj.name === 'string' &&
            typeof obj.date === 'string' &&
            Array.isArray(obj.activities)
        ) return obj as Plan
    } catch { /* fall through */ }
    return null
}

function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
}

// ─── Calendar picker ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function pad(n: number) { return String(n).padStart(2, '0') }

function CalendarPicker({
    selected, onSelect,
}: { selected: string; onSelect: (d: string) => void }) {
    const todayObj = new Date()
    todayObj.setHours(0, 0, 0, 0)

    const [viewYear, setViewYear] = useState(todayObj.getFullYear())
    const [viewMonth, setViewMonth] = useState(todayObj.getMonth())

    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells: (number | null)[] = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]

    const canGoPrev =
        viewYear > todayObj.getFullYear() ||
        (viewYear === todayObj.getFullYear() && viewMonth > todayObj.getMonth())

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }
    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    return (
        <div>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <button
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: canGoPrev ? 'var(--bg-elevated)' : 'transparent',
                        border: '1px solid var(--border)',
                        color: canGoPrev ? 'var(--text)' : 'var(--text-3)',
                        cursor: canGoPrev ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, lineHeight: 1,
                        transition: 'all 0.15s',
                    }}
                >‹</button>

                <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 15, letterSpacing: '-0.02em' }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>

                <button
                    onClick={nextMonth}
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        color: 'var(--text)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, lineHeight: 1,
                        transition: 'all 0.15s',
                    }}
                >›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
                {DAY_ABBR.map(d => (
                    <div key={d} style={{
                        textAlign: 'center', fontSize: 11, fontWeight: 600,
                        color: 'var(--text-3)', padding: '3px 0',
                    }}>{d}</div>
                ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {cells.map((day, i) => {
                    if (!day) return <div key={`e-${i}`} />

                    const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`
                    const dateObj = new Date(viewYear, viewMonth, day)
                    const isPast = dateObj < todayObj
                    const isSelected = dateStr === selected
                    const isToday = dateObj.getTime() === todayObj.getTime()

                    return (
                        <button
                            key={dateStr}
                            onClick={() => !isPast && onSelect(dateStr)}
                            disabled={isPast}
                            style={{
                                height: 38, borderRadius: 9,
                                border: isSelected
                                    ? '2px solid var(--accent)'
                                    : isToday
                                        ? '1px solid rgba(255,107,0,0.45)'
                                        : '1px solid transparent',
                                background: isSelected
                                    ? 'var(--accent)'
                                    : isToday
                                        ? 'rgba(255,107,0,0.1)'
                                        : 'transparent',
                                color: isSelected
                                    ? 'white'
                                    : isPast
                                        ? 'var(--text-3)'
                                        : isToday
                                            ? 'var(--accent)'
                                            : 'var(--text)',
                                fontWeight: isSelected || isToday ? 700 : 400,
                                fontSize: 13,
                                cursor: isPast ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >{day}</button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Horizontal plan activity card ───────────────────────────────────────────

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

// ─── Inline share button for board header ────────────────────────────────────

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

// ─── Root component ───────────────────────────────────────────────────────────

export default function PlanClient() {
    const searchParams = useSearchParams()
    const params = useParams()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    const cityActivities = getActivitiesByCity(city.id)
    const encodedData = searchParams.get('data')

    // Decode plan from URL on first render
    const urlPlan = encodedData ? decodePlan(encodedData) : null

    // ── Local state mirrors the URL so we don't need router.push on every edit
    const [plan, setPlan] = useState<Plan | null>(urlPlan)

    // ── Create-screen state
    const [planName, setPlanName] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [nameError, setNameError] = useState(false)
    const [dateError, setDateError] = useState(false)

    // ── Board state
    const [showModal, setShowModal] = useState(false)

    // ── Write plan to local state + URL (replaceState avoids back-button spam)
    const updatePlan = useCallback((newPlan: Plan) => {
        setPlan(newPlan)
        const encoded = encodePlan(newPlan)
        window.history.replaceState(null, '', `/${citySlug}/plan?data=${encoded}`)
    }, [citySlug])

    // ── Create plan
    function handleStartPlanning() {
        let err = false
        if (!planName.trim()) { setNameError(true); err = true } else setNameError(false)
        if (!selectedDate) { setDateError(true); err = true } else setDateError(false)
        if (err) return
        updatePlan({ name: planName.trim(), date: selectedDate, activities: [] })
    }

    // ── Add / remove / reorder
    function addActivity(id: string) {
        if (!plan || plan.activities.includes(id) || plan.activities.length >= 10) return
        updatePlan({ ...plan, activities: [...plan.activities, id] })
        setShowModal(false)
    }

    function removeActivity(id: string) {
        if (!plan) return
        updatePlan({ ...plan, activities: plan.activities.filter(a => a !== id) })
    }

    function moveActivity(index: number, dir: 'up' | 'down') {
        if (!plan) return
        const arr = [...plan.activities]
        const swap = dir === 'up' ? index - 1 : index + 1
        if (swap < 0 || swap >= arr.length) return
            ;[arr[index], arr[swap]] = [arr[swap], arr[index]]
        updatePlan({ ...plan, activities: arr })
    }

    // ════════════════════════════════════════════════════════════════════════
    // PLAN BOARD VIEW
    // ════════════════════════════════════════════════════════════════════════
    if (plan) {
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
                                onClick={() => {
                                    setPlan(null)
                                    window.history.replaceState(null, '', `/${citySlug}/plan`)
                                }}
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

                            {/* Title */}
                            <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 700, color: 'var(--text-3)',
                                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2,
                                }}>Your Plan</p>
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
                                    Your plan is empty
                                </p>
                                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                                    Hit <strong style={{ color: 'var(--accent)' }}>Add Activity</strong> below to start filling your day
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
            </>
        )
    }

    // ════════════════════════════════════════════════════════════════════════
    // CREATE PLAN VIEW
    // ════════════════════════════════════════════════════════════════════════
    return (
        <main style={{
            minHeight: '100vh', background: 'var(--bg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient glow orbs */}
            <div style={{
                position: 'fixed', top: -240, left: -200,
                width: 640, height: 640, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 65%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: -280, right: -200,
                width: 720, height: 720, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 65%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: 500,
                padding: '96px 24px 80px',
            }}>
                {/* Back link */}
                <Link href={`/${citySlug}/activities`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
                    textDecoration: 'none', marginBottom: 48,
                    transition: 'color 0.2s',
                }}>
                    <ArrowLeft size={14} /> Back to {city.name}
                </Link>

                {/* Hero text */}
                <div style={{ marginBottom: 36 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px', borderRadius: 100,
                        background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                        marginBottom: 18,
                    }}>
                        <span style={{ fontSize: 14 }}>🗓️</span>
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                            letterSpacing: '0.07em', textTransform: 'uppercase',
                        }}>Plan My Day</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 900,
                        letterSpacing: '-0.04em', color: 'var(--text)',
                        lineHeight: 1.1, marginBottom: 14,
                    }}>
                        Turn your group chat into a{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            plan with friends
                        </span>
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>
                        Choose a day, add activities, and share the link with friends to plan the perfect outing together.
                    </p>
                </div>

                {/* ── Plan name ── */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{
                        display: 'block', fontSize: 13, fontWeight: 700,
                        color: nameError ? '#f87171' : 'var(--text-2)',
                        marginBottom: 8, letterSpacing: '-0.01em',
                    }}>
                        Give your plan a name
                        {nameError && (
                            <span style={{ fontWeight: 400, fontSize: 12, color: '#f87171' }}> — required</span>
                        )}
                    </label>
                    <input
                        type="text"
                        placeholder='e.g. "Weekend Vibes 🌅" or "Girls Day Out 💛"'
                        value={planName}
                        onChange={e => {
                            setPlanName(e.target.value)
                            if (e.target.value.trim()) setNameError(false)
                        }}
                        maxLength={50}
                        style={{
                            width: '100%', padding: '14px 18px',
                            background: 'var(--bg-card)',
                            border: `1.5px solid ${nameError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`,
                            borderRadius: 12,
                            color: 'var(--text)', fontSize: 15, fontWeight: 500,
                            outline: 'none', transition: 'border-color 0.2s ease',
                        }}
                    />
                    <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, textAlign: 'right' }}>
                        {planName.length}/50
                    </p>
                </div>

                {/* ── Date picker ── */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: `1.5px solid ${dateError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    padding: '20px 20px 18px',
                    marginBottom: 28,
                    transition: 'border-color 0.2s',
                }}>
                    <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: dateError ? '#f87171' : 'var(--text-2)',
                        marginBottom: 16,
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                        <Calendar size={14} style={{ flexShrink: 0 }} />
                        Pick a date
                        {dateError && (
                            <span style={{ fontWeight: 400, fontSize: 12, color: '#f87171' }}> — required</span>
                        )}
                        {selectedDate && (
                            <span style={{
                                marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                                display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                                <Check size={11} strokeWidth={2.5} />
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>
                    <CalendarPicker
                        selected={selectedDate}
                        onSelect={d => { setSelectedDate(d); setDateError(false) }}
                    />
                </div>

                {/* ── CTA ── */}
                <button
                    onClick={handleStartPlanning}
                    style={{
                        width: '100%', padding: '18px',
                        borderRadius: 'var(--radius)',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                        color: 'white', fontSize: 16, fontWeight: 800,
                        border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 32px rgba(255,107,0,0.38)',
                        transition: 'all 0.2s ease',
                        letterSpacing: '-0.02em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                >
                    Start Planning →
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>
                    No account needed · plan lives in the link
                </p>
            </div>
        </main>
    )
}
