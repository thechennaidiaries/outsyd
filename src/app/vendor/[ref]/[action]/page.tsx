/**
 * /vendor/[ref]/[action]
 *
 * Server component — vendor taps a link from WhatsApp, this page:
 *   1. Validates ref + action
 *   2. Finds the booking in Supabase
 *   3. Updates status to confirmed / rejected
 *   4. Shows a clean result screen to the vendor
 *
 * Routes:
 *   /vendor/OT-20240513-4721/confirm
 *   /vendor/OT-20240513-4721/reject
 */

import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

// ── Types ────────────────────────────────────────────────────────────────────

type Action = 'confirm' | 'reject'

interface PageProps {
    params: { ref: string; action: string }
}

// ── Status updater ───────────────────────────────────────────────────────────

type UpdateResult =
    | { ok: true; booking: { customer_name: string; booking_date: string; time_slot: string; people_count: number; activity_title?: string } }
    | { ok: false; reason: 'not_found' | 'expired' | 'already_responded' | 'invalid_action' | 'error'; currentStatus?: string }

async function processAction(ref: string, action: Action): Promise<UpdateResult> {
    // 1. Fetch booking
    const { data: booking, error } = await supabase
        .from('bookings')
        .select('id, status, response_deadline, customer_name, booking_date, time_slot, people_count, activity_id')
        .eq('booking_reference', ref)
        .single()

    if (error || !booking) return { ok: false, reason: 'not_found' }

    // 2. Already responded? Lock it — vendor cannot change their answer.
    if (booking.status === 'confirmed' || booking.status === 'rejected') {
        return { ok: false, reason: 'already_responded', currentStatus: booking.status }
    }

    // 3. Expired?
    if (new Date(booking.response_deadline) < new Date()) {
        return { ok: false, reason: 'expired' }
    }

    // 4. Only allow pending_vendor status to be updated
    if (booking.status !== 'pending_vendor') {
        return { ok: false, reason: 'error' }
    }

    // 5. Update status — ONLY if still pending_vendor (atomic SQL guard)
    const newStatus = action === 'confirm' ? 'confirmed' : 'rejected'
    const { data: updated, error: updateError } = await supabase
        .from('bookings')
        .update({
            status: newStatus,
            vendor_responded_at: new Date().toISOString(),
            internal_notes: `Vendor ${newStatus} via link at ${new Date().toISOString()}`,
        })
        .eq('id', booking.id)
        .eq('status', 'pending_vendor')   // atomic guard — only updates if still pending
        .select('id')

    // If no rows updated, someone else beat us to it (race condition)
    if (updateError || !updated || updated.length === 0) {
        if (updateError) console.error('[vendor/action] Update error:', updateError)
        // Re-fetch to get actual current status
        const { data: refetch } = await supabase
            .from('bookings').select('status').eq('id', booking.id).single()
        return { ok: false, reason: 'already_responded', currentStatus: refetch?.status }
    }

    // 6. Fetch activity title for the result screen
    let activityTitle: string | undefined
    if (booking.activity_id) {
        const { data: activity } = await supabase
            .from('activities')
            .select('title')
            .eq('id', booking.activity_id)
            .single()
        activityTitle = activity?.title
    }

    return {
        ok: true,
        booking: {
            customer_name: booking.customer_name,
            booking_date: booking.booking_date,
            time_slot: booking.time_slot,
            people_count: booking.people_count,
            activity_title: activityTitle,
        },
    }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function VendorActionPage({ params }: PageProps) {
    const { ref, action } = await params

    // Validate action
    if (action !== 'confirm' && action !== 'reject') notFound()

    const result = await processAction(ref, action as Action)
    const isConfirm = action === 'confirm'

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{isConfirm ? 'Booking Confirmed' : 'Booking Rejected'} — Outsyd</title>
                <style>{`
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        background: #0a0a0e;
                        color: #f0f0f5;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                    }
                    .card {
                        background: #16161e;
                        border: 1px solid #2a2a3a;
                        border-radius: 20px;
                        padding: 36px 28px;
                        max-width: 380px;
                        width: 100%;
                        text-align: center;
                    }
                    .icon {
                        width: 72px; height: 72px; border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 32px; margin: 0 auto 24px;
                    }
                    .title { font-size: 22px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.03em; }
                    .subtitle { font-size: 14px; color: #8888aa; line-height: 1.6; margin-bottom: 28px; }
                    .detail-row {
                        display: flex; justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #2a2a3a;
                        font-size: 13px;
                    }
                    .detail-label { color: #8888aa; }
                    .detail-value { font-weight: 600; color: #f0f0f5; }
                    .ref { font-family: monospace; font-size: 18px; font-weight: 900; letter-spacing: -0.02em; margin: 24px 0 8px; }
                    .powered { font-size: 11px; color: #555566; margin-top: 28px; }
                `}</style>
            </head>
            <body>
                <div className="card">
                    {result.ok ? (
                        <SuccessView action={action as Action} ref_={ref} booking={result.booking} />
                    ) : (
                        <ErrorView reason={result.reason} action={action as Action} ref_={ref} currentStatus={result.currentStatus} />
                    )}
                </div>
            </body>
        </html>
    )
}

// ── Sub-views ─────────────────────────────────────────────────────────────────

function SuccessView({
    action, ref_, booking,
}: {
    action: Action
    ref_: string
    booking: { customer_name: string; booking_date: string; time_slot: string; people_count: number; activity_title?: string }
}) {
    const isConfirm = action === 'confirm'
    const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    })

    return (
        <>
            <div className="icon" style={{ background: isConfirm ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                {isConfirm ? '✅' : '❌'}
            </div>
            <div className="title" style={{ color: isConfirm ? '#22c55e' : '#ef4444' }}>
                Booking {isConfirm ? 'Confirmed' : 'Rejected'}
            </div>
            <div className="subtitle">
                {isConfirm
                    ? `You've confirmed this booking. The customer will be notified.`
                    : `You've rejected this booking. The customer will be notified.`
                }
            </div>

            <div className="ref" style={{ color: isConfirm ? '#22c55e' : '#ef4444' }}>{ref_}</div>

            <div style={{ textAlign: 'left', marginTop: 4 }}>
                {booking.activity_title && (
                    <div className="detail-row">
                        <span className="detail-label">Activity</span>
                        <span className="detail-value">{booking.activity_title}</span>
                    </div>
                )}
                <div className="detail-row">
                    <span className="detail-label">Customer</span>
                    <span className="detail-value">{booking.customer_name}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">{formattedDate}</span>
                </div>
                <div className="detail-row">
                    <span className="detail-label">Time</span>
                    <span className="detail-value">{booking.time_slot}</span>
                </div>
                <div className="detail-row" style={{ borderBottom: 'none' }}>
                    <span className="detail-label">People</span>
                    <span className="detail-value">{booking.people_count}</span>
                </div>
            </div>

            <div className="powered">Powered by Outsyd</div>
        </>
    )
}

function ErrorView({ reason, action, ref_, currentStatus }: { reason: string; action: Action; ref_: string; currentStatus?: string }) {
    // Build a human-readable version of the actual current status
    const statusLabel = currentStatus === 'confirmed' ? 'confirmed ✅'
        : currentStatus === 'rejected' ? 'rejected ❌'
        : 'responded'

    const msgs: Record<string, { icon: string; title: string; body: string }> = {
        not_found: {
            icon: '🔍',
            title: 'Booking Not Found',
            body: `We couldn't find a booking with reference ${ref_}. It may have been deleted.`,
        },
        expired: {
            icon: '⏰',
            title: 'Link Expired',
            body: 'This booking link has expired. Please contact the Outsyd team for help.',
        },
        already_responded: {
            icon: '🔒',
            title: 'Already Responded',
            body: `You've already ${statusLabel} this booking. The status cannot be changed.`,
        },
        error: {
            icon: '⚠️',
            title: 'Something Went Wrong',
            body: 'We couldn\'t update this booking. Please contact the Outsyd team.',
        },
    }
    const msg = msgs[reason] ?? msgs.error

    return (
        <>
            <div className="icon" style={{ background: 'rgba(251,191,36,0.15)', fontSize: 28 }}>
                {msg.icon}
            </div>
            <div className="title" style={{ color: '#fbbf24' }}>{msg.title}</div>
            <div className="subtitle">{msg.body}</div>
            <div className="powered">Powered by Outsyd</div>
        </>
    )
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'  // never cache — each action is a one-time operation
