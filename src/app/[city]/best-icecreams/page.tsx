'use client'
import { useParams } from 'next/navigation'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navigation, ArrowLeft, MessageSquareQuote } from 'lucide-react'

const ICE_CREAM_SPOTS = [
    {
        id: '1',
        title: 'Batter, KNK Road',
        review: 'Rich, dessert-style ice creams with indulgent combos like brownie and waffles. Loved for its creamy texture and balanced sweetness. 👉 Must try: Brownie ice cream + waffle combo',
        mapsLink: 'https://share.google/Lbz3QcoCAfABi9dsl',
    },
    {
        id: '2',
        title: 'Milkyway, Egmore',
        review: 'A nostalgic favorite known for fruit-based classics like mango and tender coconut. Affordable and consistently good. 👉 Must try: Mango ice cream (seasonal) & tender coconut',
        mapsLink: 'https://share.google/yHVOcnsYmdOW1tVRF',
    },
    {
        id: '3',
        title: 'Gelarto, Nungambakkam',
        review: 'Premium Italian-style gelato with smooth texture and refined flavors. Known for unique seasonal options. 👉 Must try: Pistachio gelato & dark chocolate sorbet',
        mapsLink: 'https://share.google/qfDLhvwiqNLLCjaQD',
    },
    {
        id: '4',
        title: 'Balaji Ice Cream, Perambur',
        review: 'A local favorite offering real fruit-based ice creams at budget-friendly prices. Simple, authentic, and value for money. 👉 Must try: Chickoo ice cream & mango (seasonal)',
        mapsLink: 'https://share.google/9YxZ8o2aa7o5BL1Uu',
    },
    {
        id: '5',
        title: 'Amadora Ice cream, Nungambakkam',
        review: 'Artisanal ice creams with premium ingredients and bold flavors. Not overly sweet, focused on quality. 👉 Must try: Filter coffee & dark chocolate sea salt',
        mapsLink: 'https://share.google/T4Zysps8oajMJzmJb',
    },
    {
        id: '6',
        title: 'Mercely’s, T Nagar',
        review: 'Known for creative flavors, generous portions, and indulgent sundaes. Popular but often crowded. 👉 Must try: Signature sundaes & brownie with ice cream',
        mapsLink: 'https://share.google/5l2rjYqc2rrBGJGBU',
    },
    {
        id: '7',
        title: 'Soft Serve, Alwarpet',
        review: 'Light, smooth soft serves that are creamy without feeling heavy. Great for a quick dessert fix. 👉 Must try: Classic vanilla soft serve & Oreo sundae',
        mapsLink: 'https://share.google/FKQaKencL3OYsxkZh',
    },
    {
        id: '8',
        title: 'Creamy Inn, Anna Nagar',
        review: 'A reliable Chennai chain with a wide range of flavors, shakes, and sundaes. Consistent and affordable. 👉 Must try: Thick shakes & brownie sundae',
        mapsLink: 'https://share.google/cx0iXMIxLZ5A7e6R0',
    },
    {
        id: '9',
        title: 'Kuchi Ice, Besant Nagar',
        review: 'Fun rolled ice creams made fresh with lots of toppings. Great for the experience as much as the taste. 👉 Must try: Nutella rolled ice cream & freakshakes',
        mapsLink: 'https://share.google/AwD1iJV35m5c5wW1A',
    },
    {
        id: '10',
        title: 'Maharaja Ice Cream, George Town',
        review: 'Old-school spot serving traditional flavors like kulfi and rabri. Budget-friendly with a nostalgic vibe. 👉 Must try: Kulfi & rabri ice cream',
        mapsLink: 'https://share.google/nr17IeTYmUEaCqgfi',
    },
]

export default function BestIceCreamPage() {
    const params = useParams()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
            {/* Header / Hero Section */}
            <div style={{
                paddingTop: 110, paddingBottom: 60,
                background: 'linear-gradient(180deg, rgba(236,72,153,0.05) 0%, transparent 100%)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <Link href="/" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
                        textDecoration: 'none', marginBottom: 28,
                        transition: 'color 0.2s',
                    }}>
                        <ArrowLeft size={14} /> Back to discovery
                    </Link>

                    <h1 style={{
                        fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900,
                        letterSpacing: '-0.04em', color: 'var(--text)',
                        lineHeight: 1.1, marginBottom: 16,
                    }}>
                        Best{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Ice Cream
                        </span>
                        {' '}in {city.name}
                    </h1>
                    <p style={{
                        fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-2)',
                        lineHeight: 1.6, maxWidth: 640, fontWeight: 400
                    }}>
                        From artisanal gelatos to nostalgic fruit flavors — we curated the 10 best ice cream spots across {city.name} for your sweet cravings.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 32,
                }}>
                    {ICE_CREAM_SPOTS.map((spot, idx) => (
                        <div key={spot.id} style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                        }}>
                            {/* Rank badge */}
                            <div style={{
                                position: 'absolute', top: 20, right: 20,
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 800, color: 'white',
                                boxShadow: '0 2px 10px rgba(236,72,153,0.3)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                zIndex: 2
                            }}>
                                #{idx + 1}
                            </div>

                            {/* Spot Details */}
                            <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{
                                    fontSize: 22, fontWeight: 800, color: 'var(--text)',
                                    lineHeight: 1.3, marginBottom: 16,
                                    letterSpacing: '-0.01em',
                                    paddingRight: 40
                                }}>
                                    {spot.title}
                                </h3>

                                {/* Review */}
                                <div style={{
                                    display: 'flex', gap: 10, marginBottom: 24,
                                    padding: '16px', borderRadius: 12,
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <MessageSquareQuote size={16} style={{ flexShrink: 0, marginTop: 2, color: '#EC4899' }} />
                                    <p style={{
                                        fontSize: 14, color: 'var(--text-2)',
                                        lineHeight: 1.6, margin: 0, fontStyle: 'italic',
                                    }}>
                                        "{spot.review}"
                                    </p>
                                </div>

                                <a
                                    href={spot.mapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        marginTop: 'auto',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', padding: '14px 20px',
                                        borderRadius: 12,
                                        background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text)', fontSize: 14, fontWeight: 700,
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Navigation size={14} /> Open in Maps
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
