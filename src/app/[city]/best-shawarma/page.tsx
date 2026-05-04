'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { City } from '@/data/cities'
import { fetchCityBySlug } from '@/lib/supabase-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Navigation, ArrowLeft, MessageSquareQuote } from 'lucide-react'

const SHAWARMA_SPOTS = [
    {
        id: '1',
        title: 'Mezze, Alwarpet',
        review: 'Known for juicy chicken shawarma, solid meze sides, and consistent dine-in experience, though lamb dishes get mixed feedback.',
        mapsLink: 'https://maps.app.goo.gl/CqzjBduZNbVJCZgh6',
    },
    {
        id: '2',
        title: 'Firdouse Cafe, Triplicane',
        review: 'A classic Triplicane favorite for hot, flavorful shawarma with rich onion sauce, loved for value and late-night cravings.',
        mapsLink: 'https://maps.app.goo.gl/pfSApLAu5bwUjurA6',
    },
    {
        id: '3',
        title: 'Shawarma Inn, Ambattur',
        review: 'Popular for budget-friendly shawarma with juicy chicken and strong local ratings, making it a reliable neighborhood pick.',
        mapsLink: 'https://maps.app.goo.gl/cqbP911vWrwn9VJC6',
    },
    {
        id: '4',
        title: "Abid's, Chetpet",
        review: 'A safe bet for great taste, good ambience, and consistently satisfying fast food plates, including shawarma-style wraps.',
        mapsLink: 'https://maps.app.goo.gl/JFKeqzkxhgnVNew37',
    },
    {
        id: '5',
        title: 'Ustad Hotel, ECR',
        review: 'A dependable ECR stop for good quantity, satisfying Arabian-style fast food, and solid late-night shawarma cravings.',
        mapsLink: 'https://maps.app.goo.gl/pwybBGELr2cR77ns6',
    },
    {
        id: '6',
        title: 'Tasty Kitchen, Kolathur',
        review: 'Loved for good quantity and value-for-money portions, ideal if you want filling chicken-based fast food.',
        mapsLink: 'https://maps.app.goo.gl/tZAfamtphJDB8aHL8',
    },
    {
        id: '7',
        title: 'SeaShell Restaurant, Velachery',
        review: 'A crowd favorite for rich Middle Eastern flavors, generous portions, and family-friendly consistency, especially for grilled and shawarma items.',
        mapsLink: 'https://maps.app.goo.gl/xXNWSx7CgDQn1hcn7',
    },
    {
        id: '8',
        title: 'Arabian Hut, Thousand Lights',
        review: 'A reliable choice for classic Arabian fast food flavors with decent shawarma and Mughlai-style sides.',
        mapsLink: 'https://maps.app.goo.gl/qrrztvfZmTbH2sbT9',
    },
    {
        id: '9',
        title: 'Smoky Docky, Besant Nagar',
        review: 'Best known for massive fillings and indulgent loaded shawarmas, though some feel it leans more like a chicken roll.',
        mapsLink: 'https://maps.app.goo.gl/R4iKtFHJ6q32A83dA',
    },
    {
        id: '10',
        title: 'Hotel Al-Najeeb Nawab of Kebab, Kilpauk',
        review: 'Offers good taste and kebab-style shawarma flavors, but pricing feels slightly premium for the setup.',
        mapsLink: 'https://maps.app.goo.gl/RogukHcfsSNcBepH6',
    },
    {
        id: '11',
        title: 'Althaf Food Court, Nanganallur',
        review: 'One of the strongest picks for juicy chicken, balanced spice, tasty mayo, and unbeatable value.',
        mapsLink: 'https://maps.app.goo.gl/GBPLq6V45wmS4jjW8',
    },
    {
        id: '12',
        title: 'Al-Kebabish, Anna Nagar',
        review: 'A highly rated spot for consistent shawarma wraps, smoky grilled meats, and dependable takeaway quality.',
        mapsLink: 'https://maps.app.goo.gl/QwLGPPZ9pjsX6rHr5',
    },
    {
        id: '13',
        title: 'Oho Shawarma, Medavakkam',
        review: 'Famous for authentic Lebanese-style shawarma with flavorful overload options, though portion consistency can vary.',
        mapsLink: 'https://maps.app.goo.gl/JcxYEWmoDwdgnFbT9',
    },
    {
        id: '14',
        title: 'City Square Cafeteria, Egmore',
        review: 'A mixed option where prices and authenticity get questioned, especially on chicken-to-cabbage ratio.',
        mapsLink: 'https://maps.app.goo.gl/vLcN229nvSPVfTCB9',
    },
    {
        id: '15',
        title: 'Little Hut, Anna Nagar',
        review: 'A casual stop for simple, fuss-free shawarma cravings, best for quick bites over gourmet expectations.',
        mapsLink: 'https://maps.app.goo.gl/12CFwf3Ju5FvJzUa9',
    },
    {
        id: '16',
        title: 'Al Bake, Sholinganallur',
        review: 'Decent for a quick shawarma bite, but taste can be inconsistent and occasionally bland.',
        mapsLink: 'https://maps.app.goo.gl/5xGy5svtdBqtCUxe8',
    },
    {
        id: '17',
        title: 'The Big Shawarma, Ambattur',
        review: 'Known for large portion sizes, satisfying wraps, and reliable crowd appeal.',
        mapsLink: 'https://maps.app.goo.gl/wo2QUcB8r2UrXhgR6',
    },
    {
        id: '18',
        title: 'Roz Shawarma & Rolls, Perambur',
        review: 'A neighborhood shawarma stop best known for quick rolls and affordable evening bites.',
        mapsLink: 'https://maps.app.goo.gl/fBMjKdGYDtos18KL9',
    },
    {
        id: '19',
        title: 'Shawarma Station, Mogappair',
        review: 'A strong local favorite for consistency, crowd trust, and huge repeat-order volume.',
        mapsLink: 'https://maps.app.goo.gl/RHfthGM28egxdbL56',
    },
    {
        id: '20',
        title: 'The Big Shawarma, Mogappair',
        review: 'Expect big, filling shawarmas with good chicken quantity and repeat-worthy flavors.',
        mapsLink: 'https://maps.app.goo.gl/1BpAL36cBWw5fpvm7',
    },
    {
        id: '21',
        title: "Engineer's Shawarma, Thuraipakkam",
        review: 'Simple but effective — good shawarma, solid BBQ sides, and quick-service appeal.',
        mapsLink: 'https://maps.app.goo.gl/TgvGLdEdiVyTxXNu5',
    },
    {
        id: '22',
        title: 'Zahoor Biriyani & Fastfood, Thousand Lights',
        review: 'A popular late-night pick for affordable shawarma, biryani combos, and dependable fast-food taste.',
        mapsLink: 'https://maps.app.goo.gl/oLt6ZvCwsHt7bxBX7',
    },
]

export default function BestShawarmaPage() {
    const params = useParams()
    const citySlug = params.city as string
    const [city, setCity] = useState<City | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCityBySlug(citySlug).then(c => { setCity(c || null); setLoading(false) })
    }, [citySlug])

    if (loading) return <main style={{ minHeight: '100vh' }} />
    if (!city) return notFound()

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
            {/* Header / Hero Section */}
            <div style={{
                paddingTop: 110, paddingBottom: 60,
                background: 'linear-gradient(180deg, rgba(255,107,0,0.05) 0%, transparent 100%)',
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
                            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Shawarma
                        </span>
                        {' '}in {city.name}
                    </h1>
                    <p style={{
                        fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-2)',
                        lineHeight: 1.6, maxWidth: 640, fontWeight: 400
                    }}>
                        From Triplicane classics to loaded Besant Nagar wraps — we curated the 22 best shawarma spots across {city.name} based on real reviews.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: 1200, margin: '-20px auto 0', padding: '0 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 32,
                }}>
                    {SHAWARMA_SPOTS.map((spot, idx) => (
                        <div key={spot.id} style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {/* Poster Image */}
                            <div style={{ width: '100%', aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src="/events/best-shawarma-chennai.png"
                                    alt={`Shawarma at ${spot.title}`}
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                    }}
                                />
                                {/* Rank badge */}
                                <div style={{
                                    position: 'absolute', top: 12, left: 12,
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 800, color: 'white',
                                    boxShadow: '0 2px 12px rgba(255,107,0,0.45)',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                }}>
                                    #{idx + 1}
                                </div>
                            </div>

                            {/* Spot Details */}
                            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{
                                    fontSize: 20, fontWeight: 800, color: 'var(--text)',
                                    lineHeight: 1.3, marginBottom: 16,
                                    letterSpacing: '-0.01em'
                                }}>
                                    {spot.title}
                                </h3>

                                {/* Review */}
                                <div style={{
                                    display: 'flex', gap: 10, marginBottom: 24,
                                    padding: '14px 16px', borderRadius: 12,
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                }}>
                                    <MessageSquareQuote size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{
                                        fontSize: 13, color: 'var(--text-2)',
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
                                        background: 'var(--accent-dim)',
                                        border: '1px solid var(--accent-border)',
                                        color: 'var(--accent)', fontSize: 14, fontWeight: 700,
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Navigation size={14} color="var(--accent)" /> Take me to Maps
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
