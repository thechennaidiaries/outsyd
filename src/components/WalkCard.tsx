'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, MapPin, Footprints } from 'lucide-react'
import type { Walk } from '@/data/walks'

interface Props {
    walk: Walk
    citySlug: string
}

export default function WalkCard({ walk, citySlug }: Props) {
    const [saved, setSaved] = useState(false)
    const [imgErr, setImgErr] = useState(false)

    // Use the walk's cover image
    const coverImage = walk.image

    return (
        <Link
            href={`/${citySlug}/walks/${walk.slug}`}
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
            {/* Image — 4:3 landscape */}
            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                {!imgErr && coverImage ? (
                    <img
                        src={coverImage}
                        alt={walk.title}
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
                        🚶
                    </div>
                )}

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.82) 100%)',
                }} />

                {/* Save button — top right */}
                <button
                    onClick={(e) => { e.preventDefault(); setSaved(s => !s) }}
                    style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 34, height: 34, borderRadius: '50%',
                        background: saved ? 'var(--accent)' : 'rgba(0,0,0,0.50)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${saved ? 'rgba(255,107,0,0.6)' : 'rgba(255,255,255,0.18)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: saved ? '0 0 14px rgba(255,107,0,0.45)' : 'none',
                    }}
                >
                    {saved
                        ? <BookmarkCheck size={14} color="white" />
                        : <Bookmark size={14} color="rgba(255,255,255,0.9)" />
                    }
                </button>

                {/* Places count pill — top left */}
                <div style={{
                    position: 'absolute', top: 12, left: 12,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 100,
                    background: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                }}>
                    <Footprints size={11} />
                    {walk.places.length} stops
                </div>

                {/* Title + Area overlay at bottom */}
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
                        {walk.title}
                    </p>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 500,
                    }}>
                        <MapPin size={10} style={{ flexShrink: 0 }} />
                        {walk.area}
                    </span>
                </div>
            </div>
        </Link>
    )
}
