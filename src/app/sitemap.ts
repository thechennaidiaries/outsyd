import { MetadataRoute } from 'next'
import { TAG_META } from '@/data/tags'
import { fetchCities, fetchAllActivities, fetchAllWalks } from '@/lib/supabase-data'

// ── Cache the sitemap for 24h — crawlers don't need it fresher ──
export const revalidate = 86400

const BASE_URL = 'https://outsyd.in'

/**
 * Build a category slug the same way generateStaticParams does.
 * e.g. "gaming-activities" → "gaming-activities-in-chennai"
 *      "low-budget-fun"    → "low-budget-fun-activities-in-chennai"
 */
function buildCategorySlug(tagSlug: string, cityId: string): string {
    if (tagSlug.includes('activities')) {
        return `${tagSlug}-in-${cityId}`
    }
    return `${tagSlug}-activities-in-${cityId}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    const [cities, activities, walks] = await Promise.all([
        fetchCities(),
        fetchAllActivities(),
        fetchAllWalks(),
    ])

    const urls: MetadataRoute.Sitemap = []

    // ── 1. Homepage ─────────────────────────────────────────────────
    urls.push({
        url: BASE_URL,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 1.0,
    })

    // ── 2. City pages (activities hub) ──────────────────────────────
    for (const city of cities) {
        urls.push({
            url: `${BASE_URL}/${city.id}/activities`,
            lastModified: today,
            changeFrequency: 'daily',
            priority: 0.9,
        })

        // ── 3. Category pages (tag archives) ────────────────────────
        for (const tag of TAG_META) {
            const categorySlug = buildCategorySlug(tag.slug, city.id)
            urls.push({
                url: `${BASE_URL}/${city.id}/activities/${categorySlug}`,
                lastModified: today,
                changeFrequency: 'weekly',
                priority: 0.7,
            })
        }

        // ── 4. Walk listing page ────────────────────────────────────
        urls.push({
            url: `${BASE_URL}/${city.id}/walks`,
            lastModified: today,
            changeFrequency: 'weekly',
            priority: 0.8,
        })

        // ── 5. Events page ──────────────────────────────────────────
        urls.push({
            url: `${BASE_URL}/${city.id}/events-this-weekend`,
            lastModified: today,
            changeFrequency: 'weekly',
            priority: 0.7,
        })
    }

    // ── 6. Individual activity pages ────────────────────────────────
    for (const activity of activities) {
        if (!activity.slug) continue // skip activities without slugs
        urls.push({
            url: `${BASE_URL}/${activity.cityId}/activities/${activity.slug}`,
            lastModified: today,
            changeFrequency: 'monthly',
            priority: 0.6,
        })
    }

    // ── 7. Individual walk pages ────────────────────────────────────
    for (const walk of walks) {
        urls.push({
            url: `${BASE_URL}/${walk.cityId}/walks/${walk.slug}`,
            lastModified: today,
            changeFrequency: 'monthly',
            priority: 0.6,
        })
    }

    return urls
}
