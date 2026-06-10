/**
 * /account/bookings — Unified booking history (activity bookings + event bookings)
 * Server component.
 */

import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ── Status configs ────────────────────────────────────────────────────────────

const ACTIVITY_STATUS: Record<string, { label: string; color: string; icon: string }> = {
    pending_vendor:  { label: 'Awaiting confirmation', color: '#f59e0b', icon: '⏳' },
    confirmed:       { label: 'Confirmed',             color: '#22c55e', icon: '✅' },
    rejected:        { label: 'Unavailable',           color: '#ef4444', icon: '❌' },
    manual_followup: { label: 'Being reviewed',        color: '#8b5cf6', icon: '🔄' },
    cancelled:       { label: 'Cancelled',             color: '#6b7280', icon: '✖️'  },
}

const EVENT_PAYMENT: Record<string, { label: string; color: string; icon: string }> = {
    pending:  { label: 'Payment pending', color: '#f59e0b', icon: '⏳' },
    paid:     { label: 'Confirmed',       color: '#22c55e', icon: '🎟' },
    failed:   { label: 'Payment failed',  color: '#ef4444', icon: '❌' },
    refunded: { label: 'Refunded',        color: '#6b7280', icon: '↩️' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string, timeOnly = false) {
    const d = new Date(iso)
    if (timeOnly) return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BookingsPage() {
    const session = await getSession()
    if (!session) redirect('/account/login?next=/account/bookings')

    // Fetch activity bookings
    const { data: activityBookings } = await supabase
        .from('bookings')
        .select('id, booking_reference, status, booking_date, time_slot, people_count, place_name, created_at, activity_id')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    // Fetch event bookings — only paid bookings are shown.
    // Pending bookings are either abandoned flows or in-flight payments;
    // neither is useful to display in booking history.
    const { data: eventBookings } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_title, event_date, event_venue, tier_title, quantity, amount_paid, payment_status, booking_status, created_at')
        .eq('user_id', session.userId)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })

    const hasAny = (activityBookings?.length ?? 0) + (eventBookings?.length ?? 0) > 0

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px', maxWidth: 520, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <Link href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                    ← Back to Outsyd
                </Link>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                    My Account
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {session.name ? `${session.name} · ` : ''}{session.phone}
                </p>
            </div>

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                {[
                    { label: '📋 Bookings', href: '/account/bookings', active: true  },
                    { label: '❤️ Saved',   href: '/account/saved',    active: false },
                    { label: '⚙️ Settings', href: '/account/settings', active: false },
                ].map(tab => (
                    <Link key={tab.href} href={tab.href} style={{
                        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        textDecoration: 'none',
                        background: tab.active ? 'var(--accent)' : 'var(--bg-card)',
                        color: tab.active ? '#000' : 'var(--text-3)',
                        border: `1px solid ${tab.active ? 'var(--accent)' : 'var(--border)'}`,
                    }}>
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Empty state */}
            {!hasAny && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                        No bookings yet
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
                        Your bookings will appear here after you book an activity or event.
                    </div>
                    <Link href="/chennai/activities" style={{
                        padding: '12px 24px', borderRadius: 'var(--radius)',
                        background: 'var(--accent)', color: '#000',
                        fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    }}>
                        Explore Activities
                    </Link>
                </div>
            )}

            {hasAny && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* ── Event Bookings ───────────────────────────── */}
                    {eventBookings && eventBookings.length > 0 && (
                        <>
                            <SectionLabel>🎟 Event Tickets</SectionLabel>
                            {eventBookings.map(b => {
                                const cfg = EVENT_PAYMENT[b.payment_status] ?? EVENT_PAYMENT.pending
                                const amount = `₹${(b.amount_paid / 100).toLocaleString('en-IN')}`
                                return (
                                    <div key={b.id} style={card}>
                                        <div style={statusRow}>
                                            <span style={{ ...badge, color: cfg.color, background: `${cfg.color}18` }}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <span style={refStyle}>{b.booking_reference}</span>
                                        </div>
                                        <div style={title}>{b.event_title}</div>
                                        <div style={metaRow}>
                                            <span>📅 {fmtDate(b.event_date, true)}</span>
                                            {b.event_venue && <span>📍 {b.event_venue}</span>}
                                        </div>
                                        <div style={metaRow}>
                                            <span>🎫 {b.tier_title} × {b.quantity}</span>
                                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{amount}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}

                    {/* ── Activity Bookings ─────────────────────────── */}
                    {activityBookings && activityBookings.length > 0 && (
                        <>
                            <SectionLabel>🏄 Activity Bookings</SectionLabel>
                            {activityBookings.map(b => {
                                const cfg = ACTIVITY_STATUS[b.status] ?? ACTIVITY_STATUS.pending_vendor
                                return (
                                    <div key={b.id} style={card}>
                                        <div style={statusRow}>
                                            <span style={{ ...badge, color: cfg.color, background: `${cfg.color}18` }}>
                                                {cfg.icon} {cfg.label}
                                            </span>
                                            <span style={refStyle}>{b.booking_reference}</span>
                                        </div>
                                        <div style={title}>{b.place_name}</div>
                                        <div style={metaRow}>
                                            <span>📅 {fmtDate(b.booking_date)}</span>
                                            <span>🕐 {b.time_slot}</span>
                                            <span>👥 {b.people_count}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </div>
            )}
        </main>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 0 2px' }}>
            {children}
        </p>
    )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px 18px',
}
const statusRow: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
}
const badge: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
}
const refStyle: React.CSSProperties = {
    fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace',
}
const title: React.CSSProperties = {
    fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6,
}
const metaRow: React.CSSProperties = {
    display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap', marginBottom: 4,
}

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'My Bookings — Outsyd',
}
