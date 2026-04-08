'use client'
import { ALL_TAGS, getTagsByCity, TAG_META } from '@/data/activities'
import { Grid3x3 } from 'lucide-react'

interface Props {
    activeTag: string | null
    onTagChange: (tag: string | null) => void
    cityId?: string
    featuredOnly?: boolean
}

const FEATURED_TAGS = [
    'low budget fun activities',
    'sports activities',
    'gaming activities',
    'adventure activities',
    'art activities',
    'water activities',
    'night activities',
    'kids activities',
    'unique cultural experiences',
    'leisure activities',
    'group activities'
]

export default function CategoryStrip({ activeTag, onTagChange, cityId, featuredOnly }: Props) {
    let tags = cityId ? getTagsByCity(cityId) : ALL_TAGS

    if (featuredOnly) {
        tags = tags.filter(t => FEATURED_TAGS.includes(t))
        tags.push('walks')
    }

    const getDisplayName = (t: string) => {
        if (t === 'walks') return 'City Crawls'
        let name = t.replace(/\s*activities\s*/gi, '').trim()
        if (name === 'unique cultural experiences') return 'Cultural'
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const getEmoji = (t: string) => {
        if (t === 'walks') return '🚶'
        const meta = TAG_META.find(m => m.name === t)
        return meta?.emoji ?? '🏷️'
    }

    const renderPill = (tag: string) => {
        const isActive = activeTag === tag
        return (
            <button
                key={tag}
                onClick={() => onTagChange(isActive ? null : tag)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 100, flexShrink: 0,
                    background: isActive ? '#FF6B00' : 'transparent',
                    border: isActive ? '1.5px solid transparent' : '1.5px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                className={`group ${isActive ? '' : 'hover:bg-[#FF6B00] hover:border-transparent'}`}
            >
                <span style={{ 
                    fontSize: 16, lineHeight: 1, transition: 'transform 0.2s ease',
                    filter: isActive ? 'brightness(2)' : 'none' 
                }} className="group-hover:scale-110 group-hover:brightness-125">
                    {getEmoji(tag)}
                </span>
                <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                }}>{getDisplayName(tag)}</span>
            </button>
        )
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            {/* Desktop: single horizontal-scroll row */}
            <div
                className="no-scrollbar hidden md:flex"
                style={{
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 4,
                    alignItems: 'center',
                }}
            >
                {tags.map(renderPill)}
            </div>

            {/* Mobile: 2-row grid that scrolls horizontally together */}
            <div
                className="no-scrollbar md:hidden"
                style={{
                    overflowX: 'auto',
                    paddingBottom: 4,
                }}
            >
                <div style={{
                    display: 'grid',
                    gridTemplateRows: 'auto auto',
                    gridAutoFlow: 'column',
                    gridAutoColumns: 'max-content',
                    gap: 8,
                }}>
                    {tags.map(renderPill)}
                </div>
            </div>
        </div>
    )
}
