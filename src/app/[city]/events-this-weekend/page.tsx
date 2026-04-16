'use client'
import { useParams } from 'next/navigation'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft } from 'lucide-react'

const EVENT_DATA = [
    {
        id: '1',
        title: 'Strangers Meet at Thiruvanmiyur Beach',
        time: 'Sunday, 19th April',
        location: 'Thiruvanmiyur Beach',
        image: '/events/strangers-meet-thiruvanmiyur.png',
        bookingLink: 'https://www.instagram.com/p/DXKNgAHidfT/',
        price: 'Meetup'
    },
    {
        id: '2',
        title: 'Strangers Sunset Picnic',
        time: 'Saturday, 18th April',
        location: 'Semmozhi Poonga',
        image: '/events/strangers-sunset-picnic.png',
        bookingLink: 'https://www.instagram.com/p/DXCSVQYEye6/?igsh=YzJscWJ2dWd3NGk%3D',
        price: 'Picnic'
    },
    {
        id: '3',
        title: 'Strangers Trip to Tada',
        time: 'Sunday, 19th April',
        location: 'Tada Waterfalls',
        image: '/events/strangers-trip-tada.png',
        bookingLink: 'https://www.instagram.com/reels/DXGbshZEU5E/',
        price: 'Trip'
    },
    {
        id: '4',
        title: 'Strangers Zumba',
        time: 'Sunday, 19th April',
        location: 'Semmancheri',
        image: '/events/strangers-zumba.png',
        bookingLink: 'https://www.instagram.com/p/DW3_WWoFPmZ/?img_index=3',
        price: 'Fitness'
    },
    {
        id: '5',
        title: 'Beach Games Strangers Meetup',
        time: 'Saturday, 18th April',
        location: 'Besant Nagar',
        image: '/events/beach-games-besant-nagar.png',
        bookingLink: 'https://www.instagram.com/p/DXJ_EkTADpI/',
        price: 'Sports'
    },
    {
        id: '6',
        title: 'Kollywood Night',
        time: 'Sunday, 19th April',
        location: 'Zostel Anna Nagar',
        image: '/events/kollywood-night-zostel.png',
        bookingLink: 'https://www.instagram.com/reels/DXHj8T5znGt/',
        price: 'Games'
    },
    {
        id: '7',
        title: 'Strangers Meetup',
        time: 'Sunday, 19th April',
        location: 'Cafe',
        image: '/events/strangers-meetup-cafe.png',
        bookingLink: 'https://www.instagram.com/p/DXJ6s0_gROI/',
        price: 'Meetup'
    }
]


export default function EventsWeekendPage() {
    const params = useParams()
    const citySlug = params.city as string
    const city = getCityBySlug(citySlug)

    if (!city) notFound()

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 100 }}>
            {/* Header / Hero Section */}
            <div style={{
                paddingTop: 110, paddingBottom: 60,
                background: 'linear-gradient(180deg, rgba(255,107,0,0.05) 0%, transparent 100%)',
                borderBottom: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <Link href={`/${citySlug}/activities`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: 'var(--text-3)',
                        textDecoration: 'none', marginBottom: 28,
                        transition: 'color 0.2s',
                    }} className="hover:text-[var(--accent)]">
                        <ArrowLeft size={14} /> Back to discovery
                    </Link>

                    <h1 style={{
                        fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900,
                        letterSpacing: '-0.04em', color: 'var(--text)',
                        lineHeight: 1.1, marginBottom: 16,
                    }}>
                        Stranger Meetups in {city.name} <br/> 
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                             to Meet New People
                        </span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-2)',
                        lineHeight: 1.6, maxWidth: 640, fontWeight: 400
                    }}>
                        Don't stay in! Discover the best mixers, meetups, and social gatherings happening across {city.name} this weekend.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: 1200, margin: '-20px auto 0', padding: '0 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 32,
                }}>
                    {EVENT_DATA.map((event) => (
                        <div key={event.id} style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                        }} className="hover:border-[var(--accent-border)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] group">
                            {/* Poster Image */}
                            <div style={{ width: '100%', aspectRatio: '16/10', position: 'relative', overflow: 'hidden' }}>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 0.5s ease'
                                    }}
                                    className="group-hover:scale-110"
                                />
                                <div style={{
                                    position: 'absolute', top: 12, right: 12,
                                    padding: '6px 14px', borderRadius: 20,
                                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                                    color: 'white', fontSize: 11, fontWeight: 700,
                                    letterSpacing: '0.02em', border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    {event.price}
                                </div>
                            </div>

                            {/* Event Details */}
                            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{
                                    fontSize: 20, fontWeight: 800, color: 'var(--text)',
                                    lineHeight: 1.3, marginBottom: 16,
                                    letterSpacing: '-0.01em'
                                }}>
                                    {event.title}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 13 }}>
                                        <Calendar size={14} color="var(--accent)" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 13 }}>
                                        <MapPin size={14} color="var(--accent)" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <a
                                    href={event.bookingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        marginTop: 'auto',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        width: '100%', padding: '14px 20px',
                                        borderRadius: 12,
                                        background: 'var(--accent-dim)',
                                        border: '1px solid var(--accent-border)',
                                        color: 'var(--accent)', fontSize: 14, fontWeight: 700,
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                    }}
                                    className="hover:bg-[var(--accent)] hover:text-white"
                                >
                                    View Details <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
