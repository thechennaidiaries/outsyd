/**
 * /events/booking/[ref]/return
 *
 * Cashfree redirects here after payment (success or failure).
 * Polls the booking status until confirmed, then shows the result.
 *
 * Note: useSearchParams() is intentionally avoided here — `order_id` from
 * the query string is not needed for polling (we use `ref` from params).
 * This avoids the Next.js 14 Suspense requirement for useSearchParams.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookingReturnPage({
    params,
}: {
    params: { ref: string }
}) {
    const { ref } = params
    const router  = useRouter()

    const [status, setStatus]   = useState<'checking' | 'confirmed' | 'pending' | 'failed'>('checking')
    const [booking, setBooking] = useState<any>(null)

    // ── Poll booking status ────────────────────────────────────────────────────
    useEffect(() => {
        let attempts = 0
        let interval: NodeJS.Timeout

        const checkStatus = async () => {
            attempts++
            try {
                const res  = await fetch(`/api/events/booking/${ref}/status`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.paymentStatus === 'paid') {
                        setStatus('confirmed')
                        setBooking(data)
                        clearInterval(interval)
                        return true
                    } else if (data.paymentStatus === 'failed') {
                        setStatus('failed')
                        clearInterval(interval)
                        return true
                    } else if (attempts >= 12) {
                        setStatus('pending')
                        setBooking(data)
                        clearInterval(interval)
                        return true
                    }
                } else if (attempts >= 12) {
                    setStatus('pending')
                    clearInterval(interval)
                    return true
                }
            } catch {
                if (attempts >= 12) {
                    setStatus('pending')
                    clearInterval(interval)
                    return true
                }
            }
            return false
        }

        // Run immediately on mount, then start interval if not finished
        checkStatus().then((done) => {
            if (!done) {
                interval = setInterval(checkStatus, 1500)
            }
        })

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [ref])

    // ── Format date ────────────────────────────────────────────────────────────
    function fmtDate(iso: string) {
        const [y, m, d] = iso.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
    }

    return (
        <div style={s.page}>
            <div style={s.card}>
                {/* Brand */}
                <div style={s.brand}>outsyd</div>

                {/* ── Checking ── */}
                {status === 'checking' && (
                    <>
                        <div style={s.spinner} />
                        <h1 style={s.heading}>Confirming your booking…</h1>
                        <p style={s.sub}>Please wait, this usually takes a few seconds.</p>
                    </>
                )}

                {/* ── Confirmed ── */}
                {status === 'confirmed' && booking && (
                    <>
                        <div style={s.iconBig}>🎟️</div>
                        <h1 style={{ ...s.heading, color: '#4ade80' }}>Booking Confirmed!</h1>
                        <p style={s.sub}>Your booking details have been sent to your WhatsApp.</p>

                        {/* Ref */}
                        <div style={s.refBox}>
                            <p style={s.refLabel}>Booking Reference</p>
                            <p style={s.refCode}>{ref}</p>
                        </div>

                        {/* Details */}
                        <div style={s.detailBox}>
                            <DetailRow label="Event"   value={booking.eventTitle} />
                            {booking.eventDate && (
                                <DetailRow label="Date" value={fmtDate(booking.eventDate)} />
                            )}
                            {booking.eventVenue && (
                                <DetailRow label="Venue" value={booking.eventVenue} />
                            )}
                            {booking.tickets && booking.tickets.length > 0 ? (
                                booking.tickets.map((t: any, idx: number) => (
                                    <DetailRow
                                        key={idx}
                                        label={`Ticket (${t.tierTitle})`}
                                        value={`${t.quantity}`}
                                    />
                                ))
                            ) : (
                                <DetailRow
                                    label="Tickets"
                                    value={`${booking.quantity} × ${booking.tierTitle}`}
                                />
                            )}
                            <DetailRow
                                label="Amount paid"
                                value={`₹${(booking.amountPaid / 100).toLocaleString('en-IN')}`}
                            />
                        </div>

                        {/* CTAs */}
                        <div style={s.btnGroup}>
                            <button
                                onClick={() => router.push('/account/bookings')}
                                style={s.btnPrimary}
                            >
                                View My Bookings →
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                style={s.btnGhost}
                            >
                                Back to Events
                            </button>
                        </div>
                    </>
                )}

                {/* ── Still processing ── */}
                {status === 'pending' && (
                    <>
                        <div style={s.iconBig}>⏳</div>
                        <h1 style={s.heading}>Almost there…</h1>
                        <p style={s.sub}>
                            Your payment was received but confirmation is taking longer than usual.
                            We'll send you a WhatsApp once it's done.
                        </p>
                        <div style={s.refBox}>
                            <p style={s.refLabel}>Keep this reference</p>
                            <p style={s.refCode}>{ref}</p>
                        </div>
                        <a
                            href="https://wa.me/917305554166"
                            style={s.waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            📲 Contact Support
                        </a>
                    </>
                )}

                {/* ── Failed ── */}
                {status === 'failed' && (
                    <>
                        <div style={s.iconBig}>❌</div>
                        <h1 style={{ ...s.heading, color: '#f87171' }}>Payment failed</h1>
                        <p style={s.sub}>
                            Your payment didn't go through. No money was deducted.
                        </p>
                        <button onClick={() => router.back()} style={s.btnPrimary}>
                            Try again
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
            <span style={{ fontSize: 13, color: '#666', flexShrink: 0 }}>{label}</span>
            <span style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 600, textAlign: 'right' }}>{value}</span>
        </div>
    )
}

const s: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0a0a0a', padding: '24px 16px', fontFamily: 'Inter, system-ui, sans-serif',
    },
    card: {
        width: '100%', maxWidth: 420, backgroundColor: '#141414', border: '1px solid #2a2a2a',
        borderRadius: 16, padding: '40px 32px', textAlign: 'center',
    },
    brand:    { fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 32 },
    spinner:  {
        width: 36, height: 36, border: '3px solid #2a2a2a', borderTop: '3px solid #fff',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px',
    },
    iconBig:  { fontSize: 48, marginBottom: 20 },
    heading:  { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.3px' },
    sub:      { fontSize: 14, color: '#888', lineHeight: 1.6, margin: '0 0 24px' },

    refBox:   {
        backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: 10, padding: '16px', marginBottom: 20,
    },
    refLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' },
    refCode:  { fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.05em', margin: 0 },

    detailBox: { textAlign: 'left', marginBottom: 24, borderTop: '1px solid #1f1f1f', paddingTop: 20 },

    btnGroup:   { display: 'flex', flexDirection: 'column', gap: 10 },
    btnPrimary: {
        width: '100%', padding: '13px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    btnGhost: {
        width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#555',
        border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 14, cursor: 'pointer',
    },
    waLink: {
        display: 'inline-block', fontSize: 14, fontWeight: 600,
        color: '#4ade80', textDecoration: 'none', marginTop: 8,
    },
}
