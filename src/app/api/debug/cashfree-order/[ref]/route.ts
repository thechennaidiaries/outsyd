/**
 * GET /api/debug/cashfree-order/[ref]
 * Temporary debug endpoint — shows raw Cashfree order + payments response
 * DELETE THIS before going to production
 */

import { NextRequest, NextResponse } from 'next/server'

const CF_ENV    = (process.env.CASHFREE_ENV ?? 'TEST') as 'PROD' | 'TEST'
const CF_BASE   = CF_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
const CF_VERSION = '2023-08-01'

function cfHeaders() {
    return {
        'Content-Type':    'application/json',
        'x-api-version':   CF_VERSION,
        'x-client-id':     process.env.CASHFREE_APP_ID    ?? '',
        'x-client-secret': process.env.CASHFREE_SECRET_KEY ?? '',
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { ref: string } }
) {
    const { ref } = params

    const [orderRes, paymentsRes] = await Promise.all([
        fetch(`${CF_BASE}/orders/${ref}`, { headers: cfHeaders() }),
        fetch(`${CF_BASE}/orders/${ref}/payments`, { headers: cfHeaders() }),
    ])

    const order    = await orderRes.json()
    const payments = await paymentsRes.json()

    return NextResponse.json({
        env:      CF_ENV,
        base:     CF_BASE,
        ref,
        order_status:    order.order_status,
        order:    order,
        payments: payments,
    })
}
