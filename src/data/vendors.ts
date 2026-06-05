// Type definitions for the Event Marketplace
// vendors, event_tiers, event_bookings, event_coupons, vendor_settlements

// ── Vendors ──────────────────────────────────────────────────────────────────

export type VendorStatus = 'pending_approval' | 'active' | 'paused' | 'suspended'

export interface Vendor {
  id:               string
  ownerUserId:      string          // references outsyd_users.id
  name:             string
  email?:           string
  phone?:           string
  brandName?:       string
  logoUrl?:         string          // 1:1 square, ImageKit URL
  status:           VendorStatus
  settlementNotes?: string
  createdAt:        string
  updatedAt:        string
}

// ── Event Tiers ───────────────────────────────────────────────────────────────

export interface EventTier {
  id:        string
  eventId:   string
  title:     string                 // e.g. 'Early Bird', 'General', 'VIP'
  price:     number                 // in paise (₹499 = 49900)
  capacity?: number                 // null = unlimited
  isActive:  boolean
  createdAt: string
}

/** Display helper: paise → formatted rupees string */
export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

// ── Event Bookings ────────────────────────────────────────────────────────────

export type PaymentStatus  = 'pending' | 'paid' | 'failed' | 'refunded'
export type BookingStatus  = 'confirmed' | 'cancelled'
export type BookingSource  = 'web'

export interface EventBooking {
  id:                string
  bookingReference:  string         // EVT-YYYYMMDD-XXXX

  eventId:           string
  tierId:            string
  vendorId?:         string

  // Snapshots at booking time
  eventTitle:        string
  eventDate:         string         // ISO timestamptz
  eventVenue?:       string
  tierTitle:         string

  userId?:           string
  customerName:      string
  customerPhone:     string
  customerEmail?:    string

  quantity:          number
  baseAmount:        number         // paise
  serviceFeeAmount:  number         // paise
  discountAmount:    number         // paise
  amountPaid:        number         // paise
  couponCode?:       string

  paymentProvider:   string
  cfOrderId?:        string
  cfPaymentId?:      string
  paymentStatus:     PaymentStatus
  bookingStatus:     BookingStatus

  bookingSource:     BookingSource
  createdAt:         string
  updatedAt:         string
}

/** Payload sent to POST /api/event-bookings/create-order */
export interface CreateEventBookingPayload {
  eventId:       string
  tierId:        string
  quantity:      number
  customerName:  string
  customerPhone: string
  customerEmail?: string
  couponCode?:   string
}

// ── Event Coupons ─────────────────────────────────────────────────────────────

export type DiscountType = 'percentage' | 'fixed'

export interface EventCoupon {
  id:             string
  vendorId:       string
  eventId?:       string            // null = valid for all vendor events
  code:           string
  discountType:   DiscountType
  discountValue:  number            // % (0-100) or paise flat amount
  usageLimit?:    number            // null = unlimited
  startAt:        string
  endAt?:         string
  active:         boolean
  createdAt:      string
}

// ── Vendor Settlements ────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'paid'

export interface VendorSettlement {
  id:               string
  vendorId:         string
  eventId:          string
  grossSales:       number          // paise
  refunds:          number          // paise
  platformFee:      number          // paise
  estimatedPayout:  number          // paise
  payoutStatus:     PayoutStatus
  payoutReference?: string          // bank transfer ref / UTR
  notes?:           string
  createdAt:        string
  updatedAt:        string
}

// ── Fee Breakdown (returned by calculateFees) ─────────────────────────────────

export interface FeeBreakdown {
  baseAmount:       number          // paise: tier.price × quantity
  discountAmount:   number          // paise: coupon savings
  serviceFeeAmount: number          // paise: Outsyd fee (Math.ceil)
  amountPaid:       number          // paise: what customer is charged
  vendorPayoutEst:  number          // paise: what vendor receives
}
