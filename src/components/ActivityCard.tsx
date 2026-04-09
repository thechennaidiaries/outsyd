'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Activity } from '@/data/activities'

interface Props {
    activity: Activity
    citySlug: string
}

export default function ActivityCard({ activity, citySlug }: Props) {
    const [imgErr, setImgErr] = useState(false)

    return (
        <Link
            href={`/${citySlug}/activities/${activity.slug ?? ''}`}
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
            {/* Image — 3:4 portrait */}
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                {!imgErr ? (
                    <img
                        src={activity.image ?? ''}
                        alt={activity.title}
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
                        📍
                    </div>
                )}

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)',
                }} />

                {/* Title + Location overlay at bottom */}
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
                        {activity.title}
                    </p>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
                    }}>
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {activity.location ?? activity.area ?? ''}
                    </span>
                </div>
            </div>
        </Link>
    )
}
