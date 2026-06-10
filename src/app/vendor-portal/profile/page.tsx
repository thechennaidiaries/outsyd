import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'
import VendorShell from '../_components/VendorShell'

export default async function VendorProfilePage() {
    const session = await getSession()
    if (!session) redirect('/vendor-portal/login')

    const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor) redirect('/vendor-portal/signup')
    if (vendor.status === 'pending_approval') redirect('/vendor-portal/pending')
    if (vendor.status === 'suspended') redirect('/vendor-portal/suspended')

    const displayName = vendor.brand_name ?? vendor.name

    return (
        <VendorShell vendorName={displayName}>
            <div style={s.header}>
                <h1 style={s.title}>Vendor Profile</h1>
                <p style={s.sub}>Your account details and contact information.</p>
            </div>

            <div style={s.card}>
                <h2 style={s.cardTitle}>Account Details</h2>
                <div style={s.detailsGrid}>
                    <DetailItem label="Contact Name" value={vendor.name} />
                    <DetailItem label="Brand / Organisation Name" value={vendor.brand_name ?? '—'} />
                    <DetailItem label="Phone Number" value={vendor.phone ?? session.phone ?? '—'} />
                    <DetailItem label="Email Address" value={vendor.email ?? '—'} />
                    <DetailItem label="Account Status" value={vendor.status.toUpperCase()} isStatus statusColor={vendor.status === 'active' ? '#4ade80' : '#facc15'} />
                    <DetailItem label="Member Since" value={new Date(vendor.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                </div>
            </div>
        </VendorShell>
    )
}

function DetailItem({ label, value, isStatus, statusColor }: { label: string; value: string; isStatus?: boolean; statusColor?: string }) {
    return (
        <div style={s.detailItem}>
            <span style={s.detailLabel}>{label}</span>
            {isStatus ? (
                <span style={{ ...s.statusBadge, color: statusColor, backgroundColor: `${statusColor}18`, borderColor: `${statusColor}33` }}>
                    ● {value}
                </span>
            ) : (
                <span style={s.detailValue}>{value}</span>
            )}
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    header: { marginBottom: 28 },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' },
    sub: { fontSize: 13, color: '#666', margin: 0 },
    card: { backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 12, padding: '24px 28px', maxWidth: 600 },
    cardTitle: { fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 20px', borderBottom: '1px solid #222', paddingBottom: 12 },
    detailsGrid: { display: 'flex', flexDirection: 'column', gap: 18 },
    detailItem: { display: 'flex', justifyContent: 'flex-start', borderBottom: '1px solid #1a1a1a', paddingBottom: 14, flexWrap: 'wrap', gap: 12 },
    detailLabel: { fontSize: 13, color: '#666', fontWeight: 500, width: 200, flexShrink: 0 },
    detailValue: { fontSize: 14, color: '#e5e5e5', fontWeight: 600, wordBreak: 'break-all' },
    statusBadge: { fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', border: '1px solid', textTransform: 'uppercase', letterSpacing: '0.05em' },
}

export const dynamic = 'force-dynamic'
