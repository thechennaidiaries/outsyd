'use client'

/**
 * /[city]/events/[slug]/book
 *
 * Customer checkout page:
 * 1. Show tiers for this event
 * 2. Customer fills name + phone + optional coupon
 * 3. POST /api/events/[eventId]/create-order → get paymentSessionId
 * 4. Open Cashfree payment via SDK
 */

import { useState, useEffect, use } from 'react'
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

type Step = 'select' | 'details' | 'paying'

export default function BookingPage({
    params,
}: {
    params: Promise<{ city: string; slug: string }>
}) {
    const { city, slug } = use(params)
    const router = useRouter()

    const [event, setEvent]         = useState<EventInfo | null>(null)
    const [tiers, setTiers]         = useState<Tier[]>([])
    const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
    const [quantity, setQuantity]   = useState(1)

    const [name, setName]           = useState('')
    const [phone, setPhone]         = useState('')
    const [email, setEmail]         = useState('')
    const [couponCode, setCouponCode] = useState('')

    const [step, setStep]           = useState<Step>('select')
    const isPaying                  = step === 'paying'
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')

    // ── Fetch event + tiers ───────────────────────────────────────────────────
    useEffect(() => {
        fetch(`/api/events/by-slug?city=${city}&slug=${slug}`)
            .then(r => r.json())
            .then(d => {
                if (d.event) { setEvent(d.event); setTiers(d.tiers ?? []) }
                else setError('Event not found or booking not available.')
                setLoading(false)
            })
            .catch(() => { setError('Failed to load event.'); setLoading(false) })
    }, [city, slug])

    // ── Fee preview ───────────────────────────────────────────────────────────
    function calcPreview() {
        if (!selectedTier || !event) return null
        const base = selectedTier.price * quantity
        const fee  = Math.ceil(base * (event.service_fee_pct / 100))
        const paid = event.fee_absorbed_by_vendor ? base : base + fee
        return { base, fee, paid }
    }

    const preview = calcPreview()

    // ── Proceed to pay ────────────────────────────────────────────────────────
    async function handlePay() {
        if (!event || !selectedTier || !name || !phone) return
        setError('')
        setStep('paying')

        try {
            const res = await fetch(`/api/events/${event.id}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tierId: selectedTier.id,
                    quantity,
                    customerName: name,
                    customerPhone: phone,
                    customerEmail: email || undefined,
                    couponCode: couponCode || undefined,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create order')

            // ── Open Cashfree SDK ─────────────────────────────────────────────
            const { load } = await import('@cashfreepayments/cashfree-js')
            const cashfree = await load({
                mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV ?? 'sandbox') as 'sandbox' | 'production',
            })

            cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                redirectTarget:   '_self',
            })
        } catch (err: any) {
            setError(err.message)
            setStep('details')
        }
    }

    // ── Format date ───────────────────────────────────────────────────────────
    function fmtDate(iso: string) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
    }

    if (loading) return <Page><p style={{ color: '#666', textAlign: 'center', padding: 60 }}>Loading…</p></Page>
    if (!event)  return <Page><p style={{ color: '#f87171', textAlign: 'center', padding: 60 }}>{error}</p></Page>

    return (
        <Page>
            {/* Back */}
            <button onClick={() => router.back()} style={s.backBtn}>← Back to event</button>

            <div style={s.layout}>
                {/* ── Left: form ──────────────────────────────────────── */}
                <div style={s.formCol}>

                    {/* Step 1 — Select tier */}
                    {(step === 'select' || step === 'details') && (
                        <div style={s.section}>
                            <h2 style={s.sectionTitle}>Choose your ticket</h2>
                            <div style={s.tierList}>
                                {tiers.filter(t => t.is_active).map(tier => {
                                    const selected = selectedTier?.id === tier.id
                                    return (
                                        <button
                                            key={tier.id}
                                            onClick={() => { setSelectedTier(tier); setStep('details') }}
                                            style={{
                                                ...s.tierBtn,
                                                borderColor: selected ? '#fff' : '#2a2a2a',
                                                backgroundColor: selected ? '#1a1a1a' : '#141414',
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
                    )}

                    {/* Step 2 — Customer details */}
                    {step === 'details' && selectedTier && (
                        <div style={s.section}>
                            <h2 style={s.sectionTitle}>Your details</h2>

                            <div style={s.fieldGroup}>
                                {/* Quantity */}
                                <div style={s.field}>
                                    <label style={s.label}>Tickets</label>
                                    <div style={s.qtyRow}>
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={s.qtyBtn}>−</button>
                                        <span style={s.qtyNum}>{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(10, q + 1))} style={s.qtyBtn}>+</button>
                                    </div>
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Full name *</label>
                                    <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Kumar" autoFocus />
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>WhatsApp number *</label>
                                    <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
                                    <p style={s.hint}>Your booking confirmation will be sent here.</p>
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Email (optional)</label>
                                    <input style={s.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
                                </div>

                                <div style={s.field}>
                                    <label style={s.label}>Coupon code (optional)</label>
                                    <input style={s.input} value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="EARLYBIRD20" />
                                </div>
                            </div>

                            {error && <div style={s.errorBox}>{error}</div>}

                            <button
                                onClick={handlePay}
                                disabled={!name || !phone || isPaying}
                                style={{ ...s.payBtn, opacity: (!name || !phone) ? 0.4 : 1 }}
                            >
                                {isPaying ? 'Opening payment…' : `Pay ${preview ? formatPaise(preview.paid) : ''}`}
                            </button>

                            {event.refund_policy && (
                                <p style={s.refundNote}>📋 {event.refund_policy}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Right: summary ──────────────────────────────────── */}
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

const s: Record<string, React.CSSProperties> = {
    backBtn: { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 24 },
    layout:  { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' },
    formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
    section: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: 24 },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 18px', letterSpacing: '-0.2px' },
    tierList: { display: 'flex', flexDirection: 'column', gap: 10 },
    tierBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', border: '1px solid', borderRadius: 10,
        cursor: 'pointer', transition: 'border-color 0.15s', width: '100%', textAlign: 'left',
    },
    tierInfo: {},
    tierTitle: { fontSize: 14, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    tierCap:   { fontSize: 12, color: '#666', margin: 0 },
    tierPrice: { fontSize: 16, fontWeight: 700, color: '#fff', margin: 0, flexShrink: 0 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 14 },
    field:  { display: 'flex', flexDirection: 'column', gap: 6 },
    label:  { fontSize: 12, fontWeight: 500, color: '#888' },
    input:  { padding: '11px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 14, outline: 'none' },
    hint:   { fontSize: 11, color: '#555', margin: '4px 0 0' },
    qtyRow: { display: 'flex', alignItems: 'center', gap: 16 },
    qtyBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5', fontSize: 18, cursor: 'pointer' },
    qtyNum: { fontSize: 16, fontWeight: 600, color: '#fff', minWidth: 20, textAlign: 'center' },
    errorBox: { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '12px 14px', margin: '12px 0' },
    payBtn: {
        width: '100%', padding: '14px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16,
        transition: 'opacity 0.15s',
    },
    refundNote: { fontSize: 12, color: '#555', marginTop: 14, lineHeight: 1.6 },
    summaryCol: { display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 },
    eventImage: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 12, display: 'block' },
    summaryCard: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20 },
    summaryTitle: { fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.2px' },
    summaryMeta:  { fontSize: 13, color: '#777', margin: '0 0 4px' },
    breakdownBox: { marginTop: 18, paddingTop: 16, borderTop: '1px solid #1f1f1f' },
    breakdownDivider: { borderTop: '1px solid #2a2a2a', margin: '8px 0' },
}
