/**
 * POST /api/vendor/register
 *
 * Creates a vendor profile linked to the logged-in user's account.
 * Status starts as 'pending_approval' — Outsyd approves in Supabase.
 *
 * Body: { name, brandName, email, phone }
 * Response: { vendor }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let name: string, brandName: string | undefined, email: string | undefined, phone: string | undefined
    try {
        const body = await req.json()
        name      = body.name?.trim()
        brandName = body.brandName?.trim() || undefined
        email     = body.email?.trim() || undefined
        phone     = body.phone?.trim() || undefined
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // ── Check: vendor profile already exists ──────────────────────────────────
    const { data: existing } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (existing) {
        return NextResponse.json(
            { error: 'A vendor profile already exists for this account', vendor: existing },
            { status: 409 }
        )
    }

    // ── Create vendor profile ─────────────────────────────────────────────────
    const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
            owner_user_id: session.userId,
            name,
            brand_name:    brandName ?? null,
            email:         email ?? null,
            phone:         phone ?? null,
            status:        'pending_approval',
        })
        .select('id, name, brand_name, status, created_at')
        .single()

    if (error || !vendor) {
        console.error('[vendor/register] Insert error:', error)
        return NextResponse.json({ error: 'Failed to create vendor profile' }, { status: 500 })
    }

    console.log(`[vendor/register] New vendor created: ${vendor.id} (${name})`)

    return NextResponse.json({
        vendor: {
            id:        vendor.id,
            name:      vendor.name,
            brandName: vendor.brand_name,
            status:    vendor.status,
            createdAt: vendor.created_at,
        },
    }, { status: 201 })
}
