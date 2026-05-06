// Activity type definitions
// Data has been migrated to Supabase — see src/lib/supabase-data.ts
// Category metadata (TAG_META) has been moved to src/data/tags.ts

export type PricingType = 'free' | 'paid'

export interface Activity {
    id?: string
    slug?: string
    title: string
    description?: string
    location?: string
    area?: string
    image?: string
    locationLink?: string
    address?: string
    timings?: string
    tags?: string[]
    bookingLink?: string
    pricingType?: PricingType
    pricing?: string
    cityId: string
    placeId: string
    addedDate?: string
}
