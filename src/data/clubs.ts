export interface Club {
    id: string
    slug: string              // URL-friendly slug, e.g. "chennai-runners"
    name: string              // Club name
    description?: string      // Optional long description — for detail page
    whatHappens: string        // What happens in this club (single line)
    whenTheyMeet: string      // When they meet (single line)
    joiningLink?: string      // URL to join
    instagramLink?: string    // Instagram URL
    websiteLink?: string      // Website URL
    image?: string            // Cover image
    tags: string[]            // Club-specific tags (separate from activity tags)
    cityId: string            // References City.id
}

export const CLUBS: Club[] = [
    // Add clubs here — example:
    // {
    //     id: '1',
    //     slug: 'chennai-runners',
    //     name: 'Chennai Runners',
    //     whatHappens: 'Group running sessions across the city',
    //     whenTheyMeet: 'Every Saturday & Sunday, 5:30 AM',
    //     joiningLink: 'https://example.com/join',
    //     instagramLink: 'https://instagram.com/chennairunners',
    //     websiteLink: 'https://chennairunners.com',
    //     tags: ['Fitness', 'Running'],
    //     cityId: 'chennai',
    // },
]

// All unique club tags (will be populated when data is added)
export const ALL_CLUB_TAGS: string[] = []

// ── Helper functions ──────────────────────────────────────────────

/** Get all clubs for a specific city */
export function getClubsByCity(cityId: string): Club[] {
    return CLUBS.filter(c => c.cityId === cityId)
}

/** Look up a club by its slug within a city */
export function getClubBySlug(cityId: string, slug: string): Club | undefined {
    return CLUBS.find(c => c.cityId === cityId && c.slug === slug)
}

/** Get clubs matching a specific tag within a city */
export function getClubsByCityAndTag(cityId: string, tag: string): Club[] {
    return CLUBS.filter(c => c.cityId === cityId && c.tags.includes(tag))
}

/** Get unique tags for a city's clubs */
export function getClubTagsByCity(cityId: string): string[] {
    const cityClubs = getClubsByCity(cityId)
    const tagSet = new Set<string>()
    cityClubs.forEach(c => c.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
}
