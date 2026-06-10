'use client'

/**
 * /[city]/events/[slug]/book
 *
 * 3-step booking flow:
 *   Step 1 — select:   Pick Your Tickets (tier card + inline quantity) — full width, no sidebar
 *   Step 2 — details:  Your Details — phone first → OTP → name reveals — full width, no sidebar
 *   Step 3 — review:   Order Summary inline (event, ticket, offers, payment details)
 *   Paying  — Cashfree SDK checkout in progress
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

    // ── Step 1: cart (tierId → qty) ───────────────────────────────────────────
    const [cart, setCart] = useState<Record<string, number>>({}) // tierId → qty

    // ── Step 2: auth state ────────────────────────────────────────────────────
    const [isLoggedIn, setIsLoggedIn]       = useState(false)
    const [name, setName]                   = useState('')
    const [phone, setPhone]                 = useState('')    // 10 digits only, no +91
    const [otpSent, setOtpSent]             = useState(false)
    const [phoneVerified, setPhoneVerified] = useState(false)
    const [otp, setOtp]                     = useState('')
    const [otpLoading, setOtpLoading]       = useState(false)
    const [otpError, setOtpError]           = useState('')
    const [detailsError, setDetailsError]   = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)
    const otpInputRef = useRef<HTMLInputElement>(null)

    // ── Step 3: review ────────────────────────────────────────────────────────
    const [couponCode, setCouponCode]       = useState('')
    const [couponResult, setCouponResult]   = useState<CouponResult | null>(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [payError, setPayError]           = useState('')
    const [alreadyBooked, setAlreadyBooked] = useState(false)
    const [existingBookingRef, setExistingBookingRef] = useState<string | null>(null)
    const [checkingBooking, setCheckingBooking]       = useState(false)

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
                        const digits = d.user.phone_number.replace(/^\+91/, '').replace(/\D/g, '').slice(-10)
                        setPhone(digits)
                        setPhoneVerified(true)
                    }
                }
            })
            .catch(() => {})
    }, [])

    // ── Check if user has already booked for this event ────────────────────────
    useEffect(() => {
        if (!event?.id || !phoneVerified) return

        setCheckingBooking(true)
        fetch(`/api/events/${event.id}/check-booking`)
            .then(r => r.json())
            .then(d => {
                if (d.booked) {
                    setAlreadyBooked(true)
                    if (d.bookingRef) setExistingBookingRef(d.bookingRef)
                }
                setCheckingBooking(false)
            })
            .catch(() => setCheckingBooking(false))
    }, [event?.id, phoneVerified])

    // ── Resend cooldown ticker ─────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return
        const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [resendCooldown])

    // ── Fee preview (sums across all cart items) ──────────────────────────────
    function calcPreview() {
        if (!event || Object.keys(cart).length === 0) return null
        const cartItems = Object.entries(cart).filter(([, q]) => q > 0)
        if (cartItems.length === 0) return null
        const base     = cartItems.reduce((sum, [tierId, qty]) => {
            const tier = tiers.find(t => t.id === tierId)
            return sum + (tier?.price ?? 0) * qty
        }, 0)
        const fee      = Math.ceil(base * (event.service_fee_pct / 100))
        const discount = 0 // coupon hidden for now
        const subtotal = event.fee_absorbed_by_vendor ? base : base + fee
        const paid     = Math.max(0, subtotal - discount)
        return { base, fee, discount, subtotal, paid }
    }
    const preview = calcPreview()

    function fmtDate(iso: string) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
        })
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 1 → Step 2
    // ────────────────────────────────────────────────────────────────────────────
    function handleContinueSelect() {
        const hasItems = Object.values(cart).some(q => q > 0)
        if (!hasItems) return
        setStep('details')
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2: Send OTP
    // ────────────────────────────────────────────────────────────────────────────
    async function handleSendOtp() {
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
    // Step 2: Verify OTP → reveals name field
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
            setPhoneVerified(true)
        } catch (err: any) {
            setOtpError(err.message)
        } finally {
            setOtpLoading(false)
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2 → Step 3
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
    // Step 3: Apply coupon (hidden for now — will be re-enabled with multi-tier logic)
    // ────────────────────────────────────────────────────────────────────────────
    async function handleApplyCoupon() {
        // Coupon field is hidden; this is a no-op until re-enabled
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 3 → Payment
    // ────────────────────────────────────────────────────────────────────────────
    async function handlePay() {
        if (!event || !name || !preview) return
        const lineItems = Object.entries(cart)
            .filter(([, qty]) => qty > 0)
            .map(([tierId, quantity]) => ({ tierId, quantity }))
        if (lineItems.length === 0) return
        setPayError('')
        setStep('paying')
        try {
            const res = await fetch(`/api/events/${event.id}/create-order`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineItems,
                    customerName:  name,
                    customerPhone: `+91${phone}`,
                }),
            })
            const data = await res.json()

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
    if (loading || checkingBooking) return <Page><p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading…</p></Page>
    if (!event)  return <Page><p style={{ color: '#f87171', textAlign: 'center', padding: 60 }}>{pageError}</p></Page>

    if (step === 'paying') return (
        <Page>
            <div style={s.payingState}>
                <div style={s.spinner} />
                <p style={s.payingText}>Opening payment…</p>
            </div>
        </Page>
    )

    const activeTiers         = tiers.filter(t => t.is_active)
    const stepIndex           = step === 'select' ? 0 : step === 'details' ? 1 : 2
    const tabLabels           = ['Tickets', 'Details', 'Payment']
    const canProceedDetails   = (isLoggedIn || phoneVerified) && name.trim().length > 0
    const cartHasItems        = Object.values(cart).some(q => q > 0)
    // Cart line items with tier details resolved (for review step)
    const cartLineItems       = Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([tierId, qty]) => ({ tier: tiers.find(t => t.id === tierId)!, qty }))
        .filter(item => item.tier)

    // Date + time + venue string for the event header
    const eventMeta = [fmtDate(event.date), event.time, event.venue].filter(Boolean).join(' · ')

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

            {/* ── Event header (steps 1 & 2 only) ── */}
            {step !== 'review' && (
                <div style={s.eventHeader}>
                    <h1 style={s.eventTitle}>{event.title}</h1>
                    <p style={s.eventMeta}>{eventMeta}</p>
                </div>
            )}

            {/* ── Tab progress bar ── */}
            <div style={s.tabBar}>
                {tabLabels.map((label, i) => (
                    <div key={i} style={s.tabItem}>
                        <span style={{
                            ...s.tabLabel,
                            color:      i === stepIndex ? '#fff' : i < stepIndex ? '#888' : '#444',
                            fontWeight: i === stepIndex ? 700 : 400,
                        }}>
                            {label}
                        </span>
                        <div style={{
                            ...s.tabUnderline,
                            backgroundColor: i === stepIndex ? '#FF8648'
                                : i < stepIndex ? '#444'
                                : '#222',
                        }} />
                    </div>
                ))}
            </div>

            {/* ── Single-column form area ── */}
            <div style={s.formArea}>
                {alreadyBooked ? (
                    <div style={s.alreadyBookedBox}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#4ade80', fontSize: 16, fontWeight: 700 }}>
                            🎉 You've Already Booked!
                        </h3>
                        <p style={{ margin: '0 0 16px 0', color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}>
                            You already have a confirmed booking for this event. You cannot book tickets for the same event multiple times.
                        </p>
                        <Link
                            href="/account/bookings"
                            style={{
                                display: 'inline-block',
                                padding: '12px 20px',
                                backgroundColor: '#FF8648',
                                color: '#fff',
                                borderRadius: 10,
                                fontSize: 14,
                                fontWeight: 700,
                                textDecoration: 'none',
                                textAlign: 'center',
                            }}
                        >
                            View My Bookings →
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* ══ STEP 1: Pick Your Tickets ══ */}
                        {step === 'select' && (
                    <div>
                        <p style={s.sectionHeading}>CHOOSE TICKETS</p>
                        <div style={s.tierList}>
                            {activeTiers.map(tier => {
                                const qty = cart[tier.id] ?? 0
                                return (
                                    <div key={tier.id} style={{ ...s.tierCard, borderColor: qty > 0 ? '#FF864844' : '#222', backgroundColor: '#141414' }}>
                                        {/* Row 1: tier name */}
                                        <p style={s.tierTitle}>{tier.title}</p>
                                        {tier.capacity && (
                                            <p style={s.tierCap}>{tier.capacity} seats available</p>
                                        )}
                                        {/* Row 2: price (left) + ADD/qty (right) */}
                                        <div style={s.tierCardBottom}>
                                            <p style={s.tierPrice}>{formatPaise(tier.price)}</p>
                                            {qty > 0 ? (
                                                <div style={s.qtyRow} onClick={e => e.stopPropagation()}>
                                                    <button
                                                        style={s.qtyBtn}
                                                        onClick={() => {
                                                            if (qty === 1) {
                                                                setCart(c => { const n = { ...c }; delete n[tier.id]; return n })
                                                            } else {
                                                                setCart(c => ({ ...c, [tier.id]: qty - 1 }))
                                                            }
                                                        }}
                                                    >−</button>
                                                    <span style={s.qtyNum}>{qty}</span>
                                                    <button
                                                        style={s.qtyBtn}
                                                        onClick={() => setCart(c => ({ ...c, [tier.id]: Math.min(10, qty + 1) }))}
                                                    >+</button>
                                                </div>
                                            ) : (
                                                <button
                                                    style={s.addBtn}
                                                    onClick={() => setCart(c => ({ ...c, [tier.id]: 1 }))}
                                                >
                                                    ADD
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {activeTiers.length === 0 && (
                                <p style={{ color: '#666', fontSize: 14, margin: 0 }}>No tickets available.</p>
                            )}
                        </div>

                        <button
                            onClick={handleContinueSelect}
                            disabled={!cartHasItems}
                            style={{ ...s.primaryBtn, opacity: !cartHasItems ? 0.35 : 1 }}
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* ══ STEP 2: Your Details ══ */}
                {step === 'details' && (
                    <div style={s.section}>

                        {/* Phone number */}
                        <div style={s.field}>
                            <label style={s.label}>Phone number *</label>
                            <div style={s.phoneRow}>
                                <span style={s.phonePrefix}>+91</span>
                                <input
                                    style={{
                                        ...s.input,
                                        flex: 1,
                                        borderLeft: 'none',
                                        borderRadius: '0 8px 8px 0',
                                        ...((isLoggedIn || phoneVerified) ? { color: '#aaa', cursor: 'not-allowed' } : {}),
                                    }}
                                    value={phone}
                                    onChange={e => {
                                        if (isLoggedIn || phoneVerified) return
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                        setPhone(val)
                                        if (otpSent) { setOtpSent(false); setOtp(''); setOtpError('') }
                                    }}
                                    placeholder="98765 43210"
                                    type="tel"
                                    maxLength={10}
                                    readOnly={isLoggedIn || phoneVerified}
                                    autoFocus
                                />
                                {(isLoggedIn || phoneVerified) && (
                                    <span style={s.verifiedBadge}>✓ Verified</span>
                                )}
                            </div>

                            {!isLoggedIn && otpSent && !phoneVerified && (
                                <button
                                    style={{ ...s.ghostBtn, alignSelf: 'flex-end', marginTop: 4 }}
                                    onClick={() => { setOtpSent(false); setOtp(''); setOtpError('') }}
                                >
                                    Change number
                                </button>
                            )}

                            {!isLoggedIn && !phoneVerified && !otpSent && (
                                <p style={s.phoneHint}>Your booking confirmation will be sent here</p>
                            )}
                        </div>

                        {/* Send OTP button */}
                        {!isLoggedIn && !phoneVerified && !otpSent && phone.length === 10 && (
                            <button
                                onClick={handleSendOtp}
                                disabled={otpLoading}
                                style={{ ...s.primaryBtn, marginTop: 18 }}
                            >
                                {otpLoading ? 'Sending…' : 'Verify via WhatsApp →'}
                            </button>
                        )}

                        {/* OTP input */}
                        {!isLoggedIn && !phoneVerified && otpSent && (
                            <div style={s.otpSection}>
                                <p style={s.otpSentNote}>Code sent to +91 {phone}</p>
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
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otp.length < 6 || otpLoading}
                                        style={{ ...s.primaryBtn, marginTop: 0, flex: 1, opacity: otp.length < 6 ? 0.35 : 1 }}
                                    >
                                        {otpLoading ? 'Verifying…' : 'Verify'}
                                    </button>
                                    <button
                                        style={s.ghostBtn}
                                        onClick={handleSendOtp}
                                        disabled={resendCooldown > 0 || otpLoading}
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Name field — reveals after phone verified */}
                        {(isLoggedIn || phoneVerified) && (
                            <>
                                <div style={{ ...s.field, marginTop: 24 }}>
                                    <p style={s.detailsIntro}>
                                        You're almost in. We just need a few details to confirm your spot.
                                    </p>
                                    <label style={s.label}>Full Name *</label>
                                    <input
                                        style={s.input}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Arjun Kumar"
                                        autoFocus={!name}
                                    />
                                </div>

                                {detailsError && <div style={s.errorBox}>{detailsError}</div>}

                                <button
                                    onClick={handleContinueDetails}
                                    disabled={!canProceedDetails}
                                    style={{ ...s.primaryBtn, opacity: !canProceedDetails ? 0.35 : 1, marginTop: 20 }}
                                >
                                    Next →
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* ══ STEP 3: Order Summary (Payment) ══ */}
                {step === 'review' && cartLineItems.length > 0 && preview && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* — Tickets section — */}
                        <div style={s.orderBlock}>
                            <p style={s.sectionHeading}>TICKETS</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {cartLineItems.map(({ tier, qty }) => (
                                    <div key={tier.id} style={s.orderTicketCard}>
                                        <div style={{ marginBottom: 6 }}>
                                            <p style={s.orderEventName}>{event.title}</p>
                                            <p style={s.orderTierName}>{tier.title}</p>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                                            <span style={s.orderQtyLabel}>{qty} ticket{qty > 1 ? 's' : ''}</span>
                                            <span style={s.orderTicketPrice}>{formatPaise(tier.price * qty)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* — Customer details — */}
                        <div style={s.orderBlock}>
                            <p style={s.sectionHeading}>YOUR DETAILS</p>
                            <div style={s.orderDetailsCard}>
                                <ReviewRow label="Name"      value={name} />
                                <ReviewRow label="WhatsApp"  value={`+91 ${phone}`} last />
                            </div>
                        </div>

                        {/* — Payment details — */}
                        <div style={s.orderBlock}>
                            <p style={s.sectionHeading}>PAYMENT DETAILS</p>
                            <div style={s.paymentDetailsCard}>
                                <PayRow label="Order amount" value={formatPaise(preview.base)} />
                                {preview.fee > 0 && !event.fee_absorbed_by_vendor && (
                                    <PayRow label={`Fees & charges (${event.service_fee_pct}%)`} value={formatPaise(preview.fee)} />
                                )}
                                <div style={{ borderTop: '1px solid #222', margin: '12px 0' }} />
                                <PayRow label="Total" value={formatPaise(preview.paid)} bold />
                            </div>
                        </div>

                        {payError && <div style={s.errorBox}>{payError}</div>}

                        <button onClick={handlePay} style={{ ...s.primaryBtn, marginTop: 0 }}>
                            {`Book Tickets · ${formatPaise(preview.paid)}`}
                        </button>

                        {event.refund_policy && (
                            <p style={s.refundNote}>📋 {event.refund_policy}</p>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>
        </Page>
    )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function PayRow({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: bold ? '#e5e5e5' : '#888', fontWeight: bold ? 700 : 400 }}>{label}</span>
            <span style={{ fontSize: 14, color: green ? '#4ade80' : bold ? '#fff' : '#aaa', fontWeight: bold ? 700 : 400 }}>{value}</span>
        </div>
    )
}

function Page({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px 20px' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>{children}</div>
        </div>
    )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
    backBtn:        { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 20 },

    // Event header (steps 1 & 2)
    eventHeader:    { textAlign: 'center', marginBottom: 24 },
    eventTitle:     { fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.3px' },
    eventMeta:      { fontSize: 13, color: '#888', margin: 0 },

    // Tab progress bar
    tabBar:         { display: 'flex', borderBottom: '1px solid #222', marginBottom: 28 },
    tabItem:        { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 0 },
    tabLabel:       { fontSize: 14, paddingBottom: 12, transition: 'color 0.2s', display: 'block' },
    tabUnderline:   { height: 2, width: '100%', borderRadius: 2, marginTop: -1, transition: 'background-color 0.25s' },

    // Layout
    formArea:       { display: 'flex', flexDirection: 'column', gap: 0 },
    section:        { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 14, padding: 24 },

    // Section heading (like screenshot caps)
    sectionHeading: { fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 12px' },

    // Tier cards (step 1)
    tierList:       { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
    tierCard:       { border: '1px solid', borderRadius: 12, padding: 16, transition: 'border-color 0.15s, background-color 0.15s' },
    tierCardTop:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    tierCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
    tierTitle:      { fontSize: 15, fontWeight: 700, color: '#e5e5e5', margin: '0 0 3px' },
    tierCap:        { fontSize: 12, color: '#555', margin: 0 },
    tierPrice:      { fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flexShrink: 0 },

    // ADD button (unselected tier)
    addBtn:         {
        padding: '8px 24px', backgroundColor: '#f5f5f5', color: '#111',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        letterSpacing: '0.5px',
    },

    // Quantity
    qtyRow:         { display: 'flex', alignItems: 'center', gap: 14 },
    qtyBtn:         {
        width: 34, height: 34, borderRadius: 8,
        backgroundColor: '#111', border: '1px solid #333',
        color: '#e5e5e5', fontSize: 18, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    qtyNum:         { fontSize: 16, fontWeight: 700, color: '#fff', minWidth: 20, textAlign: 'center' },

    // Form fields
    field:          { display: 'flex', flexDirection: 'column', gap: 6 },
    label:          { fontSize: 12, fontWeight: 500, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input:          { padding: '11px 13px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },

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

    // Details intro
    detailsIntro:   { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 16px', lineHeight: 1.5 },

    // Order summary blocks (step 3)
    orderBlock:         { display: 'flex', flexDirection: 'column' },
    orderTicketCard:    { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 12, padding: '14px 16px' },
    orderEventName:     { fontSize: 14, fontWeight: 700, color: '#e5e5e5', margin: '0 0 4px' },
    orderTierName:      { fontSize: 13, color: '#888', margin: 0 },
    orderQtyLabel:      { fontSize: 13, color: '#888' },
    orderTicketPrice:   { fontSize: 14, fontWeight: 700, color: '#fff' },
    orderDetailsCard:   { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 12, padding: '4px 16px' },
    paymentDetailsCard: { backgroundColor: '#141414', border: '1px solid #222', borderRadius: 12, padding: '16px' },

    // Coupon
    couponRow:      { display: 'flex', gap: 8 },
    couponBtn:      { padding: '11px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },

    // Primary button
    primaryBtn:     {
        width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 18,
        transition: 'opacity 0.15s',
    },

    errorBox:           { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '12px 14px', marginTop: 4 },
    alreadyBookedBox:   { backgroundColor: '#0f2318', border: '1px solid #1a4a2e', borderRadius: 10, padding: '18px 16px' },
    refundNote:         { fontSize: 12, color: '#555', marginTop: 4, lineHeight: 1.6 },

    // Paying state
    payingState:    { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
    spinner:        { width: 40, height: 40, border: '3px solid #2a2a2a', borderTop: '3px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
    payingText:     { fontSize: 15, color: '#666' },
}
