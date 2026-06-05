'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

interface Props {
    vendorName?: string
    children: ReactNode
}

const navItems = [
    { label: 'Dashboard',   href: '/vendor-portal/dashboard',    icon: '⬡' },
    { label: 'Events',      href: '/vendor-portal/events',       icon: '🎟' },
    { label: 'Bookings',    href: '/vendor-portal/bookings',     icon: '📋' },
    { label: 'Coupons',     href: '/vendor-portal/coupons',      icon: '🏷' },
    { label: 'Settlements', href: '/vendor-portal/settlements',  icon: '💰' },
]

export default function VendorShell({ vendorName, children }: Props) {
    const router = useRouter()
    const path = typeof window !== 'undefined' ? window.location.pathname : ''

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/vendor-portal/login')
    }

    return (
        <div style={styles.root}>
            {/* Sidebar */}
            <aside style={styles.sidebar}>
                <div style={styles.brandWrap}>
                    <span style={styles.brandName}>outsyd</span>
                    <span style={styles.brandTag}>Vendors</span>
                </div>

                <nav style={styles.nav}>
                    {navItems.map(item => {
                        const active = path.startsWith(item.href)
                        return (
                            <a key={item.href} href={item.href} style={{
                                ...styles.navItem,
                                ...(active ? styles.navItemActive : {}),
                            }}>
                                <span style={styles.navIcon}>{item.icon}</span>
                                {item.label}
                            </a>
                        )
                    })}
                </nav>

                <div style={styles.sidebarFooter}>
                    <p style={styles.vendorName}>{vendorName ?? '—'}</p>
                    <button onClick={handleLogout} style={styles.logoutBtn}>Sign out</button>
                </div>
            </aside>

            {/* Main content */}
            <main style={styles.main}>
                {children}
            </main>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#e5e5e5',
    },
    sidebar: {
        width: 220,
        flexShrink: 0,
        backgroundColor: '#111',
        borderRight: '1px solid #1f1f1f',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
    },
    brandWrap: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 36,
        paddingLeft: 8,
    },
    brandName: { fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
    brandTag: {
        fontSize: 10, color: '#666', textTransform: 'uppercase',
        letterSpacing: '0.08em', fontWeight: 600,
    },
    nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        color: '#888',
        textDecoration: 'none',
        transition: 'all 0.15s',
    },
    navItemActive: {
        backgroundColor: '#1f1f1f',
        color: '#fff',
    },
    navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
    sidebarFooter: {
        borderTop: '1px solid #1f1f1f',
        paddingTop: 16,
        marginTop: 16,
    },
    vendorName: { fontSize: 12, color: '#555', marginBottom: 8, paddingLeft: 4 },
    logoutBtn: {
        background: 'none',
        border: '1px solid #2a2a2a',
        borderRadius: 6,
        color: '#666',
        fontSize: 12,
        padding: '6px 12px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
    },
    main: {
        flex: 1,
        padding: '32px 36px',
        overflowY: 'auto',
        maxWidth: 900,
    },
}
