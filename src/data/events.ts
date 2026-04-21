export type PricingType = 'free' | 'paid'

export interface Event {
    id: string
    slug: string                // URL-friendly slug, e.g. "stand-up-comedy-night"
    title: string
    description?: string        // 1 line about the event
    cityId: string              // References City.id
    venue: string               // Venue name
    address?: string            // Address of the venue
    mapsLink?: string           // Google Maps link
    bookingLink?: string        // Booking URL
    image?: string              // Event poster/image
    date: string                // ISO date string (YYYY-MM-DD)
    time?: string               // e.g. "7:00 PM – 10:00 PM"
    categories?: string[]       // Event categories for filtering
    pricingType: PricingType    // 'free' or 'paid'
    pricing?: string            // Pricing details text, e.g. "₹499 per person"
}

// ── Dummy Events for Testing ──────────────────────────────────────

export const EVENTS: Event[] = [
    {
        id: 'evt-1',
        slug: 'stand-up-comedy-night-jun-2026',
        title: 'Stand-up Comedy Night ft. Local Comics',
        description: 'An evening of laughs with Chennai\'s best upcoming stand-up comedians.',
        cityId: 'chennai',
        venue: 'The Bazaar',
        address: '37, TTK Road, Alwarpet, Chennai, Tamil Nadu 600018',
        mapsLink: 'https://maps.app.goo.gl/example1',
        bookingLink: 'https://insider.in/example1',
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/semmozhi%20poonga.png?updatedAt=1774535379431',
        date: '2026-06-14',
        time: '7:00 PM – 10:00 PM',
        categories: ['comedy', 'nightlife'],
        pricingType: 'paid',
        pricing: '₹499 per person',
    },
    {
        id: 'evt-2',
        slug: 'sunday-flea-market-jun-2026',
        title: 'Sunday Flea Market — Handmade & Vintage',
        description: 'Browse handmade crafts, vintage clothing, and artisan food stalls.',
        cityId: 'chennai',
        venue: 'Express Avenue Mall Grounds',
        address: 'Whites Road, Royapettah, Chennai, Tamil Nadu 600014',
        mapsLink: 'https://maps.app.goo.gl/example2',
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/chetpetecopark_processed.png',
        date: '2026-06-15',
        time: '10:00 AM – 5:00 PM',
        categories: ['market', 'shopping'],
        pricingType: 'free',
    },
    {
        id: 'evt-3',
        slug: 'acoustic-jam-night-jun-2026',
        title: 'Acoustic Jam Night — Open Mic',
        description: 'Bring your guitar or just your ears for a chill acoustic evening.',
        cityId: 'chennai',
        venue: 'Bay 146',
        address: 'ECR, Neelankarai, Chennai, Tamil Nadu 600041',
        mapsLink: 'https://maps.app.goo.gl/example3',
        bookingLink: 'https://insider.in/example3',
        image: 'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/anna%20nagar%20tower%20park.png?updatedAt=1774535377739',
        date: '2026-06-20',
        time: '8:00 PM – 11:00 PM',
        categories: ['music', 'nightlife'],
        pricingType: 'paid',
        pricing: '₹299 per person',
    },
]

// ── Helper Functions ──────────────────────────────────────────────

/** Get all events for a specific city */
export function getEventsByCity(cityId: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId)
}

/** Look up an event by its slug within a city */
export function getEventBySlug(cityId: string, slug: string): Event | undefined {
    return EVENTS.find(e => e.cityId === cityId && e.slug === slug)
}

/** Get events filtered by category within a city */
export function getEventsByCityAndCategory(cityId: string, category: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.categories?.includes(category))
}

/** Get unique categories for a city's events */
export function getCategoriesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const catSet = new Set<string>()
    cityEvents.forEach(e => e.categories?.forEach(c => catSet.add(c)))
    return Array.from(catSet)
}

/** Get events for a specific date within a city */
export function getEventsByDate(cityId: string, date: string): Event[] {
    return EVENTS.filter(e => e.cityId === cityId && e.date === date)
}

/** Get upcoming events (today or later) for a city, sorted by date */
export function getUpcomingEvents(cityId: string): Event[] {
    const today = new Date().toISOString().split('T')[0]
    return EVENTS
        .filter(e => e.cityId === cityId && e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
}

/** Get unique dates for a city's events */
export function getDatesByCity(cityId: string): string[] {
    const cityEvents = getEventsByCity(cityId)
    const dateSet = new Set<string>()
    cityEvents.forEach(e => dateSet.add(e.date))
    return Array.from(dateSet).sort()
}
