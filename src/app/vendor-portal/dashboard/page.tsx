/**
 * /vendor-portal/dashboard
 * Overview: revenue stats, recent bookings, event status summary.
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import VendorShell from '../_components/VendorShell'
import Link from 'next/link'

function fmtMoney(paise: number) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default async function VendorDashboardPage() {
    const session = await getSession()
    if (!session) redirect('/vendor-portal/login')

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, name, brand_name, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor) redirect('/vendor-portal/signup')
    if (vendor.status === 'pending_approval') redirect('/vendor-portal/pending')
    if (vendor.status === 'suspended') redirect('/vendor-portal/suspended')

    const displayName = vendor.brand_name ?? vendor.name

    // ── Stats ──────────────────────────────────────────────────────────────────
    const { data: events } = await supabase
        .from('events')
        .select('id, approval_status, booking_enabled')
        .eq('vendor_id', vendor.id)

    const totalEvents   = events?.length ?? 0
    const liveEvents    = events?.filter(e => e.approval_status === 'approved').length ?? 0
    const draftEvents   = events?.filter(e => e.approval_status === 'draft').length ?? 0
    const pendingReview = events?.filter(e => e.approval_status === 'submitted').length ?? 0

    const eventIds = (events ?? []).map(e => e.id)

    // Bookings & revenue
    let totalRevenue   = 0
    let totalBookings  = 0
    let recentBookings: any[] = []

    if (eventIds.length > 0) {
        const { data: bookings } = await supabase
            .from('event_bookings')
            .select('id, booking_reference, event_title, event_date, tier_title, quantity, amount_paid, payment_status, customer_name, created_at')
            .eq('vendor_id', vendor.id)
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false })

        totalRevenue  = (bookings ?? []).reduce((s, b) => s + b.amount_paid, 0)
        totalBookings = bookings?.length ?? 0
        recentBookings = (bookings ?? []).slice(0, 5)
    }

    return (
        <VendorShell vendorName={displayName}>
            <div style={s.pageHeader}>
                <div>
                    <h1 style={s.pageTitle}>Dashboard</h1>
                    <p style={s.pageSub}>Welcome back, {displayName} 👋</p>
                </div>
                <Link href="/vendor-portal/events/new" style={s.createBtn}>+ New Event</Link>
            </div>

            {/* ── Stats Grid ──────────────────────────────────────── */}
            <div style={s.statsGrid}>
                <StatCard label="Total Revenue" value={fmtMoney(totalRevenue)} icon="💰" accent />
                <StatCard label="Paid Bookings" value={totalBookings.toString()} icon="🎟" />
                <StatCard label="Live Events"   value={liveEvents.toString()}   icon="✅" />
                <StatCard label="Drafts"        value={draftEvents.toString()}  icon="📝" />
            </div>

            {/* ── Alert: pending review ────────────────────────────── */}
            {pendingReview > 0 && (
                <div style={s.alertBox}>
                    ⏳ <strong>{pendingReview} event{pendingReview > 1 ? 's' : ''}</strong> waiting for Outsyd review.
                </div>
            )}

            {/* ── Recent Bookings ──────────────────────────────────── */}
            <div style={s.section}>
                <div style={s.sectionHeader}>
                    <h2 style={s.sectionTitle}>Recent Bookings</h2>
                    <Link href="/vendor-portal/bookings" style={s.viewAll}>View all →</Link>
                </div>

                {recentBookings.length === 0 ? (
                    <p style={s.empty}>No paid bookings yet. Share your event links to get started!</p>
                ) : (
                    <div style={s.bookingList}>
                        {recentBookings.map(b => (
                            <div key={b.id} style={s.bookingRow}>
                                <div style={{ flex: 1 }}>
                                    <p style={s.bookingName}>{b.customer_name}</p>
                                    <p style={s.bookingMeta}>{b.event_title} · {b.tier_title} × {b.quantity}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={s.bookingAmount}>{fmtMoney(b.amount_paid)}</p>
                                    <p style={s.bookingDate}>{fmtDate(b.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Event Status Summary ─────────────────────────────── */}
            <div style={s.section}>
                <div style={s.sectionHeader}>
                    <h2 style={s.sectionTitle}>Your Events</h2>
                    <Link href="/vendor-portal/events" style={s.viewAll}>Manage →</Link>
                </div>
                {totalEvents === 0 ? (
                    <p style={s.empty}>
                        No events yet.{' '}
                        <Link href="/vendor-portal/events/new" style={{ color: '#aaa' }}>Create your first event →</Link>
                    </p>
                ) : (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Live',      count: liveEvents,    color: '#4ade80' },
                            { label: 'In Review', count: pendingReview, color: '#facc15' },
                            { label: 'Drafts',    count: draftEvents,   color: '#888'    },
                        ].map(item => (
                            <div key={item.label} style={{ ...s.eventStat, borderColor: `${item.color}33` }}>
                                <p style={{ ...s.eventStatNum, color: item.color }}>{item.count}</p>
                                <p style={s.eventStatLabel}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </VendorShell>
    )
}

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent?: boolean }) {
    return (
        <div style={{
            backgroundColor: accent ? '#141f14' : '#141414',
            border: `1px solid ${accent ? '#1a3a1a' : '#2a2a2a'}`,
            borderRadius: 12, padding: '18px 20px',
        }}>
            <p style={{ fontSize: 22, margin: '0 0 2px' }}>{icon}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{value}</p>
            <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{label}</p>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
    pageTitle:  { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' },
    pageSub:    { fontSize: 13, color: '#666', margin: 0 },
    createBtn:  { padding: '9px 18px', backgroundColor: '#fff', color: '#000', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' },
    statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
    alertBox:   { backgroundColor: '#1a1a08', border: '1px solid #3a3a10', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#facc15', marginBottom: 16 },
    section:    { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 22px', marginBottom: 16 },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle:  { fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 },
    viewAll:    { fontSize: 12, color: '#666', textDecoration: 'none' },
    empty:      { fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 },
    bookingList: { display: 'flex', flexDirection: 'column', gap: 12 },
    bookingRow:  { display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 12, borderBottom: '1px solid #1f1f1f' },
    bookingName: { fontSize: 13, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    bookingMeta: { fontSize: 12, color: '#666', margin: 0 },
    bookingAmount: { fontSize: 14, fontWeight: 700, color: '#4ade80', margin: '0 0 2px' },
    bookingDate:   { fontSize: 11, color: '#555', margin: 0 },
    eventStat:  { backgroundColor: '#1a1a1a', border: '1px solid', borderRadius: 10, padding: '14px 20px', minWidth: 90, textAlign: 'center' },
    eventStatNum:   { fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' },
    eventStatLabel: { fontSize: 12, color: '#666', margin: 0 },
}

export const dynamic = 'force-dynamic'
