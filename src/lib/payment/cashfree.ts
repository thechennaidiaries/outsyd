/**
 * Cashfree Payments API wrapper
 *
 * Env variables required:
 *   CASHFREE_APP_ID      — from Cashfree dashboard
 *   CASHFREE_SECRET_KEY  — from Cashfree dashboard
 *   CASHFREE_ENV         — 'PROD' or 'TEST' (defaults to TEST)
 *
 * Docs: https://docs.cashfree.com/reference/pg-new-apis-endpoint
 */

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

// ── Create Order ──────────────────────────────────────────────────────────────

export interface CashfreeOrderInput {
    orderId:         string     // must be unique, use booking_reference
    amountInPaise:   number
    customerName:    string
    customerPhone:   string
    customerEmail?:  string
    returnUrl:       string     // where Cashfree redirects after payment
    notifyUrl:       string     // webhook URL
    eventTitle:      string
}

export interface CashfreeOrderResult {
    success:          boolean
    cfOrderId?:       string
    paymentSessionId?: string
    error?:           string
}

export async function createCashfreeOrder(input: CashfreeOrderInput): Promise<CashfreeOrderResult> {
    try {
        const amountInRupees = (input.amountInPaise / 100).toFixed(2)

        const body = {
            order_id:       input.orderId,
            order_amount:   Number(amountInRupees),
            order_currency: 'INR',
            order_note:     input.eventTitle,
            customer_details: {
                customer_id:    input.customerPhone.replace(/\D/g, ''),
                customer_name:  input.customerName,
                customer_phone: input.customerPhone.replace(/\D/g, ''),
                customer_email: input.customerEmail ?? 'noreply@outsyd.in',
            },
            order_meta: {
                return_url: input.returnUrl,
                notify_url: input.notifyUrl,
            },
        }

        const res = await fetch(`${CF_BASE}/orders`, {
            method:  'POST',
            headers: cfHeaders(),
            body:    JSON.stringify(body),
        })

        const data = await res.json()

        if (!res.ok) {
            console.error('[cashfree/createOrder] Error:', data)
            return { success: false, error: data.message ?? `Cashfree error ${res.status}` }
        }

        return {
            success:          true,
            cfOrderId:        data.cf_order_id?.toString(),
            paymentSessionId: data.payment_session_id,
        }
    } catch (err) {
        console.error('[cashfree/createOrder] Network error:', err)
        return { success: false, error: 'Network error connecting to Cashfree' }
    }
}

// ── Verify Order Status (webhook fallback) ────────────────────────────────────

export async function verifyCashfreeOrder(
    orderId: string,
): Promise<{ status: string; cfPaymentId?: string } | null> {
    try {
        const res = await fetch(`${CF_BASE}/orders/${orderId}/payments`, {
            method:  'GET',
            headers: cfHeaders(),
        })
        if (!res.ok) return null
        const payments = await res.json()
        // payments is an array; find the successful one
        const paid = Array.isArray(payments)
            ? payments.find((p: any) => p.payment_status === 'SUCCESS')
            : null
        if (paid) {
            return { status: 'PAID', cfPaymentId: paid.cf_payment_id?.toString() }
        }
        return { status: 'PENDING' }
    } catch {
        return null
    }
}


// ── Verify Webhook Signature ──────────────────────────────────────────────────

import { createHmac } from 'crypto'

export function verifyCashfreeWebhook(
    rawBody: string,
    signature: string,
    timestamp: string,
): boolean {
    try {
        const secret = process.env.CASHFREE_SECRET_KEY ?? ''
        const payload = timestamp + rawBody
        const expected = createHmac('sha256', secret).update(payload).digest('base64')
        return expected === signature
    } catch {
        return false
    }
}

// ── Refund ────────────────────────────────────────────────────────────────────

export async function issueCashfreeRefund(
    cfOrderId: string,
    refundAmount: number,    // in paise
    refundNote: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const body = {
            refund_amount: (refundAmount / 100).toFixed(2),
            refund_id:     `refund-${cfOrderId}-${Date.now()}`,
            refund_note:   refundNote,
        }
        const res = await fetch(`${CF_BASE}/orders/${cfOrderId}/refunds`, {
            method:  'POST',
            headers: cfHeaders(),
            body:    JSON.stringify(body),
        })
        if (!res.ok) {
            const d = await res.json()
            return { success: false, error: d.message ?? 'Refund failed' }
        }
        return { success: true }
    } catch (err) {
        return { success: false, error: 'Network error issuing refund' }
    }
}
