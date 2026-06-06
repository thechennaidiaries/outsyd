'use client'

/**
 * /[city]/events/[slug]/book
 *
 * 4-step booking flow:
 *   Step 1  — select:  Choose tier + quantity
 *   Step 2  — verify:  Phone OTP via bottom drawer (skipped if already logged in)
 *   Step 3  — details: Ticket summary + name (auto-filled) + coupon
 *   Step 4  — paying:  Cashfree SDK checkout
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatPaise } from '@/data/vendors'

interface Tier {
    id: string; title: string; price: number; capacity?: number; is_active: boolean
}

interface EventInfo {
    id: string; title: string; date: string; time?: string; venue?: string
    image?: string; service_fee_pct: number; fee_absorbed_by_vendor: boolean
    refund_policy?: string
}

type Step = 'select' | 'verify' | 'details' | 'paying'

// ── Coupon result shape ────────────────────────────────────────────────────────
interface CouponResult {
    valid: boolean
    discountAmount: number   // in paise
    code: string
    message?: string
}

export default function BookingPage({ params }: { params: { city: string; slug: string } }) {
    const { city, slug } = params
    const router = useRouter()

    // ── Event data ─────────────────────────────────────────────────────────────
    const [event, setEvent]               = useState<EventInfo | null>(null)
    const [tiers, setTiers]               = useState<Tier[]>([])
    const [loading, setLoading]           = useState(true)
    const [pageError, setPageError]       = useState('')

    // ── Step 1: tier selection ─────────────────────────────────────────────────
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
    const [quantity, setQuantity]         = useState(1)

    // ── Step 2: OTP drawer ─────────────────────────────────────────────────────
    const [drawerOpen, setDrawerOpen]     = useState(false)
    const [phone, setPhone]               = useState('')
    const [otpSent, setOtpSent]           = useState(false)
    const [otp, setOtp]                   = useState('')
    const [otpLoading, setOtpLoading]     = useState(false)
    const [otpError, setOtpError]         = useState('')
    const [resendCooldown, setResendCooldown] = useState(0)
    const otpInputRef                     = useRef<HTMLInputElement>(null)

    // ── Step 3: details ────────────────────────────────────────────────────────
    const [name, setName]                 = useState('')
    const [couponCode, setCouponCode]     = useState('')
    const [couponResult, setCouponResult] = useState<CouponResult | null>(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [detailsError, setDetailsError] = useState('')

    // ── Global step ────────────────────────────────────────────────────────────
    const [step, setStep]                 = useState<Step>('select')

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

    // ── Check if already logged in on mount ────────────────────────────────────
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(d => {
                if (d.user?.name)         setName(d.user.name)
                if (d.user?.phone_number) setPhone(d.user.phone_number)
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

    // ── Format date ────────────────────────────────────────────────────────────
    function fmtDate(iso: string) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 1 → 2: Tier selected, open OTP drawer (or skip if logged in)
    // ────────────────────────────────────────────────────────────────────────────
    async function handleTierSelect(tier: Tier) {
        setSelectedTier(tier)

        // Check if already logged in — if so skip OTP drawer
        try {
            const res  = await fetch('/api/auth/me')
            const data = await res.json()
            if (data.user) {
                if (data.user.name)         setName(data.user.name)
                if (data.user.phone_number) setPhone(data.user.phone_number)
                setStep('details')
                return
            }
        } catch {}

        // Not logged in — open the OTP drawer
        setDrawerOpen(true)
        setStep('verify')
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 2: OTP — Send code
    // ────────────────────────────────────────────────────────────────────────────
    async function handleSendOtp() {
        const formatted = phone.startsWith('+') ? phone.replace(/\s/g, '') : `+91${phone.replace(/\s/g, '')}`
        setOtpError('')
        setOtpLoading(true)

        try {
            const res  = await fetch('/api/auth/send-otp', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ phone: formatted, context: 'booking' }),
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
    // Step 2: OTP — Verify code
    // ────────────────────────────────────────────────────────────────────────────
    async function handleVerifyOtp() {
        const formatted = phone.startsWith('+') ? phone.replace(/\s/g, '') : `+91${phone.replace(/\s/g, '')}`
        setOtpError('')
        setOtpLoading(true)

        try {
            const res  = await fetch('/api/auth/verify-otp', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ phone: formatted, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Verification failed')

            // Auto-fill name if repeat user
            if (data.name) setName(data.name)

            // Close drawer and advance to Step 3
            setDrawerOpen(false)
            setStep('details')
        } catch (err: any) {
            setOtpError(err.message)
        } finally {
            setOtpLoading(false)
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Step 3: Apply coupon
    // ────────────────────────────────────────────────────────────────────────────
    async function handleApplyCoupon() {
        if (!couponCode || !event || !selectedTier) return
        setCouponLoading(true)
        setCouponResult(null)

        try {
            const res  = await fetch(`/api/events/${event.id}/validate-coupon`, {
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
    // Step 3 → 4: Proceed to payment
    // ────────────────────────────────────────────────────────────────────────────
    async function handlePay() {
        if (!event || !selectedTier || !name) return
        setDetailsError('')
        setStep('paying')

        try {
            const res = await fetch(`/api/events/${event.id}/create-order`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tierId:        selectedTier.id,
                    quantity,
                    customerName:  name,
                    customerPhone: phone.startsWith('+') ? phone.replace(/\s/g, '') : `+91${phone.replace(/\s/g, '')}`,
                    couponCode:    couponResult?.valid ? couponResult.code : undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create order')

            // Open Cashfree SDK
            const { load } = await import('@cashfreepayments/cashfree-js')
            const cashfree  = await load({
                mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production',
            })
            cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' })
        } catch (err: any) {
            setDetailsError(err.message)
            setStep('details')
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────────────────
    if (loading)    return <Page><p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading…</p></Page>
    if (!event)     return <Page><p style={{ color: '#f87171', textAlign: 'center', padding: 60 }}>{pageError}</p></Page>
    if (step === 'paying') return (
        <Page>
            <div style={s.payingState}>
                <div style={s.spinner} />
                <p style={s.payingText}>Opening payment…</p>
            </div>
        </Page>
    )

    return (
        <Page>
            {/* Back */}
            <button onClick={() => router.back()} style={s.backBtn}>← Back to event</button>

            <div style={s.layout}>
                {/* ── Left: form ──────────────────────────────────── */}
                <div style={s.formCol}>

                    {/* ── Step 1: Select tier ── */}
                    <div style={s.section}>
                        <h2 style={s.sectionTitle}>Choose your ticket</h2>
                        <div style={s.tierList}>
                            {tiers.filter(t => t.is_active).map(tier => {
                                const selected = selectedTier?.id === tier.id
                                return (
                                    <button
                                        key={tier.id}
                                        onClick={() => handleTierSelect(tier)}
                                        style={{
                                            ...s.tierBtn,
                                            borderColor:     selected ? '#ffffff40' : '#2a2a2a',
                                            backgroundColor: selected ? '#1e1e1e' : '#141414',
                                            boxShadow:       selected ? '0 0 0 1px #ffffff20' : 'none',
                                        }}
                                    >
                                        <div style={s.tierInfo}>
                                            <p style={s.tierTitle}>{tier.title}</p>
                                            {tier.capacity && (
                                                <p style={s.tierCap}>{tier.capacity} seats available</p>
                                            )}
                                        </div>
                                        <p style={s.tierPrice}>{formatPaise(tier.price)}</p>
                                    </button>
                                )
                            })}
                            {tiers.length === 0 && (
                                <p style={{ color: '#666', fontSize: 14 }}>No tickets available.</p>
                            )}
                        </div>
                    </div>

                    {/* ── Step 3: Details (after OTP) ── */}
                    {step === 'details' && selectedTier && (
                        <div style={s.section}>
                            <h2 style={s.sectionTitle}>Your details</h2>

                            <div style={s.fieldGroup}>
                                {/* Quantity */}
                                <div style={s.field}>
                                    <label style={s.label}>Number of tickets</label>
                                    <div style={s.qtyRow}>
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={s.qtyBtn}>−</button>
                                        <span style={s.qtyNum}>{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(10, q + 1))} style={s.qtyBtn}>+</button>
                                    </div>
                                </div>

                                {/* Name */}
                                <div style={s.field}>
                                    <label style={s.label}>Full name *</label>
                                    <input
                                        style={s.input}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Arjun Kumar"
                                        autoFocus={!name}
                                    />
                                    {name && <p style={s.hint}>✓ Auto-filled from your account. Feel free to change it.</p>}
                                </div>

                                {/* Coupon */}
                                <div style={s.field}>
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
                            </div>

                            {detailsError && <div style={s.errorBox}>{detailsError}</div>}

                            <button
                                onClick={handlePay}
                                disabled={!name}
                                style={{ ...s.payBtn, opacity: !name ? 0.4 : 1 }}
                            >
                                {preview ? `Pay ${formatPaise(preview.paid)}` : 'Proceed to Payment'}
                            </button>

                            {event.refund_policy && (
                                <p style={s.refundNote}>📋 {event.refund_policy}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: summary ──────────────────────────────── */}
                <div style={s.summaryCol}>
                    {event.image && (
                        <img src={event.image} alt={event.title} style={s.eventImage} />
                    )}
                    <div style={s.summaryCard}>
                        <h3 style={s.summaryTitle}>{event.title}</h3>
                        <p style={s.summaryMeta}>{fmtDate(event.date)}{event.time && ` · ${event.time}`}</p>
                        {event.venue && <p style={s.summaryMeta}>{event.venue}</p>}

                        {selectedTier && preview && (
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
                    </div>
                </div>
            </div>

            {/* ── OTP Bottom Drawer ──────────────────────────────────────────── */}
            {drawerOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        style={s.backdrop}
                        onClick={() => { setDrawerOpen(false); setStep('select') }}
                    />

                    {/* Drawer */}
                    <div style={s.drawer}>
                        <div style={s.drawerHandle} />

                        <h3 style={s.drawerTitle}>Verify your WhatsApp</h3>
                        <p style={s.drawerSubtitle}>
                            We'll send a code to confirm it's you. Your booking confirmation will also arrive here.
                        </p>

                        {!otpSent ? (
                            /* ── Phone input ── */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={s.phoneRow}>
                                    <span style={s.phonePrefix}>+91</span>
                                    <input
                                        style={{ ...s.input, flex: 1, borderLeft: 'none', borderRadius: '0 8px 8px 0' }}
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="98765 43210"
                                        type="tel"
                                        maxLength={10}
                                        autoFocus
                                    />
                                </div>
                                {otpError && <p style={s.otpError}>{otpError}</p>}
                                <button
                                    onClick={handleSendOtp}
                                    disabled={phone.length < 10 || otpLoading}
                                    style={{ ...s.payBtn, opacity: phone.length < 10 ? 0.4 : 1, marginTop: 4 }}
                                >
                                    {otpLoading ? 'Sending…' : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            /* ── OTP input ── */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
                                    Code sent to +91 {phone}
                                </p>
                                <input
                                    ref={otpInputRef}
                                    style={{ ...s.input, fontSize: 22, letterSpacing: 10, textAlign: 'center' }}
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
                                    style={{ ...s.payBtn, opacity: otp.length < 6 ? 0.4 : 1, marginTop: 4 }}
                                >
                                    {otpLoading ? 'Verifying…' : 'Verify & Continue'}
                                </button>
                                <button
                                    onClick={() => { setOtpSent(false); setOtp(''); setOtpError('') }}
                                    style={s.ghostBtn}
                                    disabled={resendCooldown > 0}
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Change number'}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Page>
    )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: bold ? '#e5e5e5' : '#888', fontWeight: bold ? 600 : 400 }}>{label}</span>
            <span style={{ fontSize: 13, color: bold ? '#fff' : '#aaa', fontWeight: bold ? 700 : 400 }}>{value}</span>
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
    backBtn:       { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24 },
    layout:        { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' },
    formCol:       { display: 'flex', flexDirection: 'column', gap: 16 },
    section:       { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 },
    sectionTitle:  { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.2px' },

    // Tier list
    tierList:      { display: 'flex', flexDirection: 'column', gap: 10 },
    tierBtn:       {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', border: '1px solid', borderRadius: 10,
        cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s',
        width: '100%', textAlign: 'left',
    },
    tierInfo:      {},
    tierTitle:     { fontSize: 14, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    tierCap:       { fontSize: 12, color: '#666', margin: 0 },
    tierPrice:     { fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flexShrink: 0 },

    // Form fields
    fieldGroup:    { display: 'flex', flexDirection: 'column', gap: 14 },
    field:         { display: 'flex', flexDirection: 'column', gap: 6 },
    label:         { fontSize: 12, fontWeight: 500, color: '#888' },
    input:         { padding: '11px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 14, outline: 'none' },
    hint:          { fontSize: 11, color: '#4ade80', margin: '4px 0 0' },

    // Quantity
    qtyRow:        { display: 'flex', alignItems: 'center', gap: 16 },
    qtyBtn:        { width: 36, height: 36, borderRadius: 8, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5', fontSize: 18, cursor: 'pointer' },
    qtyNum:        { fontSize: 16, fontWeight: 600, color: '#fff', minWidth: 20, textAlign: 'center' },

    // Coupon
    couponRow:     { display: 'flex', gap: 8 },
    couponBtn:     { padding: '11px 16px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },

    // Pay button
    payBtn:        {
        width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16,
        transition: 'opacity 0.15s',
    },

    errorBox:      { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '12px 14px', margin: '12px 0' },
    refundNote:    { fontSize: 12, color: '#555', marginTop: 14, lineHeight: 1.6 },

    // Summary column
    summaryCol:    { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 },
    eventImage:    { width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12, display: 'block' },
    summaryCard:   { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 },
    summaryTitle:  { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.2px' },
    summaryMeta:   { fontSize: 13, color: '#777', margin: '0 0 4px' },
    breakdownBox:  { marginTop: 18, paddingTop: 16, borderTop: '1px solid #1f1f1f' },
    breakdownDivider: { borderTop: '1px solid #2a2a2a', margin: '8px 0' },

    // OTP Drawer
    backdrop:      {
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 100, backdropFilter: 'blur(4px)',
    },
    drawer:        {
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#141414', border: '1px solid #2a2a2a',
        borderRadius: '20px 20px 0 0', padding: '20px 24px 40px',
        zIndex: 101, maxWidth: 520, margin: '0 auto',
        animation: 'slideUp 0.25s ease-out',
    },
    drawerHandle:  { width: 40, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, margin: '0 auto 24px' },
    drawerTitle:   { fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 8px' },
    drawerSubtitle: { fontSize: 13, color: '#666', margin: '0 0 24px', lineHeight: 1.5 },

    // Phone input in drawer
    phoneRow:      { display: 'flex', alignItems: 'stretch' },
    phonePrefix:   {
        padding: '11px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#666', fontSize: 14,
        display: 'flex', alignItems: 'center',
    },
    otpError:      { fontSize: 13, color: '#f87171', margin: 0 },
    ghostBtn:      { background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', textAlign: 'center', padding: '8px 0' },

    // Paying state
    payingState:   { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
    spinner:       {
        width: 40, height: 40, border: '3px solid #2a2a2a', borderTop: '3px solid #fff',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    payingText:    { fontSize: 15, color: '#666' },
}
