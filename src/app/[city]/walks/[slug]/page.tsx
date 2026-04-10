import { WALKS, getWalkBySlug, getWalksByCity } from '@/data/walks'
import { getCityBySlug, CITIES } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Navigation, ArrowLeft, Home, Footprints } from 'lucide-react'
import ShareButton from '@/components/ShareButton'

interface Props {
    params: { city: string; slug: string }
}

// ── Static params ────────────────────────────────────────────────
export function generateStaticParams() {
    return WALKS.map(w => ({ city: w.cityId, slug: w.slug }))
}

// ── Metadata ─────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) return {}
    const walk = getWalkBySlug(city.id, params.slug)
    if (!walk) return {}
    return {
        title: `${walk.title} — TBOC ${city.name}`,
        description: `${walk.title} — a curated walk through ${walk.area} in ${city.name} with ${walk.places.length} stops.`,
    }
}

// ── Page component ───────────────────────────────────────────────
export default function WalkDetailPage({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) notFound()

    const walk = getWalkBySlug(city.id, params.slug)
    if (!walk) notFound()

    // Use the walk's dedicated cover image for the hero
    const heroImage = walk.image

    // Other walks in the same city for "You might also like"
    const otherWalks = getWalksByCity(city.id)
        .filter(w => w.id !== walk.id)
        .slice(0, 4)

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ── Hero Image ───────────────────────────────────────── */}
            <div style={{ position: 'relative', width: '100%' }}>
                <div
                    style={{ width: '100%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg-elevated)' }}
                    className="md:aspect-auto md:h-[70vh]"
                >
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={walk.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 80, background: 'var(--bg-elevated)',
                        }}>
                            🚶
                        </div>
                    )}

                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,14,0.55) 0%, transparent 30%, transparent 50%, rgba(10,10,14,0.95) 100%)',
                    }} />

                    {/* Back to Home button */}
                    <Link href={`/${city.id}/activities`} style={{
                        position: 'absolute', top: 80, left: 24,
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '9px 16px', borderRadius: 100,
                        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: 'white', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                        transition: 'all 0.2s ease', zIndex: 10
                    }} className="hover:bg-[rgba(0,0,0,0.75)]">
                        <Home size={14} /> Back to Home
                    </Link>

                    {/* Title overlay */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px 32px' }}>
                        {/* Stops pill */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 12px', borderRadius: 100, marginBottom: 12,
                            background: 'rgba(255,107,0,0.2)', border: '1px solid rgba(255,107,0,0.4)',
                            color: '#FF9A3C', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                        }}>
                            <Footprints size={11} />
                            {walk.places.length} stops
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900,
                            letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.15,
                            marginBottom: 8, maxWidth: 720,
                        }}>
                            {walk.title}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500 }}>
                            <MapPin size={13} /> {walk.area}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────── */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>

                {/* Area card */}
                <DetailCard icon={<Home size={18} />} label="Area">
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{walk.area}</p>
                </DetailCard>

                {/* Places heading */}
                <div style={{ marginTop: 32, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', margin: 0 }}>
                            Places on this Walk
                        </h2>
                        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            {walk.places.length} stops
                        </span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>
                        Visit these spots in order for the best experience
                    </p>
                </div>

                {/* Place cards (activity-card style — 3:4 portrait) */}
                <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 14, marginBottom: 40 }}>
                    {walk.places.map((place, idx) => (
                        <PlaceCard key={idx} title={place.title} image={place.image} index={idx + 1} />
                    ))}
                </div>

                {/* Share + Maps buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 56 }} className="flex-col md:flex-row">
                    <ShareButton title={walk.title} text={`Check out ${walk.title} on TBOC ${city.name}`} />
                    <a
                        href={walk.mapsLink}
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
                        Take me to Maps
                    </a>
                </div>
            </div>

            {/* ── Other Walks ───────────────────────────────────────── */}
            {otherWalks.length > 0 && (
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px' }}>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 4 }}>
                            You might also like
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            More curated walks in {city.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 14 }}>
                        {otherWalks.map(w => {
                            const coverImg = w.image
                            return (
                                <Link
                                    key={w.id}
                                    href={`/${city.id}/walks/${w.slug}`}
                                    style={{
                                        display: 'flex', flexDirection: 'column',
                                        background: 'var(--bg-card)',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        overflow: 'hidden',
                                        textDecoration: 'none',
                                        cursor: 'pointer',
                                        transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
                                        boxShadow: 'var(--shadow-card)',
                                    }}
                                    className="group hover:border-[var(--accent-border)] hover:-translate-y-[4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                                >
                                    <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                                        {coverImg && (
                                            <img
                                                src={coverImg}
                                                alt={w.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                                className="group-hover:scale-[1.05]"
                                            />
                                        )}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)',
                                        }} />
                                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                                            <Footprints size={9} /> {w.places.length} stops
                                        </div>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 12px 14px' }}>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>
                                                {w.title}
                                            </p>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                                                <MapPin size={9} /> {w.area}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </main>
    )
}

// ═══════════════════════════════════════════════════════════════════
// PLACE CARD — activity-card style (3:4 portrait, gradient overlay)
// ═══════════════════════════════════════════════════════════════════

function PlaceCard({ title, image, index }: { title: string; image: string; index: number }) {
    return (
        <div
            style={{
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
                boxShadow: 'var(--shadow-card)',
                cursor: 'default',
            }}
            className="group hover:border-[var(--accent-border)] hover:-translate-y-[4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
            {/* Image — 3:4 portrait aspect ratio */}
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                <img
                    src={image}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="group-hover:scale-[1.05]"
                />

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)',
                }} />

                {/* Step number badge — top left */}
                <div style={{
                    position: 'absolute', top: 12, left: 12,
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: 'white',
                    boxShadow: '0 2px 12px rgba(255,107,0,0.45)',
                }}>
                    {index}
                </div>

                {/* Title overlay at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '14px 14px 16px',
                }}>
                    <p style={{
                        fontSize: 14, fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.3, letterSpacing: '-0.01em',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        margin: 0,
                    }}>
                        {title}
                    </p>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════
// DETAIL CARD (reusable, same as activity detail page)
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
