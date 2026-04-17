'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import ActivityCard from '@/components/ActivityCard'
import WalkCard from '@/components/WalkCard'
import { getActivitiesByCity } from '@/data/activities'
import { getWalksByCity } from '@/data/walks'
import { getCityBySlug } from '@/data/cities'

/* ── Reusable horizontal-scroll section ─────────────────────────── */
function HScrollSection({
    emoji,
    heading,
    subheading,
    viewMoreHref,
    children,
    hideViewMore = false,
}: {
    emoji: string
    heading: string
    subheading?: string
    viewMoreHref: string
    children: React.ReactNode
    hideViewMore?: boolean
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(true)

    const checkScroll = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setShowLeft(scrollLeft > 20)
            setShowRight(scrollLeft < scrollWidth - clientWidth - 20)
        }
    }, [])

    useEffect(() => {
        const ref = scrollRef.current
        if (ref) {
            ref.addEventListener('scroll', checkScroll)
            checkScroll()
            window.addEventListener('resize', checkScroll)
        }
        return () => {
            ref?.removeEventListener('scroll', checkScroll)
            window.removeEventListener('resize', checkScroll)
        }
    }, [checkScroll])

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = scrollRef.current.clientWidth * 0.8
            scrollRef.current.scrollBy({
                left: dir === 'left' ? -amount : amount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '62px 28px 0', position: 'relative' }}>
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--text)' }}>
                    {emoji} {heading}
                </h2>
                {subheading && (
                    <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
                        {subheading}
                    </p>
                )}
            </div>

            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => scroll('left')}
                    style={{
                        position: 'absolute', left: -20, top: '45%', transform: 'translateY(-50%)',
                        zIndex: 10, width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        display: showLeft ? undefined : 'none', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    className="hidden md:flex hover:scale-110 active:scale-95"
                >
                    <ChevronLeft size={20} color="var(--text)" />
                </button>

                <div
                    ref={scrollRef}
                    style={{
                        display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 20,
                        scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none'
                    }}
                    className="no-scrollbar"
                >
                    {children}
                    {!hideViewMore && (
                        <Link
                            href={viewMoreHref}
                            style={{
                                minWidth: 200, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center', gap: 12,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.2s ease',
                                scrollSnapAlign: 'start'
                            }}
                            className="hover:bg-[rgba(255,107,0,0.05)] hover:border-[var(--accent)] group"
                        >
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-dim)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid var(--accent-border)', transition: 'all 0.3s ease'
                            }} className="group-hover:scale-110 group-hover:rotate-[-10deg]">
                                <ArrowRight size={20} color="var(--accent)" />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>View All</span>
                        </Link>
                    )}
                </div>

                <button
                    onClick={() => scroll('right')}
                    style={{
                        position: 'absolute', right: -20, top: '45%', transform: 'translateY(-50%)',
                        zIndex: 10, width: 40, height: 40, borderRadius: '50%',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        display: showRight ? undefined : 'none', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                    className="hidden md:flex hover:scale-110 active:scale-95"
                >
                    <ChevronRight size={20} color="var(--text)" />
                </button>
            </div>
        </div>
    )
}

function shuffleArray<T>(array: T[]): T[] {
    const a = [...array]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export default function RootPage() {
    const city = getCityBySlug('chennai')!
    const citySlug = 'chennai'
    const cityActivities = getActivitiesByCity(city.id)
    const cityWalks = getWalksByCity(city.id)

    const lowBudget = cityActivities.filter(a => a.tags?.includes('low budget fun activities'))
    const night = cityActivities.filter(a => a.tags?.includes('night activities'))

    const [shuffledWalks, setShuffledWalks] = useState(cityWalks)
    const [shuffledLowBudget, setShuffledLowBudget] = useState(lowBudget)
    const [shuffledNight, setShuffledNight] = useState(night)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setShuffledWalks(shuffleArray(cityWalks))
        setShuffledLowBudget(shuffleArray(lowBudget))
        setShuffledNight(shuffleArray(night))
    }, [])

    const cardStyle: React.CSSProperties = {
        minWidth: 260, maxWidth: 320, flexShrink: 0, scrollSnapAlign: 'start'
    }

    const walkCardStyle: React.CSSProperties = {
        minWidth: 330, maxWidth: 390, flexShrink: 0, scrollSnapAlign: 'start'
    }

    return (
        <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
            {/* ── Hero Section ────────────────────────────────────────── */}
            <section style={{
                height: '80vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', overflow: 'hidden', padding: '0 24px'
            }}>
                {/* Background Image */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img
                        src="https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sunrisechennai.jpeg?updatedAt=1775389293078"
                        alt="Chennai skyline at sunset"
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            filter: 'saturate(0.8) brightness(0.42)',
                        }}
                    />
                </div>
                
                {/* Gradients */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: [
                        'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(10,10,14,0.98) 0%, transparent 70%)',
                        'linear-gradient(180deg, rgba(10,10,14,0.3) 0%, rgba(10,10,14,0.15) 40%, rgba(10,10,14,0.85) 100%)',
                    ].join(', '),
                }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
                    <h1 style={{
                        fontSize: 'clamp(32px, 6vw, 72px)', lineHeight: 1.1,
                        marginBottom: 32, color: '#fff',
                        fontFamily: "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        fontWeight: 100,
                        letterSpacing: '-0.02em',
                        animation: 'fade-up 0.7s ease 0.1s both',
                    }}>
                        Never feel bored or lonely,<br />
                        <span style={{
                            display: 'inline-block',
                            fontFamily: "'Caveat', cursive",
                            fontSize: '1.25em',
                            background: 'linear-gradient(135deg, #FF6B00 0%, #FF9A3C 50%, #FFB870 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            animation: 'hero-shine 4s linear infinite',
                            fontWeight: 700,
                            fontStyle: 'normal',
                            paddingRight: 10,
                            marginTop: 4,
                        }}>
                            Find sidequests & activities in Chennai
                        </span>
                    </h1>
                    
                    <Link href="/chennai/activities" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 12,
                        padding: '18px 36px', borderRadius: 100, background: 'var(--accent)',
                        color: 'white', fontSize: 18, fontWeight: 700, textDecoration: 'none',
                        boxShadow: '0 8px 32px rgba(255,107,0,0.4)', transition: 'all 0.3s ease'
                    }} className="hover:scale-105 active:scale-95">
                        Explore Chennai <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* ── City Crawls ────────────────────────────────────────── */}
            <HScrollSection
                emoji="🚶"
                heading="City Crawls"
                subheading="Curated walks through historic neighbourhoods"
                viewMoreHref="/chennai/walks"
            >
                {shuffledWalks.map(w => (
                    <div key={w.id} style={walkCardStyle}>
                        <WalkCard walk={w} citySlug="chennai" />
                    </div>
                ))}
            </HScrollSection>

            {/* ── Pocket Friendly ────────────────────────────────────── */}
            <HScrollSection
                emoji="💰"
                heading="Pocket Friendly Activities"
                subheading="Great experiences that won't break the bank"
                viewMoreHref="/chennai/activities"
            >
                {shuffledLowBudget.map(a => (
                    <div key={a.id} style={cardStyle}>
                        <ActivityCard activity={a} citySlug="chennai" />
                    </div>
                ))}
            </HScrollSection>

            {/* ── Night Life ─────────────────────────────────────────── */}
            <HScrollSection
                emoji="🌙"
                heading="Night Life Activities"
                subheading="Experience Chennai after the sun goes down"
                viewMoreHref="/chennai/activities"
            >
                {shuffledNight.map(a => (
                    <div key={a.id} style={cardStyle}>
                        <ActivityCard activity={a} citySlug="chennai" />
                    </div>
                ))}
            </HScrollSection>

            {/* ── Call-out Cards ─────────────────────────────────────── */}
            <div style={{ 
                maxWidth: 1400, margin: '80px auto 0', padding: '0 28px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 
            }}>
                <Link href="/chennai/events-this-weekend" style={{
                    aspectRatio: '16/9', borderRadius: 32, overflow: 'hidden', position: 'relative',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
                    textDecoration: 'none', transition: 'all 0.3s ease'
                }} className="group hover:border-[var(--accent)] hover:-translate-y-2">
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.1,
                        background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)'
                    }} />
                    <h3 style={{
                        fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center',
                        lineHeight: 1.2, zIndex: 1, letterSpacing: '-0.02em'
                    }}>
                        Checkout the <br />
                        <span style={{ color: 'var(--accent)' }}>events happening</span> <br />
                        in Chennai
                    </h3>
                    <div style={{
                        position: 'absolute', bottom: 32, right: 32, width: 48, height: 48,
                        borderRadius: '50%', background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
                        opacity: 0, transform: 'translateY(10px)'
                    }} className="group-hover:opacity-100 group-hover:translate-y-0">
                        <ArrowRight size={24} color="white" />
                    </div>
                </Link>

                <Link href="/chennai/best-shawarma" style={{
                    aspectRatio: '16/9', borderRadius: 32, overflow: 'hidden', position: 'relative',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
                    textDecoration: 'none', transition: 'all 0.3s ease'
                }} className="group hover:border-[var(--accent)] hover:-translate-y-2">
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 0, opacity: 0.1,
                        background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)'
                    }} />
                    <h3 style={{
                        fontSize: 28, fontWeight: 800, color: 'white', textAlign: 'center',
                        lineHeight: 1.2, zIndex: 1, letterSpacing: '-0.02em'
                    }}>
                        Checkout <br />
                        <span style={{ color: 'var(--accent)' }}>best shawarmas</span> <br />
                        in Chennai
                    </h3>
                    <div style={{
                        position: 'absolute', bottom: 32, right: 32, width: 48, height: 48,
                        borderRadius: '50%', background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease',
                        opacity: 0, transform: 'translateY(10px)'
                    }} className="group-hover:opacity-100 group-hover:translate-y-0">
                        <ArrowRight size={24} color="white" />
                    </div>
                </Link>
            </div>
        </main>
    )
}
