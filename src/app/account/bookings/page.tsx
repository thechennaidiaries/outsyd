/**
 * /account/bookings — Booking history page (server component).
 * Primary destination after completing a booking.
 */

import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Booking {
    id: string
    booking_reference: string
    status: string
    booking_date: string
    time_slot: string
    people_count: number
    place_name: string
    created_at: string
    activity_id: string
}

// ── Status display helpers ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
    pending_vendor:  { label: 'Awaiting confirmation', color: '#f59e0b', icon: '⏳' },
    confirmed:       { label: 'Confirmed',             color: '#22c55e', icon: '✅' },
    rejected:        { label: 'Unavailable',           color: '#ef4444', icon: '❌' },
    manual_followup: { label: 'Being reviewed',        color: '#8b5cf6', icon: '🔄' },
    cancelled:       { label: 'Cancelled',             color: '#6b7280', icon: '✖️'  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BookingsPage() {
    const session = await getSession()
    if (!session) redirect('/')

    // Fetch user's bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('id, booking_reference, status, booking_date, time_slot, people_count, place_name, created_at, activity_id')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false })

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>

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
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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
            {(!bookings || bookings.length === 0) && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '48px 24px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                        No bookings yet
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
                        Your booking requests will appear here after you submit them.
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

            {/* Bookings list */}
            {bookings && bookings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {bookings.map((booking) => {
                        const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending_vendor
                        const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-IN', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                        })

                        return (
                            <div key={booking.id} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)', padding: '16px 18px',
                            }}>
                                {/* Status row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700, color: cfg.color,
                                        background: `${cfg.color}18`, borderRadius: 20, padding: '3px 10px',
                                    }}>
                                        {cfg.icon} {cfg.label}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace' }}>
                                        {booking.booking_reference}
                                    </span>
                                </div>

                                {/* Details */}
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                                    {booking.place_name}
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)' }}>
                                    <span>📅 {formattedDate}</span>
                                    <span>🕐 {booking.time_slot}</span>
                                    <span>👥 {booking.people_count}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'My Bookings — Outsyd',
}
