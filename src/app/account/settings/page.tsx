'use client'

/**
 * /account/settings — Profile settings + logout
 * Client component so we can handle form submission and logout redirect.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Check, LogOut, Phone, User } from 'lucide-react'

interface UserData {
    id: string
    name: string | null
    phone_number: string
    created_at: string
}

const TAB_NAV = [
    { label: '📋 Bookings', href: '/account/bookings' },
    { label: '❤️ Saved',   href: '/account/saved'    },
    { label: '⚙️ Settings', href: '/account/settings' },
]

export default function SettingsPage() {
    const router = useRouter()
    const [user, setUser]       = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [name, setName]       = useState('')
    const [saving, setSaving]   = useState(false)
    const [saved, setSaved]     = useState(false)
    const [error, setError]     = useState('')
    const [loggingOut, setLoggingOut] = useState(false)

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(({ user }) => {
                if (!user) { router.replace('/'); return }
                setUser(user)
                setName(user.name ?? '')
            })
            .finally(() => setLoading(false))
    }, [router])

    async function handleSaveName(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim() || name.trim().length < 2) {
            setError('Name must be at least 2 characters')
            return
        }
        setSaving(true)
        setError('')
        setSaved(false)

        const res = await fetch('/api/account/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() }),
        })
        const json = await res.json()

        setSaving(false)
        if (res.ok) {
            setSaved(true)
            setUser(prev => prev ? { ...prev, name: json.name } : prev)
            setTimeout(() => setSaved(false), 2500)
        } else {
            setError(json.error || 'Failed to save. Please try again.')
        }
    }

    async function handleLogout() {
        setLoggingOut(true)
        await fetch('/api/auth/logout', { method: 'POST' })
        router.replace('/')
    }

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </main>
        )
    }

    if (!user) return null

    const joinedDate = new Date(user.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <Link href="/" style={{ fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                    ← Back to Outsyd
                </Link>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                    My Account
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {user.name ? `${user.name} · ` : ''}{user.phone_number}
                </p>
            </div>

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                {TAB_NAV.map(tab => {
                    const active = tab.href === '/account/settings'
                    return (
                        <Link key={tab.href} href={tab.href} style={{
                            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            textDecoration: 'none',
                            background: active ? 'var(--accent)' : 'var(--bg-card)',
                            color: active ? '#000' : 'var(--text-3)',
                            border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                            {tab.label}
                        </Link>
                    )
                })}
            </div>

            {/* Profile card */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '20px', marginBottom: 20,
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 16 }}>
                    Profile
                </div>

                {/* Phone — read only */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <Phone size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Phone number</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{user.phone_number}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border)' }}>
                        verified
                    </div>
                </div>

                {/* Name — editable */}
                <form onSubmit={handleSaveName}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <User size={13} />
                        Display name
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); setSaved(false) }}
                            placeholder="Your name"
                            style={{
                                flex: 1, padding: '11px 14px', borderRadius: 10,
                                border: `1.5px solid ${error ? '#ef4444' : 'var(--border)'}`,
                                background: 'var(--bg)', color: 'var(--text)',
                                fontSize: 14, outline: 'none',
                            }}
                        />
                        <button
                            type="submit"
                            disabled={saving || name.trim() === (user.name ?? '')}
                            style={{
                                padding: '11px 18px', borderRadius: 10, border: 'none',
                                background: saved ? '#22c55e' : 'var(--accent)',
                                color: '#000', fontWeight: 700, fontSize: 13,
                                cursor: (saving || name.trim() === (user.name ?? '')) ? 'not-allowed' : 'pointer',
                                opacity: (saving || name.trim() === (user.name ?? '')) && !saved ? 0.5 : 1,
                                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> :
                             saved  ? <><Check size={14} /> Saved</> : 'Save'}
                        </button>
                    </div>
                    {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>{error}</p>}
                </form>
            </div>

            {/* Account info */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 20,
            }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>
                    Account
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    Member since {joinedDate}
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius)',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#ef4444', fontWeight: 700, fontSize: 15,
                    cursor: loggingOut ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.2s',
                }}
            >
                {loggingOut
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Logging out...</>
                    : <><LogOut size={16} /> Log out</>
                }
            </button>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    )
}
