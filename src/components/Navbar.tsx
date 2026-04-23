'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Zap, Rocket, CalendarDays, Calendar, Bookmark } from 'lucide-react'
import { getCityBySlug } from '@/data/cities'

export default function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [scrolledPast30, setScrolledPast30] = useState(false)

    // Extract the city slug from the current pathname (e.g. /chennai/activities → "chennai").
    // Non-city routes like /saved should fall back to the default city instead of becoming /saved/events.
    const citySlug = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        const firstSegment = segments[0]
        return firstSegment && getCityBySlug(firstSegment) ? firstSegment : 'chennai'
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

    const homeHref = '/'
    const eventsHref = `/${citySlug}/events`
    const surpriseHref = `/${citySlug}/surprise`
    const savedHref = '/saved'
    const planHref = `/${citySlug}/plan`

    const isHomeActive = pathname === homeHref || pathname.startsWith(homeHref + '/')
    const isEventsActive = pathname === eventsHref || pathname.startsWith(eventsHref + '/')
    const isSurpriseActive = pathname === surpriseHref || pathname.startsWith(surpriseHref + '/')
    const isSavedActive = pathname === savedHref || pathname.startsWith(savedHref + '/')
    const isPlanActive = pathname === planHref || pathname.startsWith(planHref + '/')

    const isEventsPage = pathname.includes('/events-this-weekend') || pathname.includes('/best-shawarma') || pathname.includes('/best-icecreams')

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
                <Link href="/" style={{ 
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
                        {pathname.includes('/best-shawarma') || pathname.includes('/best-icecreams')
                            ? `Find Cool Things to do in ${citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}`
                            : `More Activities in ${citySlug.charAt(0).toUpperCase() + citySlug.slice(1)} this Weekend`
                        }
                    </Link>
                )}

                <div style={{
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    maxWidth: 540, margin: '0 auto',
                    padding: '8px 16px 10px',
                    position: 'relative',
                }}>
                    {/* ── Explore (Home) ── */}
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
                            Explore
                        </span>
                    </Link>

                    <Link
                        href={eventsHref}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textDecoration: 'none', flex: 1,
                            padding: '6px 12px',
                            borderRadius: 14,
                            color: isEventsActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: 44, height: 30,
                            borderRadius: isEventsActive ? 20 : 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isEventsActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            <Calendar
                                size={20}
                                strokeWidth={isEventsActive ? 2.5 : 1.75}
                                color={isEventsActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isEventsActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                            whiteSpace: 'nowrap',
                        }}>
                            Events
                        </span>
                    </Link>

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
                            fontSize: 10, fontWeight: isSurpriseActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                            whiteSpace: 'nowrap',
                        }}>
                            I&apos;m bored!
                        </span>
                    </Link>

                    <Link
                        href={savedHref}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textDecoration: 'none', flex: 1,
                            padding: '6px 12px',
                            borderRadius: 14,
                            color: isSavedActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: 44, height: 30,
                            borderRadius: isSavedActive ? 20 : 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isSavedActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            <Bookmark
                                size={20}
                                strokeWidth={isSavedActive ? 2.5 : 1.75}
                                color={isSavedActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isSavedActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            transition: 'font-weight 0.2s',
                            whiteSpace: 'nowrap',
                        }}>
                            Saved
                        </span>
                    </Link>

                    {/* ── My Plan ── */}
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
                            whiteSpace: 'nowrap',
                        }}>
                            My Plan
                        </span>
                    </Link>
                </div>
            </nav>
        </>
    )
}
