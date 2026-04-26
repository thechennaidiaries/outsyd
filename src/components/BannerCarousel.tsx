'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface BannerItem {
    id: string
    image: string
    link: string
    title?: string
}

interface BannerCarouselProps {
    items: BannerItem[]
    heading?: string
    subheading?: string
}

export default function BannerCarousel({
    items,
    heading = 'Handpicked For You',
    subheading,
}: BannerCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

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

    function scrollToCard(idx: number) {
        const card = cardRefs.current[idx]
        if (card && scrollRef.current) {
            const container = scrollRef.current
            const scrollTo = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2
            container.scrollTo({ left: scrollTo, behavior: 'smooth' })
        }
    }

    if (items.length === 0) return null

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 0 0', position: 'relative' }}>
            {/* Header */}
            {heading && (
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
            )}

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
                {items.map((item, idx) => {
                    const isActive = idx === activeIndex

                    return (
                        <div
                            key={item.id}
                            ref={el => { cardRefs.current[idx] = el }}
                            style={{
                                flexShrink: 0,
                                scrollSnapAlign: 'center',
                                width: isMobile ? 'calc(100vw - 80px)' : 'calc(25% - 12px)',
                                minWidth: isMobile ? 'calc(100vw - 80px)' : 260,
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
                            <Link
                                href={item.link}
                                style={{
                                    display: 'block',
                                    background: 'transparent',
                                    borderRadius: 0,
                                    overflow: 'hidden',
                                    border: 'none',
                                    boxShadow: 'none',
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title || 'Handpicked banner'}
                                    style={{
                                        width: '100%', height: 'auto',
                                        display: 'block',
                                    }}
                                />
                            </Link>
                        </div>
                    )
                })}
            </div>

            {/* Dot indicators (mobile only) */}
            {isMobile && items.length > 1 && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 6, padding: '14px 0 0',
                }}>
                    {items.map((_, idx) => (
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
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
