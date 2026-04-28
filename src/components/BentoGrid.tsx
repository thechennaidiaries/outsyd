'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BentoCard {
    title: string
    subtitle: string
    emoji: string
    href: string
    gradient: string
    image?: string
}

interface BentoGridProps {
    citySlug: string
    heading?: string
    subheading?: string
}

export default function BentoGrid({
    citySlug,
    heading = 'Going out with Friends?',
    subheading,
}: BentoGridProps) {
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])
    const cards: BentoCard[] = [
        {
            title: 'Gaming',
            subtitle: 'Bowling, Laser Tag, VR & more',
            emoji: '🎮',
            href: `/${citySlug}/activities/art-activities-in-${citySlug}`,
            gradient: 'linear-gradient(145deg, #7c3aed 0%, #3b0764 100%)',
            image: 'https://ik.imagekit.io/zxnq8x4yz/image.png_202604261120%201.png',
        },
        {
            title: 'Sports',
            subtitle: 'Football, Cricket, Tennis & more',
            emoji: '⚽',
            href: `/${citySlug}/activities/cultural-experiences-in-${citySlug}`,
            gradient: 'linear-gradient(145deg, #059669 0%, #022c22 100%)',
            image: 'https://ik.imagekit.io/zxnq8x4yz/image.png_202604261112%201.png',
        },
    ]

    const dotPattern = `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '62px 28px 0' }}>
            {/* Section header */}
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
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

            {/* Bento grid */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
            }}>
                {cards.map((card, idx) => (
                    <Link
                        key={idx}
                        href={card.href}
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            width: isMobile ? 'calc(50% - 8px)' : 'calc(25% - 12px)',
                            minWidth: isMobile ? 140 : 260,
                            maxWidth: isMobile ? 'none' : 340,
                            aspectRatio: '3/4',
                            background: 'transparent',
                            borderRadius: 0,
                            textDecoration: 'none',
                            overflow: 'hidden',
                            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        }}
                        className="hover:-translate-y-[2px]"
                    >
                        {card.image ? (
                            <img 
                                src={card.image} 
                                alt={card.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <>
                                {/* Dot pattern overlay on right half */}
                                <div style={{
                                    position: 'absolute', top: 0, right: 0, bottom: 0,
                                    width: '55%',
                                    backgroundImage: dotPattern,
                                    backgroundSize: '12px 12px',
                                    pointerEvents: 'none',
                                    maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                                }} />

                                {/* Text top-left */}
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <p style={{
                                        fontSize: 15, fontWeight: 800,
                                        color: '#fff',
                                        letterSpacing: '-0.02em',
                                        lineHeight: 1.2,
                                        marginBottom: 4,
                                    }}>
                                        {card.title}
                                    </p>
                                    <p style={{
                                        fontSize: 11, fontWeight: 500,
                                        color: 'rgba(255,255,255,0.7)',
                                        lineHeight: 1.4,
                                    }}>
                                        {card.subtitle}
                                    </p>
                                </div>

                                {/* Emoji bottom-right */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 10, right: 12,
                                    fontSize: 48,
                                    lineHeight: 1,
                                    opacity: 0.9,
                                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                }}>
                                    {card.emoji}
                                </div>
                            </>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}
