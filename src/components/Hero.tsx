'use client'
import { useState, useEffect } from 'react'
import { Search, ArrowRight, ChevronDown, MapPin } from 'lucide-react'
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

const BG_SLIDES = [
    {
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/temple.png?updatedAt=1775389293239',
        label: 'Temples',
        emoji: '🪔',
    },
    {
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/sunrisechennai.jpeg?updatedAt=1775389293078',
        label: 'Sunrises',
        emoji: '🌅',
    },
    {
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/surfingchennai.jpeg?updatedAt=1775389293055',
        label: 'Adventure',
        emoji: '🏄‍♂️',
    },
    {
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/paintball.jpeg?updatedAt=1775389292732',
        label: 'Games',
        emoji: '🎯',
    },
    {
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/burger.jpeg?updatedAt=1775389292690',
        label: 'Food',
        emoji: '🍔',
    },
]

interface HeroProps {
    city: City
    onSearch?: (query: string) => void
}

export default function Hero({ city, onSearch }: HeroProps) {
    const [slideIdx, setSlideIdx] = useState(0)
    const [phraseIdx, setPhraseIdx] = useState(0)
    const [phraseFade, setPhraseFade] = useState(true)
    const [searchFocused, setSearchFocused] = useState(false)
    const [inputVal, setInputVal] = useState('')

    // Cycle background slides every 4 seconds
    useEffect(() => {
        const t = setInterval(() => {
            setSlideIdx(i => (i + 1) % BG_SLIDES.length)
        }, 4000)
        return () => clearInterval(t)
    }, [])

    // Cycle rotating phrases
    useEffect(() => {
        const t = setInterval(() => {
            setPhraseFade(false)
            setTimeout(() => { setPhraseIdx(i => (i + 1) % ROTATING_PHRASES.length); setPhraseFade(true) }, 350)
        }, 2800)
        return () => clearInterval(t)
    }, [])

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '120px 24px 100px',
            position: 'relative', overflow: 'hidden',
        }}>

            {/* Crossfading background slides */}
            {BG_SLIDES.map((slide, i) => (
                <div
                    key={slide.image}
                    style={{
                        position: 'absolute', inset: 0, zIndex: 0,
                        opacity: i === slideIdx ? 1 : 0,
                        transition: 'opacity 1.4s ease-in-out',
                    }}
                >
                    <img
                        src={slide.image}
                        alt={slide.label}
                        style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'center',
                            filter: 'saturate(0.8) brightness(0.48)',
                            transform: i === slideIdx ? 'scale(1.06)' : 'scale(1.0)',
                            transition: 'transform 4s ease-out, opacity 1.4s ease-in-out',
                        }}
                    />
                </div>
            ))}

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
                    fontSize: 'clamp(28px, 5.5vw, 64px)',
                    fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.2,
                    marginBottom: 48,
                    color: '#fff',
                    animation: 'fade-up 0.7s ease 0.1s both',
                }}>
                    Find where to go in {city.name} When you're{' '}
                    <span style={{
                        display: 'inline-block',
                        fontWeight: 500, fontStyle: 'italic',
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF9A3C 50%, #FFB870 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        animation: 'hero-shine 4s linear infinite',
                        opacity: phraseFade ? 1 : 0,
                        transform: phraseFade ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.35s ease, transform 0.35s ease',
                    }}>
                        {ROTATING_PHRASES[phraseIdx]}
                    </span>
                </h1>

                {/* Search bar — wraps on mobile */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 10, width: '100%', maxWidth: 600,
                    margin: '0 auto',
                    animation: 'fade-up 0.7s ease 0.3s both',
                }}>
                    <div style={{
                        position: 'relative', flex: '1 1 300px', minWidth: 0,
                        borderRadius: 16,
                        background: searchFocused ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${searchFocused ? 'rgba(255,107,0,0.5)' : 'rgba(255,255,255,0.11)'}`,
                        boxShadow: searchFocused
                            ? '0 0 0 4px rgba(255,107,0,0.08), 0 8px 32px rgba(0,0,0,0.4)'
                            : '0 4px 20px rgba(0,0,0,0.35)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <Search size={17} style={{
                            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                            color: searchFocused ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s', pointerEvents: 'none',
                        }} />
                        <input
                            id="hero-search"
                            type="text"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder="Search places, moods, areas…"
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && onSearch) {
                                    onSearch(inputVal)
                                    document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' })
                                }
                            }}
                            style={{
                                width: '100%', height: 56, paddingLeft: 52, paddingRight: 16,
                                background: 'transparent',
                                color: 'var(--text)', fontSize: 15,
                                outline: 'none', fontFamily: 'inherit', border: 'none',
                                borderRadius: 16,
                            }}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (onSearch) {
                                onSearch(inputVal)
                                document.getElementById('activities-section')?.scrollIntoView({ behavior: 'smooth' })
                            }
                        }}
                        style={{
                            height: 56, padding: '0 28px', borderRadius: 16,
                            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                            color: 'white', fontSize: 15, fontWeight: 700,
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 24px rgba(255,107,0,0.4)',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                            flex: '0 0 auto',
                            width: 'auto',
                        }}
                        className="hero-explore-btn"
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 30px rgba(255,107,0,0.6)'
                                ; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(255,107,0,0.4)'
                                ; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                        }}
                    >
                        Explore <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="bounce-arrow" style={{
                position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                color: 'var(--text-3)', zIndex: 2,
            }}>
                <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
                <ChevronDown size={18} />
            </div>
        </section>
    )
}
