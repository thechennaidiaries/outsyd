'use client'

/**
 * /[city]/activities/[slug]/book
 *
 * Booking request form. Fetches activity from Supabase via the client,
 * shows slot picker + date + group size + contact fields,
 * then POSTs to /api/bookings.
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users, Phone, User, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import BookingCalendar from '@/components/BookingCalendar'
import { supabaseClient } from '@/lib/supabase-client'

// ── Types ────────────────────────────────────────────────────────────────────

interface ActivityBookingInfo {
    id: string
    title: string
    image?: string
    location?: string
    area?: string
    place_id?: string
    city_id: string
    booking_enabled: boolean
    available_slots: string[]
    booking_days: string[]
    group_size_min?: number
    group_size_max?: number
    pricing_per_person?: number
    cancellation_policy?: string
}

type Step = 'form' | 'submitting' | 'success' | 'error'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTodayIST(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

function formatINPhone(val: string): string {
    // Auto-prefix +91 if user types 10 digits
    const digits = val.replace(/\D/g, '')
    if (digits.length === 10 && !val.startsWith('+')) return `+91${digits}`
    return val
}

// ── Main component ───────────────────────────────────────────────────────────

export default function BookingPage() {
    const params = useParams()
    const router = useRouter()
    const citySlug = params.city as string
    const activitySlug = params.slug as string

    // ── Activity data ────────────────────────────────────────────────────────
    const [activity, setActivity] = useState<ActivityBookingInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [notBookable, setNotBookable] = useState(false)

    useEffect(() => {
        async function load() {
            if (!supabaseClient) { setNotBookable(true); setLoading(false); return }
            const { data, error } = await supabaseClient
                .from('activities')
                .select('id, title, image, location, area, place_id, city_id, booking_enabled, available_slots, booking_days, group_size_min, group_size_max, pricing_per_person, cancellation_policy')
                .eq('city_id', citySlug)
                .eq('slug', activitySlug)
                .single()
            if (error || !data || !data.booking_enabled) {
                setNotBookable(true)
            } else {
                setActivity(data as ActivityBookingInfo)
            }
            setLoading(false)
        }
        load()
    }, [citySlug, activitySlug])

    // ── Form state ───────────────────────────────────────────────────────────
    const [selectedSlot, setSelectedSlot] = useState('')
    const [bookingDate, setBookingDate] = useState('')
    const [peopleCount, setPeopleCount] = useState(1)
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('+91')
    const [customerEmail, setCustomerEmail] = useState('')
    const [step, setStep] = useState<Step>('form')
    const [bookingRef, setBookingRef] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const canSubmit =
        selectedSlot &&
        bookingDate &&
        peopleCount >= 1 &&
        customerName.trim().length >= 2 &&
        customerPhone.length >= 10

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!activity || !canSubmit) return
        setStep('submitting')

        const phone = formatINPhone(customerPhone)

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activity_id: activity.id,
                    customer_name: customerName.trim(),
                    customer_phone: phone,
                    customer_email: customerEmail || undefined,
                    booking_date: bookingDate,
                    time_slot: selectedSlot,
                    people_count: peopleCount,
                }),
            })
            const json = await res.json()
            if (!res.ok) {
                setErrorMsg(json.error || 'Something went wrong. Please try again.')
                setStep('error')
            } else {
                setBookingRef(json.booking_reference)
                setStep('success')
            }
        } catch {
            setErrorMsg('Network error. Please check your connection and try again.')
            setStep('error')
        }
    }

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        )
    }

    // ── Not bookable ─────────────────────────────────────────────────────────
    if (notBookable || !activity) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>Booking not available</h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, textAlign: 'center' }}>This activity doesn't support booking requests yet.</p>
                <Link href={`/${citySlug}/activities/${activitySlug}`} style={{
                    padding: '14px 28px', borderRadius: 'var(--radius)',
                    background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 15,
                    textDecoration: 'none',
                }}>
                    ← Back to Activity
                </Link>
            </main>
        )
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (step === 'success') {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24,
                }}>
                    <CheckCircle size={36} style={{ color: '#22c55e' }} />
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.03em' }}>
                    Request Sent! 🎉
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, textAlign: 'center', lineHeight: 1.7 }}>
                    Your booking request has been submitted.<br />
                    The venue will confirm shortly.
                </p>

                {/* Booking reference card */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius)', padding: '20px 28px',
                    marginBottom: 32, width: '100%', maxWidth: 360, textAlign: 'center',
                }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>
                        Booking Reference
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                        {bookingRef}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                        Save this — the venue may ask for it
                    </div>
                </div>

                {/* Details recap */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', width: '100%', maxWidth: 360, marginBottom: 32 }}>
                    {[
                        { label: 'Activity', value: activity.title },
                        { label: 'Date', value: bookingDate },
                        { label: 'Time', value: selectedSlot },
                        { label: 'People', value: `${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}` },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
                        </div>
                    ))}
                </div>

                <Link href={`/${citySlug}/activities/${activitySlug}`} style={{
                    padding: '14px 28px', borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontWeight: 700, fontSize: 15, textDecoration: 'none',
                }}>
                    Back to Activity
                </Link>
            </main>
        )
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (step === 'error') {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                }}>
                    <AlertCircle size={36} style={{ color: '#ef4444' }} />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>Something went wrong</h1>
                <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 32, textAlign: 'center', lineHeight: 1.7, maxWidth: 300 }}>{errorMsg}</p>
                <button
                    onClick={() => setStep('form')}
                    style={{
                        padding: '14px 28px', borderRadius: 'var(--radius)',
                        background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 15,
                        border: 'none', cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </main>
        )
    }

    // ── Form ─────────────────────────────────────────────────────────────────
    const minGroup = activity.group_size_min ?? 1
    const maxGroup = activity.group_size_max ?? 20

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* ── Top bar ── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 40,
                background: 'var(--bg-glass)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
                <Link href={`/${citySlug}/activities/${activitySlug}`} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text)', textDecoration: 'none', flexShrink: 0,
                }}>
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>Request Booking</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {activity.title}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: '0 auto', padding: '28px 20px 100px' }}>

                {/* ── Activity thumbnail ── */}
                {activity.image && (
                    <div style={{
                        width: '100%', height: 160, borderRadius: 'var(--radius)',
                        overflow: 'hidden', marginBottom: 28, position: 'relative',
                        border: '1px solid var(--border)',
                    }}>
                        <img src={activity.image} alt={activity.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,14,0.85) 100%)',
                        }} />
                        {activity.area && (
                            <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                📍 {activity.area}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Info banner ── */}
                <div style={{
                    background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                    borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                    fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 28,
                }}>
                    💡 This is a <strong style={{ color: 'var(--text)' }}>booking request</strong>, not an instant confirmation. The venue will confirm availability and reach out to you.
                </div>

                {/* ── SECTION: Pick a time slot ── */}
                <FormSection icon={<Clock size={16} />} label="Pick a Time Slot">
                    {activity.available_slots?.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {activity.available_slots.map(slot => (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    style={{
                                        padding: '10px 18px', borderRadius: 'var(--radius-sm)',
                                        border: selectedSlot === slot
                                            ? '2px solid var(--accent)'
                                            : '1.5px solid var(--border)',
                                        background: selectedSlot === slot ? 'var(--accent-dim)' : 'var(--bg-card)',
                                        color: selectedSlot === slot ? 'var(--accent)' : 'var(--text)',
                                        fontSize: 14, fontWeight: 600, cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No slots configured yet.</p>
                    )}
                </FormSection>

                {/* ── SECTION: Date ── */}
                <FormSection icon={<Calendar size={16} />} label="Choose a Date">
                    <BookingCalendar
                        value={bookingDate}
                        onChange={setBookingDate}
                        bookingDays={activity.booking_days ?? []}
                    />
                </FormSection>

                {/* ── SECTION: Group size ── */}
                <FormSection icon={<Users size={16} />} label="Number of People">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                            type="button"
                            onClick={() => setPeopleCount(c => Math.max(minGroup, c - 1))}
                            style={counterBtnStyle}
                        >
                            −
                        </button>
                        <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', minWidth: 40, textAlign: 'center' }}>
                            {peopleCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPeopleCount(c => Math.min(maxGroup, c + 1))}
                            style={counterBtnStyle}
                        >
                            +
                        </button>
                    </div>
                    {activity.group_size_min && (
                        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10 }}>
                            Min {activity.group_size_min}{activity.group_size_max ? ` · Max ${activity.group_size_max}` : ''} people
                        </p>
                    )}
                    {activity.pricing_per_person && (
                        <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: 6, fontWeight: 600 }}>
                            ₹{(activity.pricing_per_person * peopleCount).toLocaleString('en-IN')} estimated · ₹{activity.pricing_per_person.toLocaleString('en-IN')}/person
                        </p>
                    )}
                </FormSection>

                {/* ── SECTION: Your details ── */}
                <FormSection icon={<User size={16} />} label="Your Details">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <FormField
                            icon={<User size={14} />}
                            placeholder="Your name"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <FormField
                            icon={<Phone size={14} />}
                            placeholder="+91 98765 43210"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            required
                            type="tel"
                            autoComplete="tel"
                        />
                        <FormField
                            icon={<Mail size={14} />}
                            placeholder="Email (optional)"
                            value={customerEmail}
                            onChange={e => setCustomerEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
                        />
                    </div>
                </FormSection>

                {/* ── Cancellation policy ── */}
                {activity.cancellation_policy && (
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '12px 16px',
                        fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 20,
                    }}>
                        📋 <strong style={{ color: 'var(--text-2)' }}>Cancellation:</strong> {activity.cancellation_policy}
                    </div>
                )}

                {/* ── Submit ── */}
                <button
                    type="submit"
                    disabled={!canSubmit || step === 'submitting'}
                    style={{
                        width: '100%', padding: '18px 24px',
                        borderRadius: 'var(--radius)',
                        background: canSubmit
                            ? 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)'
                            : 'var(--bg-elevated)',
                        color: canSubmit ? 'white' : 'var(--text-3)',
                        fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
                        border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
                        boxShadow: canSubmit ? '0 8px 32px rgba(255,107,0,0.35)' : 'none',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                >
                    {step === 'submitting' ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            Sending Request...
                        </>
                    ) : (
                        '✉️ Send Booking Request'
                    )}
                </button>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 14, lineHeight: 1.6 }}>
                    No payment required · Vendor confirms availability · Free to cancel
                </p>
            </form>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.6);
                    cursor: pointer;
                }
            `}</style>
        </main>
    )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FormSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '20px', marginBottom: 16,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)',
                }}>
                    {icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {label}
                </span>
            </div>
            {children}
        </div>
    )
}

function FormField({ icon, placeholder, value, onChange, required, type = 'text', autoComplete }: {
    icon: React.ReactNode
    placeholder: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    type?: string
    autoComplete?: string
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '12px 14px',
        }}>
            <div style={{ color: 'var(--text-3)', flexShrink: 0 }}>{icon}</div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--text)', fontSize: 14, fontWeight: 500,
                }}
            />
        </div>
    )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text)',
    fontSize: 14, fontWeight: 500, outline: 'none',
}

const counterBtnStyle: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 10,
    background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
    color: 'var(--text)', fontSize: 22, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
}
