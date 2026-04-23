import { EVENTS, getEventsByCity, getEventBySlug } from '@/data/events'
import { getCityBySlug, CITIES } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Calendar, Navigation, ArrowLeft, Home, FileText, Tag, DollarSign, Ticket } from 'lucide-react'
import EventCard from '@/components/EventCard'
import ShareButton from '@/components/ShareButton'
import SaveItemButton from '@/components/SaveItemButton'

interface Props {
    params: { city: string; slug: string }
}

// ── Static params ────────────────────────────────────────────────
export function generateStaticParams() {
    return EVENTS.map(e => ({ city: e.cityId, slug: e.slug }))
}

// ── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) return {}

    const event = getEventBySlug(city.id, params.slug)
    if (!event) return {}

    const dateObj = new Date(event.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
        month: 'long', day: 'numeric', year: 'numeric',
    })

    return {
        title: `${event.title} — ${formattedDate} | TBOC ${city.name}`,
        description: event.description ?? `${event.title} at ${event.venue}, ${city.name} on ${formattedDate}.`,
    }
}

// ── Page component ───────────────────────────────────────────────
export default function EventDetailPage({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) notFound()

    const event = getEventBySlug(city.id, params.slug)
    if (!event) notFound()

    // Format date
    const dateObj = new Date(event.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })

    // Related events (same categories)
    const related = getEventsByCity(city.id)
        .filter(e => e.id !== event.id && (e.categories?.some(c => event.categories?.includes(c)) ?? false))
        .slice(0, 4)

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ── Hero Image ───────────────────────────────────────── */}
            <div style={{ position: 'relative', width: '100%' }}>
                <div
                    style={{ width: '100%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg-elevated)' }}
                    className="md:aspect-auto md:h-[70vh]"
                >
                    {event.image && (
                    <img
                        src={event.image}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    />
                    )}

                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,14,0.55) 0%, transparent 30%, transparent 50%, rgba(10,10,14,0.95) 100%)',
                    }} />

                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px 32px' }}>
                        {/* Date badge */}
                        <div style={{
                            display: 'inline-block', padding: '5px 12px', borderRadius: 100, marginBottom: 12,
                            background: 'rgba(255,107,0,0.9)', color: '#fff', fontSize: 12, fontWeight: 800,
                        }}>
                            {formattedDate}
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900,
                            letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.15,
                            marginBottom: 8, maxWidth: 720,
                        }}>
                            {event.title}
                        </h1>
                        {event.venue && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500 }}>
                                <MapPin size={13} /> {event.venue}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail Cards ─────────────────────────────────────── */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>

                {event.description && (
                    <DetailCard icon={<FileText size={18} />} label="About">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{event.description}</p>
                    </DetailCard>
                )}

                <DetailCard icon={<Calendar size={18} />} label="Date & Time">
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                        {formattedDate}
                        {event.time && <><br />{event.time}</>}
                    </p>
                </DetailCard>

                {event.venue && (
                    <DetailCard icon={<Home size={18} />} label="Venue">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{event.venue}</p>
                    </DetailCard>
                )}

                {event.address && (
                    <DetailCard icon={<MapPin size={18} />} label="Address">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{event.address}</p>
                    </DetailCard>
                )}

                {event.pricingType && (
                    <DetailCard icon={<Tag size={18} />} label="Pricing Type">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0, textTransform: 'capitalize' }}>{event.pricingType}</p>
                    </DetailCard>
                )}

                {event.pricing && (
                    <DetailCard icon={<DollarSign size={18} />} label="Pricing">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{event.pricing}</p>
                    </DetailCard>
                )}

                {event.categories && event.categories.length > 0 && (
                    <DetailCard icon={<Ticket size={18} />} label="Categories">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {event.categories.map(c => (
                                <span key={c} style={{
                                    padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                                    background: 'var(--accent-dim)', color: 'var(--accent)',
                                    border: '1px solid var(--accent-border)', textTransform: 'capitalize',
                                }}>{c}</span>
                            ))}
                        </div>
                    </DetailCard>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 56 }} className="flex-col md:flex-row">
                    <SaveItemButton type="event" slug={event.slug} citySlug={city.id} />
                    <ShareButton title={event.title} text={`Check out ${event.title} at ${event.venue} on TBOC ${city.name}`} />
                    {event.status === 'expired' ? (
                        <div
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                width: '100%', padding: '18px 24px',
                                borderRadius: 'var(--radius)',
                                background: 'rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.35)', fontSize: 16, fontWeight: 700,
                                letterSpacing: '-0.01em',
                                cursor: 'not-allowed',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <Clock size={18} />
                            Event is Over
                        </div>
                    ) : (
                        <a
                            href={event.bookingLink || event.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                width: '100%', padding: '18px 24px',
                                borderRadius: 'var(--radius)',
                                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                                color: 'white', fontSize: 16, fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 4px 24px rgba(255,107,0,0.35)',
                                transition: 'all 0.2s ease', letterSpacing: '-0.01em',
                            }}
                        >
                            <Navigation size={18} fill="white" />
                            {event.bookingLink ? 'Book Tickets' : 'Take me to Maps'}
                        </a>
                    )}
                </div>
            </div>

            {/* ── Related Events ───────────────────────────────────── */}
            {related.length > 0 && (
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px' }}>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 4 }}>
                            You might also like
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            More {event.categories?.[0] ?? ''} events in {city.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 14 }}>
                        {related.map(e => (
                            <EventCard key={e.id} event={e} citySlug={city.id} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

// ═══════════════════════════════════════════════════════════════════
// DETAIL CARD (reusable)
// ═══════════════════════════════════════════════════════════════════

function DetailCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', marginTop: 2,
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                    }}>
                        {label}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
