'use client'
import { useState, useEffect } from 'react'
import { ACTIVITIES, ALL_TAGS, getActivitiesByCity, getTagsByCity } from '@/data/activities'
import { getEventsByCity } from '@/data/events'
import { getWalksByCity } from '@/data/walks'
import { X, Search, Check, MapPin, Footprints, Calendar } from 'lucide-react'

// Unified item for picker
interface PickerItem {
    id: string
    type: 'activity' | 'walk' | 'event'
    title: string
    image: string
    area: string
    tags: string[]
}

interface Props {
    addedIds: string[]
    onAdd: (id: string) => void
    onClose: () => void
    cityId?: string
}

export default function ActivityPickerModal({ addedIds, onAdd, onClose, cityId }: Props) {
    const activities = cityId ? getActivitiesByCity(cityId) : ACTIVITIES
    const walks = cityId ? getWalksByCity(cityId) : []
    const events = cityId ? getEventsByCity(cityId) : []
    const tags = cityId ? getTagsByCity(cityId) : ALL_TAGS
    const allTags = [...tags, 'Crawl', 'Event']  // add Crawl and Event as filter options

    // Build unified pool
    const pool: PickerItem[] = [
        ...activities.map(a => ({
            id: a.id ?? '',
            type: 'activity' as const,
            title: a.title,
            image: a.image ?? '',
            area: a.area ?? '',
            tags: a.tags ?? [],
        })),
        ...walks.map(w => ({
            id: `walk-${w.id}`,
            type: 'walk' as const,
            title: w.title,
            image: w.image,
            area: w.area,
            tags: ['Crawl'],
        })),
        ...events.map(e => ({
            id: `event-${e.id}`,
            type: 'event' as const,
            title: e.title,
            image: e.image ?? '',
            area: e.address ?? e.venue ?? '',
            tags: [...(e.categories ?? []), 'Event'],
        })),
    ]

    const [search, setSearch] = useState('')
    const [activeTag, setActiveTag] = useState<string | null>(null)

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    const isFull = addedIds.length >= 10

    const filtered = pool.filter(item => {
        const q = search.toLowerCase()
        const matchesSearch = !q ||
            item.title.toLowerCase().includes(q) ||
            item.area.toLowerCase().includes(q)
        const matchesTag = !activeTag || item.tags.includes(activeTag)
        return matchesSearch && matchesTag
    })

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: 'rgba(0,0,0,0.72)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                }}
            />

            {/* Sheet panel — bottom on all screens, centred with max-width */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
                display: 'flex', justifyContent: 'center',
                pointerEvents: 'none',
            }}>
                <div style={{
                    width: '100%', maxWidth: 720,
                    maxHeight: '88vh',
                    background: 'var(--bg-card)',
                    borderRadius: '24px 24px 0 0',
                    border: '1px solid var(--border)',
                    borderBottom: 'none',
                    display: 'flex', flexDirection: 'column',
                    pointerEvents: 'auto',
                    boxShadow: '0 -24px 80px rgba(0,0,0,0.7)',
                    animation: 'slideUpSheet 0.28s cubic-bezier(0.32,0.72,0,1) both',
                }}>

                    {/* Drag handle */}
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}>
                        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
                    </div>

                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                        padding: '14px 20px 0', flexShrink: 0,
                    }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.035em', lineHeight: 1.2 }}>
                                Add to Plan
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>
                                {addedIds.length} / 10 added to plan
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-2)', flexShrink: 0, marginTop: 2,
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Search bar */}
                    <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-3)', pointerEvents: 'none', flexShrink: 0,
                            }} />
                            <input
                                type="text"
                                placeholder="Search by name, area, location…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%', padding: '12px 14px 12px 40px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    color: 'var(--text)', fontSize: 14,
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                            />
                        </div>
                    </div>

                    {/* Category filters */}
                    <div style={{
                        display: 'flex', gap: 8, padding: '12px 20px 0',
                        overflowX: 'auto', flexShrink: 0,
                    }} className="no-scrollbar">
                        {[null, ...allTags].map(tag => {
                            const isActive = activeTag === tag
                            return (
                                <button
                                    key={tag ?? '__all'}
                                    onClick={() => setActiveTag(tag)}
                                    style={{
                                        padding: '7px 16px', borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0,
                                        background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                                        border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                                        color: isActive ? 'white' : 'var(--text-2)',
                                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.18s ease',
                                    }}
                                >
                                    {tag ?? 'All'}
                                </button>
                            )
                        })}
                    </div>

                    {/* Result count */}
                    <div style={{ padding: '10px 20px 2px', flexShrink: 0 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>
                            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                        </p>
                    </div>

                    {/* Scrollable activity grid */}
                    <div style={{ overflowY: 'auto', padding: '10px 20px 40px', flex: 1 }}>
                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: 14 }}>
                                No items match your search
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
                                gap: 12,
                            }}>
                                {filtered.map(item => {
                                    const isAdded = addedIds.includes(item.id)
                                    const disabled = isAdded || isFull

                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex', flexDirection: 'column',
                                                background: 'var(--bg-elevated)',
                                                borderRadius: 14,
                                                border: `1.5px solid ${isAdded ? 'rgba(255,107,0,0.45)' : 'var(--border)'}`,
                                                overflow: 'hidden',
                                                transition: 'border-color 0.2s, opacity 0.2s',
                                                opacity: isFull && !isAdded ? 0.45 : 1,
                                            }}
                                        >
                                            {/* Image */}
                                            <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', flexShrink: 0 }}>
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                                                />
                                                {/* Crawl badge */}
                                                {item.type === 'walk' && (
                                                    <div style={{
                                                        position: 'absolute', top: 6, left: 6,
                                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                                        padding: '3px 8px', borderRadius: 100,
                                                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                                                        border: '1px solid rgba(255,255,255,0.12)',
                                                        fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                                                    }}>
                                                        <Footprints size={8} /> Crawl
                                                    </div>
                                                )}
                                                {item.type === 'event' && (
                                                    <div style={{
                                                        position: 'absolute', top: 6, left: 6,
                                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                                        padding: '3px 8px', borderRadius: 100,
                                                        background: 'rgba(255,107,0,0.88)',
                                                        border: '1px solid rgba(255,255,255,0.16)',
                                                        fontSize: 9, fontWeight: 700, color: '#fff',
                                                    }}>
                                                        <Calendar size={8} /> Event
                                                    </div>
                                                )}
                                                {/* Already added overlay */}
                                                {isAdded && (
                                                    <div style={{
                                                        position: 'absolute', inset: 0,
                                                        background: 'rgba(255,107,0,0.25)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <div style={{
                                                            width: 34, height: 34, borderRadius: '50%',
                                                            background: 'var(--accent)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            boxShadow: '0 0 16px rgba(255,107,0,0.6)',
                                                        }}>
                                                            <Check size={17} color="white" strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info + button */}
                                            <div style={{ padding: '10px 10px 11px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div>
                                                    <p style={{
                                                        fontSize: 13, fontWeight: 700,
                                                        color: isAdded ? 'var(--text-2)' : 'var(--text)',
                                                        lineHeight: 1.3, marginBottom: 4,
                                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                    }}>
                                                        {item.title}
                                                    </p>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 3,
                                                        fontSize: 11, color: 'var(--text-3)', fontWeight: 500,
                                                    }}>
                                                        <MapPin size={9} style={{ flexShrink: 0 }} />
                                                        {item.area}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => !disabled && onAdd(item.id)}
                                                    disabled={disabled}
                                                    style={{
                                                        marginTop: 'auto',
                                                        padding: '9px 8px',
                                                        borderRadius: 9,
                                                        background: isAdded
                                                            ? 'rgba(255,107,0,0.12)'
                                                            : isFull
                                                                ? 'var(--bg-card)'
                                                                : 'var(--accent)',
                                                        border: isAdded
                                                            ? '1px solid rgba(255,107,0,0.3)'
                                                            : isFull
                                                                ? '1px solid var(--border)'
                                                                : 'none',
                                                        color: isAdded ? 'var(--accent)' : isFull ? 'var(--text-3)' : 'white',
                                                        fontSize: 12, fontWeight: 700,
                                                        cursor: disabled ? 'default' : 'pointer',
                                                        width: '100%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                        transition: 'all 0.18s ease',
                                                    }}
                                                >
                                                    {isAdded
                                                        ? <><Check size={11} strokeWidth={2.5} /> Added</>
                                                        : isFull
                                                            ? 'Plan Full'
                                                            : '+ Add to Plan'
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-up animation keyframe */}
            <style>{`
                @keyframes slideUpSheet {
                    from { transform: translateY(100%); opacity: 0.6; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </>
    )
}
