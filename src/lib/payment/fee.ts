/**
 * Fee calculation utility
 * All amounts in paise (₹1 = 100 paise). Never use floats for money.
 *
 * Rules:
 * - Service fee: Math.ceil (always round UP — we never under-charge)
 * - Discount:    Math.round (coupons are exact)
 * - If feeAbsorbedByVendor: fee is NOT added to customer price (vendor pays it from payout)
 */

import type { EventCoupon } from '@/data/vendors'
import type { FeeBreakdown } from '@/data/vendors'

interface CalcFeesInput {
    tierPriceInPaise:     number   // price per ticket
    quantity:             number
    serviceFeePercent:    number   // e.g. 5.00
    feeAbsorbedByVendor:  boolean
    coupon?:              EventCoupon | null
}

export function calculateFees({
    tierPriceInPaise,
    quantity,
    serviceFeePercent,
    feeAbsorbedByVendor,
    coupon,
}: CalcFeesInput): FeeBreakdown {
    const baseAmount = tierPriceInPaise * quantity

    // ── Discount ──────────────────────────────────────────────────────────────
    let discountAmount = 0
    if (coupon && coupon.active) {
        if (coupon.discountType === 'percentage') {
            // Percentage off base amount
            discountAmount = Math.round(baseAmount * (coupon.discountValue / 100))
        } else {
            // Fixed amount off (flat paise)
            discountAmount = Math.min(coupon.discountValue, baseAmount) // can't discount more than total
        }
    }

    const discountedBase = baseAmount - discountAmount

    // ── Service fee ───────────────────────────────────────────────────────────
    // Always ceil — we never under-charge platform fee
    const serviceFeeAmount = Math.ceil(discountedBase * (serviceFeePercent / 100))

    // ── What customer pays ────────────────────────────────────────────────────
    // If vendor absorbs fee: customer pays discountedBase only
    // If customer pays fee: customer pays discountedBase + serviceFeeAmount
    const amountPaid = feeAbsorbedByVendor
        ? discountedBase
        : discountedBase + serviceFeeAmount

    // ── Vendor payout estimate ────────────────────────────────────────────────
    // Vendor always nets: baseAmount - discountAmount - serviceFeeAmount
    const vendorPayoutEst = discountedBase - serviceFeeAmount

    return {
        baseAmount,
        discountAmount,
        serviceFeeAmount,
        amountPaid,
        vendorPayoutEst,
    }
}
