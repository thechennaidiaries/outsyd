'use client'

/**
 * Customer login page — outsyd.in/account/login
 * Used when unauthenticated users try to access /account/bookings or /account/saved.
 * Supports ?next=/account/bookings to redirect after login.
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
    const router       = useRouter()
    const searchParams = useSearchParams()
    const nextUrl      = searchParams.get('next') || '/account/bookings'

    const [step, setStep]       = useState<'phone' | 'otp'>('phone')
    const [phone, setPhone]     = useState('')
    const [otp, setOtp]         = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState('')

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
            setStep('otp')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Invalid OTP')
            // Redirect to next page (e.g. /account/bookings)
            router.push(nextUrl)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.brand}>
                    <span style={styles.brandName}>outsyd</span>
                </div>

                <h1 style={styles.heading}>
                    {step === 'phone' ? 'Sign in to your account' : 'Enter your code'}
                </h1>
                <p style={styles.subheading}>
                    {step === 'phone'
                        ? "Enter your phone number to view your bookings."
                        : `Code sent to ${phone}. Check your WhatsApp.`}
                </p>

                {error && <div style={styles.errorBox}>{error}</div>}

                {step === 'phone' ? (
                    <form onSubmit={handleSendOtp} style={styles.form}>
                        <label style={styles.label}>Phone number</label>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            required
                            autoFocus
                            style={styles.input}
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Sending…' : 'Send OTP via WhatsApp'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} style={styles.form}>
                        <label style={styles.label}>6-digit code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="123456"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            autoFocus
                            style={{ ...styles.input, letterSpacing: '0.3em', textAlign: 'center' }}
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? 'Verifying…' : 'Verify & Sign In'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                            style={styles.linkButton}
                        >
                            ← Change number
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default function AccountLoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
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
        maxWidth: 400,
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: '40px 32px',
    },
    brand: {
        marginBottom: 28,
    },
    brandName: {
        fontSize: 22,
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.5px',
    },
    heading: {
        fontSize: 22,
        fontWeight: 700,
        color: '#ffffff',
        margin: '0 0 8px',
        letterSpacing: '-0.3px',
    },
    subheading: {
        fontSize: 14,
        color: '#888',
        margin: '0 0 28px',
        lineHeight: 1.5,
    },
    errorBox: {
        backgroundColor: '#2a1212',
        border: '1px solid #5a2020',
        borderRadius: 8,
        color: '#f87171',
        fontSize: 13,
        padding: '12px 14px',
        marginBottom: 20,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: 500,
        color: '#ccc',
        marginBottom: 2,
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 10,
        color: '#fff',
        fontSize: 15,
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '13px',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: 4,
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#888',
        fontSize: 13,
        cursor: 'pointer',
        padding: 0,
        textAlign: 'center',
        marginTop: 4,
    },
}
