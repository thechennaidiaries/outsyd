'use client'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import ActivityCard from './ActivityCard'
import type { Activity } from '@/data/activities'

interface Props {
    title: string
    emoji?: string
    badge?: string
    badgeColor?: 'orange' | 'purple' | 'indigo' | 'green'
    subtitle?: string
    activities: Activity[]
    size?: 'sm' | 'md' | 'lg'
    viewAllHref?: string
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
    orange: {
        background: 'rgba(255,107,0,0.1)',
        border: '1px solid rgba(255,107,0,0.3)',
        color: '#FF9A3C',
    },
    purple: {
        background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.3)',
        color: '#c4b5fd',
    },
    indigo: {
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.3)',
        color: '#a5b4fc',
    },
    green: {
        background: 'rgba(52,211,153,0.1)',
        border: '1px solid rgba(52,211,153,0.3)',
        color: '#6ee7b7',
    },
}

export default function Section({ title, emoji, badge, badgeColor = 'orange', subtitle, activities, size = 'md', viewAllHref }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    const scroll = (dir: 'left' | 'right') => {
        ref.current?.scrollBy({ left: dir === 'right' ? 700 : -700, behavior: 'smooth' })
    }

    if (!activities.length) return null

    return (
        <section style={{ padding: '36px 0' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div>
                        {badge && (
                            <span style={{
                                display: 'inline-block', marginBottom: 8,
                                padding: '3px 11px', borderRadius: 100,
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                ...BADGE_STYLES[badgeColor],
                            }}>
                                {badge}
                            </span>
                        )}
                        <h2 style={{
                            fontSize: 20, fontWeight: 800, letterSpacing: '-0.025em',
                            color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 9,
                            lineHeight: 1.2,
                        }}>
                            {emoji && <span style={{ fontSize: 20 }}>{emoji}</span>}
                            {title}
                        </h2>
                        {subtitle && (
                            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4, fontWeight: 400 }}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* Arrow buttons — desktop only */}
                        <div style={{ display: 'flex', gap: 6 }} className="hidden md:flex">
                            {(['left', 'right'] as const).map(dir => (
                                <button key={dir} onClick={() => scroll(dir)} style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'all 0.2s ease',
                                }}
                                    className="hover:border-[var(--accent-border)] hover:text-white hover:bg-[var(--accent-dim)]"
                                >
                                    {dir === 'left' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                </button>
                            ))}
                        </div>

                        {viewAllHref && (
                            <Link href={viewAllHref} style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--accent)',
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3,
                                padding: '7px 14px', borderRadius: 8,
                                background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                                transition: 'all 0.2s ease',
                            }}
                                className="hover:bg-[var(--accent-dim-hover)]"
                            >
                                See all <ChevronRight size={14} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Scroll row */}
                <div
                    ref={ref}
                    className="no-scrollbar"
                    style={{
                        display: 'flex', gap: 14, overflowX: 'auto',
                        paddingBottom: 8, paddingTop: 4,
                    }}
                >
                    {activities.map(a => (
                        <ActivityCard key={a.id} activity={a} size={size} />
                    ))}
                </div>
            </div>
        </section>
    )
}
