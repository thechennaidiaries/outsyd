'use client'

/**
 * /[city]/events/[slug]/book
 *
 * 3-step booking flow:
 *   Step 1 — select:   Pick Your Tickets (tier card + inline quantity)
 *   Step 2 — details:  Your Details (name + WhatsApp OTP, or pre-filled if logged in)
 *   Step 3 — review:   Review & Pay (summary + coupon + book button)
 *   Paying  — Cashfree SDK checkout in progress
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatPaise } from '@/data/vendors'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Tier {
    id: string; title: string; price: number; capacity?: number; is_active: boolean
}

interface EventInfo {
    id: string; title: string; date: string; time?: string; venue?: string
    image?: string; service_fee_pct: number; fee_absorbed_by_vendor: boolean
    refund_policy?: string
}

type Step = 'select' | 'details' | 'review' | 'paying'

interface CouponResult {
    valid: boolean
    discountAmount: number
    code: string
    message?: string
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BookingPage({ params }: { params: { city: string; slug: string } }) {
    const { city, slug } = params
    const router = useRouter()

    // ── Event data ─────────────────────────────────────────────────────────────
    const [event, setEvent]         = useState<EventInfo | null>(null)
    const [tiers, setTiers]         = useState<Tier[]>([])
    const [loading, setLoading]     = useState(true)
    const [pageError, setPageError] = useState('')

    // ── Step 1: tier + quantity ────────────────────────────────────────────────
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
    const [quantity, setQuantity]         = useState(1)

    // ── Step 2: auth state ────────────────────────────────────────────────────
    const [isLoggedIn, setIsLoggedIn]     = useState(false)
    const [name, setName]                 = useState('')
    const [phone, setPhone]               = useState('')    // 10 digits only, no +91
    const [otpSent, setOtpSent]           = useState(false)
    const [otp, setOtp]                   = useState('')
    const [otpLoading, setOtpLoading]     = useState(false)
    const [otpError, setOtpError]         = useState('')
    const [detailsError, setDetailsError] = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)
    const otpInputRef = useRef<HTMLInputElement>(null)

    // ── Step 3: review ────────────────────────────────────────────────────────
    const [couponCode, setCouponCode]     = useState('')
    const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [payError, setPayError]         = useState('')
    const [alreadyBooked, setAlreadyBooked] = useState(false)

    // ── Global step ────────────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>('select')

    // ── Fetch event + tiers ────────────────────────────────────────────────────
    useEffect(() => {
        fetch(`/api/events/by-slug?city=${city}&slug=${slug}`)
            .then(r => r.json())
            .then(d => {
                if (d.event) { setEvent(d.event); setTiers(d.tiers ?? []) }
                else setPageError('Event not found or booking not available.')
                setLoading(false)
            })
            .catch(() => { setPageError('Failed to load event.'); setLoading(false) })
    }, [city, slug])

    // ── Check session on mount ─────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => {
                if (d.user) {
                    setIsLoggedIn(true)
                    if (d.user.name) setName(d.user.name)
                    if (d.user.phone_number) {
                        // Strip +91 prefix — phone state stores 10 digits only
                        const digits = d.user.phone_number.replace(/^\+91/, '').replace(/\D/g, '').slice(-10)
                        setPhone(digits)
                    }
                }
            })
            .catch(() => {})
    }, [])

    // ── Resend cooldown ticker ─────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [resendCooldown])

    // ── Fee preview ────────────────────────────────────────────────────────────
    function calcPreview() {
        if (!selectedTier || !event) return null
        const base     = selectedTier.price * quantity
        const fee      = Math.ceil(base * (event.service_fee_pct / 100))
        const discount = couponResult?.valid ? couponResult.discountAmount : 0
        const subtotal = event.fee_absorbed_by_vendor ? base : base + fee
        const paid     = Math.max(0, subtotal - discount)
        return { base, fee, discount, paid }
    }
    const preview = calcPreview()

    function fmtDate(iso: string) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 1 → Step 2
    // ────────────────────────────────────────────────────────────────────────────
    function handleContinueSelect() {
        if (!selectedTier) return
        setStep('details')
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2: Send OTP
    // ────────────────────────────────────────────────────────────────────────────
    async function handleSendOtp() {
        if (!name.trim()) {
            setDetailsError('Please enter your name before verifying.')
            return
        }
        setDetailsError('')
        setOtpError('')
        setOtpLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ phone: `+91${phone}`, context: 'booking' }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
            setOtpSent(true)
            setResendCooldown(30)
            setTimeout(() => otpInputRef.current?.focus(), 100)
        } catch (err: any) {
            setOtpError(err.message)
        } finally {
            setOtpLoading(false)
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2: Verify OTP
    // ────────────────────────────────────────────────────────────────────────────
    async function handleVerifyOtp() {
        setOtpError('')
        setOtpLoading(true)
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ phone: `+91${phone}`, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Verification failed')
            if (data.name && !name) setName(data.name)
            setStep('review')
        } catch (err: any) {
            setOtpError(err.message)
        } finally {
            setOtpLoading(false)
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2 → Step 3 (logged-in users skip OTP)
    // ────────────────────────────────────────────────────────────────────────────
    function handleContinueDetails() {
        if (!name.trim()) {
            setDetailsError('Please enter your name.')
            return
        }
        setDetailsError('')
        setStep('review')
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 3: Apply coupon
    // ────────────────────────────────────────────────────────────────────────────
    async function handleApplyCoupon() {
        if (!couponCode || !event || !selectedTier) return
        setCouponLoading(true)
        setCouponResult(null)
        try {
            const res = await fetch(`/api/events/${event.id}/validate-coupon`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ couponCode, tierId: selectedTier.id, quantity }),
            })
            const data = await res.json()
            if (!res.ok) {
                setCouponResult({ valid: false, discountAmount: 0, code: couponCode, message: data.error })
            } else {
                setCouponResult({ valid: true, discountAmount: data.discountAmount, code: couponCode })
            }
        } catch {
            setCouponResult({ valid: false, discountAmount: 0, code: couponCode, message: 'Could not validate coupon.' })
        } finally {
            setCouponLoading(false)
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 3 → Payment
    // ────────────────────────────────────────────────────────────────────────────
    async function handlePay() {
        if (!event || !selectedTier || !name) return
        setPayError('')
        setStep('paying')
        try {
            const res = await fetch(`/api/events/${event.id}/create-order`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tierId:        selectedTier.id,
                    quantity,
                    customerName:  name,
                    customerPhone: `+91${phone}`,
                    couponCode:    couponResult?.valid ? couponResult.code : undefined,
                }),
            })
            const data = await res.json()

            if (res.status === 409) {
                setStep('review')
                setAlreadyBooked(true)
                return
            }

            if (!res.ok) throw new Error(data.error || 'Failed to create order')

            const { load } = await import('@cashfreepayments/cashfree-js')
            const cashfree  = await load({
                mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production',
            })
            cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' })
        } catch (err: any) {
            setPayError(err.message)
            setStep('review')
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────────────────
    if (loading) return <Page><p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading…</p></Page>
    if (!event)  return <Page><p style={{ color: '#f87171', textAlign: 'center', padding: 60 }}>{pageError}</p></Page>

    if (step === 'paying') return (
        <Page>
            <div style={s.payingState}>
                <div style={s.spinner} />
                <p style={s.payingText}>Opening payment…</p>
            </div>
        </Page>
    )

    const activeTiers  = tiers.filter(t => t.is_active)
    const stepIndex    = step === 'select' ? 0 : step === 'details' ? 1 : 2
    const stepLabels   = ['Pick Your Tickets', 'Your Details', 'Review & Pay']

    return (
        <Page>
            {/* ── Back button ── */}
            <button
                onClick={() => {
                    if (step === 'select')  router.back()
                    if (step === 'details') setStep('select')
                    if (step === 'review')  setStep('details')
                }}
                style={s.backBtn}
            >
                ← {step === 'select' ? 'Back to event' : 'Back'}
            </button>

            {/* ── Step progress dots ── */}
            <div style={s.dotsRow}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        style={{
                            ...s.dot,
                            backgroundColor: i === stepIndex ? '#fff'
                                : i < stepIndex  ? '#555'
                                : '#2a2a2a',
                            transform: i === stepIndex ? 'scale(1.35)' : 'scale(1)',
                        }}
                    />
                ))}
            </div>
            <p style={s.stepLabel}>{stepLabels[stepIndex]}</p>

            <div style={s.layout}>

                {/* ══════════════════════════════════════════════════════
                    Left column — form
                ══════════════════════════════════════════════════════ */}
                <div style={s.formCol}>

                    {/* ── STEP 1: Pick Your Tickets ── */}
                    {step === 'select' && (
                        <div style={s.section}>
                            <div style={s.tierList}>
                                {activeTiers.map(tier => {
                                    const selected = selectedTier?.id === tier.id
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => {
                                                setSelectedTier(tier)
                                                if (!selected) setQuantity(1)
                                            }}
                                            style={{
                                                ...s.tierBtn,
                                                borderColor:     selected ? '#ffffff25' : '#2a2a2a',
                                                backgroundColor: selected ? '#1c1c1c'  : '#141414',
                                                boxShadow:       selected ? '0 0 0 1px #ffffff12' : 'none',
                                            }}
                                        >
                                            {/* Tier info */}
                                            <div style={s.tierInfo}>
                                                <p style={s.tierTitle}>{tier.title}</p>
                                                {tier.capacity && (
                                                    <p style={s.tierCap}>{tier.capacity} seats available</p>
                                                )}
                                            </div>

                                            {/* Price + quantity (quantity only when selected) */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                                                <p style={s.tierPrice}>{formatPaise(tier.price)}</p>
                                                {selected && (
                                                    <div
                                                        style={s.qtyRow}
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <button
                                                            style={s.qtyBtn}
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setQuantity(q => Math.max(1, q - 1))
                                                            }}
                                                        >−</button>
                                                        <span style={s.qtyNum}>{quantity}</span>
                                                        <button
                                                            style={s.qtyBtn}
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setQuantity(q => Math.min(10, q + 1))
                                                            }}
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    )
                                })}
                                {activeTiers.length === 0 && (
                                    <p style={{ color: '#666', fontSize: 14, margin: 0 }}>No tickets available.</p>
                                )}
                            </div>

                            <button
                                onClick={handleContinueSelect}
                                disabled={!selectedTier}
                                style={{ ...s.primaryBtn, opacity: !selectedTier ? 0.35 : 1 }}
                            >
                                Continue →
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Your Details ── */}
                    {step === 'details' && (
                        <div style={s.section}>

                            {/* Name */}
                            <div style={s.field}>
                                <label style={s.label}>Your name *</label>
                                <input
                                    style={s.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Arjun Kumar"
                                    autoFocus={!name}
                                />
                            </div>

                            {/* WhatsApp number */}
                            <div style={{ ...s.field, marginTop: 18 }}>
                                <label style={s.label}>WhatsApp number</label>
                                <div style={s.phoneRow}>
                                    <span style={s.phonePrefix}>+91</span>
                                    <input
                                        style={{
                                            ...s.input,
                                            flex: 1,
                                            borderLeft: 'none',
                                            borderRadius: '0 8px 8px 0',
                                            ...(isLoggedIn ? { color: '#555', cursor: 'not-allowed' } : {}),
                                        }}
                                        value={phone}
                                        onChange={e => !isLoggedIn && setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="98765 43210"
                                        type="tel"
                                        maxLength={10}
                                        readOnly={isLoggedIn}
                                    />
                                    {isLoggedIn && (
                                        <span style={s.verifiedBadge}>✓ Verified</span>
                                    )}
                                </div>
                                {!isLoggedIn && (
                                    <p style={s.phoneHint}>
                                        Your booking confirmation will be sent here
                                    </p>
                                )}
                            </div>

                            {/* Verify button — non-logged-in, 10 digits typed, OTP not yet sent */}
                            {!isLoggedIn && !otpSent && phone.length === 10 && (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={otpLoading}
                                    style={{ ...s.primaryBtn, marginTop: 18 }}
                                >
                                    {otpLoading ? 'Sending…' : 'Verify via WhatsApp →'}
                                </button>
                            )}

                            {/* OTP input — slides in after OTP is sent */}
                            {!isLoggedIn && otpSent && (
                                <div style={s.otpSection}>
                                    <p style={s.otpSentNote}>
                                        Code sent to +91 {phone} ·{' '}
                                        <button
                                            style={s.ghostBtn}
                                            onClick={() => { setOtpSent(false); setOtp(''); setOtpError('') }}
                                            disabled={resendCooldown > 0}
                                        >
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Change number'}
                                        </button>
                                    </p>
                                    <input
                                        ref={otpInputRef}
                                        style={s.otpInput}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="— — — — — —"
                                        type="tel"
                                        maxLength={6}
                                        autoFocus
                                    />
                                    {otpError && <p style={s.otpError}>{otpError}</p>}
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otp.length < 6 || otpLoading}
                                        style={{ ...s.primaryBtn, opacity: otp.length < 6 ? 0.35 : 1 }}
                                    >
                                        {otpLoading ? 'Verifying…' : 'Verify & Continue'}
                                    </button>
                                </div>
                            )}

                            {/* Continue button — logged-in users */}
                            {isLoggedIn && (
                                <button
                                    onClick={handleContinueDetails}
                                    disabled={!name.trim()}
                                    style={{ ...s.primaryBtn, opacity: !name.trim() ? 0.35 : 1, marginTop: 20 }}
                                >
                                    Continue →
                                </button>
                            )}

                            {detailsError && <div style={s.errorBox}>{detailsError}</div>}
                        </div>
                    )}

                    {/* ── STEP 3: Review & Pay ── */}
                    {step === 'review' && selectedTier && (
                        <div style={s.section}>

                            {/* Booking details summary */}
                            <div style={s.reviewBox}>
                                <ReviewRow label="Ticket"    value={selectedTier.title} />
                                <ReviewRow label="Quantity"  value={`${quantity} ticket${quantity > 1 ? 's' : ''}`} />
                                <ReviewRow label="Name"      value={name} />
                                <ReviewRow label="WhatsApp"  value={`+91 ${phone}`} last />
                            </div>

                            {/* Price breakdown */}
                            {preview && (
                                <div style={s.breakdownBox}>
                                    <Row label={`${selectedTier.title} × ${quantity}`} value={formatPaise(preview.base)} />
                                    {preview.fee > 0 && !event.fee_absorbed_by_vendor && (
                                        <Row label={`Service fee (${event.service_fee_pct}%)`} value={formatPaise(preview.fee)} />
                                    )}
                                    {preview.discount > 0 && (
                                        <Row label="Coupon discount" value={`−${formatPaise(preview.discount)}`} />
                                    )}
                                    <div style={s.breakdownDivider} />
                                    <Row label="Total" value={formatPaise(preview.paid)} bold />
                                </div>
                            )}

                            {/* Coupon */}
                            <div style={{ ...s.field, marginTop: 18 }}>
                                <label style={s.label}>Coupon code (optional)</label>
                                <div style={s.couponRow}>
                                    <input
                                        style={{ ...s.input, flex: 1 }}
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                                        placeholder="EARLYBIRD20"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || couponLoading}
                                        style={s.couponBtn}
                                    >
                                        {couponLoading ? '…' : 'Apply'}
                                    </button>
                                </div>
                                {couponResult && (
                                    <p style={{ fontSize: 12, margin: '4px 0 0', color: couponResult.valid ? '#4ade80' : '#f87171' }}>
                                        {couponResult.valid
                                            ? `✓ Coupon applied — ${formatPaise(couponResult.discountAmount)} off`
                                            : `✗ ${couponResult.message}`}
                                    </p>
                                )}
                            </div>

                            {payError && <div style={s.errorBox}>{payError}</div>}

                            {alreadyBooked ? (
                                <div style={s.alreadyBookedBox}>
                                    <p style={{ fontSize: 15, margin: '0 0 4px', fontWeight: 700, color: '#fff' }}>🎟 You're already booked!</p>
                                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px', lineHeight: 1.5 }}>
                                        You have a confirmed ticket for this tier. No need to book again.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/account/bookings'}
                                        style={s.primaryBtn}
                                    >
                                        View My Bookings →
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handlePay} style={s.primaryBtn}>
                                    {preview ? `Book Tickets · ${formatPaise(preview.paid)}` : 'Book Tickets'}
                                </button>
                            )}

                            {event.refund_policy && (
                                <p style={s.refundNote}>📋 {event.refund_policy}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════════════════════
                    Right column — event summary (sticky)
                ══════════════════════════════════════════════════════ */}
                <div style={s.summaryCol}>
                    {event.image && (
                        <img src={event.image} alt={event.title} style={s.eventImage} />
                    )}
                    <div style={s.summaryCard}>
                        <h3 style={s.summaryTitle}>{event.title}</h3>
                        <p style={s.summaryMeta}>{fmtDate(event.date)}{event.time && ` · ${event.time}`}</p>
                        {event.venue && <p style={s.summaryMeta}>{event.venue}</p>}

                        {selectedTier && preview && step !== 'select' && (
                            <div style={s.summaryBreakdown}>
                                <Row label={`${selectedTier.title} × ${quantity}`} value={formatPaise(preview.base)} />
                                {preview.fee > 0 && !event.fee_absorbed_by_vendor && (
                                    <Row label="Service fee" value={formatPaise(preview.fee)} />
                                )}
                                {preview.discount > 0 && (
                                    <Row label="Discount" value={`−${formatPaise(preview.discount)}`} />
                                )}
                                <div style={s.breakdownDivider} />
                                <Row label="Total" value={formatPaise(preview.paid)} bold />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: bold ? '#e5e5e5' : '#888', fontWeight: bold ? 600 : 400 }}>{label}</span>
            <span style={{ fontSize: 13, color: bold ? '#fff' : '#aaa',   fontWeight: bold ? 700 : 400 }}>{value}</span>
        </div>
    )
}

function ReviewRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0',
            borderBottom: last ? 'none' : '1px solid #1f1f1f',
        }}>
            <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
            <span style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
        </div>
    )
}

function Page({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px 20px' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>{children}</div>
        </div>
    )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    backBtn:    { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 28 },

    // Step progress
    dotsRow:    { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 },
    dot:        { width: 8, height: 8, borderRadius: '50%', transition: 'background-color 0.25s, transform 0.25s' },
    stepLabel:  { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 24px', letterSpacing: '-0.5px' },

    // Layout
    layout:     { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' },
    formCol:    { display: 'flex', flexDirection: 'column', gap: 16 },
    section:    { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 14, padding: 24 },

    // Tier list
    tierList:   { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
    tierBtn:    {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', border: '1px solid', borderRadius: 10,
        cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
        width: '100%', textAlign: 'left',
    },
    tierInfo:   {},
    tierTitle:  { fontSize: 14, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    tierCap:    { fontSize: 12, color: '#555', margin: 0 },
    tierPrice:  { fontSize: 15, fontWeight: 700, color: '#fff', margin: 0, flexShrink: 0 },

    // Quantity
    qtyRow:     { display: 'flex', alignItems: 'center', gap: 10 },
    qtyBtn:     {
        width: 30, height: 30, borderRadius: 6,
        backgroundColor: '#2a2a2a', border: '1px solid #333',
        color: '#e5e5e5', fontSize: 16, cursor: 'pointer', lineHeight: '1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    qtyNum:     { fontSize: 15, fontWeight: 600, color: '#fff', minWidth: 18, textAlign: 'center' },

    // Form fields
    field:      { display: 'flex', flexDirection: 'column', gap: 6 },
    label:      { fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input:      { padding: '11px 13px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },

    // Phone row
    phoneRow:       { display: 'flex', alignItems: 'stretch', position: 'relative' },
    phonePrefix:    { padding: '11px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#666', fontSize: 14, display: 'flex', alignItems: 'center', flexShrink: 0 },
    verifiedBadge:  { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#4ade80', fontWeight: 600, pointerEvents: 'none' },
    phoneHint:      { fontSize: 12, color: '#555', margin: '4px 0 0' },

    // OTP section
    otpSection:     { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 },
    otpSentNote:    { fontSize: 13, color: '#666', margin: 0 },
    otpInput:       { padding: '13px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 22, letterSpacing: 12, textAlign: 'center', outline: 'none', width: '100%', boxSizing: 'border-box' },
    otpError:       { fontSize: 13, color: '#f87171', margin: 0 },
    ghostBtn:       { background: 'none', border: 'none', color: '#4ade80', fontSize: 13, cursor: 'pointer', padding: 0, textDecoration: 'underline' },

    // Review box
    reviewBox:      { backgroundColor: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: 10, padding: '4px 16px', marginBottom: 4 },

    // Price breakdown
    breakdownBox:   { marginTop: 16, paddingTop: 14, borderTop: '1px solid #1f1f1f' },
    breakdownDivider: { borderTop: '1px solid #2a2a2a', margin: '8px 0' },

    // Coupon
    couponRow:      { display: 'flex', gap: 8 },
    couponBtn:      { padding: '11px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },

    // Primary button
    primaryBtn:     {
        width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 18,
        transition: 'opacity 0.15s',
    },

    errorBox:           { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '12px 14px', marginTop: 14 },
    alreadyBookedBox:   { backgroundColor: '#0f2318', border: '1px solid #1a4a2e', borderRadius: 10, padding: '18px 16px', marginTop: 18 },
    refundNote:         { fontSize: 12, color: '#555', marginTop: 14, lineHeight: 1.6 },

    // Right column
    summaryCol:         { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 },
    eventImage:         { width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12, display: 'block' },
    summaryCard:        { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 12, padding: 20 },
    summaryTitle:       { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.2px' },
    summaryMeta:        { fontSize: 13, color: '#666', margin: '0 0 4px' },
    summaryBreakdown:   { marginTop: 16, paddingTop: 14, borderTop: '1px solid #1f1f1f' },

    // Paying state
    payingState:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
    spinner:        { width: 40, height: 40, border: '3px solid #2a2a2a', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    payingText:     { fontSize: 15, color: '#666' },
}
