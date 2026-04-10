'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Zap, Rocket, CalendarDays } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [scrolledPast30, setScrolledPast30] = useState(false)

    // Extract the city slug from the current pathname (e.g. /chennai/activities → "chennai")
    const citySlug = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        return segments[0] || 'chennai' // fallback to chennai
    }, [pathname])

    useEffect(() => {
        const fn = () => {
            setScrolled(window.scrollY > 50)
            // Check if user scrolled past 30% of the page
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = docHeight > 0 ? window.scrollY / docHeight : 0
            setScrolledPast30(scrollPercent >= 0.3)
        }
        window.addEventListener('scroll', fn, { passive: true })
        // Call fn once to sync initial state
        fn()
        return () => window.removeEventListener('scroll', fn)
    }, [])

    const homeHref = `/${citySlug}/activities`
    const surpriseHref = `/${citySlug}/surprise`
    const planHref = `/${citySlug}/plan`

    const isHomeActive = pathname === homeHref || pathname.startsWith(homeHref + '/')
    const isSurpriseActive = pathname === surpriseHref || pathname.startsWith(surpriseHref + '/')
    const isPlanActive = pathname === planHref || pathname.startsWith(planHref + '/')

    const isEventsPage = pathname.includes('/events-this-weekend')

    // Show outsyd as FAB only when scrolled past 30% AND not on surprise page AND not on events page
    const showOutsydFab = scrolledPast30 && !isSurpriseActive && !isEventsPage

    return (
        <>
            {/* ── Top bar — logo only, centred ── */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: 80,
                background: scrolled ? 'rgba(10,10,14,0.92)' : 'rgba(0,0,0,0)',
                backdropFilter: scrolled ? 'blur(28px) saturate(180%)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(180%)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.4s ease-out',
                pointerEvents: 'none',
            }}>
                <Link href={`/${citySlug}/activities`} style={{ 
                    display: 'flex', alignItems: 'center', textDecoration: 'none',
                    pointerEvents: 'auto',
                }}>
                    <img 
                        src="https://ik.imagekit.io/xqeoferlz6hbc/outsyd%20logo%20(1)_E8upmu0cU.png" 
                        alt="Outsyd" 
                        style={{ height: 57, width: 'auto', objectFit: 'contain' }} 
                    />
                </Link>
            </header>

            {/* ── Bottom sticky nav ── */}
            <nav style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: 'rgba(10,10,14,0.94)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                borderTop: '1px solid rgba(255,255,255,0.075)',
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}>
                {/* ── Events Page CTA Banner ── Sits flush on top of nav ── */}
                {isEventsPage && scrolledPast30 && (
                    <Link
                        href={homeHref}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            width: '100%', padding: '14px 20px',
                            background: 'linear-gradient(90deg, var(--accent) 0%, #FF8533 100%)',
                            color: '#fff', textDecoration: 'none',
                            fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
                            boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
                            animation: 'fade-up 0.4s ease-out both',
                        }}
                    >
                        <Rocket size={16} />
                        More Activities in {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)} this Weekend
                    </Link>
                )}

                <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    maxWidth: 540, margin: '0 auto',
                    padding: '8px 16px 10px',
                    position: 'relative',
                }}>
                    {/* ── All Activities (Home) ── */}
                    <Link
                        href={homeHref}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textDecoration: 'none', flex: 1,
                            padding: '6px 12px',
                            borderRadius: 14,
                            color: isHomeActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: 44, height: 30,
                            borderRadius: isHomeActive ? 20 : 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isHomeActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            <Rocket
                                size={20}
                                strokeWidth={isHomeActive ? 2.5 : 1.75}
                                color={isHomeActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isHomeActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                            whiteSpace: 'nowrap',
                        }}>
                            All Activities
                        </span>
                    </Link>

                    {/* ── outsyd ── */}
                    {showOutsydFab ? (
                        /* Floating FAB — shown after 30% scroll on non-surprise pages */
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <Link
                                href={surpriseHref}
                                style={{
                                    position: 'absolute',
                                    bottom: -2,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
                                    textDecoration: 'none',
                                }}
                            >
                                {/* Outer ring */}
                                <div style={{
                                    width: 102, height: 102, borderRadius: '50%',
                                    background: 'rgba(10,10,14,0.96)',
                                    border: '3.5px solid rgba(255,107,0,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 -6px 32px rgba(255,107,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)',
                                    transition: 'all 0.3s ease',
                                }}>
                                    {/* Inner orange button */}
                                    <div style={{
                                        width: 81, height: 81, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 50%, #FF9A3C 100%)',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center', gap: 0,
                                        boxShadow: '0 6px 28px rgba(255,107,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s ease',
                                    }}>
                                        <Zap size={28} color="white" strokeWidth={2.2} fill="white" />
                                        <span style={{
                                            fontSize: 22, fontWeight: 800, color: 'white',
                                            letterSpacing: '0.01em',
                                            fontFamily: "'Caveat', cursive",
                                            lineHeight: 1,
                                            marginTop: -2,
                                        }}>
                                            flash
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        /* Normal nav item — default state & always on surprise page */
                        <Link
                            href={surpriseHref}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                textDecoration: 'none', flex: 1,
                                padding: '6px 12px',
                                borderRadius: 14,
                                color: isSurpriseActive ? 'var(--accent)' : 'var(--text-3)',
                                transition: 'color 0.2s ease',
                            }}
                        >
                            <div style={{
                                width: 44, height: 30,
                                borderRadius: isSurpriseActive ? 20 : 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isSurpriseActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            }}>
                                <Zap
                                    size={20}
                                    strokeWidth={isSurpriseActive ? 2.5 : 1.75}
                                    color={isSurpriseActive ? 'var(--accent)' : 'var(--text-3)'}
                                    fill={isSurpriseActive ? 'var(--accent)' : 'transparent'}
                                />
                            </div>
                            <span style={{
                                fontSize: 16, fontWeight: isSurpriseActive ? 700 : 500,
                                letterSpacing: '0.01em',
                                transition: 'font-weight 0.2s',
                                fontFamily: "'Caveat', cursive",
                                lineHeight: 1,
                            }}>
                                flash
                            </span>
                        </Link>
                    )}

                    {/* ── Plan My Day ── */}
                    <Link
                        href={planHref}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textDecoration: 'none', flex: 1,
                            padding: '6px 12px',
                            borderRadius: 14,
                            color: isPlanActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: 44, height: 30,
                            borderRadius: isPlanActive ? 20 : 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isPlanActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            <CalendarDays
                                size={20}
                                strokeWidth={isPlanActive ? 2.5 : 1.75}
                                color={isPlanActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isPlanActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                        }}>
                            Plan
                        </span>
                    </Link>
                </div>
            </nav>
        </>
    )
}
