'use client'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { City } from '@/data/cities'

const ROTATING_PHRASES = [
    'Bored AF',
    'All alone',
    'on a Budget',
    'on a Date',
    'with your Gang',
    'Free right now',
    'planning this Weekend',
    'Done with the beaches',
]

interface HeroProps {
    city: City
}

export default function Hero({ city }: HeroProps) {
    const [phraseIdx, setPhraseIdx] = useState(0)
    const [phraseFade, setPhraseFade] = useState(true)

    // Cycle rotating phrases
    useEffect(() => {
        const t = setInterval(() => {
            setPhraseFade(false)
            setTimeout(() => { setPhraseIdx(i => (i + 1) % ROTATING_PHRASES.length); setPhraseFade(true) }, 350)
        }, 2800)
        return () => clearInterval(t)
    }, [])

    /* ── Shared content (headline + search + scroll) ────────────── */
    const heroContent = (
        <>
            {/* Overlays */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                background: [
                    'radial-gradient(ellipse 100% 55% at 50% 100%, rgba(10,10,14,0.98) 0%, transparent 70%)',
                    'radial-gradient(ellipse 110% 40% at 50% 0%,  rgba(10,10,14,0.75) 0%, transparent 60%)',
                    'linear-gradient(180deg, rgba(10,10,14,0.3) 0%, rgba(10,10,14,0.15) 40%, rgba(10,10,14,0.85) 100%)',
                    'radial-gradient(ellipse 60% 60% at 50% 42%, rgba(255,107,0,0.05) 0%, transparent 70%)',
                ].join(', '),
            }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 780, width: '100%' }}>

                {/* Main Headline — static + rotating */}
                <h1 style={{
                    fontSize: 'clamp(32px, 6vw, 72px)',
                    lineHeight: 1.1,
                    marginBottom: 48,
                    color: '#fff',
                    animation: 'fade-up 0.7s ease 0.1s both',
                    fontFamily: "'PP Neue Montreal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    fontWeight: 100,
                    letterSpacing: '-0.02em',
                }}>
                    Find where to go in<br />
                    {city.name} When you're<br />
                    <span style={{
                        display: 'inline-block',
                        fontFamily: "'Caveat', cursive",
                        fontSize: '1.25em',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF9A3C 50%, #FFB870 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        animation: 'hero-shine 4s linear infinite',
                        opacity: phraseFade ? 1 : 0,
                        transform: phraseFade ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.35s ease, transform 0.35s ease',
                        fontWeight: 700,
                        fontStyle: 'normal',
                        paddingRight: 10,
                    }}>
                        {ROTATING_PHRASES[phraseIdx]}
                    </span>
                </h1>

                <div 
                    onClick={() => {
                        const el = document.getElementById('mood-navigator')
                        if (el) {
                            const offset = 80 // header offset
                            const bodyRect = document.body.getBoundingClientRect().top
                            const elementRect = el.getBoundingClientRect().top
                            const elementPosition = elementRect - bodyRect
                            const offsetPosition = elementPosition - offset
                            window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                        }
                    }}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: -10,
                        marginBottom: 40,
                        animation: 'fade-up 0.9s ease 0.5s both',
                        cursor: 'pointer'
                    }}
                >
                    <ChevronDown size={22} color="#ffffff" strokeWidth={2.5} />
                </div>

                {/* Search bar removed as per user request */}
            </div>


        </>
    )

    const sectionBase: React.CSSProperties = {
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 100px',
        position: 'relative', overflow: 'hidden',
    }

    return (
        <>
            {/* ── Desktop hero (image background) ── hidden on mobile ── */}
            <section className="hidden md:flex" style={{
                ...sectionBase,
                display: undefined, // let className control display
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                {/* Background image — desktop */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img
                        src="https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sunrisechennai.jpeg?updatedAt=1775389293078"
                        alt="Chennai Sunrise"
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            filter: 'saturate(0.8) brightness(0.48)',
                        }}
                    />
                </div>
                {heroContent}
            </section>

            {/* ── Mobile hero (video background) ── hidden on desktop ── */}
            <section className="flex md:hidden" style={{
                ...sectionBase,
                display: undefined, // let className control display
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                {/* Background video — mobile */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            filter: 'saturate(0.8) brightness(0.48)',
                        }}
                    >
                        <source
                            src="https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/herocompressstreaming.mp4?updatedAt=1776366306071"
                            type="video/mp4"
                        />
                    </video>
                </div>
                {heroContent}
            </section>
        </>
    )
}
