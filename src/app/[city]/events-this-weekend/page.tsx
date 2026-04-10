'use client'
import { useParams } from 'next/navigation'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft } from 'lucide-react'

const EVENT_DATA = [
    {
        id: '1',
        title: 'Singles Mixer by Twisty Tails',
        time: 'Saturday, 12th April',
        location: 'Twisty Tails',
        image: '/events/singles-mixer-twisty-tails.png',
        bookingLink: 'https://www.instagram.com/p/DWog7AND6y_/',
        price: 'Event'
    },
    {
        id: '2',
        title: 'Strangers Meetup by Rafiky',
        time: 'Saturday, 12th April',
        location: 'Rafiky Cafe',
        image: '/events/strangers-meetup-rafiky.png',
        bookingLink: 'https://www.instagram.com/p/DW3thdnzt1H/',
        price: 'Event'
    },
    {
        id: '3',
        title: 'Run & Dodge by Ahora Run Club',
        time: 'Saturday, 12th April',
        location: 'To be revealed soon',
        image: '/events/run-and-dodge-ahora.png',
        bookingLink: 'https://www.instagram.com/p/DW1oJrKkvb9/',
        price: 'Sports'
    },
    {
        id: '4',
        title: 'Strangers Meetup by Ulaa Tribe',
        time: 'Saturday, 12th April, 4PM',
        location: 'Teynampet',
        image: '/events/strangers-meetup-ulaa-tribe.png',
        bookingLink: 'https://www.instagram.com/reels/DWy81y_RoBj/',
        price: 'Meetup'
    },
    {
        id: '5',
        title: 'Singles Meetup by Social Sailor',
        time: 'Friday, 11th April, 4:30 PM',
        location: 'Madras Food Walk',
        image: '/events/social-sailor-singles-meetup.png',
        bookingLink: 'https://www.district.in/events/singles-meetup-chennai-apr4-2026-buy-tickets',
        price: 'Food Walk'
    },
    {
        id: '6',
        title: 'Solo Travellers Meetup',
        time: 'Saturday, 12th April, 5:00 PM',
        location: 'Madras Food Walk',
        image: '/events/solo-travellers-meetup.png',
        bookingLink: 'https://in.bookmyshow.com/events/solo-travellers/ET00461911',
        price: 'Travel'
    },
    {
        id: '7',
        title: 'Lunch with Strangers',
        time: 'Friday, 11th April, 4:30 PM',
        location: 'Madras Food Walk',
        image: '/events/lunch-with-strangers.png',
        bookingLink: 'https://www.district.in/events/lunch-with-strangers-chennai-apr4-2026-buy-tickets',
        price: 'Dining'
    },
    {
        id: '8',
        title: 'Mafia Night',
        time: 'Friday, 11th April, 7:00 PM',
        location: 'Ratio Alwarpet',
        image: '/events/mafia-night-alwarpet.png',
        bookingLink: 'https://www.instagram.com/p/DWYvnrIEQTj/',
        price: 'Games'
    },
    {
        id: '9',
        title: 'Sing with Strangers',
        time: 'Saturday, 12th April',
        location: 'Phoenix Mall',
        image: '/events/sing-with-strangers-phoenix.png',
        bookingLink: 'https://www.instagram.com/p/DW6XBK_CdJY/',
        price: 'Karaoke'
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
