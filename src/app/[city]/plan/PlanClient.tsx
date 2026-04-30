'use client'
import { useSearchParams, useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Calendar, Check, Loader2, Search, MapPin, Footprints, X, Bookmark,
} from 'lucide-react'
import type { City } from '@/data/cities'
import type { Activity } from '@/data/activities'
import type { Walk } from '@/data/walks'
import type { Event } from '@/data/events'
import { fetchCityBySlug, fetchActivitiesByCity, fetchWalksByCity, fetchEventsByCity } from '@/lib/supabase-data'
import { useSavedItems } from '@/hooks/useSavedItems'
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

    const [city, setCity] = useState<City | null>(null)
    const [cityActivities, setCityActivities] = useState<Activity[]>([])
    const [cityWalks, setCityWalks] = useState<Walk[]>([])
    const [cityEvents, setCityEvents] = useState<Event[]>([])
    const [dataLoaded, setDataLoaded] = useState(false)
    const { savedItems } = useSavedItems()

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
            setDataLoaded(true)
        }
        loadData()
    }, [citySlug])

    if (!dataLoaded) return <main style={{ minHeight: '100vh', paddingTop: 100 }} />
    if (!city) return notFound()

    // ── State
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [showPicker, setShowPicker] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('Saved')

    const [planName, setPlanName] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [nameError, setNameError] = useState(false)
    const [dateError, setDateError] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isMigrating, setIsMigrating] = useState(false)

    // ── Build unified pool
    type PickerItem = { id: string; type: 'activity' | 'walk' | 'event'; title: string; image: string; area: string; slug: string; category: string }
    const pool: PickerItem[] = [
        ...cityEvents.map(e => ({ id: `event-${e.id}`, type: 'event' as const, title: e.title, image: e.image ?? '', area: e.address ?? e.venue ?? '', slug: e.slug, category: 'Events' })),
        ...cityWalks.map(w => ({ id: `walk-${w.id}`, type: 'walk' as const, title: w.title, image: w.image, area: w.area, slug: w.slug, category: 'Walks' })),
        ...cityActivities.map(a => ({ id: a.id ?? '', type: 'activity' as const, title: a.title, image: a.image ?? '', area: a.area ?? '', slug: a.slug ?? '', category: 'Activities' })),
    ]

    // ── Saved items mapped to pool IDs
    const savedPoolIds = savedItems
        .filter(si => si.citySlug === citySlug)
        .map(si => {
            if (si.type === 'activity') return pool.find(p => p.type === 'activity' && p.slug === si.slug)?.id
            if (si.type === 'walk') return pool.find(p => p.type === 'walk' && p.slug === si.slug)?.id
            if (si.type === 'event') return pool.find(p => p.type === 'event' && p.slug === si.slug)?.id
            return undefined
        })
        .filter(Boolean) as string[]

    const savedPool = pool.filter(p => savedPoolIds.includes(p.id))

    // ── Categories: Saved, Events, Walks, Activities
    const categories = ['Saved', 'Events', 'Walks', 'Activities']

    // ── Set initial category based on whether user has saved items
    useEffect(() => {
        if (savedPool.length === 0 && activeCategory === 'Saved') {
            setActiveCategory('Events')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedPool.length])

    // ── Filtered items for picker
    const categoryItems = activeCategory === 'Saved'
        ? savedPool
        : pool.filter(p => p.category === activeCategory)
    const filtered = categoryItems.filter(item => {
        const q = searchQuery.toLowerCase()
        return !q || item.title.toLowerCase().includes(q) || item.area.toLowerCase().includes(q)
    })

    const isFull = selectedActivities.length >= 10

    function toggleActivity(id: string) {
        setSelectedActivities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : prev.length < 10 ? [...prev, id] : prev
        )
    }

    // ── Auto-add item from ?add= query param (e.g. from Saved page) ─────
    useEffect(() => {
        const addParam = searchParams.get('add')
        if (!addParam) return

        const [type, ...slugParts] = addParam.split(':')
        const slug = slugParts.join(':')
        if (!type || !slug) return

        const match = pool.find(p => p.type === type && p.slug === slug)
        if (match && !selectedActivities.includes(match.id)) {
            setSelectedActivities(prev => prev.length < 10 ? [...prev, match.id] : prev)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Backward compatibility: auto-migrate legacy ?data= links ──────────
    useEffect(() => {
        const encodedData = searchParams.get('data')
        if (!encodedData) return

        const legacyPlan = decodeLegacyPlan(encodedData)
        if (!legacyPlan) return

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
                    activities: selectedActivities,
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
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                    <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>Upgrading your plan to live mode…</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </main>
        )
    }

    // ════════════════════════════════════════════════════════════════════════
    // SINGLE-PAGE PLAN CREATION VIEW
    // ════════════════════════════════════════════════════════════════════════
    return (
        <>
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Ambient glow orbs */}
                <div style={{ position: 'fixed', top: -240, left: -200, width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <div style={{ position: 'fixed', bottom: -280, right: -200, width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 500, padding: '96px 24px 80px' }}>
                    {/* Back link */}
                    <Link href={`/${citySlug}/activities`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 48, transition: 'color 0.2s' }}>
                        <ArrowLeft size={14} /> Back to {city.name}
                    </Link>

                    {/* Hero */}
                    <div style={{ marginBottom: 36 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', marginBottom: 18 }}>
                            <span style={{ fontSize: 14 }}>🗓️</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Plan My Day</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1.1, marginBottom: 14 }}>
                            Planning with friends?{' '}
                            <span style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>start here</span>
                        </h1>
                        <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7 }}>
                            Select activities, choose a day and share the link with friends to plan the perfect outing together — <strong style={{ color: 'var(--text-2)' }}>changes sync live</strong>.
                        </p>
                    </div>

                    {/* ── Pick activities section ── */}
                    <div style={{ marginBottom: 28 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                            Pick your activities, events and walks
                        </h2>

                        {/* Selected activities strip */}
                        {selectedActivities.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }} className="no-scrollbar">
                                {selectedActivities.map(id => {
                                    const item = pool.find(p => p.id === id)
                                    if (!item) return null
                                    return (
                                        <div key={id} style={{ position: 'relative', flexShrink: 0 }}>
                                            <img src={item.image} alt={item.title} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--accent-border)' }} />
                                            <button onClick={() => toggleActivity(id)}
                                                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <X size={10} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Add to plan button — opens modal */}
                        <button onClick={() => setShowPicker(true)}
                            style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius)', background: 'transparent', border: '2px dashed rgba(255,107,0,0.4)', color: 'var(--accent)', fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            + Add to Plan
                            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,107,0,0.6)', marginLeft: 4 }}>
                                ({selectedActivities.length}/10)
                            </span>
                        </button>
                    </div>

                    {/* ── Plan name ── */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: nameError ? '#f87171' : 'var(--text-2)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                            Give your plan a name
                            {nameError && <span style={{ fontWeight: 400, fontSize: 12, color: '#f87171' }}> — required</span>}
                        </label>
                        <input type="text" placeholder='e.g. "Weekend Vibes 🌅" or "Girls Day Out 💛"' value={planName}
                            onChange={e => { setPlanName(e.target.value); if (e.target.value.trim()) setNameError(false) }} maxLength={50}
                            style={{ width: '100%', padding: '14px 18px', background: 'var(--bg-card)', border: `1.5px solid ${nameError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`, borderRadius: 12, color: 'var(--text)', fontSize: 15, fontWeight: 500, outline: 'none', transition: 'border-color 0.2s ease' }} />
                        <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, textAlign: 'right' }}>{planName.length}/50</p>
                    </div>

                    {/* ── Date picker ── */}
                    <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${dateError ? 'rgba(248,113,113,0.5)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '20px 20px 18px', marginBottom: 28, transition: 'border-color 0.2s' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: dateError ? '#f87171' : 'var(--text-2)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Calendar size={14} style={{ flexShrink: 0 }} />
                            Pick a date
                            {dateError && <span style={{ fontWeight: 400, fontSize: 12, color: '#f87171' }}> — required</span>}
                            {selectedDate && (
                                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Check size={11} strokeWidth={2.5} />
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            )}
                        </div>
                        <CalendarPicker selected={selectedDate} onSelect={d => { setSelectedDate(d); setDateError(false) }} />
                    </div>

                    {/* ── CTA ── */}
                    <button onClick={handleStartPlanning} disabled={isCreating}
                        style={{ width: '100%', padding: '18px', borderRadius: 'var(--radius)', background: isCreating ? 'rgba(255,107,0,0.5)' : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)', color: 'white', fontSize: 16, fontWeight: 800, border: 'none', cursor: isCreating ? 'default' : 'pointer', boxShadow: '0 4px 32px rgba(255,107,0,0.38)', transition: 'all 0.2s ease', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        {isCreating ? (<><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Creating…</>) : ('Create Plan →')}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>
                        No account needed · changes sync live for everyone
                    </p>
                </div>
            </main>

            {/* ═══ ACTIVITY PICKER MODAL ═══ */}
            {showPicker && (
                <>
                    <div onClick={() => setShowPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ width: '100%', maxWidth: 720, maxHeight: '88vh', background: 'var(--bg-card)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'flex', flexDirection: 'column', pointerEvents: 'auto', boxShadow: '0 -24px 80px rgba(0,0,0,0.7)', animation: 'slideUpSheet 0.28s cubic-bezier(0.32,0.72,0,1) both' }}>
                            {/* Drag handle */}
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}>
                                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
                            </div>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 20px 0', flexShrink: 0 }}>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.035em', lineHeight: 1.2 }}>Pick your activities, events and walks</h2>
                                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{selectedActivities.length} / 10 added to plan</p>
                                </div>
                                <button onClick={() => setShowPicker(false)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', flexShrink: 0, marginTop: 2 }}>
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Search */}
                            <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
                                    <input type="text" placeholder="Search by name, area…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                                        style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }} />
                                </div>
                            </div>
                            {/* Category tabs: Saved, Events, Walks, Activities */}
                            <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', overflowX: 'auto', flexShrink: 0 }} className="no-scrollbar">
                                {categories.map(cat => {
                                    if (cat === 'Saved' && savedPool.length === 0) return null
                                    const isActive = activeCategory === cat
                                    return (
                                        <button key={cat} onClick={() => setActiveCategory(cat)}
                                            style={{ padding: '7px 16px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0, background: isActive ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`, color: isActive ? 'white' : 'var(--text-2)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', display: 'flex', alignItems: 'center', gap: 5 }}>
                                            {cat === 'Saved' && <Bookmark size={11} />}
                                            {cat === 'Saved' ? 'Your Saved Things' : cat}
                                        </button>
                                    )
                                })}
                            </div>
                            {/* Result count */}
                            <div style={{ padding: '10px 20px 2px', flexShrink: 0 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{filtered.length} {filtered.length === 1 ? 'result' : 'results'}</p>
                            </div>
                            {/* Grid */}
                            <div style={{ overflowY: 'auto', padding: '10px 20px 40px', flex: 1 }}>
                                {filtered.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>
                                        {activeCategory === 'Saved' ? 'No saved items yet — save activities from the explore page!' : 'No items match your search'}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
                                        {filtered.map(item => {
                                            const isSelected = selectedActivities.includes(item.id)
                                            const disabled = !isSelected && isFull
                                            return (
                                                <div key={item.id} onClick={() => !disabled && toggleActivity(item.id)}
                                                    style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-elevated)', borderRadius: 14, border: `1.5px solid ${isSelected ? 'rgba(255,107,0,0.45)' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.2s, opacity 0.2s', opacity: disabled ? 0.45 : 1, cursor: disabled ? 'default' : 'pointer' }}>
                                                    <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', flexShrink: 0 }}>
                                                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        {item.type === 'walk' && (
                                                            <div style={{ position: 'absolute', top: 6, left: 6, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                                                                <Footprints size={8} /> Crawl
                                                            </div>
                                                        )}
                                                        {item.type === 'event' && (
                                                            <div style={{ position: 'absolute', top: 6, left: 6, display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,107,0,0.88)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                                                                <Calendar size={8} /> Event
                                                            </div>
                                                        )}
                                                        {isSelected && (
                                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,107,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(255,107,0,0.6)' }}>
                                                                    <Check size={17} color="white" strokeWidth={2.5} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ padding: '10px 10px 11px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: isSelected ? 'var(--text-2)' : 'var(--text)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</p>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>
                                                            <MapPin size={9} style={{ flexShrink: 0 }} />{item.area}
                                                        </span>
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
            )}

            <style>{`
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
