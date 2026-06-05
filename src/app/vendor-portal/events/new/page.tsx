'use client'

/**
 * /vendor-portal/events/new  — Create new event
 *
 * Sections:
 * 1. Basic info (title, date, time, city, venue, address, maps link)
 * 2. Description & image
 * 3. Categories & pricing label
 * 4. Ticket tiers (dynamic builder)
 * 5. Settings (fee, refund policy, event phone)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import VendorShell from '../../_components/VendorShell'

const CITIES = [
    { id: 'chennai', label: 'Chennai' },
    { id: 'bangalore', label: 'Bangalore' },
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'mumbai', label: 'Mumbai' },
]

interface TierDraft {
    key: number
    title: string
    priceInRupees: string
    capacity: string
}

let tierKey = 0

export default function NewEventPage() {
    const router = useRouter()

    // ── Form state ────────────────────────────────────────────────────────────
    const [title, setTitle]             = useState('')
    const [date, setDate]               = useState('')
    const [time, setTime]               = useState('')
    const [cityId, setCityId]           = useState('chennai')
    const [venue, setVenue]             = useState('')
    const [address, setAddress]         = useState('')
    const [mapsLink, setMapsLink]       = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage]             = useState('')
    const [categories, setCategories]   = useState('')
    const [pricingType, setPricingType] = useState<'free'|'paid'>('paid')
    const [pricing, setPricing]         = useState('')
    const [eventPhone, setEventPhone]   = useState('')
    const [feeAbsorbed, setFeeAbsorbed] = useState(false)
    const [refundPolicy, setRefundPolicy] = useState('')

    // ── Tiers ─────────────────────────────────────────────────────────────────
    const [tiers, setTiers] = useState<TierDraft[]>([
        { key: ++tierKey, title: 'General', priceInRupees: '', capacity: '' }
    ])

    function addTier() {
        setTiers(t => [...t, { key: ++tierKey, title: '', priceInRupees: '', capacity: '' }])
    }

    function removeTier(key: number) {
        setTiers(t => t.filter(x => x.key !== key))
    }

    function updateTier(key: number, field: keyof TierDraft, value: string) {
        setTiers(t => t.map(x => x.key === key ? { ...x, [field]: value } : x))
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (pricingType === 'paid' && tiers.some(t => !t.title || !t.priceInRupees)) {
            setError('Each tier needs a name and price.')
            return
        }

        setLoading(true)
        try {
            // 1. Create event
            const eventRes = await fetch('/api/vendor/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, date, time, cityId, venue, address, mapsLink,
                    description, image,
                    categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                    pricingType, pricing,
                    eventPhone, feeAbsorbedByVendor: feeAbsorbed, refundPolicy,
                }),
            })
            const eventData = await eventRes.json()
            if (!eventRes.ok) throw new Error(eventData.error || 'Failed to create event')

            const eventId = eventData.event.id

            // 2. Create tiers
            for (const tier of tiers) {
                if (!tier.title || !tier.priceInRupees) continue
                const tierRes = await fetch(`/api/vendor/events/${eventId}/tiers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: tier.title,
                        priceInRupees: Number(tier.priceInRupees),
                        capacity: tier.capacity ? Number(tier.capacity) : null,
                    }),
                })
                if (!tierRes.ok) {
                    const td = await tierRes.json()
                    throw new Error(td.error || 'Failed to add tier')
                }
            }

            router.push(`/vendor-portal/events/${eventId}`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <VendorShell>
            <div style={styles.header}>
                <button onClick={() => router.back()} style={styles.backBtn}>← Events</button>
                <h1 style={styles.title}>New Event</h1>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>

                {/* ── Section 1: Basic Info ─────────────────────────────── */}
                <Section title="Basic Info">
                    <Field label="Event title *">
                        <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Stand-Up Comedy Night" required />
                    </Field>
                    <Row>
                        <Field label="Date *">
                            <input style={styles.input} type="date" value={date}
                                onChange={e => setDate(e.target.value)} required />
                        </Field>
                        <Field label="Time">
                            <input style={styles.input} value={time} onChange={e => setTime(e.target.value)}
                                placeholder="7:00 PM – 10:00 PM" />
                        </Field>
                    </Row>
                    <Row>
                        <Field label="City *">
                            <select style={styles.input} value={cityId} onChange={e => setCityId(e.target.value)}>
                                {CITIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Venue name">
                            <input style={styles.input} value={venue} onChange={e => setVenue(e.target.value)}
                                placeholder="The Comedy Store" />
                        </Field>
                    </Row>
                    <Field label="Address">
                        <input style={styles.input} value={address} onChange={e => setAddress(e.target.value)}
                            placeholder="42, Anna Salai, Chennai" />
                    </Field>
                    <Field label="Google Maps link">
                        <input style={styles.input} value={mapsLink} onChange={e => setMapsLink(e.target.value)}
                            placeholder="https://maps.google.com/..." type="url" />
                    </Field>
                </Section>

                {/* ── Section 2: Description & Image ───────────────────── */}
                <Section title="Description & Image">
                    <Field label="Description">
                        <textarea style={{ ...styles.input, height: 90, resize: 'vertical' }}
                            value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="One-liner or short description of the event" />
                    </Field>
                    <Field label="Cover image URL (3:4 portrait — ImageKit)">
                        <input style={styles.input} value={image} onChange={e => setImage(e.target.value)}
                            placeholder="https://ik.imagekit.io/..." type="url" />
                    </Field>
                    {image && (
                        <img src={image} alt="preview" style={styles.imagePreview} onError={e => (e.currentTarget.style.display = 'none')} />
                    )}
                </Section>

                {/* ── Section 3: Categories & Pricing label ────────────── */}
                <Section title="Categories & Pricing">
                    <Field label="Categories (comma separated)">
                        <input style={styles.input} value={categories} onChange={e => setCategories(e.target.value)}
                            placeholder="Comedy, Standup, Nightlife" />
                    </Field>
                    <Row>
                        <Field label="Pricing type">
                            <select style={styles.input} value={pricingType}
                                onChange={e => setPricingType(e.target.value as 'free'|'paid')}>
                                <option value="paid">Paid</option>
                                <option value="free">Free</option>
                            </select>
                        </Field>
                        <Field label="Pricing label (shown on listing)">
                            <input style={styles.input} value={pricing} onChange={e => setPricing(e.target.value)}
                                placeholder="From ₹499" />
                        </Field>
                    </Row>
                </Section>

                {/* ── Section 4: Ticket Tiers ───────────────────────────── */}
                <Section title="Ticket Tiers">
                    <p style={styles.sectionHint}>
                        Prices in ₹ — we store them in paise internally. Add a capacity if you want to limit seats.
                    </p>
                    {tiers.map((tier, i) => (
                        <div key={tier.key} style={styles.tierRow}>
                            <span style={styles.tierNum}>{i + 1}</span>
                            <input style={{ ...styles.input, flex: 2 }} placeholder="Tier name (e.g. Early Bird)"
                                value={tier.title} onChange={e => updateTier(tier.key, 'title', e.target.value)} />
                            <div style={styles.priceWrap}>
                                <span style={styles.rupeeSymbol}>₹</span>
                                <input style={{ ...styles.input, paddingLeft: 28 }} type="number" min="0"
                                    placeholder="499" value={tier.priceInRupees}
                                    onChange={e => updateTier(tier.key, 'priceInRupees', e.target.value)} />
                            </div>
                            <input style={{ ...styles.input, flex: 1 }} type="number" min="1"
                                placeholder="Capacity (opt)" value={tier.capacity}
                                onChange={e => updateTier(tier.key, 'capacity', e.target.value)} />
                            {tiers.length > 1 && (
                                <button type="button" onClick={() => removeTier(tier.key)} style={styles.removeBtn}>✕</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addTier} style={styles.addTierBtn}>+ Add Tier</button>
                </Section>

                {/* ── Section 5: Settings ───────────────────────────────── */}
                <Section title="Settings">
                    <Field label="Event WhatsApp number (for booking notifications)">
                        <input style={styles.input} value={eventPhone} onChange={e => setEventPhone(e.target.value)}
                            placeholder="+91 98765 43210" type="tel" />
                        <p style={styles.hint}>Leave blank to use the default Outsyd ops number.</p>
                    </Field>

                    <div style={styles.toggleRow}>
                        <div>
                            <p style={styles.toggleLabel}>Absorb service fee</p>
                            <p style={styles.toggleHint}>
                                If on, the 5% Outsyd fee is deducted from your payout instead of added to the ticket price.
                            </p>
                        </div>
                        <button type="button" onClick={() => setFeeAbsorbed(f => !f)}
                            style={{ ...styles.toggle, backgroundColor: feeAbsorbed ? '#fff' : '#2a2a2a' }}>
                            <span style={{ ...styles.toggleThumb, transform: feeAbsorbed ? 'translateX(20px)' : 'translateX(2px)', backgroundColor: feeAbsorbed ? '#000' : '#555' }} />
                        </button>
                    </div>

                    <Field label="Refund policy">
                        <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }}
                            value={refundPolicy} onChange={e => setRefundPolicy(e.target.value)}
                            placeholder="e.g. No refunds after purchase. Tickets are non-transferable." />
                    </Field>
                </Section>

                {/* ── Submit ────────────────────────────────────────────── */}
                <div style={styles.submitRow}>
                    <button type="button" onClick={() => router.back()} style={styles.cancelBtn}>Cancel</button>
                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? 'Creating…' : 'Create Event (Draft)'}
                    </button>
                </div>
            </form>
        </VendorShell>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={sectionStyles.wrap}>
            <h2 style={sectionStyles.title}>{title}</h2>
            <div style={sectionStyles.body}>{children}</div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={styles.label}>{label}</label>
            {children}
        </div>
    )
}

function Row({ children }: { children: React.ReactNode }) {
    return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
}

const sectionStyles: Record<string, React.CSSProperties> = {
    wrap: {
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    title: {
        fontSize: 12,
        fontWeight: 600,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '12px 20px',
        margin: 0,
        borderBottom: '1px solid #1f1f1f',
        backgroundColor: '#111',
    },
    body: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
}

const styles: Record<string, React.CSSProperties> = {
    header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 },
    backBtn: { background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', padding: 0 },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.3px' },
    errorBox: {
        backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8,
        color: '#f87171', fontSize: 13, padding: '12px 16px', marginBottom: 20,
    },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    label: { fontSize: 12, fontWeight: 500, color: '#888' },
    input: {
        width: '100%', padding: '10px 12px', backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a', borderRadius: 8, color: '#e5e5e5',
        fontSize: 13, outline: 'none', boxSizing: 'border-box',
    },
    sectionHint: { fontSize: 12, color: '#555', margin: 0 },
    hint: { fontSize: 11, color: '#555', margin: '4px 0 0' },
    tierRow: { display: 'flex', alignItems: 'center', gap: 10 },
    tierNum: { fontSize: 12, color: '#555', width: 16, textAlign: 'center', flexShrink: 0 },
    priceWrap: { position: 'relative', flex: 1 },
    rupeeSymbol: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: 13, pointerEvents: 'none', zIndex: 1 },
    removeBtn: {
        background: 'none', border: '1px solid #2a2a2a', borderRadius: 6,
        color: '#555', fontSize: 12, padding: '6px 10px', cursor: 'pointer', flexShrink: 0,
    },
    addTierBtn: {
        background: 'none', border: '1px dashed #2a2a2a', borderRadius: 8,
        color: '#666', fontSize: 13, padding: '10px', cursor: 'pointer', width: '100%',
    },
    toggleRow: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20,
        padding: '14px 0', borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f',
    },
    toggleLabel: { fontSize: 13, fontWeight: 500, color: '#ccc', margin: '0 0 4px' },
    toggleHint: { fontSize: 12, color: '#555', margin: 0, maxWidth: 340, lineHeight: 1.5 },
    toggle: {
        width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0, transition: 'background-color 0.2s',
    },
    toggleThumb: {
        position: 'absolute', top: 2, width: 20, height: 20,
        borderRadius: '50%', transition: 'transform 0.2s',
    },
    imagePreview: { width: 80, height: 107, objectFit: 'cover', borderRadius: 8, border: '1px solid #2a2a2a' },
    submitRow: { display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 },
    cancelBtn: {
        padding: '10px 20px', background: 'none', border: '1px solid #2a2a2a',
        borderRadius: 8, color: '#888', fontSize: 13, cursor: 'pointer',
    },
    submitBtn: {
        padding: '10px 24px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
}
