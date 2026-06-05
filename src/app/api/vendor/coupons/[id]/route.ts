/**
 * PUT    /api/vendor/coupons/[id]   — toggle active / update
 * DELETE /api/vendor/coupons/[id]   — delete
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

async function verifyCouponOwnership(userId: string, couponId: string) {
    const { data: vendor } = await supabase
        .from('vendors').select('id').eq('owner_user_id', userId).single()
    if (!vendor) return null

    const { data: coupon } = await supabase
        .from('event_coupons').select('*').eq('id', couponId).eq('vendor_id', vendor.id).single()
    return coupon ?? null
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const coupon = await verifyCouponOwnership(session.userId, id)
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const update: Record<string, any> = {}
    if (body.active !== undefined) update.active = body.active

    const { data: updated, error } = await supabase
        .from('event_coupons').update(update).eq('id', id).select('*').single()

    if (error) return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
    return NextResponse.json({ coupon: updated })
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const coupon = await verifyCouponOwnership(session.userId, id)
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })

    const { error } = await supabase.from('event_coupons').delete().eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
    return NextResponse.json({ success: true })
}
