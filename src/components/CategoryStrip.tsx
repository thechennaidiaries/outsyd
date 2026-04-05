'use client'
import { ALL_TAGS, getTagsByCity, TAG_META } from '@/data/activities'
import { Grid3x3 } from 'lucide-react'

interface Props {
    activeTag: string | null
    onTagChange: (tag: string | null) => void
    cityId?: string
}

export default function CategoryStrip({ activeTag, onTagChange, cityId }: Props) {
    const tags = cityId ? getTagsByCity(cityId) : ALL_TAGS

    // Clean tag name: capitalize first letters and remove "activities"
    const getDisplayName = (t: string) => {
        let name = t.replace(/\s*activities\s*/gi, '').trim()
        if (name === 'unique cultural experiences') return 'Cultural'
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const getEmoji = (t: string) => {
        const meta = TAG_META.find(m => m.name === t)
        return meta?.emoji ?? '🏷️'
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>

                {/* "All" pill */}
                <button
                    onClick={() => onTagChange(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '10px 20px', borderRadius: 100, flexShrink: 0,
                        background: activeTag === null
                            ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                            : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${activeTag === null ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: activeTag === null ? '0 4px 20px rgba(255,107,0,0.3)' : 'none',
                    }}
                >
                    <Grid3x3 size={13} color={activeTag === null ? 'white' : 'var(--text-2)'} />
                    <span style={{
                        fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                        color: activeTag === null ? 'white' : 'var(--text-2)',
                    }}>All</span>
                </button>

                {/* Tag pills */}
                {tags.map(tag => {
                    const isActive = activeTag === tag
                    return (
                        <button
                            key={tag}
                            onClick={() => onTagChange(isActive ? null : tag)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 20px', borderRadius: 100, flexShrink: 0,
                                background: isActive ? 'rgba(255,107,0,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${isActive ? 'rgba(255,107,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
                                cursor: 'pointer', transition: 'all 0.2s ease',
                            }}
                            className="group hover:bg-white/6 hover:border-white/14"
                        >
                            <span style={{ fontSize: 16, lineHeight: 1, transition: 'transform 0.2s ease' }} className="group-hover:scale-110">
                                {getEmoji(tag)}
                            </span>
                            <span style={{
                                fontSize: 13, fontWeight: isActive ? 700 : 600,
                                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                                whiteSpace: 'nowrap',
                            }}>{getDisplayName(tag)}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
