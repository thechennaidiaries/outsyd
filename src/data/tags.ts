// ── Activity category metadata ────────────────────────────────────
// Kept separate from activities.ts so this tiny list doesn't
// drag the 200KB ACTIVITIES array into the client JS bundle.

export interface TagMeta {
    name: string        // Display name (matches tag strings on Activity objects)
    slug: string        // URL-friendly slug
    emoji: string       // Used on category strip and pages
    description: string // SEO meta description snippet
}

export const TAG_META: TagMeta[] = [
    { name: 'outdoor activities',         slug: 'outdoor-activities',   emoji: '🌿', description: 'Parks, nature walks, and open-air adventures in the city' },
    { name: 'leisure activities',         slug: 'leisure-activities',   emoji: '☕', description: 'Relaxing outings, scenic spots, and chill hangout ideas' },
    { name: 'low budget fun activities',  slug: 'low-budget-fun',       emoji: '💰', description: "Fun things to do that won't break the bank" },
    { name: 'water activities',           slug: 'water-activities',     emoji: '🌊', description: 'Swimming, boating, water parks, and beach fun' },
    { name: 'group activities',           slug: 'group-activities',     emoji: '🤟', description: 'The best things to do with friends and large groups' },
    { name: 'indoor activities',          slug: 'indoor-activities',    emoji: '🏠', description: 'Beat the heat with fun indoor experiences and games' },
    { name: 'adventure activities',       slug: 'adventure-activities', emoji: '🧗', description: 'Thrilling experiences like paintball, zorbing, and rock climbing' },
    { name: 'night activities',           slug: 'night-activities',     emoji: '🌙', description: 'Fun things to do after dark - night drives, stargazing, and more' },
    { name: 'kids activities',            slug: 'kids-activities',      emoji: '🧒', description: 'Family-friendly activities and fun outings for children' },
    { name: 'unique cultural experiences',slug: 'cultural-experiences', emoji: '🎭', description: 'Temples, heritage sites, and unique local cultural experiences' },
    { name: 'gaming activities',          slug: 'gaming-activities',    emoji: '🎳', description: 'PS5 gaming, PC cafes, arcade zones, and VR experiences' },
    { name: 'sports activities',          slug: 'sports-activities',    emoji: '⚽', description: 'Football turfs, badminton courts, cricket, and more' },
    { name: 'art activities',             slug: 'art-activities',       emoji: '🎨', description: 'Pottery, painting, art galleries, and creative workshops' },
    { name: 'escape room activities',     slug: 'escape-room',          emoji: '🔐', description: 'Escape rooms and puzzle-solving adventures with friends' },
]

/** Look up tag metadata by slug */
export function getTagBySlug(slug: string): TagMeta | undefined {
    return TAG_META.find(t => t.slug === slug)
}
