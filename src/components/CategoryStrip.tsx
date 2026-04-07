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
        // Add "walks" as a special tag if it's meant to be in the strip
        tags.push('walks')
    }

    // Clean tag name: capitalize first letters and remove "activities"
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

    // Split tags into two rows
    const midpoint = Math.ceil(tags.length / 2)
    const row1Tags = tags.slice(0, midpoint)
    const row2Tags = tags.slice(midpoint)

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

    /* Row styles:
       - Mobile: horizontal scroll, no wrap
       - Desktop (md+): normal flex, no overflow via Tailwind overrides */
    const rowStyle: React.CSSProperties = {
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        alignItems: 'center',
    }

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Row 1 */}
                <div className="no-scrollbar md:flex-wrap md:overflow-x-visible" style={rowStyle}>
                    {row1Tags.map(renderPill)}
                </div>

                {/* Row 2 */}
                <div className="no-scrollbar md:flex-wrap md:overflow-x-visible" style={rowStyle}>
                    {row2Tags.map(renderPill)}
                </div>
            </div>
        </div>
    )
}
