'use client'

import { useEffect, useState } from 'react'
import VendorShell from '../_components/VendorShell'

export default function VendorCouponsPage() {
    const [vendorName, setVendorName] = useState('')

    useEffect(() => {
        fetch('/api/vendor/me').then(r => r.json()).then(d => {
            if (d.vendor) {
                setVendorName(d.vendor.brandName ?? d.vendor.name)
            }
        })
    }, [])

    return (
        <VendorShell vendorName={vendorName}>
            <div style={s.container}>
                <div style={s.icon}>🏷️</div>
                <h1 style={s.title}>Coupons</h1>
                <p style={s.sub}>Create, view, and manage discount coupons for your events.</p>
                <div style={s.badge}>Coming Soon</div>
            </div>
        </VendorShell>
    )
}

const s: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        textAlign: 'center',
        maxWidth: 600,
        margin: '40px auto 0',
    },
    icon: {
        fontSize: 48,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 800,
        color: '#fff',
        margin: '0 0 8px',
        letterSpacing: '-0.5px',
    },
    sub: {
        fontSize: 14,
        color: '#666',
        lineHeight: 1.6,
        margin: '0 0 24px',
        maxWidth: 360,
    },
    badge: {
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: '#1a1a08',
        border: '1px solid #3a3a10',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: '#facc15',
    },
}
