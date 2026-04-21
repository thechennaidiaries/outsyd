'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import type { Event } from '@/data/events'

interface Props {
    event: Event
    citySlug: string
}

export default function EventCard({ event, citySlug }: Props) {
    const [imgErr, setImgErr] = useState(false)

    // Format the date for display (e.g. "Jun 14, Sat")
    const dateObj = new Date(event.date + 'T00:00:00')
    const formattedDate = dateObj.toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', weekday: 'short',
    })

    return (
        <Link
            href={`/${citySlug}/events/${event.slug}`}
            style={{
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
                boxShadow: 'var(--shadow-card)',
            }}
            className="group hover:border-[var(--accent-border)] hover:-translate-y-[4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
            {/* Image — 3:4 portrait (same as ActivityCard) */}
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                {!imgErr ? (
                    <img
                        src={event.image ?? ''}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                        className="group-hover:scale-[1.05]"
                        onError={() => setImgErr(true)}
                    />
                ) : (
                    <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 48, background: 'var(--bg-elevated)',
                    }}>
                        🎪
                    </div>
                )}

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)',
                }} />

                {/* Pricing badge */}
                <div style={{
                    position: 'absolute', top: 10, right: 10,
                    padding: '4px 10px', borderRadius: 100,
                    background: event.pricingType === 'free' ? 'rgba(34,197,94,0.9)' : 'rgba(255,107,0,0.9)',
                    color: '#fff', fontSize: 10, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                    {event.pricingType === 'free' ? 'Free' : event.pricing ?? 'Paid'}
                </div>

                {/* Title + Date overlay at bottom */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '14px 14px 16px',
                }}>
                    <p style={{
                        fontSize: 14, fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.3, letterSpacing: '-0.01em',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        marginBottom: 5,
                    }}>
                        {event.title}
                    </p>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
                    }}>
                        <Calendar size={10} style={{ flexShrink: 0 }} />
                        {formattedDate}{event.time ? ` · ${event.time}` : ''}
                    </span>
                </div>
            </div>
        </Link>
    )
}
