// Booking type definitions — matches the bookings table in Supabase

export type BookingStatus =
    | 'pending_vendor'
    | 'confirmed'
    | 'rejected'
    | 'expired'
    | 'manual_followup'

export type BookingSource = 'web' | 'whatsapp' | 'admin'

export interface Booking {
    id: string
    booking_reference: string          // e.g. OT-20240512-0042

    activity_id: string                // uuid → activities.id
    place_name: string                 // text → places.name
    city_id: string                    // denormalised snapshot

    customer_name: string
    customer_phone: string             // +91... format
    customer_email?: string

    booking_date: string               // YYYY-MM-DD
    time_slot: string                  // e.g. "10:00 AM"
    people_count: number

    status: BookingStatus
    booking_source: BookingSource

    response_deadline?: string         // ISO timestamptz
    vendor_responded_at?: string       // ISO timestamptz
    internal_notes?: string

    created_at: string
    updated_at: string
}

/** Payload the frontend sends to POST /api/bookings */
export interface CreateBookingPayload {
    activity_id: string
    customer_name: string
    customer_phone: string
    customer_email?: string
    booking_date: string               // YYYY-MM-DD
    time_slot: string
    people_count: number
}
