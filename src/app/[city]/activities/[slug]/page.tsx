import {
    ACTIVITIES, TAG_META,
    getActivitiesByCity, getActivityBySlug, getTagBySlug, getActivitiesByCityAndTag,
} from '@/data/activities'
import { getCityBySlug, CITIES } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Clock, Navigation, ArrowLeft, Home, FileText, Tag, DollarSign } from 'lucide-react'
import TimingsDisplay from '@/components/TimingsDisplay'
import ActivityCard from '@/components/ActivityCard'
import ShareButton from '@/components/ShareButton'

interface Props {
    params: { city: string; slug: string }
}

// ── Helper: build/parse category archive slug ───────────────────
function buildCategorySlug(tagSlug: string, cityId: string): string {
    // If the tagSlug already contains "activities", just add "-in-[cityId]"
    if (tagSlug.includes('activities')) {
        return `${tagSlug}-in-${cityId}`
    }
    // Otherwise, add "-activities-in-[cityId]"
    return `${tagSlug}-activities-in-${cityId}`
}

function parseCategorySlug(slug: string, cityId: string): string | null {
    const suffix = `-in-${cityId}`
    if (!slug.endsWith(suffix)) return null

    const base = slug.slice(0, -suffix.length) // e.g. "gaming-activities" or "low-budget-fun-activities"

    // If base ends with "-activities", check if the original tagSlug is just base OR base minus "-activities"
    if (base.endsWith('-activities')) {
        const tagSlugWithoutActivities = base.slice(0, -'-activities'.length)
        // Check if a tag exists with either slug
        if (getTagBySlug(base)) return base
        if (getTagBySlug(tagSlugWithoutActivities)) return tagSlugWithoutActivities
    }

    return base
}

// ── Static params: generate for both activities AND categories ────
export function generateStaticParams() {
    const activityParams = ACTIVITIES.map(a => ({ city: a.cityId, slug: a.slug }))
    const categoryParams = CITIES.flatMap(c =>
        TAG_META.map(t => ({ city: c.id, slug: buildCategorySlug(t.slug, c.id) }))
    )
    return [...activityParams, ...categoryParams]
}

import { generateActivitySeo } from '@/lib/seo'

// ── Metadata: different for category vs activity ─────────────────
export async function generateMetadata({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) return {}

    // Category page?
    const tagSlugPart = parseCategorySlug(params.slug, city.id)
    const tag = tagSlugPart ? getTagBySlug(tagSlugPart) : undefined
    if (tag) {
        return {
            title: `${tag.name} in ${city.name} — TBOC`,
            description: `${tag.description} — discover the best ${tag.name.toLowerCase()} things to do in ${city.name}.`,
        }
    }

    // Activity page
    const activity = getActivityBySlug(city.id, params.slug)
    if (!activity) return {}

    const { metaTitle, metaDescription } = generateActivitySeo({
        title: activity.title,
        placeName: activity.location,
        area: activity.area,
        city: city.name,
        tags: activity.tags
    })

    return {
        title: metaTitle,
        description: metaDescription,
    }
}

// ── Page component ───────────────────────────────────────────────
export default function SlugPage({ params }: Props) {
    const city = getCityBySlug(params.city)
    if (!city) notFound()

    // ─── Check: is this a category page? ─────────────────────────
    const tagSlugPart = parseCategorySlug(params.slug, city.id)
    const tag = tagSlugPart ? getTagBySlug(tagSlugPart) : undefined
    if (tag) {
        return <CategoryPage cityId={city.id} cityName={city.name} tag={tag} />
    }

    // ─── Otherwise: activity detail page ─────────────────────────
    const activity = getActivityBySlug(city.id, params.slug)
    if (!activity) notFound()

    const related = getActivitiesByCity(city.id)
        .filter(a => a.id !== activity.id && (a.tags?.some(t => activity.tags?.includes(t)) ?? false))
        .slice(0, 4)

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ── Hero Image ───────────────────────────────────────── */}
            <div style={{ position: 'relative', width: '100%' }}>
                <div
                    style={{ width: '100%', aspectRatio: '3/4', position: 'relative', overflow: 'hidden', background: 'var(--bg-elevated)' }}
                    className="md:aspect-auto md:h-[70vh]"
                >
                    {activity.image && (
                    <img
                        src={activity.image}
                        alt={activity.location ?? activity.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    />
                    )}

                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, rgba(10,10,14,0.55) 0%, transparent 30%, transparent 50%, rgba(10,10,14,0.95) 100%)',
                    }} />


                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 28px 32px' }}>
                        <h1 style={{
                            fontSize: 'clamp(22px, 4vw, 38px)', fontWeight: 900,
                            letterSpacing: '-0.03em', color: '#ffffff', lineHeight: 1.15,
                            marginBottom: 8, maxWidth: 720,
                        }}>
                            {activity.title}
                        </h1>
                        {activity.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 500 }}>
                            <MapPin size={13} /> {activity.location}
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Detail Cards ─────────────────────────────────────── */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 0' }}>
                {activity.area && (
                <DetailCard icon={<Home size={18} />} label="Area">
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{activity.area}</p>
                </DetailCard>
                )}

                {activity.description && (
                    <DetailCard icon={<FileText size={18} />} label="Description">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{activity.description}</p>
                    </DetailCard>
                )}

                {activity.address && (
                <DetailCard icon={<MapPin size={18} />} label="Address">
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{activity.address}</p>
                </DetailCard>
                )}

                {activity.timings && (
                <DetailCard icon={<Clock size={18} />} label="Timings">
                    <TimingsDisplay timings={activity.timings} />
                </DetailCard>
                )}

                {activity.pricingType && (
                    <DetailCard icon={<Tag size={18} />} label="Pricing Type">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0, textTransform: 'capitalize' }}>{activity.pricingType}</p>
                    </DetailCard>
                )}

                {activity.pricing && (
                    <DetailCard icon={<DollarSign size={18} />} label="Pricing">
                        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{activity.pricing}</p>
                    </DetailCard>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 56 }} className="flex-col md:flex-row">
                    <ShareButton title={activity.title} text={`Check out ${activity.location} on TBOC ${city.name}`} />
                    <a
                        href={activity.bookingLink || activity.locationLink}
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
                        {activity.bookingLink ? 'Book a Slot' : 'Take me to Maps'}
                    </a>
                </div>
            </div>

            {/* ── Related Activities ───────────────────────────────── */}
            {related.length > 0 && (
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 100px' }}>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40, marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 4 }}>
                            You might also like
                        </h2>
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                            More {activity.tags?.[0] ?? ''} activities nearby
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 14 }}>
                        {related.map(a => (
                            <ActivityCard key={a.id} activity={a} citySlug={city.id} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

// ═══════════════════════════════════════════════════════════════════
// CATEGORY PAGE
// ═══════════════════════════════════════════════════════════════════

import type { TagMeta } from '@/data/activities'

function CategoryPage({ cityId, cityName, tag }: { cityId: string; cityName: string; tag: TagMeta }) {
    const activities = getActivitiesByCityAndTag(cityId, tag.name)

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ── Header ────────────────────────────────────────────── */}
            <div style={{
                paddingTop: 100, paddingBottom: 48,
                background: 'var(--bg)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>

                    {/* Back link */}
                    <Link href={`/${cityId}/activities`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
                        textDecoration: 'none', marginBottom: 32,
                        transition: 'color 0.2s',
                    }}>
                        <ArrowLeft size={14} /> All Activities
                    </Link>

                    {/* Title */}
                    <h1 style={{
                        fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900,
                        letterSpacing: '-0.04em', color: 'var(--text)',
                        lineHeight: 1.1, marginBottom: 14,
                    }}>
                        {tag.name} in{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            {cityName}
                        </span>
                    </h1>

                    <p style={{ fontSize: 15, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 560 }}>
                        {tag.description} — {activities.length} {activities.length === 1 ? 'place' : 'places'} to explore.
                    </p>
                </div>
            </div>

            {/* ── Activities Grid ───────────────────────────────────── */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 28px 100px' }}>
                <div style={{ marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)' }}>
                        {tag.emoji} {tag.name}
                    </h2>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                        {activities.length} {activities.length === 1 ? 'place' : 'places'}
                    </span>
                </div>

                {activities.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '64px 24px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius)',
                        border: '1.5px dashed var(--border)',
                    }}>
                        <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                            No activities yet
                        </p>
                        <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
                            We're still curating {tag.name.toLowerCase()} activities for {cityName}.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 16 }}>
                        {activities.map(activity => (
                            <ActivityCard key={activity.id} activity={activity} citySlug={cityId} />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)', padding: '32px 24px',
                textAlign: 'center', color: 'var(--text-3)', fontSize: 13,
            }}>
                ⚡ <strong style={{ color: 'var(--text-2)' }}>TBOC</strong> — {tag.name} in {cityName} · Never be bored again · Made with ❤️ in {cityName}
            </footer>
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
