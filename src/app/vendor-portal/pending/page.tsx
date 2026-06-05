/**
 * Vendor Portal — Pending Approval Page
 * vendors.outsyd.in/pending
 *
 * Shown after signup while Outsyd reviews the vendor application.
 */

export default function VendorPendingPage() {
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.brand}>
                    <span style={styles.brandName}>outsyd</span>
                    <span style={styles.brandTag}>Vendor Portal</span>
                </div>

                <div style={styles.icon}>⏳</div>
                <h1 style={styles.heading}>Application submitted</h1>
                <p style={styles.body}>
                    Thanks for applying! Our team will review your application and
                    get back to you within <strong style={{ color: '#fff' }}>24 hours</strong>.
                </p>
                <p style={styles.body}>
                    We'll send you a WhatsApp message once your account is approved
                    and you're ready to start listing events.
                </p>

                <div style={styles.infoBox}>
                    <p style={styles.infoText}>Questions? Reach us at</p>
                    <a href="https://wa.me/917305554166" style={styles.waLink} target="_blank" rel="noopener noreferrer">
                        📲 WhatsApp us
                    </a>
                </div>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        padding: '24px 16px',
        fontFamily: 'Inter, system-ui, sans-serif',
    },
    card: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: '40px 36px',
        textAlign: 'center',
    },
    brand: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 36, justifyContent: 'center' },
    brandName: { fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' },
    brandTag: {
        fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase',
        letterSpacing: '0.08em', backgroundColor: '#1f1f1f', border: '1px solid #2a2a2a',
        borderRadius: 4, padding: '2px 8px',
    },
    icon: { fontSize: 40, marginBottom: 20 },
    heading: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.3px' },
    body: { fontSize: 14, color: '#888', lineHeight: 1.7, margin: '0 0 12px' },
    infoBox: {
        marginTop: 28,
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 10,
        padding: '16px 20px',
    },
    infoText: { fontSize: 13, color: '#666', margin: '0 0 8px' },
    waLink: {
        display: 'inline-block',
        fontSize: 14,
        fontWeight: 600,
        color: '#4ade80',
        textDecoration: 'none',
    },
}
