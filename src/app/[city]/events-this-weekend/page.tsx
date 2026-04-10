'use client'
import { useParams } from 'next/navigation'
import { getCityBySlug } from '@/data/cities'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ExternalLink, ArrowLeft } from 'lucide-react'

const DUMMY_EVENTS = [
    {
        id: '1',
        title: 'Sunburn Arena ft. Alan Walker',
        time: 'Saturday, 12th Oct • 4:00 PM',
        location: 'YMCA Grounds, Nandanam',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://bookmyshow.com',
        price: 'From ₹1500'
    },
    {
        id: '2',
        title: 'The Great Indian Food Festival',
        time: 'Sun, 13th Oct • 11:00 AM',
        location: 'Island Grounds, Anna Salai',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://bookmyshow.com',
        price: 'From ₹200'
    },
    {
        id: '3',
        title: 'Laughter Night with Zakir Khan',
        time: 'Saturday, 12th Oct • 7:00 PM',
        location: 'Music Academy, Royapettah',
        image: 'https://images.unsplash.com/photo-1514525253361-b83f859b73c0?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://bookmyshow.com',
        price: 'From ₹999'
    },
    {
        id: '4',
        title: 'Sunrise Beach Yoga Workshop',
        time: 'Sun, 13th Oct • 6:00 AM',
        location: 'Besant Nagar Beach',
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://insider.in',
        price: 'Free'
    },
    {
        id: '5',
        title: 'Pottery & Sip Workshop',
        time: 'Saturday, 12th Oct • 3:00 PM',
        location: 'Life of Art Studios, Adyar',
        image: 'https://images.unsplash.com/photo-1565191999001-551c187427bb?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://insider.in',
        price: '₹1200'
    },
    {
        id: '6',
        title: 'Tech & Startup Mixer 2024',
        time: 'Friday, 11th Oct • 6:30 PM',
        location: 'IITM Research Park, Taramani',
        image: 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe1?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://insider.in',
        price: '₹500'
    },
    {
        id: '7',
        title: 'Midnight Cycling Tour',
        time: 'Sat Night, Oct 12 • 10:00 PM',
        location: 'Starting from Marina Lighthouse',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://insider.in',
        price: '₹800'
    },
    {
        id: '8',
        title: 'Indie Rock Concert: The F16s',
        time: 'Sunday, 13th Oct • 8:00 PM',
        location: 'Barracuda Brew, Nungambakkam',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://bookmyshow.com',
        price: '₹1000'
    },
    {
        id: '9',
        title: 'Weekend Farmers Market',
        time: 'Sun, 13th Oct • 8:00 AM',
        location: 'Hanu Reddy Residences, Poes Garden',
        image: 'https://images.unsplash.com/photo-1488459711615-de9b7b7a8d4b?auto=format&fit=crop&w=800&q=80',
        bookingLink: 'https://insider.in',
        price: 'Entry Free'
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
                        fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900,
                        letterSpacing: '-0.04e m', color: 'var(--text)',
                        lineHeight: 1.1, marginBottom: 16,
                    }}>
                        Events This{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                             Weekend
                        </span>
                        {' '}in {city.name}
                    </h1>
                    <p style={{
                        fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--text-3)',
                        lineHeight: 1.6, maxWidth: 600, fontWeight: 400
                    }}>
                        From massive concerts and food festivals to sunrise yoga and local pop-ups. 
                        Make the most of your weekend with our curated list.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ maxWidth: 1200, margin: '-30px auto 0', padding: '0 24px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 32,
                }}>
                    {DUMMY_EVENTS.map((event) => (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
                                        <Calendar size={14} color="var(--accent)" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
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
                                    Book Tickets <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Call to Action */}
            <div style={{ 
                marginTop: 80, textAlign: 'center', 
                padding: '60px 24px', 
                background: 'linear-gradient(to top, rgba(20,20,25,0.5), transparent)',
                borderTop: '1px solid var(--border)'
            }}>
                <h4 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                    Organizing an event?
                </h4>
                <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 24 }}>
                    Get your event featured on Outsyd and reach thousands of locals.
                </p>
                <Link href="#" style={{
                    color: 'var(--accent)', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    borderBottom: '1.5px solid var(--accent)', paddingBottom: 2
                }}>
                    List your event here
                </Link>
            </div>
        </main>
    )
}
