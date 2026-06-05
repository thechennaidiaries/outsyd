/**
 * /vendor-portal/settlements
 * Shows per-event revenue breakdown and payout status.
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import VendorShell from '../_components/VendorShell'

function fmtMoney(paise: number) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`
}

const PAYOUT_BADGE: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#facc15' },
    paid:    { label: 'Paid',    color: '#4ade80' },
}

export default async function VendorSettlementsPage() {
    const session = await getSession()
    if (!session) redirect('/vendor-portal/login')

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, name, brand_name, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor || vendor.status !== 'active') redirect('/vendor-portal/pending')

    const displayName = vendor.brand_name ?? vendor.name

    // ── Settlements ────────────────────────────────────────────────────────────
    const { data: settlements } = await supabase
        .from('vendor_settlements')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })

    // ── Per-event revenue (bookings not yet settled) ───────────────────────────
    const { data: events } = await supabase
        .from('events')
        .select('id, title, date, approval_status')
        .eq('vendor_id', vendor.id)
        .eq('approval_status', 'approved')

    const unsettledEventIds = (events ?? [])
        .filter(ev => !(settlements ?? []).find(s => s.event_id === ev.id))
        .map(ev => ev.id)

    let unsettledBookings: any[] = []
    if (unsettledEventIds.length > 0) {
        const { data: b } = await supabase
            .from('event_bookings')
            .select('event_id, event_title, event_date, amount_paid, service_fee_amount, discount_amount, quantity')
            .in('event_id', unsettledEventIds)
            .eq('payment_status', 'paid')
        unsettledBookings = b ?? []
    }

    // Group by event
    const unsettledByEvent: Record<string, { title: string; date: string; gross: number; fee: number; net: number; tickets: number }> = {}
    for (const b of unsettledBookings) {
        if (!unsettledByEvent[b.event_id]) {
            unsettledByEvent[b.event_id] = { title: b.event_title, date: b.event_date, gross: 0, fee: 0, net: 0, tickets: 0 }
        }
        unsettledByEvent[b.event_id].gross   += b.amount_paid
        unsettledByEvent[b.event_id].fee     += b.service_fee_amount
        unsettledByEvent[b.event_id].net     += (b.amount_paid - b.service_fee_amount)
        unsettledByEvent[b.event_id].tickets += b.quantity
    }

    const totalPaid = (settlements ?? []).filter(s => s.payout_status === 'paid').reduce((sum, s) => sum + s.estimated_payout, 0)
    const totalPending = Object.values(unsettledByEvent).reduce((sum, e) => sum + e.net, 0)

    return (
        <VendorShell vendorName={displayName}>
            <h1 style={s.title}>Settlements</h1>

            {/* Summary */}
            <div style={s.summaryGrid}>
                <div style={s.summaryCard}>
                    <p style={s.summaryNum}>{fmtMoney(totalPending)}</p>
                    <p style={s.summaryLabel}>Pending payout</p>
                </div>
                <div style={s.summaryCard}>
                    <p style={{ ...s.summaryNum, color: '#4ade80' }}>{fmtMoney(totalPaid)}</p>
                    <p style={s.summaryLabel}>Total paid out</p>
                </div>
            </div>

            {/* ── Unsettled events ────────────────────────────────────── */}
            {Object.keys(unsettledByEvent).length > 0 && (
                <div style={s.section}>
                    <h2 style={s.sectionTitle}>Pending Settlement</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(unsettledByEvent).map(([evId, ev]) => (
                            <div key={evId} style={s.row}>
                                <div style={{ flex: 1 }}>
                                    <p style={s.evTitle}>{ev.title}</p>
                                    <p style={s.evMeta}>{ev.tickets} tickets · {fmtMoney(ev.gross)} gross · {fmtMoney(ev.fee)} platform fee</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={s.netAmount}>{fmtMoney(ev.net)}</p>
                                    <p style={s.evMeta}>Your payout</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={s.noteBox}>
                        ℹ️ Payouts are processed within 3–5 business days after the event.
                    </div>
                </div>
            )}

            {/* ── Past settlements ────────────────────────────────────── */}
            <div style={s.section}>
                <h2 style={s.sectionTitle}>Past Settlements</h2>
                {(!settlements || settlements.length === 0) ? (
                    <p style={s.empty}>No settlements yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {settlements.map(s => {
                            const badge = PAYOUT_BADGE[s.payout_status] ?? PAYOUT_BADGE.pending
                            return (
                                <div key={s.id} style={ss.row}>
                                    <div style={{ flex: 1 }}>
                                        <p style={ss.evTitle}>Settlement #{s.id.slice(0, 8)}</p>
                                        <p style={ss.evMeta}>
                                            {fmtMoney(s.gross_sales)} gross · {fmtMoney(s.platform_fee)} fee · {fmtMoney(s.refunds)} refunds
                                        </p>
                                        {s.payout_reference && (
                                            <p style={{ ...ss.evMeta, marginTop: 2, color: '#4ade80' }}>Ref: {s.payout_reference}</p>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ ...ss.netAmount, color: s.payout_status === 'paid' ? '#4ade80' : '#facc15' }}>
                                            {fmtMoney(s.estimated_payout)}
                                        </p>
                                        <span style={{ ...ss.badge, color: badge.color }}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </VendorShell>
    )
}

const s: Record<string, React.CSSProperties> = {
    title:       { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.3px' },
    summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
    summaryCard: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 22px' },
    summaryNum:  { fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.5px' },
    summaryLabel:{ fontSize: 12, color: '#666', margin: 0 },
    section:     { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '20px 22px', marginBottom: 16 },
    sectionTitle:{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' },
    row:         { display: 'flex', alignItems: 'center', gap: 16, backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 16px' },
    evTitle:     { fontSize: 13, fontWeight: 600, color: '#e5e5e5', margin: '0 0 3px' },
    evMeta:      { fontSize: 12, color: '#666', margin: 0 },
    netAmount:   { fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 3px' },
    noteBox:     { marginTop: 14, backgroundColor: '#1a1a08', border: '1px solid #3a3a10', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#aaa' },
    empty:       { fontSize: 13, color: '#555', margin: 0 },
}

// Alias for settlement rows (same styles, different var name to avoid TS issue)
const ss = s

export const dynamic = 'force-dynamic'
