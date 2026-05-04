'use client'
import { Grid3x3 } from 'lucide-react'

interface Props {
    activeArea: string | null
    onAreaChange: (area: string | null) => void
    cityId: string
    areas?: string[]
}

export default function WalkAreaStrip({ activeArea, onAreaChange, cityId, areas = [] }: Props) {

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 28px' }}>
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, alignItems: 'center' }}>

                {/* "All" pill */}
                <button
                    onClick={() => onAreaChange(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '10px 18px', borderRadius: 100, flexShrink: 0,
                        background: activeArea === null
                            ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                            : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${activeArea === null ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: activeArea === null ? '0 4px 20px rgba(255,107,0,0.3)' : 'none',
                    }}
                >
                    <Grid3x3 size={13} color={activeArea === null ? 'white' : 'var(--text-2)'} />
                    <span style={{
                        fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                        color: activeArea === null ? 'white' : 'var(--text-2)',
                    }}>All Areas</span>
                </button>

                {/* Area pills */}
                {areas.map(area => {
                    const isActive = activeArea === area
                    return (
                        <button
                            key={area}
                            onClick={() => onAreaChange(isActive ? null : area)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '10px 18px', borderRadius: 100, flexShrink: 0,
                                background: isActive ? 'rgba(255,107,0,0.12)' : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${isActive ? 'rgba(255,107,0,0.35)' : 'rgba(255,255,255,0.07)'}`,
                                cursor: 'pointer', transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-white/6 hover:border-white/14"
                        >
                            <span style={{ fontSize: 15, lineHeight: 1 }}>📍</span>
                            <span style={{
                                fontSize: 13, fontWeight: isActive ? 600 : 500,
                                color: isActive ? 'var(--accent)' : 'var(--text-2)',
                                whiteSpace: 'nowrap',
                            }}>{area}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
