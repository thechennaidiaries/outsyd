'use client'

/**
 * /vendor-portal/coupons
 * Create, view, and deactivate discount coupons per event.
 */

import { useEffect, useState } from 'react'
import VendorShell from '../_components/VendorShell'

interface Event { id: string; title: string }
interface Coupon {
    id: string; code: string; discount_type: string; discount_value: number
    usage_limit?: number; start_at: string; end_at?: string; active: boolean
    event_id?: string
}

export default function VendorCouponsPage() {
    const [vendorId, setVendorId]   = useState('')
    const [vendorName, setVendorName] = useState('')
    const [events, setEvents]       = useState<Event[]>([])
    const [coupons, setCoupons]     = useState<Coupon[]>([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')

    // Form state
    const [code, setCode]           = useState('')
    const [discountType, setDiscountType] = useState<'percentage'|'fixed'>('percentage')
    const [discountValue, setDiscountValue] = useState('')
    const [eventId, setEventId]     = useState('')       // '' = all events
    const [usageLimit, setUsageLimit] = useState('')
    const [endAt, setEndAt]         = useState('')
    const [creating, setCreating]   = useState(false)

    useEffect(() => {
        fetch('/api/vendor/me').then(r => r.json()).then(d => {
            if (d.vendor) {
                setVendorId(d.vendor.id)
                setVendorName(d.vendor.brandName ?? d.vendor.name)
            }
        })
        fetch('/api/vendor/events').then(r => r.json()).then(d => setEvents(d.events ?? []))
        fetchCoupons()
    }, [])

    async function fetchCoupons() {
        const res = await fetch('/api/vendor/coupons')
        const d   = await res.json()
        setCoupons(d.coupons ?? [])
        setLoading(false)
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        setError(''); setSuccess('')
        if (!code || !discountValue) return
        setCreating(true)
        try {
            const res = await fetch('/api/vendor/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.toUpperCase(),
                    discountType,
                    discountValue: discountType === 'fixed'
                        ? Math.round(Number(discountValue) * 100)  // rupees → paise
                        : Number(discountValue),
                    eventId: eventId || undefined,
                    usageLimit: usageLimit ? Number(usageLimit) : undefined,
                    endAt: endAt || undefined,
                }),
            })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error)
            setSuccess(`Coupon ${d.coupon.code} created!`)
            setCode(''); setDiscountValue(''); setUsageLimit(''); setEndAt(''); setEventId('')
            fetchCoupons()
        } catch (err: any) { setError(err.message) }
        finally { setCreating(false) }
    }

    async function handleToggle(id: string, currentlyActive: boolean) {
        await fetch(`/api/vendor/coupons/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: !currentlyActive }),
        })
        fetchCoupons()
    }

    function fmtDiscount(c: Coupon) {
        return c.discount_type === 'percentage'
            ? `${c.discount_value}% off`
            : `₹${(c.discount_value / 100).toLocaleString('en-IN')} off`
    }

    return (
        <VendorShell vendorName={vendorName}>
            <h1 style={s.title}>Coupons</h1>

            {/* ── Create form ───────────────────────────────────────── */}
            <div style={s.card}>
                <h2 style={s.cardTitle}>Create Coupon</h2>
                {error   && <div style={s.errorBox}>{error}</div>}
                {success && <div style={s.successBox}>{success}</div>}
                <form onSubmit={handleCreate} style={s.form}>
                    <div style={s.row}>
                        <Field label="Code *">
                            <input style={s.input} value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                placeholder="EARLYBIRD20" required />
                        </Field>
                        <Field label="Applies to event">
                            <select style={s.input} value={eventId} onChange={e => setEventId(e.target.value)}>
                                <option value="">All events</option>
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div style={s.row}>
                        <Field label="Discount type">
                            <select style={s.input} value={discountType}
                                onChange={e => setDiscountType(e.target.value as 'percentage'|'fixed')}>
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed amount (₹)</option>
                            </select>
                        </Field>
                        <Field label={discountType === 'percentage' ? 'Discount % *' : 'Amount (₹) *'}>
                            <input style={s.input} type="number" min="1"
                                max={discountType === 'percentage' ? '100' : undefined}
                                value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                                placeholder={discountType === 'percentage' ? '20' : '100'} required />
                        </Field>
                    </div>
                    <div style={s.row}>
                        <Field label="Usage limit (optional)">
                            <input style={s.input} type="number" min="1"
                                value={usageLimit} onChange={e => setUsageLimit(e.target.value)}
                                placeholder="100" />
                        </Field>
                        <Field label="Expiry date (optional)">
                            <input style={s.input} type="date" value={endAt} onChange={e => setEndAt(e.target.value)} />
                        </Field>
                    </div>
                    <button type="submit" disabled={creating} style={s.createBtn}>
                        {creating ? 'Creating…' : 'Create Coupon'}
                    </button>
                </form>
            </div>

            {/* ── Coupons list ──────────────────────────────────────── */}
            <div style={s.card}>
                <h2 style={s.cardTitle}>Active & Inactive Coupons</h2>
                {loading && <p style={{ color: '#555', fontSize: 13 }}>Loading…</p>}
                {!loading && coupons.length === 0 && (
                    <p style={{ color: '#555', fontSize: 13 }}>No coupons yet.</p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {coupons.map(c => (
                        <div key={c.id} style={{ ...s.couponRow, opacity: c.active ? 1 : 0.5 }}>
                            <div style={{ flex: 1 }}>
                                <div style={s.couponCode}>{c.code}</div>
                                <div style={s.couponMeta}>
                                    {fmtDiscount(c)}
                                    {c.event_id && events.find(e => e.id === c.event_id) &&
                                        ` · ${events.find(e => e.id === c.event_id)?.title}`}
                                    {c.usage_limit && ` · Max ${c.usage_limit} uses`}
                                    {c.end_at && ` · Expires ${new Date(c.end_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(c.id, c.active)}
                                style={{ ...s.toggleBtn, color: c.active ? '#f87171' : '#4ade80' }}
                            >
                                {c.active ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </VendorShell>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>{label}</label>
        {children}
    </div>
}

const s: Record<string, React.CSSProperties> = {
    title:   { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.3px' },
    card:    { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '22px 24px', marginBottom: 16 },
    cardTitle: { fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 18px' },
    errorBox:  { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '10px 14px', marginBottom: 14 },
    successBox:{ backgroundColor: '#0a2a0a', border: '1px solid #1a5a1a', borderRadius: 8, color: '#4ade80', fontSize: 13, padding: '10px 14px', marginBottom: 14 },
    form:    { display: 'flex', flexDirection: 'column', gap: 14 },
    row:     { display: 'flex', gap: 14 },
    input:   { padding: '10px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    createBtn: { padding: '10px 20px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' },
    couponRow: { display: 'flex', alignItems: 'center', gap: 16, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px' },
    couponCode: { fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace', letterSpacing: '0.05em', marginBottom: 3 },
    couponMeta: { fontSize: 12, color: '#666' },
    toggleBtn:  { background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0 },
}
