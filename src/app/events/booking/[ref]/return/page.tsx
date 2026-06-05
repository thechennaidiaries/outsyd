/**
 * /events/booking/[ref]/return
 *
 * Cashfree redirects here after payment (success or failure).
 * We show appropriate state while the webhook processes in the background.
 */

'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function BookingReturnPage({
    params,
}: {
    params: { ref: string }
}) {
    const { ref } = params
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get('order_id')

    const [status, setStatus] = useState<'checking' | 'confirmed' | 'pending' | 'failed'>('checking')
    const [booking, setBooking] = useState<any>(null)

    useEffect(() => {
        // Poll every 3s for up to 36s — Cashfree sandbox can be slow
        let attempts = 0
        const interval = setInterval(async () => {
            attempts++
            const res = await fetch(`/api/events/booking/${ref}/status`)
            if (res.ok) {
                const data = await res.json()
                if (data.paymentStatus === 'paid') {
                    setStatus('confirmed')
                    setBooking(data)
                    clearInterval(interval)
                } else if (data.paymentStatus === 'failed') {
                    setStatus('failed')
                    clearInterval(interval)
                } else if (attempts >= 12) {
                    setStatus('pending')
                    setBooking(data)
                    clearInterval(interval)
                }
            } else if (attempts >= 12) {
                setStatus('pending')
                clearInterval(interval)
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [ref])

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.brand}>
                    <span style={styles.brandName}>outsyd</span>
                </div>

                {status === 'checking' && (
                    <>
                        <div style={styles.spinner} />
                        <h1 style={styles.heading}>Confirming your booking…</h1>
                        <p style={styles.sub}>Please wait, this usually takes a few seconds.</p>
                    </>
                )}

                {status === 'confirmed' && booking && (
                    <>
                        <div style={styles.iconBig}>🎟</div>
                        <h1 style={{ ...styles.heading, color: '#4ade80' }}>You're in!</h1>
                        <p style={styles.sub}>Booking confirmed. Check your WhatsApp for details.</p>
                        <div style={styles.refBox}>
                            <p style={styles.refLabel}>Booking Reference</p>
                            <p style={styles.refCode}>{ref}</p>
                        </div>
                        <div style={styles.detailBox}>
                            <p style={styles.detailRow}><span>Event</span><strong>{booking.eventTitle}</strong></p>
                            <p style={styles.detailRow}><span>Tickets</span><strong>{booking.quantity} × {booking.tierTitle}</strong></p>
                            <p style={styles.detailRow}><span>Amount</span><strong>₹{(booking.amountPaid / 100).toLocaleString('en-IN')}</strong></p>
                        </div>
        <button
                            onClick={() => window.location.href = 'https://outsyd.in/account/bookings'}
                            style={styles.btn}
                        >
                            View My Bookings →
                        </button>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <div style={styles.iconBig}>⏳</div>
                        <h1 style={styles.heading}>Almost there…</h1>
                        <p style={styles.sub}>
                            Your payment was received but the booking is still being confirmed.
                            If it doesn't show up in a few minutes, WhatsApp us with your reference.
                        </p>
                        <div style={styles.refBox}>
                            <p style={styles.refLabel}>Keep this reference</p>
                            <p style={styles.refCode}>{ref}</p>
                        </div>
                        <a href="https://wa.me/917305554166" style={styles.waLink} target="_blank" rel="noopener noreferrer">
                            📲 Contact Support
                        </a>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div style={styles.iconBig}>❌</div>
                        <h1 style={{ ...styles.heading, color: '#f87171' }}>Payment failed</h1>
                        <p style={styles.sub}>
                            Your payment didn't go through. No money was deducted.
                            Please try again.
                        </p>
                        <button onClick={() => router.back()} style={styles.btn}>Try again</button>
                    </>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0a0a0a', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif',
    },
    card: {
        width: '100%', maxWidth: 420, backgroundColor: '#141414', border: '1px solid #2a2a2a',
        borderRadius: 16, padding: '40px 32px', textAlign: 'center',
    },
    brand: { marginBottom: 32 },
    brandName: { fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' },
    spinner: {
        width: 36, height: 36, border: '3px solid #2a2a2a', borderTop: '3px solid #fff',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px',
    },
    iconBig: { fontSize: 48, marginBottom: 20 },
    heading: { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' },
    sub: { fontSize: 14, color: '#888', lineHeight: 1.6, margin: '0 0 24px' },
    refBox: {
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: 10, padding: '16px', marginBottom: 20,
    },
    refLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' },
    refCode: { fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', margin: 0 },
    detailBox: { textAlign: 'left', marginBottom: 24 },
    detailRow: {
        display: 'flex', justifyContent: 'space-between',
        fontSize: 13, color: '#888', margin: '0 0 8px',
    },
    btn: {
        width: '100%', padding: '13px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    waLink: {
        display: 'inline-block', fontSize: 14, fontWeight: 600, color: '#4ade80', textDecoration: 'none', marginTop: 8,
    },
}
