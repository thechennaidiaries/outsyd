/**
 * GET  /api/vendor/coupons   — list vendor's coupons
 * POST /api/vendor/coupons   — create coupon
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

async function getVendor(userId: string) {
    const { data } = await supabase
        .from('vendors').select('id, status').eq('owner_user_id', userId).single()
    return data
}

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendor = await getVendor(session.userId)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const { data: coupons } = await supabase
        .from('event_coupons')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })

    return NextResponse.json({ coupons: coupons ?? [] })
}

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendor = await getVendor(session.userId)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    if (vendor.status !== 'active') return NextResponse.json({ error: 'Vendor not active' }, { status: 403 })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { code, discountType, discountValue, eventId, usageLimit, endAt } = body

    if (!code || !discountType || discountValue === undefined) {
        return NextResponse.json({ error: 'code, discountType, and discountValue are required' }, { status: 400 })
    }

    if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
        return NextResponse.json({ error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    // Check code uniqueness for this vendor
    const { data: existing } = await supabase
        .from('event_coupons')
        .select('id')
        .eq('vendor_id', vendor.id)
        .eq('code', code.toUpperCase())
        .single()

    if (existing) {
        return NextResponse.json({ error: `Coupon code ${code.toUpperCase()} already exists` }, { status: 409 })
    }

    const { data: coupon, error } = await supabase
        .from('event_coupons')
        .insert({
            vendor_id:      vendor.id,
            event_id:       eventId ?? null,
            code:           code.toUpperCase(),
            discount_type:  discountType,
            discount_value: discountValue,
            usage_limit:    usageLimit ?? null,
            start_at:       new Date().toISOString(),
            end_at:         endAt ?? null,
            active:         true,
        })
        .select('*')
        .single()

    if (error) {
        console.error('[vendor/coupons POST]', error)
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
    }

    return NextResponse.json({ coupon }, { status: 201 })
}
