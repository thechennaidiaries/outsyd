'use client'

/**
 * Vendor Portal Signup / Apply Page
 * vendors.outsyd.in/signup
 *
 * Two cases:
 * A) User is not logged in → show OTP first, then profile form
 * B) User is already logged in → show profile form directly
 *
 * On submit: POST /api/vendor/register → status: pending_approval
 * Then redirect to /vendor-portal/pending
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'phone' | 'otp' | 'profile' | 'done'

export default function VendorSignupPage() {
    const router  = useRouter()
    const [step, setStep]         = useState<Step>('phone')
    const [phone, setPhone]       = useState('')
    const [otp, setOtp]           = useState('')
    const [name, setName]         = useState('')
    const [brandName, setBrandName] = useState('')
    const [email, setEmail]       = useState('')
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState('')
    const [checkingSession, setCheckingSession] = useState(true)

    // Check if already logged in
    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user) {
                    if (data.user.name) setName(data.user.name)
                    if (data.user.phone_number) {
                        const digits = data.user.phone_number.replace(/^\+91/, '').replace(/\D/g, '').slice(-10)
                        setPhone(digits)
                    }
                    // Already logged in — check if already a vendor
                    fetch('/api/vendor/me').then(r => {
                        if (r.ok) router.push('/vendor-portal/dashboard')
                        else setStep('profile')
                    })
                }
            })
            .finally(() => setCheckingSession(false))
    }, [router])

    async function handleSendOtp(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+91${phone}` }),
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
                body: JSON.stringify({ phone: `+91${phone}`, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Invalid OTP')
            // Check existing vendor
            const meRes = await fetch('/api/vendor/me')
            if (meRes.ok) {
                router.push('/vendor-portal/dashboard')
            } else {
                setStep('profile')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/vendor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, brandName, email, phone: `+91${phone}` }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Registration failed')
            router.push('/vendor-portal/pending')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (checkingSession) {
        return <div style={styles.page}><div style={styles.card}><p style={{ color: '#666', textAlign: 'center' }}>Loading…</p></div></div>
    }

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.brand}>
                    <span style={styles.brandName}>outsyd</span>
                    <span style={styles.brandTag}>Vendor Portal</span>
                </div>

                {/* Progress steps */}
                <div style={styles.steps}>
                    {['Verify', 'Profile', 'Review'].map((s, i) => {
                        const stepIndex = step === 'phone' || step === 'otp' ? 0 : step === 'profile' ? 1 : 2
                        return (
                            <div key={s} style={styles.stepItem}>
                                <div style={{
                                    ...styles.stepDot,
                                    backgroundColor: i <= stepIndex ? '#ffffff' : '#2a2a2a',
                                    color: i <= stepIndex ? '#000' : '#666',
                                }}>
                                    {i < stepIndex ? '✓' : i + 1}
                                </div>
                                <span style={{ ...styles.stepLabel, color: i <= stepIndex ? '#fff' : '#555' }}>{s}</span>
                            </div>
                        )
                    })}
                </div>

                {error && <div style={styles.errorBox}>{error}</div>}

                {/* Step: Phone */}
                {step === 'phone' && (
                    <>
                        <h1 style={styles.heading}>List your events on Outsyd</h1>
                        <p style={styles.subheading}>Enter your phone number to get started.</p>
                        <form onSubmit={handleSendOtp} style={styles.form}>
                            <label style={styles.label}>Phone number</label>
                            <div style={styles.phoneRow}>
                                <span style={styles.phonePrefix}>+91</span>
                                <input
                                    type="tel"
                                    placeholder="98765 43210"
                                    value={phone}
                                    onChange={e => {
                                        let val = e.target.value.replace(/\D/g, '')
                                        if (val.startsWith('91') && val.length > 10) {
                                            val = val.substring(2)
                                        }
                                        setPhone(val.slice(0, 10))
                                    }}
                                    required
                                    autoFocus
                                    style={{
                                        ...styles.input,
                                        flex: 1,
                                        borderLeft: 'none',
                                        borderRadius: '0 10px 10px 0',
                                    }}
                                />
                            </div>
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Sending…' : 'Send WhatsApp OTP'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <>
                        <h1 style={styles.heading}>Enter your code</h1>
                        <p style={styles.subheading}>Sent to +91 {phone} via WhatsApp.</p>
                        <form onSubmit={handleVerifyOtp} style={styles.form}>
                            <label style={styles.label}>6-digit code</label>
                            <input type="text" inputMode="numeric" placeholder="123456" value={otp}
                                onChange={e => setOtp(e.target.value)} required maxLength={6} autoFocus
                                style={{ ...styles.input, letterSpacing: '0.3em', textAlign: 'center' }} />
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Verifying…' : 'Verify'}
                            </button>
                            <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                                style={styles.linkButton}>← Change number</button>
                        </form>
                    </>
                )}

                {/* Step: Profile */}
                {step === 'profile' && (
                    <>
                        <h1 style={styles.heading}>Tell us about yourself</h1>
                        <p style={styles.subheading}>
                            We'll review your application and get back to you within 24 hours.
                        </p>
                        <form onSubmit={handleRegister} style={styles.form}>
                            <div style={styles.field}>
                                <label style={styles.label}>Your name *</label>
                                <input style={styles.input} type="text" placeholder="Arjun Kumar"
                                    value={name} onChange={e => setName(e.target.value)} required autoFocus />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Brand / Organisation name</label>
                                <input style={styles.input} type="text" placeholder="Chennai Comedy Club"
                                    value={brandName} onChange={e => setBrandName(e.target.value)} />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Email address</label>
                                <input style={styles.input} type="email" placeholder="you@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <button type="submit" disabled={loading} style={styles.button}>
                                {loading ? 'Submitting…' : 'Submit Application'}
                            </button>
                        </form>
                    </>
                )}

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <a href="/vendor-portal/login" style={styles.link}>Sign in</a>
                </p>
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
        maxWidth: 460,
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: '40px 36px',
    },
    brand: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 28 },
    brandName: { fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' },
    brandTag: {
        fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase',
        letterSpacing: '0.08em', backgroundColor: '#1f1f1f', border: '1px solid #2a2a2a',
        borderRadius: 4, padding: '2px 8px',
    },
    steps: {
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 32,
    },
    stepItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    stepDot: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
    },
    stepLabel: { fontSize: 12, fontWeight: 500 },
    heading: { fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.3px' },
    subheading: { fontSize: 14, color: '#888', margin: '0 0 24px', lineHeight: 1.5 },
    errorBox: {
        backgroundColor: '#2a1212', border: '1px solid #5a2020', borderRadius: 8,
        color: '#f87171', fontSize: 13, padding: '12px 14px', marginBottom: 20,
    },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    field: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: { fontSize: 13, fontWeight: 500, color: '#ccc' },
    input: {
        width: '100%', padding: '12px 14px', backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a', borderRadius: 10, color: '#fff',
        fontSize: 15, outline: 'none', boxSizing: 'border-box',
    },
    button: {
        width: '100%', padding: '13px', backgroundColor: '#ffffff', color: '#000000',
        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4,
    },
    linkButton: {
        background: 'none', border: 'none', color: '#888', fontSize: 13,
        cursor: 'pointer', padding: 0, textAlign: 'center',
    },
    footer: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 28 },
    link: { color: '#aaa', textDecoration: 'underline' },
    phoneRow: {
        display: 'flex',
        alignItems: 'stretch',
        position: 'relative',
    },
    phonePrefix: {
        padding: '12px 14px',
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRight: 'none',
        borderRadius: '10px 0 0 10px',
        color: '#666',
        fontSize: 15,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
}
