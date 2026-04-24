'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Footprints } from 'lucide-react'
import type { Walk } from '@/data/walks'
import SaveItemButton from '@/components/SaveItemButton'
import { optimizeImageUrl } from '@/utils/image'

interface Props {
    walk: Walk
    citySlug: string
    eager?: boolean
}

export default function WalkCard({ walk, citySlug, eager = false }: Props) {
    const [imgErr, setImgErr] = useState(false)

    // Use the walk's cover image
    const coverImage = walk.image

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease',
                boxShadow: 'var(--shadow-card)',
            }}
            className="group hover:border-[var(--accent-border)] hover:-translate-y-[4px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
            <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                <SaveItemButton type="walk" slug={walk.slug} citySlug={citySlug} compact iconOnly />
            </div>

            <Link
                href={`/${citySlug}/walks/${walk.slug}`}
                style={{
                    display: 'flex', flexDirection: 'column',
                    textDecoration: 'none',
                    cursor: 'pointer',
                }}
            >
            {/* Image — 4:3 landscape */}
            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-elevated)', flexShrink: 0 }}>
                {!imgErr && coverImage ? (
                    <img
                        src={optimizeImageUrl(coverImage, 'w-800,q-60,f-auto')}
                        alt={walk.title}
                        loading={eager ? 'eager' : 'lazy'}
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
        </div>
    )
}
