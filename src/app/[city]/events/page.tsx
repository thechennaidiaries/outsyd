'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Filter, X } from 'lucide-react'
import EventCard from '@/components/EventCard'
import { getEventsByCity, getCategoriesByCity, getDatesByCity } from '@/data/events'
import { getCityBySlug } from '@/data/cities'

export default function EventsPage() {
    const params = useParams()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    const allEvents = getEventsByCity(city.id)
    const allCategories = getCategoriesByCity(city.id)
    const allDates = getDatesByCity(city.id)

    // Filter state
    const [selectedDate, setSelectedDate] = useState<string>('all')
    const [selectedPricing, setSelectedPricing] = useState<string>('all')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    const filteredEvents = useMemo(() => {
        return allEvents.filter(e => {
            if (selectedDate !== 'all' && e.date !== selectedDate) return false
            if (selectedPricing !== 'all' && e.pricingType !== selectedPricing) return false
            if (selectedCategory !== 'all' && !e.categories?.includes(selectedCategory)) return false
            return true
        })
    }, [allEvents, selectedDate, selectedPricing, selectedCategory])

    const hasActiveFilters = selectedDate !== 'all' || selectedPricing !== 'all' || selectedCategory !== 'all'

    const clearFilters = () => {
        setSelectedDate('all')
        setSelectedPricing('all')
        setSelectedCategory('all')
    }

    // Format date for filter pills
    const formatDatePill = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00')
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }

    const pillStyle = (isActive: boolean): React.CSSProperties => ({
        padding: '8px 16px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: isActive ? 'var(--accent-border)' : 'var(--border)',
        background: isActive ? 'var(--accent-dim)' : 'var(--bg-card)',
        color: isActive ? 'var(--accent)' : 'var(--text-3)',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
    })

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

            {/* ── Filters ── */}
            <div style={{
                maxWidth: 1400, margin: '0 auto', padding: '20px 28px 0',
            }}>
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 16,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '20px 24px',
                }}>
                    {/* Date Filter */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            <Calendar size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Date
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => setSelectedDate('all')} style={pillStyle(selectedDate === 'all')}>All Dates</button>
                            {allDates.map(d => (
                                <button key={d} onClick={() => setSelectedDate(d)} style={pillStyle(selectedDate === d)}>
                                    {formatDatePill(d)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Filter */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                            💰 Pricing
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => setSelectedPricing('all')} style={pillStyle(selectedPricing === 'all')}>All</button>
                            <button onClick={() => setSelectedPricing('free')} style={pillStyle(selectedPricing === 'free')}>Free</button>
                            <button onClick={() => setSelectedPricing('paid')} style={pillStyle(selectedPricing === 'paid')}>Paid</button>
                        </div>
                    </div>

                    {/* Category Filter */}
                    {allCategories.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                🏷️ Category
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button onClick={() => setSelectedCategory('all')} style={pillStyle(selectedCategory === 'all')}>All</button>
                                {allCategories.map(c => (
                                    <button key={c} onClick={() => setSelectedCategory(c)} style={pillStyle(selectedCategory === c)}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button onClick={clearFilters} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 100,
                            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                            color: '#f87171', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', width: 'fit-content',
                        }}>
                            <X size={12} /> Clear all filters
                        </button>
                    )}
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
