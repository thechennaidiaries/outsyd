'use client'

/**
 * /vendor-portal/events/[id]
 * View + edit event, manage tiers, submit for review, delete.
 */

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import VendorShell from '../../_components/VendorShell'

const CITIES = [
    { id: 'chennai', label: 'Chennai' },
    { id: 'bangalore', label: 'Bangalore' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'mumbai', label: 'Mumbai' },
]

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    draft:     { label: 'Draft',     color: '#aaa'    },
    submitted: { label: 'In Review', color: '#facc15' },
    approved:  { label: 'Live',      color: '#4ade80' },
    rejected:  { label: 'Rejected',  color: '#f87171' },
    closed:    { label: 'Closed',    color: '#888'    },
    completed: { label: 'Completed', color: '#60a5fa' },
}

interface Tier {
    id: string; title: string; price: number; capacity?: number; is_active: boolean
}

export default function EditEventPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()

    const [event, setEvent]     = useState<any>(null)
    const [tiers, setTiers]     = useState<Tier[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving]   = useState(false)
    const [syncing, setSyncing] = useState(false)
    const [error, setError]     = useState('')
    const [success, setSuccess] = useState('')

    // Form fields
    const [title, setTitle]             = useState('')
    const [date, setDate]               = useState('')
    const [time, setTime]               = useState('')
    const [cityId, setCityId]           = useState('')
    const [venue, setVenue]             = useState('')
    const [address, setAddress]         = useState('')
    const [mapsLink, setMapsLink]       = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage]             = useState('')
    const [categories, setCategories]   = useState('')
    const [pricingType, setPricingType] = useState('paid')
    const [pricing, setPricing]         = useState('')
    const [eventPhone, setEventPhone]   = useState('')
    const [feeAbsorbed, setFeeAbsorbed] = useState(false)
    const [refundPolicy, setRefundPolicy] = useState('')

    // New tier state
    const [newTierTitle, setNewTierTitle]     = useState('')
    const [newTierPrice, setNewTierPrice]     = useState('')
    const [newTierCap, setNewTierCap]         = useState('')
    const [addingTier, setAddingTier]         = useState(false)

    useEffect(() => {
        if (!id) return
        fetch(`/api/vendor/events/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.error) { setError(d.error); setLoading(false); return }
                const ev = d.event
                setEvent(ev)
                setTiers(d.tiers ?? [])
                setTitle(ev.title ?? '')
                setDate(ev.date ?? '')
                setTime(ev.time ?? '')
                setCityId(ev.city_id ?? 'chennai')
                setVenue(ev.venue ?? '')
                setAddress(ev.address ?? '')
                setMapsLink(ev.maps_link ?? '')
                setDescription(ev.description ?? '')
                setImage(ev.image ?? '')
                setCategories((ev.categories ?? []).join(', '))
                setPricingType(ev.pricing_type ?? 'paid')
                setPricing(ev.pricing ?? '')
                setEventPhone(ev.event_phone ?? '')
                setFeeAbsorbed(ev.fee_absorbed_by_vendor ?? false)
                setRefundPolicy(ev.refund_policy ?? '')
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    const canDelete = event && ['draft', 'rejected'].includes(event.approval_status)

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setError(''); setSuccess('')
        setSaving(true)
        try {
            const res = await fetch(`/api/vendor/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, date, time, cityId, venue, address, mapsLink, description, image,
                    categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                    pricingType, pricing, eventPhone,
                    feeAbsorbedByVendor: feeAbsorbed, refundPolicy,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccess('Event saved.')
            setEvent((ev: any) => ({ ...ev, ...data.event }))
        } catch (err: any) { setError(err.message) }
        finally { setSaving(false) }
    }

    async function handleSync() {
        setError(''); setSuccess('')
        setSyncing(true)
        try {
            const res = await fetch(`/api/vendor/events/${id}/revalidate`, { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to sync')
            setSuccess('Live page cache updated successfully!')
        } catch (err: any) { setError(err.message) }
        finally { setSyncing(false) }
    }

    async function handleSubmitForReview() {
        setError(''); setSuccess('')
        setSaving(true)
        try {
            const res = await fetch(`/api/vendor/events/${id}/submit`, { method: 'POST' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setSuccess('Submitted for review! We\'ll get back to you within 24 hours.')
            setEvent((ev: any) => ({ ...ev, approval_status: 'submitted' }))
        } catch (err: any) { setError(err.message) }
        finally { setSaving(false) }
    }

    async function handleDelete() {
        if (!confirm('Delete this event? This cannot be undone.')) return
        try {
            const res = await fetch(`/api/vendor/events/${id}`, { method: 'DELETE' })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            router.push('/vendor-portal/events')
        } catch (err: any) { setError(err.message) }
    }

    async function handleAddTier() {
        if (!newTierTitle || !newTierPrice) return
        setAddingTier(true)
        try {
            const res = await fetch(`/api/vendor/events/${id}/tiers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTierTitle, priceInRupees: Number(newTierPrice), capacity: newTierCap ? Number(newTierCap) : null }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setTiers(t => [...t, data.tier])
            setNewTierTitle(''); setNewTierPrice(''); setNewTierCap('')
        } catch (err: any) { setError(err.message) }
        finally { setAddingTier(false) }
    }

    async function handleDeleteTier(tierId: string) {
        try {
            const res = await fetch(`/api/vendor/events/${id}/tiers/${tierId}`, { method: 'DELETE' })
            if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
            setTiers(t => t.filter(x => x.id !== tierId))
        } catch (err: any) { setError(err.message) }
    }

    if (loading) return <VendorShell><p style={{ color: '#555' }}>Loading…</p></VendorShell>

    const badge = event ? STATUS_BADGE[event.approval_status] : null

    return (
        <VendorShell>
            {/* Header */}
            <div style={styles.header}>
                <button onClick={() => router.push('/vendor-portal/events')} style={styles.backBtn}>← Events</button>
                <div style={styles.headerRight}>
                    {event?.approval_status === 'approved' && (
                        <button
                            type="button"
                            onClick={handleSync}
                            disabled={syncing}
                            style={styles.syncBtn}
                        >
                            {syncing ? 'Syncing...' : 'Sync Live Page'}
                        </button>
                    )}
                    {badge && <span style={{ ...styles.badge, color: badge.color }}>{badge.label}</span>}
                    {canDelete && (
                        <button onClick={handleDelete} style={styles.deleteBtn}>Delete event</button>
                    )}
                </div>
            </div>
            <h1 style={styles.title}>{event?.title || 'Event'}</h1>

            {error   && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            {/* ── Event Form ──────────────────────────────────────────── */}
            <form onSubmit={handleSave} style={styles.form}>
                <SCard title="Basic Info">
                    <SField label="Title">
                        <input style={styles.input} value={title}
                            onChange={e => setTitle(e.target.value)} required />
                    </SField>
                    <SRow>
                        <SField label="Date">
                            <input style={styles.input} type="date" value={date}
                                onChange={e => setDate(e.target.value)} />
                        </SField>
                        <SField label="Time">
                            <input style={styles.input} value={time}
                                onChange={e => setTime(e.target.value)} placeholder="7:00 PM – 10:00 PM" />
                        </SField>
                    </SRow>
                    <SRow>
                        <SField label="City">
                            <select style={styles.input} value={cityId}
                                onChange={e => setCityId(e.target.value)}>
                                {CITIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </SField>
                        <SField label="Venue">
                            <input style={styles.input} value={venue}
                                onChange={e => setVenue(e.target.value)} />
                        </SField>
                    </SRow>
                    <SField label="Address">
                        <input style={styles.input} value={address}
                            onChange={e => setAddress(e.target.value)} />
                    </SField>
                    <SField label="Google Maps link">
                        <input style={styles.input} value={mapsLink} type="url"
                            onChange={e => setMapsLink(e.target.value)} />
                    </SField>
                </SCard>

                <SCard title="Description & Image">
                    <SField label="Description">
                        <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }}
                            value={description} onChange={e => setDescription(e.target.value)} />
                    </SField>
                    <SField label="Image URL (3:4 portrait)">
                        <input style={styles.input} value={image} type="url"
                            onChange={e => setImage(e.target.value)} />
                    </SField>
                    {image && <img src={image} alt="preview" style={styles.imagePreview} />}
                </SCard>

                <SCard title="Pricing">
                    <SRow>
                        <SField label="Pricing type">
                            <select style={styles.input} value={pricingType}
                                onChange={e => setPricingType(e.target.value)}>
                                <option value="paid">Paid</option>
                                <option value="free">Free</option>
                            </select>
                        </SField>
                        <SField label="Pricing label">
                            <input style={styles.input} value={pricing}
                                onChange={e => setPricing(e.target.value)} placeholder="From ₹499" />
                        </SField>
                    </SRow>
                    <SField label="Categories (comma separated)">
                        <input style={styles.input} value={categories}
                            onChange={e => setCategories(e.target.value)} />
                    </SField>
                </SCard>

                <SCard title="Settings">
                    <SField label="Refund policy">
                        <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }}
                            value={refundPolicy} onChange={e => setRefundPolicy(e.target.value)} />
                    </SField>
                </SCard>

                <div style={styles.actionRow}>
                        <button type="submit" disabled={saving} style={styles.saveBtn}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                        {['draft', 'rejected'].includes(event?.approval_status) && (
                            <button type="button" onClick={handleSubmitForReview} disabled={saving} style={styles.submitBtn}>
                                Submit for Review →
                            </button>
                        )}
                    </div>

                {event?.approval_status === 'submitted' && (
                    <div style={styles.infoBox}>
                        ⏳ Under review — we'll notify you within 24 hours.
                    </div>
                )}
            </form>

            {/* ── Tiers ──────────────────────────────────────────────────── */}
            <div style={{ ...sStyles.wrap, marginTop: 16 }}>
                <h2 style={sStyles.title}>Ticket Tiers</h2>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tiers.length === 0 && <p style={{ fontSize: 13, color: '#555' }}>No tiers yet.</p>}
                    {tiers.map(tier => (
                        <div key={tier.id} style={styles.tierCard}>
                            <div style={{ flex: 1 }}>
                                <p style={styles.tierName}>{tier.title}</p>
                                <p style={styles.tierMeta}>
                                    ₹{(tier.price / 100).toLocaleString('en-IN')}
                                    {tier.capacity ? ` · ${tier.capacity} seats` : ' · Unlimited'}
                                    {!tier.is_active && ' · Inactive'}
                                </p>
                            </div>
                            <button onClick={() => handleDeleteTier(tier.id)} style={styles.removeBtn}>Remove</button>
                        </div>
                    ))}

                    <div style={styles.addTierWrap}>
                            <input style={{ ...styles.input, flex: 2 }} placeholder="Tier name"
                                value={newTierTitle} onChange={e => setNewTierTitle(e.target.value)} />
                            <div style={styles.priceWrap}>
                                <span style={styles.rupee}>₹</span>
                                <input style={{ ...styles.input, paddingLeft: 26 }} type="number" min="0"
                                    placeholder="Price" value={newTierPrice} onChange={e => setNewTierPrice(e.target.value)} />
                            </div>
                            <input style={{ ...styles.input, flex: 1 }} type="number" min="1"
                                placeholder="Capacity" value={newTierCap} onChange={e => setNewTierCap(e.target.value)} />
                            <button type="button" onClick={handleAddTier} disabled={addingTier} style={styles.addBtn}>
                                {addingTier ? '…' : 'Add'}
                            </button>
                        </div>
                </div>
            </div>
        </VendorShell>
    )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function disabled(base: React.CSSProperties, isDisabled: boolean): React.CSSProperties {
    return { ...base, opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : undefined }
}

function SCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={sStyles.wrap}>
            <h2 style={sStyles.title}>{title}</h2>
            <div style={sStyles.body}>{children}</div>
        </div>
    )
}
function SField({ label, children }: { label: string; children: React.ReactNode }) {
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={styles.label}>{label}</label>{children}
    </div>
}
function SRow({ children }: { children: React.ReactNode }) {
    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
}

const sStyles: Record<string, React.CSSProperties> = {
    wrap: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' },
    title: { fontSize: 11, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 20px', margin: 0, borderBottom: '1px solid #1f1f1f', backgroundColor: '#111' },
    body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 14 },
}

const styles: Record<string, React.CSSProperties> = {
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    backBtn: { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0 },
    headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
    badge: { fontSize: 12, fontWeight: 600 },
    deleteBtn: { background: 'none', border: '1px solid #3a1a1a', borderRadius: 6, color: '#f87171', fontSize: 12, padding: '5px 12px', cursor: 'pointer' },
    syncBtn: { background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#e5e5e5', fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontWeight: 600, backgroundColor: '#1a1a1a', transition: 'all 0.2s' },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.3px' },
    errorBox: { backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8, color: '#f87171', fontSize: 13, padding: '12px 16px', marginBottom: 16 },
    successBox: { backgroundColor: '#0a2a0a', border: '1px solid #1a5a1a', borderRadius: 8, color: '#4ade80', fontSize: 13, padding: '12px 16px', marginBottom: 16 },
    infoBox: { backgroundColor: '#1a1a0a', border: '1px solid #3a3a0a', borderRadius: 8, color: '#facc15', fontSize: 13, padding: '12px 16px' },
    form: { display: 'flex', flexDirection: 'column', gap: 14 },
    label: { fontSize: 12, fontWeight: 500, color: '#888' },
    input: { width: '100%', padding: '10px 12px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    imagePreview: { width: 72, height: 96, objectFit: 'cover', borderRadius: 6, border: '1px solid #2a2a2a' },
    toggleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, padding: '12px 0', borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f' },
    toggleLabel: { fontSize: 13, fontWeight: 500, color: '#ccc', margin: '0 0 4px' },
    toggleHint: { fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 },
    toggle: { width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background-color 0.2s' },
    toggleThumb: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', transition: 'transform 0.2s' },
    actionRow: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    saveBtn: { padding: '10px 20px', background: 'none', border: '1px solid #2a2a2a', borderRadius: 8, color: '#aaa', fontSize: 13, cursor: 'pointer' },
    submitBtn: { padding: '10px 20px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    tierCard: { display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 14px' },
    tierName: { fontSize: 13, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    tierMeta: { fontSize: 12, color: '#666', margin: 0 },
    removeBtn: { background: 'none', border: '1px solid #2a2a2a', borderRadius: 6, color: '#666', fontSize: 12, padding: '5px 10px', cursor: 'pointer' },
    addTierWrap: { display: 'flex', gap: 10, alignItems: 'center', paddingTop: 8, borderTop: '1px solid #1f1f1f' },
    priceWrap: { position: 'relative', flex: 1 },
    rupee: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 13, pointerEvents: 'none' },
    addBtn: { padding: '10px 16px', backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
}
