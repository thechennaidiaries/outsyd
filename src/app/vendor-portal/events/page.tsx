'use client'

/**
 * /vendor-portal/events
 * Lists all events for the current vendor with status badges.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import VendorShell from '../_components/VendorShell'

interface EventRow {
    id: string
    title: string
    date: string
    time?: string
    venue?: string
    image?: string
    approval_status: string
    booking_enabled: boolean
    status: string
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: 'Draft',     color: '#aaa',    bg: '#1f1f1f' },
    submitted: { label: 'In Review', color: '#facc15', bg: '#2a2200' },
    approved:  { label: 'Live',      color: '#4ade80', bg: '#0a2a0a' },
    rejected:  { label: 'Rejected',  color: '#f87171', bg: '#2a0a0a' },
    closed:    { label: 'Closed',    color: '#888',    bg: '#1a1a1a' },
    completed: { label: 'Completed', color: '#60a5fa', bg: '#0a1a2a' },
}

export default function VendorEventsPage() {
    const router = useRouter()
    const [events, setEvents]     = useState<EventRow[]>([])
    const [loading, setLoading]   = useState(true)
    const [vendorName, setVendorName] = useState('')

    useEffect(() => {
        // Fetch vendor name
        fetch('/api/vendor/me').then(r => r.json()).then(d => {
            if (d.vendor) setVendorName(d.vendor.brandName ?? d.vendor.name)
            else if (d.pending) router.push('/vendor-portal/pending')
        })
        // Fetch events
        fetch('/api/vendor/events').then(r => r.json()).then(d => {
            setEvents(d.events ?? [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [router])

    function formatDate(iso: string) {
        return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        })
    }

    return (
        <VendorShell vendorName={vendorName}>
            {/* Header */}
            <div style={styles.pageHeader}>
                <div>
                    <h1 style={styles.pageTitle}>Events</h1>
                    <p style={styles.pageSubtitle}>Manage your events and ticket tiers</p>
                </div>
                <button onClick={() => router.push('/vendor-portal/events/new')} style={styles.createBtn}>
                    + New Event
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={styles.emptyState}>
                    <p style={{ color: '#555' }}>Loading…</p>
                </div>
            )}

            {/* Empty */}
            {!loading && events.length === 0 && (
                <div style={styles.emptyState}>
                    <p style={styles.emptyIcon}>🎟</p>
                    <p style={styles.emptyTitle}>No events yet</p>
                    <p style={styles.emptySubtitle}>Create your first event to start selling tickets.</p>
                    <button onClick={() => router.push('/vendor-portal/events/new')} style={styles.createBtnSm}>
                        Create Event
                    </button>
                </div>
            )}

            {/* Event list */}
            {!loading && events.length > 0 && (
                <div style={styles.list}>
                    {events.map(event => {
                        const badge = STATUS_BADGE[event.approval_status] ?? STATUS_BADGE.draft
                        return (
                            <div
                                key={event.id}
                                style={styles.eventCard}
                                onClick={() => router.push(`/vendor-portal/events/${event.id}`)}
                            >
                                {/* Image thumbnail */}
                                <div style={{
                                    ...styles.thumb,
                                    backgroundImage: event.image ? `url(${event.image})` : undefined,
                                    backgroundColor: event.image ? undefined : '#1f1f1f',
                                }}>
                                    {!event.image && <span style={{ fontSize: 22 }}>🎟</span>}
                                </div>

                                {/* Info */}
                                <div style={styles.eventInfo}>
                                    <div style={styles.eventTop}>
                                        <h2 style={styles.eventTitle}>{event.title}</h2>
                                        <span style={{
                                            ...styles.badge,
                                            color: badge.color,
                                            backgroundColor: badge.bg,
                                        }}>
                                            {badge.label}
                                        </span>
                                    </div>
                                    <p style={styles.eventMeta}>
                                        {formatDate(event.date)}
                                        {event.time && ` · ${event.time}`}
                                        {event.venue && ` · ${event.venue}`}
                                    </p>
                                </div>

                                <span style={styles.arrow}>→</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </VendorShell>
    )
}

const styles: Record<string, React.CSSProperties> = {
    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 },
    pageTitle:  { fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px' },
    pageSubtitle: { fontSize: 13, color: '#666', margin: 0 },
    createBtn: {
        padding: '9px 18px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
    list: { display: 'flex', flexDirection: 'column', gap: 10 },
    eventCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: 12,
        padding: '14px 18px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
    },
    thumb: {
        width: 52,
        height: 52,
        borderRadius: 8,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eventInfo: { flex: 1, minWidth: 0 },
    eventTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
    eventTitle: { fontSize: 14, fontWeight: 600, color: '#e5e5e5', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    badge: { fontSize: 11, fontWeight: 600, borderRadius: 4, padding: '2px 8px', flexShrink: 0 },
    eventMeta: { fontSize: 12, color: '#666', margin: 0 },
    arrow: { color: '#444', fontSize: 16, flexShrink: 0 },
    emptyState: { textAlign: 'center', padding: '80px 0' },
    emptyIcon: { fontSize: 40, margin: '0 0 12px' },
    emptyTitle: { fontSize: 16, fontWeight: 600, color: '#aaa', margin: '0 0 6px' },
    emptySubtitle: { fontSize: 13, color: '#555', margin: '0 0 20px' },
    createBtnSm: {
        padding: '9px 20px', backgroundColor: '#fff', color: '#000',
        border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
}
