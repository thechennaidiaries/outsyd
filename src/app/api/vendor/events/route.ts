/**
 * GET  /api/vendor/events        — list all events for the current vendor
 * POST /api/vendor/events        — create a new event (draft)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function getActiveVendor(userId: string) {
    const { data } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('owner_user_id', userId)
        .single()
    if (!data || data.status !== 'active') return null
    return data
}

// ── Slug generator ────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        + '-' + Date.now().toString(36)
}

// ── GET — list vendor events ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendor = await getActiveVendor(session.userId)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found or not active' }, { status: 403 })

    const { data, error } = await supabase
        .from('events')
        .select('id, slug, title, date, time, venue, image, approval_status, booking_enabled, status, created_at')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[vendor/events GET]', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }

    return NextResponse.json({ events: data || [] })
}

// ── POST — create event ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendor = await getActiveVendor(session.userId)
    if (!vendor) return NextResponse.json({ error: 'Vendor not found or not active' }, { status: 403 })

    let body: any
    try { body = await req.json() } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { title, description, venue, address, mapsLink, image, date, time,
            cityId, categories, pricingType, pricing,
            eventPhone, serviceFeePercent, feeAbsorbedByVendor, refundPolicy } = body

    if (!title || !date || !cityId) {
        return NextResponse.json({ error: 'title, date, and cityId are required' }, { status: 400 })
    }

    // Ensure slug is unique by appending timestamp hash
    const slug = generateSlug(title)

    const { data: event, error } = await supabase
        .from('events')
        .insert({
            slug,
            title,
            description:              description ?? null,
            venue:                    venue ?? null,
            address:                  address ?? null,
            maps_link:                mapsLink ?? null,
            image:                    image ?? null,
            date,
            time:                     time ?? null,
            city_id:                  cityId,
            categories:               categories ?? [],
            pricing_type:             pricingType ?? 'paid',
            pricing:                  pricing ?? null,
            status:                   'active',
            // Marketplace fields
            vendor_id:                vendor.id,
            approval_status:          'draft',
            booking_enabled:          false,
            event_phone:              eventPhone ?? null,
            service_fee_pct:          serviceFeePercent ?? 5.00,
            fee_absorbed_by_vendor:   feeAbsorbedByVendor ?? false,
            refund_policy:            refundPolicy ?? null,
        })
        .select('id, slug, title, approval_status')
        .single()

    if (error) {
        console.error('[vendor/events POST]', error)
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
}
