'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Activity } from '@/data/activities'
import SaveItemButton from '@/components/SaveItemButton'
import { optimizeImageUrl } from '@/utils/image'

interface SpotlightCarouselProps {
    activities: Activity[]
    citySlug: string
    heading?: string
    subheading?: string
}

export default function SpotlightCarousel({
    activities,
    citySlug,
    heading = 'In the Spotlight',
    subheading = 'Fresh discoveries added this week',
}: SpotlightCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    // Check viewport
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Track active card via IntersectionObserver
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    const updateActiveOnScroll = useCallback(() => {
        if (!scrollRef.current || !isMobile) return
        const container = scrollRef.current
        const containerCenter = container.scrollLeft + container.clientWidth / 2

        let closestIdx = 0
        let closestDist = Infinity

        cardRefs.current.forEach((card, idx) => {
            if (!card) return
            const cardCenter = card.offsetLeft + card.offsetWidth / 2
            const dist = Math.abs(containerCenter - cardCenter)
            if (dist < closestDist) {
                closestDist = dist
                closestIdx = idx
            }
        })
        setActiveIndex(closestIdx)
    }, [isMobile])

    useEffect(() => {
        const ref = scrollRef.current
        if (!ref) return
        ref.addEventListener('scroll', updateActiveOnScroll, { passive: true })
        return () => ref.removeEventListener('scroll', updateActiveOnScroll)
    }, [updateActiveOnScroll])

    // Scroll to a specific card when dot is clicked
    function scrollToCard(idx: number) {
        const card = cardRefs.current[idx]
        if (card && scrollRef.current) {
            const container = scrollRef.current
            const scrollTo = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2
            container.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    }

    if (activities.length === 0) return null

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '62px 0 0', position: 'relative' }}>
            {/* Header */}
            <div style={{ padding: '0 28px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    color: '#ffffff',
                    fontFamily: '"PP Neue Montreal", sans-serif'
                }}>
                    {heading}
                </h2>
                {subheading && (
                    <p style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 400, letterSpacing: '-0.01em' }}>
                        {subheading}
                    </p>
                )}
            </div>

            {/* Carousel Track */}
            <div
                ref={scrollRef}
                className="no-scrollbar"
                style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    paddingLeft: isMobile ? 28 : 28,
                    paddingRight: isMobile ? 28 : 28,
                    paddingBottom: 12,
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                {activities.map((activity, idx) => {
                    const isActive = idx === activeIndex
                    const activitySlug = activity.slug ?? ''

                    return (
                        <div
                            key={activity.id ?? idx}
                            ref={el => { cardRefs.current[idx] = el }}
                            style={{
                                flexShrink: 0,
                                scrollSnapAlign: 'center',
                                // Mobile: one card fills ~85% of viewport, desktop: ~25%
                                width: isMobile ? 'calc(100vw - 80px)' : 'calc(25% - 16px)',
                                minWidth: isMobile ? 'calc(100vw - 80px)' : 280,
                                maxWidth: isMobile ? 400 : 340,
                                transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease',
                                transform: isMobile
                                    ? isActive ? 'scale(1)' : 'scale(0.92)'
                                    : 'scale(1)',
                                opacity: isMobile
                                    ? isActive ? 1 : 0.65
                                    : 1,
                            }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    display: 'flex', flexDirection: 'column',
                                    background: 'var(--bg-card)',
                                    borderRadius: 20,
                                    border: `1.5px solid ${isMobile && isActive ? 'rgba(255,107,0,0.25)' : 'var(--border)'}`,
                                    overflow: 'hidden',
                                    boxShadow: isMobile && isActive
                                        ? '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,0,0.08)'
                                        : 'var(--shadow-card)',
                                    transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
                                }}
                            >
                                {/* Save button */}
                                {activitySlug && (
                                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                                        <SaveItemButton type="activity" slug={activitySlug} citySlug={citySlug} compact iconOnly />
                                    </div>
                                )}

                                <Link
                                    href={`/${citySlug}/activities/${activitySlug}`}
                                    style={{
                                        display: 'flex', flexDirection: 'column',
                                        textDecoration: 'none', cursor: 'pointer',
                                    }}
                                >
                                    {/* Image — 3:4 portrait */}
                                    <div style={{
                                        position: 'relative',
                                        aspectRatio: '3/4',
                                        overflow: 'hidden',
                                        background: 'var(--bg-elevated)',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={optimizeImageUrl(activity.image, 'w-800,q-70,f-auto')}
                                            alt={activity.title}
                                            loading={idx < 2 ? 'eager' : 'lazy'}
                                            style={{
                                                width: '100%', height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.5s ease',
                                            }}
                                        />

                                        {/* Gradient overlay */}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
                                        }} />

                                        {/* "NEW" badge */}
                                        <div style={{
                                            position: 'absolute', top: 12, left: 12,
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            padding: '4px 10px', borderRadius: 100,
                                            background: 'rgba(0,0,0,0.6)',
                                            backdropFilter: 'blur(8px)',
                                            fontSize: 10, fontWeight: 800, color: '#fff',
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                        }}>
                                            ✨ New
                                        </div>

                                        {/* Title + Location overlay at bottom */}
                                        <div style={{
                                            position: 'absolute', bottom: 0, left: 0, right: 0,
                                            padding: '16px 16px 18px',
                                        }}>
                                            <p style={{
                                                fontSize: 16, fontWeight: 800,
                                                color: '#ffffff',
                                                lineHeight: 1.3, letterSpacing: '-0.02em',
                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                marginBottom: 6,
                                            }}>
                                                {activity.title}
                                            </p>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500,
                                            }}>
                                                <MapPin size={11} style={{ flexShrink: 0 }} />
                                                {activity.location ?? activity.area ?? ''}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Dot indicators (mobile only) */}
            {isMobile && activities.length > 1 && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '14px 0 0',
                }}>
                    {activities.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollToCard(idx)}
                            style={{
                                width: idx === activeIndex ? 20 : 6,
                                height: 6,
                                borderRadius: 100,
                                border: 'none',
                                background: idx === activeIndex ? 'var(--accent)' : 'rgba(255,255,255,0.18)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                padding: 0,
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
