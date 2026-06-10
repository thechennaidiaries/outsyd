/**
 * /vendor-portal/bookings
 * Full paginated list of all bookings across the vendor's events.
 */

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import VendorShell from '../_components/VendorShell'

function fmtMoney(paise: number) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'Pending',  color: '#facc15', bg: '#2a2200' },
    paid:     { label: 'Paid',     color: '#4ade80', bg: '#0a2a0a' },
    failed:   { label: 'Failed',   color: '#f87171', bg: '#2a0a0a' },
    refunded: { label: 'Refunded', color: '#60a5fa', bg: '#0a1a2a' },
}

export default async function VendorBookingsPage() {
    const session = await getSession()
    if (!session) redirect('/vendor-portal/login')

    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, name, brand_name, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor || vendor.status !== 'active') redirect('/vendor-portal/pending')

    const { data: bookings } = await supabase
        .from('event_bookings')
        .select('id, booking_reference, event_title, event_date, tier_title, quantity, amount_paid, payment_status, customer_name, customer_phone, created_at')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(100)

    const totalRevenue = (bookings ?? [])
        .filter(b => b.payment_status === 'paid')
        .reduce((s, b) => s + b.amount_paid, 0)

    return (
        <VendorShell vendorName={vendor.brand_name ?? vendor.name}>
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>Bookings</h1>
                    <p style={s.sub}>All ticket sales across your events</p>
                </div>
                <div style={s.revenuePill}>
                    Total Revenue: <strong style={{ color: '#4ade80' }}>{fmtMoney(totalRevenue)}</strong>
                </div>
            </div>

            {(!bookings || bookings.length === 0) ? (
                <div style={s.empty}>
                    <p style={{ fontSize: 32 }}>🎟</p>
                    <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>No bookings yet across any event.</p>
                </div>
            ) : (
                <div style={s.table}>
                    {/* Table header */}
                    <div style={{ ...s.tableRow, ...s.tableHead }}>
                        <span style={{ flex: 2 }}>Customer</span>
                        <span style={{ flex: 2 }}>Event / Tier</span>
                        <span style={{ flex: 1 }}>Qty</span>
                        <span style={{ flex: 1 }}>Amount</span>
                        <span style={{ flex: 1 }}>Status</span>
                        <span style={{ flex: 1, textAlign: 'right' }}>Date</span>
                    </div>

                    {bookings.map(b => {
                        const badge = STATUS_BADGE[b.payment_status] ?? STATUS_BADGE.pending
                        const date  = new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        return (
                            <div key={b.id} style={s.tableRow}>
                                <div style={{ flex: 2 }}>
                                    <p style={s.custName}>{b.customer_name}</p>
                                    <p style={s.custPhone}>{b.customer_phone}</p>
                                </div>
                                <div style={{ flex: 2 }}>
                                    <p style={s.eventName}>{b.event_title}</p>
                                    <p style={s.tierName}>{b.tier_title}</p>
                                </div>
                                <span style={{ flex: 1, fontSize: 13, color: '#ccc' }}>{b.quantity}</span>
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>{fmtMoney(b.amount_paid)}</span>
                                <span style={{ flex: 1 }}>
                                    <span style={{ ...s.badge, color: badge.color, backgroundColor: badge.bg }}>
                                        {badge.label}
                                    </span>
                                </span>
                                <span style={{ flex: 1, fontSize: 12, color: '#666', textAlign: 'right' }}>{date}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </VendorShell>
    )
}

const s: Record<string, React.CSSProperties> = {
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
    title:  { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' },
    sub:    { fontSize: 13, color: '#666', margin: 0 },
    revenuePill: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#888' },
    empty:  { textAlign: 'center', padding: '80px 0' },
    table:  { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, overflow: 'hidden' },
    tableHead: { backgroundColor: '#111', borderBottom: '1px solid #2a2a2a' },
    tableRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid #1a1a1a', fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
    custName:  { fontSize: 13, fontWeight: 600, color: '#e5e5e5', margin: '0 0 2px' },
    custPhone: { fontSize: 11, color: '#555', margin: 0 },
    eventName: { fontSize: 13, fontWeight: 500, color: '#ccc', margin: '0 0 2px' },
    tierName:  { fontSize: 11, color: '#555', margin: 0 },
    badge: { fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 8px' },
}

export const dynamic = 'force-dynamic'
