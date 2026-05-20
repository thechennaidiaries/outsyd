'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

const USAGE_OPTIONS = [
    'Finding activities in Chennai',
    'Finding stranger meetups in Chennai',
    'Planning with friends',
]

const FEATURE_OPTIONS = [
    'Activity & Event booking',
    'Get Discounts on Activities & Events',
    'Find more Stranger Meetups',
]

interface Props {
    open: boolean
    onClose: () => void
}

export default function VoteFeedbackModal({ open, onClose }: Props) {
    const [usage, setUsage] = useState('')
    const [feature, setFeature] = useState('')
    const [suggestion, setSuggestion] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    if (!open) return null

    async function handleSubmit() {
        setError('')
        if (!usage) { setError('Please select how you use Outsyd'); return }
        if (!feature) { setError('Please select a feature to build next'); return }

        setSubmitting(true)
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usage,
                    next_feature: feature,
                    suggestion,
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
        // Reset state when closing
        setUsage('')
        setFeature('')
        setSuggestion('')
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
                animation: 'fadeIn 0.2s ease-out',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: 480,
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    background: '#161618',
                    borderRadius: '20px 20px 0 0',
                    padding: '24px 20px 40px',
                    position: 'relative',
                    animation: 'slideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
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
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                        <h2 style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#fff',
                            marginBottom: 8,
                        }}>
                            Thanks for voting!
                        </h2>
                        <p style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.5,
                        }}>
                            Your feedback helps us make Outsyd better for everyone.
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
                            How will You Make Outsyd Better?
                        </h2>
                        <p style={{
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.45)',
                            marginBottom: 24,
                        }}>
                            Takes less than 30 seconds ⚡
                        </p>

                        {/* ── Q1 ── */}
                        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
                            <legend style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#fff',
                                marginBottom: 12,
                                display: 'block',
                            }}>
                                How are you using Outsyd? <span style={{ color: '#ff4444' }}>*</span>
                            </legend>
                            {USAGE_OPTIONS.map((opt) => (
                                <label
                                    key={opt}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 14px',
                                        marginBottom: 8,
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        border: usage === opt
                                            ? '1.5px solid var(--accent, #FF6B00)'
                                            : '1.5px solid rgba(255,255,255,0.1)',
                                        background: usage === opt
                                            ? 'rgba(255,107,0,0.08)'
                                            : 'rgba(255,255,255,0.04)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        border: usage === opt
                                            ? '5px solid var(--accent, #FF6B00)'
                                            : '2px solid rgba(255,255,255,0.3)',
                                        background: usage === opt ? '#fff' : 'transparent',
                                        flexShrink: 0,
                                        transition: 'all 0.15s ease',
                                    }} />
                                    <input
                                        type="radio"
                                        name="usage"
                                        value={opt}
                                        checked={usage === opt}
                                        onChange={() => setUsage(opt)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        fontSize: 14,
                                        color: usage === opt ? '#fff' : 'rgba(255,255,255,0.7)',
                                        fontWeight: usage === opt ? 600 : 400,
                                    }}>
                                        {opt}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* ── Q2 ── */}
                        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
                            <legend style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#fff',
                                marginBottom: 12,
                                display: 'block',
                            }}>
                                What feature should we build next on Outsyd? <span style={{ color: '#ff4444' }}>*</span>
                            </legend>
                            {FEATURE_OPTIONS.map((opt) => (
                                <label
                                    key={opt}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '12px 14px',
                                        marginBottom: 8,
                                        borderRadius: 12,
                                        cursor: 'pointer',
                                        border: feature === opt
                                            ? '1.5px solid var(--accent, #FF6B00)'
                                            : '1.5px solid rgba(255,255,255,0.1)',
                                        background: feature === opt
                                            ? 'rgba(255,107,0,0.08)'
                                            : 'rgba(255,255,255,0.04)',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    <span style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        border: feature === opt
                                            ? '5px solid var(--accent, #FF6B00)'
                                            : '2px solid rgba(255,255,255,0.3)',
                                        background: feature === opt ? '#fff' : 'transparent',
                                        flexShrink: 0,
                                        transition: 'all 0.15s ease',
                                    }} />
                                    <input
                                        type="radio"
                                        name="feature"
                                        value={opt}
                                        checked={feature === opt}
                                        onChange={() => setFeature(opt)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        fontSize: 14,
                                        color: feature === opt ? '#fff' : 'rgba(255,255,255,0.7)',
                                        fontWeight: feature === opt ? 600 : 400,
                                    }}>
                                        {opt}
                                    </span>
                                </label>
                            ))}
                        </fieldset>

                        {/* ── Q3 ── */}
                        <fieldset style={{ border: 'none', padding: 0, margin: '0 0 24px' }}>
                            <legend style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#fff',
                                marginBottom: 12,
                                display: 'block',
                            }}>
                                Share your suggestion to improve Outsyd
                            </legend>
                            <textarea
                                value={suggestion}
                                onChange={(e) => setSuggestion(e.target.value)}
                                placeholder="What would make Outsyd awesome for you?"
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
                            {submitting ? 'Submitting…' : 'Submit Vote 🗳️'}
                        </button>
                    </>
                )}
            </div>

            {/* ── Keyframe animations ── */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0 }
                    to   { opacity: 1 }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%) }
                    to   { transform: translateY(0) }
                }
            `}</style>
        </div>
    )
}
