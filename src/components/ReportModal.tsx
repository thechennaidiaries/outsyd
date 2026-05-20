'use client'
import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface Props {
    open: boolean
    onClose: () => void
    itemTitle: string
    itemType: 'activity' | 'event'
}

export default function ReportModal({ open, onClose, itemTitle, itemType }: Props) {
    const [reason, setReason] = useState<'closed' | 'wrong' | ''>('')
    const [details, setDetails] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    if (!open) return null

    async function handleSubmit() {
        setError('')
        if (!reason) { setError('Please select a reason'); return }

        setSubmitting(true)
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_title: itemTitle,
                    item_type: itemType,
                    reason,
                    details: reason === 'wrong' ? details.trim() : '',
                }),
            })
            if (!res.ok) throw new Error('Failed')
            setSubmitted(true)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    function handleClose() {
        setReason('')
        setDetails('')
        setSubmitted(false)
        setError('')
        onClose()
    }

    return (
        <div
            onClick={handleClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                animation: 'reportFadeIn 0.2s ease-out',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    background: '#161618',
                    borderRadius: '20px 20px 0 0',
                    padding: '24px 20px 40px',
                    position: 'relative',
                    animation: 'reportSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: 'rgba(255,255,255,0.08)',
                        border: 'none',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                    }}
                >
                    <X size={18} />
                </button>

                {submitted ? (
                    /* ── Success state ── */
                    <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#fff',
                            marginBottom: 8,
                        }}>
                            Thanks for reporting!
                        </h2>
                        <p style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.5,
                        }}>
                            We&apos;ll review and update this {itemType} soon.
                        </p>
                        <button
                            onClick={handleClose}
                            style={{
                                marginTop: 24,
                                padding: '12px 32px',
                                borderRadius: 12,
                                border: 'none',
                                background: 'var(--accent, #FF6B00)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 15,
                                cursor: 'pointer',
                            }}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    /* ── Form ── */
                    <>
                        {/* Heading */}
                        <h2 style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#fff',
                            marginBottom: 4,
                            paddingRight: 32,
                            lineHeight: 1.35,
                        }}>
                            Report about this {itemType}
                        </h2>
                        <p style={{
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.45)',
                            marginBottom: 6,
                        }}>
                            {itemTitle}
                        </p>
                        <p style={{
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.35)',
                            marginBottom: 24,
                        }}>
                            Help us keep Outsyd accurate 🎯
                        </p>

                        {/* ── Reason options ── */}
                        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
                            {/* Option: This is closed */}
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '14px 14px',
                                    marginBottom: 8,
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    border: reason === 'closed'
                                        ? '1.5px solid var(--accent, #FF6B00)'
                                        : '1.5px solid rgba(255,255,255,0.1)',
                                    background: reason === 'closed'
                                        ? 'rgba(255,107,0,0.08)'
                                        : 'rgba(255,255,255,0.04)',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    border: reason === 'closed'
                                        ? '5px solid var(--accent, #FF6B00)'
                                        : '2px solid rgba(255,255,255,0.3)',
                                    background: reason === 'closed' ? '#fff' : 'transparent',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease',
                                }} />
                                <input
                                    type="radio"
                                    name="reason"
                                    value="closed"
                                    checked={reason === 'closed'}
                                    onChange={() => { setReason('closed'); setDetails('') }}
                                    style={{ display: 'none' }}
                                />
                                <span style={{
                                    fontSize: 14,
                                    color: reason === 'closed' ? '#fff' : 'rgba(255,255,255,0.7)',
                                    fontWeight: reason === 'closed' ? 600 : 400,
                                }}>
                                    This is closed
                                </span>
                            </label>

                            {/* Option: Details are wrong */}
                            <label
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '14px 14px',
                                    marginBottom: 8,
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    border: reason === 'wrong'
                                        ? '1.5px solid var(--accent, #FF6B00)'
                                        : '1.5px solid rgba(255,255,255,0.1)',
                                    background: reason === 'wrong'
                                        ? 'rgba(255,107,0,0.08)'
                                        : 'rgba(255,255,255,0.04)',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <span style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    border: reason === 'wrong'
                                        ? '5px solid var(--accent, #FF6B00)'
                                        : '2px solid rgba(255,255,255,0.3)',
                                    background: reason === 'wrong' ? '#fff' : 'transparent',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease',
                                }} />
                                <input
                                    type="radio"
                                    name="reason"
                                    value="wrong"
                                    checked={reason === 'wrong'}
                                    onChange={() => setReason('wrong')}
                                    style={{ display: 'none' }}
                                />
                                <span style={{
                                    fontSize: 14,
                                    color: reason === 'wrong' ? '#fff' : 'rgba(255,255,255,0.7)',
                                    fontWeight: reason === 'wrong' ? 600 : 400,
                                }}>
                                    Details are wrong
                                </span>
                            </label>
                        </fieldset>

                        {/* ── Details textarea (only when "Details are wrong" is selected) ── */}
                        {reason === 'wrong' && (
                            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 20px' }}>
                                <legend style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: '#fff',
                                    marginBottom: 12,
                                    display: 'block',
                                }}>
                                    Share what details are wrong and how are they changed?
                                </legend>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="e.g. Timings have changed, address is different, pricing is outdated..."
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '12px 14px',
                                        borderRadius: 12,
                                        border: '1.5px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.04)',
                                        color: '#fff',
                                        fontSize: 14,
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'border-color 0.15s ease',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,107,0,0.5)'
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                                    }}
                                />
                            </fieldset>
                        )}

                        {/* Error */}
                        {error && (
                            <p style={{
                                fontSize: 13,
                                color: '#ff4444',
                                marginBottom: 16,
                                fontWeight: 500,
                            }}>
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px 0',
                                borderRadius: 14,
                                border: 'none',
                                background: submitting
                                    ? 'rgba(255,107,0,0.4)'
                                    : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: 15,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                letterSpacing: '-0.01em',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {submitting ? 'Submitting…' : 'Submit Report'}
                        </button>
                    </>
                )}
            </div>

            {/* ── Keyframe animations ── */}
            <style>{`
                @keyframes reportFadeIn {
                    from { opacity: 0 }
                    to   { opacity: 1 }
                }
                @keyframes reportSlideUp {
                    from { transform: translateY(100%) }
                    to   { transform: translateY(0) }
                }
            `}</style>
        </div>
    )
}
