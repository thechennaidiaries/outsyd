'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Filter, X } from 'lucide-react'
import EventCard from '@/components/EventCard'
import type { Event } from '@/data/events'
import type { City } from '@/data/cities'
import { fetchEventsByCity, fetchCategoriesByCity, fetchCityBySlug } from '@/lib/supabase-data'

/* ── IST date helpers ─────────────────────────────────────────────── */
function getTodayIST(): string {
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
    return f.format(new Date()) // returns YYYY-MM-DD
}

function addDaysIST(iso: string, days: number): string {
    const d = new Date(iso + 'T00:00:00+05:30')
    d.setDate(d.getDate() + days)
    // Format back in IST to avoid UTC date shift
    const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' })
    return f.format(d) // returns YYYY-MM-DD in IST
}

function getDayOfWeekIST(): number {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' })
    const day = f.format(new Date())
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)
}

function getDateRangeForFilter(filter: string): string[] | null {
    if (filter === 'all') return null
    const today = getTodayIST()
    const dow = getDayOfWeekIST() // 0=Sun … 6=Sat

    if (filter === 'today') return [today]
    if (filter === 'tomorrow') return [addDaysIST(today, 1)]

    if (filter === 'this-weekend') {
        // This weekend = this week's Friday, Saturday, Sunday
        const daysToFri = (5 - dow + 7) % 7
        const fri = addDaysIST(today, daysToFri)
        const sat = addDaysIST(fri, 1)
        const sun = addDaysIST(fri, 2)
        return [fri, sat, sun]
    }

    if (filter === 'next-weekend') {
        // Next weekend = next week's Friday, Saturday, Sunday
        let daysToThisFri = (5 - dow + 7) % 7
        const daysToNextFri = daysToThisFri + 7
        const fri = addDaysIST(today, daysToNextFri)
        const sat = addDaysIST(fri, 1)
        const sun = addDaysIST(fri, 2)
        return [fri, sat, sun]
    }

    return null
}

function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

export default function EventsPage() {
    const params = useParams()
    const citySlug = params.city as string

    const [city, setCity] = useState<City | null>(null)
    const [allCategories, setAllCategories] = useState<string[]>([])
    const [shuffledAllEvents, setShuffledAllEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    // Filter state — must be declared before any early returns (Rules of Hooks)
    const [selectedDate, setSelectedDate] = useState<string>('all')
    const [selectedPricing, setSelectedPricing] = useState<string>('all')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    useEffect(() => {
        async function loadData() {
            const [cityData, events, categories] = await Promise.all([
                fetchCityBySlug(citySlug),
                fetchEventsByCity(citySlug),
                fetchCategoriesByCity(citySlug),
            ])
            if (cityData) setCity(cityData)
            setShuffledAllEvents(shuffleArray(events))
            setAllCategories(categories)
            setLoading(false)
        }
        loadData()
    }, [citySlug])

    const filteredEvents = useMemo(() => {
        const dateRange = getDateRangeForFilter(selectedDate)
        return shuffledAllEvents.filter(e => {
            if (dateRange && !dateRange.includes(e.date)) return false
            if (selectedPricing !== 'all' && e.pricingType !== selectedPricing) return false
            if (selectedCategory !== 'all' && !e.categories?.includes(selectedCategory)) return false
            return true
        })
    }, [shuffledAllEvents, selectedDate, selectedPricing, selectedCategory])

    const hasActiveFilters = selectedDate !== 'all' || selectedPricing !== 'all' || selectedCategory !== 'all'

    const clearFilters = () => {
        setSelectedDate('all')
        setSelectedPricing('all')
        setSelectedCategory('all')
    }

    if (loading) return <main style={{ minHeight: '100vh', paddingTop: '100px' }} />
    if (!city) return notFound()

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px', background: 'var(--bg)' }}>
            {/* ── Breadcrumb & Title ── */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 20px' }}>
                <Link href="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
                    textDecoration: 'none', marginBottom: 32,
                    transition: 'color 0.2s',
                }} className="hover:text-white">
                    <ArrowLeft size={14} /> Back to Home
                </Link>

                <h1 style={{
                    fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900,
                    letterSpacing: '-0.04em', color: 'var(--text)',
                    lineHeight: 1.1, marginBottom: 12, maxWidth: 800,
                }}>
                    Events in{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        {city.name}
                    </span>
                </h1>
                <p style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
                    Discover upcoming events, gigs, markets, and experiences in {city.name}
                </p>
            </div>

            {/* ── Filter Bar ── */}
            <div style={{
                maxWidth: 1400, margin: '0 auto', padding: '10px 28px 0',
            }}>
                <div style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '24px',
                }}>
                    {/* Date Filter Dropdown */}
                    <div style={{ flex: '1 1 200px', minWidth: 200 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <Calendar size={11} style={{ marginRight: 6 }} /> When
                        </label>
                        <select 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                            }}
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="tomorrow">Tomorrow</option>
                            <option value="this-weekend">This Weekend</option>
                            <option value="next-weekend">Next Weekend</option>
                        </select>
                    </div>

                    {/* Pricing Dropdown */}
                    <div style={{ flex: '1 1 180px', minWidth: 150 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <span style={{ marginRight: 6 }}>💰</span> Pricing
                        </label>
                        <select 
                            value={selectedPricing}
                            onChange={(e) => setSelectedPricing(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                            }}
                        >
                            <option value="all">All Pricing</option>
                            <option value="free">Free</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>

                    {/* Category Dropdown */}
                    <div style={{ flex: '1 1 180px', minWidth: 150 }}>
                        <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <span style={{ marginRight: 6 }}>🏷️</span> Category
                        </label>
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: 12,
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                color: 'var(--text)', fontSize: 13, fontWeight: 500,
                                cursor: 'pointer', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
                                textTransform: 'capitalize'
                            }}
                        >
                            <option value="all">All Categories</option>
                            {allCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Button */}
                    <div style={{ flexShrink: 0, paddingBottom: 2 }}>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '12px 20px', borderRadius: 100,
                                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                                color: '#f87171', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s',
                            }} className="hover:bg-[rgba(248,113,113,0.15)]">
                                <X size={14} /> Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Events Grid ── */}
            <div id="events-section" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
                <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: 'var(--text)',
                    }}>
                        <span>🎪</span>
                        {hasActiveFilters ? 'Filtered Events' : 'All Events'}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </span>
                </div>

                {filteredEvents.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '64px 24px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius)',
                        border: '1.5px dashed var(--border)',
                    }}>
                        <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                            No events found
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
                            {hasActiveFilters
                                ? 'Try adjusting your filters to see more events.'
                                : `We're still curating events for ${city.name}. Check back soon!`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 20 }}>
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} citySlug={citySlug} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)', padding: '32px 24px',
                textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
            }}>
                ⚡ <strong style={{ color: 'var(--text-2)' }}>TBOC</strong> — Events in {city.name} · Never miss out · Made with ❤️ in {city.name}
            </footer>
        </main>
    )
}
