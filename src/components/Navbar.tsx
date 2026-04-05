'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Zap, Home, Shuffle, CalendarDays, PartyPopper } from 'lucide-react'

export default function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)

    // Extract the city slug from the current pathname (e.g. /chennai/activities → "chennai")
    const citySlug = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        return segments[0] || 'chennai' // fallback to chennai
    }, [pathname])

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 24)
        window.addEventListener('scroll', fn, { passive: true })
        return () => window.removeEventListener('scroll', fn)
    }, [])

    const homeHref = `/${citySlug}/activities`
    const surpriseHref = `/${citySlug}/surprise`
    const planHref = `/${citySlug}/plan`

    const isHomeActive = pathname === homeHref || pathname.startsWith(homeHref + '/')
    const isSurpriseActive = pathname === surpriseHref || pathname.startsWith(surpriseHref + '/')
    const isPlanActive = pathname === planHref || pathname.startsWith(planHref + '/')

    return (
        <>
            {/* ── Top bar — logo only, centred ── */}
            <header style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                height: 60,
                background: scrolled ? 'rgba(10,10,14,0.90)' : 'transparent',
                backdropFilter: scrolled ? 'blur(22px) saturate(180%)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(22px) saturate(180%)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
                transition: 'background 0.35s ease, border-color 0.35s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Link href={`/${citySlug}/activities`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 34, height: 34,
                        background: 'linear-gradient(135deg, #FF6B00 0%, #FF9A3C 100%)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 18px rgba(255,107,0,0.42)',
                    }}>
                        <Zap size={16} color="white" fill="white" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.04em', color: '#ffffff' }}>TBOC</span>
                        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                            {citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}
                        </span>
                    </div>
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
                <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    maxWidth: 540, margin: '0 auto',
                    padding: '8px 16px 10px',
                    position: 'relative',
                }}>
                    {/* ── Home ── */}
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
                            <Home
                                size={20}
                                strokeWidth={isHomeActive ? 2.5 : 1.75}
                                color={isHomeActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isHomeActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                        }}>
                            Home
                        </span>
                    </Link>

                    {/* ── Surprise Me ── */}
                    {isSurpriseActive ? (
                        /* When on surprise page, render as a normal nav item */
                        <Link
                            href={surpriseHref}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                textDecoration: 'none', flex: 1,
                                padding: '6px 12px',
                                borderRadius: 14,
                                color: 'var(--accent)',
                                transition: 'color 0.2s ease',
                            }}
                        >
                            <div style={{
                                width: 44, height: 30,
                                borderRadius: 20,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,107,0,0.16)',
                                transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                            }}>
                                <PartyPopper
                                    size={20}
                                    strokeWidth={2.5}
                                    color={'var(--accent)'}
                                />
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: 700,
                                letterSpacing: '0.01em',
                                transition: 'font-weight 0.2s',
                            }}>
                                Surprise
                            </span>
                        </Link>
                    ) : (
                        /* Floating FAB when NOT on surprise page */
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
                                        alignItems: 'center', justifyContent: 'center', gap: 3,
                                        boxShadow: '0 6px 28px rgba(255,107,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s ease',
                                    }}>
                                        <PartyPopper size={28} color="white" strokeWidth={2.2} />
                                        <span style={{
                                            fontSize: 9, fontWeight: 800, color: 'white',
                                            letterSpacing: '0.08em', textTransform: 'uppercase',
                                        }}>
                                            Surprise
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </div>
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
