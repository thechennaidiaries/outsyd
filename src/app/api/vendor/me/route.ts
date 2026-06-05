/**
 * GET /api/vendor/me
 *
 * Returns the vendor profile for the currently logged-in user.
 * Used by all vendor portal pages to check auth + approval status.
 *
 * Responses:
 *   200 { vendor }          → active vendor
 *   200 { pending: true }   → vendor exists but pending_approval
 *   401                     → not logged in
 *   404                     → logged in but no vendor profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ── Fetch vendor profile ──────────────────────────────────────────────────
    const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_user_id', session.userId)
        .single()

    if (error || !vendor) {
        return NextResponse.json({ error: 'No vendor profile found' }, { status: 404 })
    }

    // ── Return status-aware response ──────────────────────────────────────────
    if (vendor.status === 'pending_approval') {
        return NextResponse.json({
            pending: true,
            vendor: {
                id:        vendor.id,
                name:      vendor.name,
                brandName: vendor.brand_name,
                status:    vendor.status,
            },
        })
    }

    if (vendor.status === 'suspended' || vendor.status === 'paused') {
        return NextResponse.json({
            suspended: true,
            status:    vendor.status,
        })
    }

    // Active vendor — return full profile
    return NextResponse.json({
        vendor: {
            id:              vendor.id,
            ownerUserId:     vendor.owner_user_id,
            name:            vendor.name,
            email:           vendor.email,
            phone:           vendor.phone,
            brandName:       vendor.brand_name,
            logoUrl:         vendor.logo_url,
            status:          vendor.status,
            settlementNotes: vendor.settlement_notes,
            createdAt:       vendor.created_at,
        },
    })
}
