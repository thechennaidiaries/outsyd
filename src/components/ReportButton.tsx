'use client'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import ReportModal from './ReportModal'

interface Props {
    itemTitle: string
    itemType: 'activity' | 'event'
}

export default function ReportButton({ itemTitle, itemType }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '16px 24px',
                    marginBottom: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                }}
                onClick={() => setOpen(true)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(255,170,0,0.1)',
                        border: '1px solid rgba(255,170,0,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ffaa00',
                    }}>
                        <AlertTriangle size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: 13, fontWeight: 700,
                            color: 'var(--text)',
                        }}>
                            Report about this {itemType}
                        </div>
                        <div style={{
                            fontSize: 12,
                            color: 'var(--text-3)',
                            marginTop: 2,
                        }}>
                            Is this closed or are details wrong? Let us know
                        </div>
                    </div>
                    <span style={{ color: 'var(--text-3)', fontSize: 18 }}>›</span>
                </div>
            </div>

            <ReportModal
                open={open}
                onClose={() => setOpen(false)}
                itemTitle={itemTitle}
                itemType={itemType}
            />
        </>
    )
}
