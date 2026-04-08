'use client'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Calendar, Check, Loader2,
} from 'lucide-react'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'

// ─── Decode legacy URL-encoded plans ──────────────────────────────────────────

interface LegacyPlan {
    name: string
    date: string
    activities: string[]
}

function decodeLegacyPlan(encoded: string): LegacyPlan | null {
    try {
        const obj = JSON.parse(atob(decodeURIComponent(encoded)))
        if (
            obj &&
            typeof obj.name === 'string' &&
            typeof obj.date === 'string' &&
            Array.isArray(obj.activities)
        ) return obj as LegacyPlan
    } catch { /* fall through */ }
    return null
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

// ─── Root component ───────────────────────────────────────────────────────────

export default function PlanClient() {
    const searchParams = useSearchParams()
    const params = useParams()
    const router = useRouter()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    // ── Create-screen state
    const [planName, setPlanName] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [nameError, setNameError] = useState(false)
    const [dateError, setDateError] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)

    // ── Backward compatibility: auto-migrate legacy ?data= links ──────────
    useEffect(() => {
        const encodedData = searchParams.get('data')
        if (!encodedData) return

        const legacyPlan = decodeLegacyPlan(encodedData)
        if (!legacyPlan) return

        // Migrate to server-persisted plan
        setIsMigrating(true)
        fetch('/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: legacyPlan.name,
                date: legacyPlan.date,
                city: citySlug,
                activities: legacyPlan.activities,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    router.replace(`/${citySlug}/plan/${data.id}`)
                } else {
                    setIsMigrating(false)
                }
            })
            .catch(() => {
                setIsMigrating(false)
            })
    }, [searchParams, citySlug, router])

    // ── Create plan via API ───────────────────────────────────────────────
    async function handleStartPlanning() {
        let err = false
        if (!planName.trim()) { setNameError(true); err = true } else setNameError(false)
        if (!selectedDate) { setDateError(true); err = true } else setDateError(false)
        if (err) return

        setIsCreating(true)
        try {
            const res = await fetch('/api/plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: planName.trim(),
                    date: selectedDate,
                    city: citySlug,
                }),
            })

            const data = await res.json()
            if (data.id) {
                router.push(`/${citySlug}/plan/${data.id}`)
            } else {
                setIsCreating(false)
                alert('Something went wrong creating your plan. Please try again.')
            }
        } catch {
            setIsCreating(false)
            alert('Failed to create plan. Check your connection and try again.')
        }
    }

    // ── Migrating state ───────────────────────────────────────────────────
    if (isMigrating) {
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
                        Upgrading your plan to live mode…
                    </p>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </main>
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
                        Choose a day, add activities, and share the link with friends to plan the perfect outing together — <strong style={{ color: 'var(--text-2)' }}>changes sync live</strong>.
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
                    disabled={isCreating}
                    style={{
                        width: '100%', padding: '18px',
                        borderRadius: 'var(--radius)',
                        background: isCreating
                            ? 'rgba(255,107,0,0.5)'
                            : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                        color: 'white', fontSize: 16, fontWeight: 800,
                        border: 'none', cursor: isCreating ? 'default' : 'pointer',
                        boxShadow: '0 4px 32px rgba(255,107,0,0.38)',
                        transition: 'all 0.2s ease',
                        letterSpacing: '-0.02em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                >
                    {isCreating ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            Creating…
                        </>
                    ) : (
                        'Start Planning →'
                    )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>
                    No account needed · changes sync live for everyone
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </main>
    )
}
