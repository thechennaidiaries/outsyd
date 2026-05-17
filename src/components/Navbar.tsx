'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { Rocket, CalendarDays, Calendar, Compass, Bookmark, Map, Gamepad2 } from 'lucide-react'
import { fetchCities } from '@/lib/supabase-data'
import type { City } from '@/data/cities'
import { SAVED_ITEM_ADDED_EVENT, type SavedItem } from '@/lib/saved-items'
import { isClientLoggedIn } from '@/lib/auth-client'

export default function Navbar() {
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [scrolledPast30, setScrolledPast30] = useState(false)
    const [savedBannerLabel, setSavedBannerLabel] = useState<string | null>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(() => isClientLoggedIn())

    const [cities, setCities] = useState<City[]>([])

    useEffect(() => {
        fetchCities().then(setCities)
        // Re-sync on mount in case session expired
        setIsLoggedIn(isClientLoggedIn())
    }, [])

    // Extract the city slug from the current pathname (e.g. /chennai/activities → "chennai").
    // Non-city routes like /saved should fall back to the default city instead of becoming /saved/events.
    const citySlug = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        const firstSegment = segments[0]
        return firstSegment && cities.some(c => c.id === firstSegment) ? firstSegment : 'chennai'
    }, [pathname, cities])

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

    useEffect(() => {
        let timeoutId: ReturnType<typeof window.setTimeout> | null = null

        function handleSavedItemAdded(event: Event) {
            const savedItem = (event as CustomEvent<SavedItem>).detail
            const typeLabel = savedItem.type.charAt(0).toUpperCase() + savedItem.type.slice(1)

            setSavedBannerLabel(typeLabel)

            if (timeoutId) {
                window.clearTimeout(timeoutId)
            }

            timeoutId = window.setTimeout(() => {
                setSavedBannerLabel(null)
                timeoutId = null
            }, 3500)
        }

        window.addEventListener(SAVED_ITEM_ADDED_EVENT, handleSavedItemAdded)

        return () => {
            window.removeEventListener(SAVED_ITEM_ADDED_EVENT, handleSavedItemAdded)
            if (timeoutId) {
                window.clearTimeout(timeoutId)
            }
        }
    }, [])

    const homeHref       = '/'
    const surpriseHref   = `/${citySlug}/surprise`
    const savedHref      = isLoggedIn ? '/account/saved' : '/saved'
    const planHref       = `/${citySlug}/plan`

    const isHomeActive = pathname === homeHref || pathname.startsWith(homeHref + '/')
    const isGameActive = pathname.startsWith(`/${citySlug}/games`)
    const isSurpriseActive = pathname === surpriseHref || pathname.startsWith(surpriseHref + '/')
    const isSavedActive = pathname === savedHref || pathname.startsWith(savedHref + '/')
    const isPlanActive = pathname === planHref || pathname.startsWith(planHref + '/')

    const isHomepage = pathname === '/'
    
    return (
        <>
            {/* ── Top bar — logo only, centred ── */}
            <header style={{
                position: isHomepage ? 'absolute' : 'fixed', 
                top: 0, left: 0, right: 0, zIndex: 100,
                height: 80,
                background: scrolled && !isHomepage ? 'rgba(10,10,14,0.92)' : 'rgba(0,0,0,0)',
                backdropFilter: scrolled && !isHomepage ? 'blur(28px) saturate(180%)' : 'none',
                WebkitBackdropFilter: scrolled && !isHomepage ? 'blur(28px) saturate(180%)' : 'none',
                borderBottom: scrolled && !isHomepage ? '1px solid rgba(255,255,255,0.08)' : 'none',
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
                {savedBannerLabel && (
                    <Link
                        href={savedHref}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '14px 20px',
                            background: 'linear-gradient(90deg, #FF6B00 0%, #FF8533 52%, #FF9A3C 100%)',
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
                            animation: 'fade-up 0.24s ease-out both',
                        }}
                    >
                        <Bookmark size={16} color="#fff" />
                        <span style={{ whiteSpace: 'nowrap' }}>
                            {savedBannerLabel} saved
                        </span>
                        <span style={{
                            whiteSpace: 'nowrap',
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}>
                            View saved &rarr;
                        </span>
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

                    {/* ── Game ── */}
                    <Link
                        href={`/${citySlug}/games/routethala`}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                            textDecoration: 'none', flex: 1,
                            padding: '6px 12px',
                            borderRadius: 14,
                            color: isGameActive ? 'var(--accent)' : 'var(--text-3)',
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <div style={{
                            width: 44, height: 30,
                            borderRadius: isGameActive ? 20 : 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isGameActive ? 'rgba(255,107,0,0.16)' : 'transparent',
                            transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                            <Gamepad2
                                size={20}
                                strokeWidth={isGameActive ? 2.5 : 1.75}
                                color={isGameActive ? 'var(--accent)' : 'var(--text-3)'}
                            />
                        </div>
                        <span style={{
                            fontSize: 10, fontWeight: isGameActive ? 700 : 500,
                            letterSpacing: '0.01em',
                            whiteSpace: 'nowrap',
                        }}>
                            Game
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
                            <span style={{ fontSize: 20 }}>
                                🫠
                            </span>
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
