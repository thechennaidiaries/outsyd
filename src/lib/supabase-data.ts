/**
 * Supabase Data Layer
 * 
 * All data-fetching functions that replace the static TypeScript arrays.
 * Uses the public (anon key) Supabase client for client-side use.
 */

import { supabaseClient } from './supabase-client'
import type { Activity } from '@/data/activities'
import type { Event } from '@/data/events'
import type { Walk, WalkPlace } from '@/data/walks'
import type { City } from '@/data/cities'
import type { Place } from '@/data/places'
import type { Club } from '@/data/clubs'

// ── Row → TypeScript mappers ─────────────────────────────────────

/** Map a Supabase row to an Activity object */
function mapActivity(row: any): Activity {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        location: row.location,
        area: row.area,
        image: row.image,
        locationLink: row.location_link,
        address: row.address,
        timings: row.timings,
        tags: row.tags || [],
        bookingLink: row.booking_link,
        pricingType: row.pricing_type,
        pricing: row.pricing,
        cityId: row.city_id,
        placeId: row.place_id,
        addedDate: row.added_date,
    }
}

/** Map a Supabase row to an Event object */
function mapEvent(row: any): Event {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        cityId: row.city_id,
        venue: row.venue,
        address: row.address,
        mapsLink: row.maps_link,
        bookingLink: row.booking_link,
        image: row.image,
        date: row.date,
        time: row.time,
        categories: row.categories || [],
        pricingType: row.pricing_type,
        pricing: row.pricing,
        status: row.status,
    }
}

/** Map a Supabase row to a Walk object */
function mapWalk(row: any): Walk {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        cityId: row.city_id,
        area: row.area,
        image: row.image,
        mapsLink: row.maps_link,
        places: (row.places || []) as WalkPlace[],
    }
}

/** Map a Supabase row to a City object */
function mapCity(row: any): City {
    return {
        id: row.id,
        name: row.name,
    }
}

/** Map a Supabase row to a Place object */
function mapPlace(row: any): Place {
    return {
        name: row.name,
        area: row.area,
        cityId: row.city_id,
    }
}

/** Map a Supabase row to a Club object */
function mapClub(row: any): Club {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        whatHappens: row.what_happens,
        whenTheyMeet: row.when_they_meet,
        joiningLink: row.joining_link,
        instagramLink: row.instagram_link,
        websiteLink: row.website_link,
        image: row.image,
        tags: row.tags || [],
        cityId: row.city_id,
    }
}


// ═══════════════════════════════════════════════════════════════════
// CITIES
// ═══════════════════════════════════════════════════════════════════

/** Get all cities */
export async function fetchCities(): Promise<City[]> {
    const { data, error } = await supabaseClient
        .from('cities')
        .select('*')
    if (error) { console.error('fetchCities error:', error); return [] }
    return (data || []).map(mapCity)
}

/** Look up a city by its URL slug */
export async function fetchCityBySlug(slug: string): Promise<City | undefined> {
    const { data, error } = await supabaseClient
        .from('cities')
        .select('*')
        .eq('id', slug)
        .single()
    if (error || !data) return undefined
    return mapCity(data)
}


// ═══════════════════════════════════════════════════════════════════
// PLACES
// ═══════════════════════════════════════════════════════════════════

/** Get all places for a city */
export async function fetchPlacesByCity(cityId: string): Promise<Place[]> {
    const { data, error } = await supabaseClient
        .from('places')
        .select('*')
        .eq('city_id', cityId)
    if (error) { console.error('fetchPlacesByCity error:', error); return [] }
    return (data || []).map(mapPlace)
}

/** Look up a single place by its name */
export async function fetchPlaceByName(name: string): Promise<Place | undefined> {
    const { data, error } = await supabaseClient
        .from('places')
        .select('*')
        .eq('name', name)
        .single()
    if (error || !data) return undefined
    return mapPlace(data)
}


// ═══════════════════════════════════════════════════════════════════
// ACTIVITIES
// ═══════════════════════════════════════════════════════════════════

/** Get all activities for a specific city */
export async function fetchActivitiesByCity(cityId: string): Promise<Activity[]> {
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('city_id', cityId)
    if (error) { console.error('fetchActivitiesByCity error:', error); return [] }
    return (data || []).map(mapActivity)
}

/** Get all activities (for sitemap, saved page, etc.) */
export async function fetchAllActivities(): Promise<Activity[]> {
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
    if (error) { console.error('fetchAllActivities error:', error); return [] }
    return (data || []).map(mapActivity)
}

/** Look up an activity by its slug within a city */
export async function fetchActivityBySlug(cityId: string, slug: string): Promise<Activity | undefined> {
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('city_id', cityId)
        .eq('slug', slug)
        .single()
    if (error || !data) return undefined
    return mapActivity(data)
}

/** Get activities for a specific tag within a city */
export async function fetchActivitiesByCityAndTag(cityId: string, tagName: string): Promise<Activity[]> {
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('city_id', cityId)
        .contains('tags', [tagName])
    if (error) { console.error('fetchActivitiesByCityAndTag error:', error); return [] }
    return (data || []).map(mapActivity)
}

/** Get activities added within the last N days for a city, sorted newest-first */
export async function fetchNewlyAddedActivities(cityId: string, days: number = 7): Promise<Activity[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const cutoffStr = cutoff.toISOString().split('T')[0] // YYYY-MM-DD
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('city_id', cityId)
        .gte('added_date', cutoffStr)
        .order('added_date', { ascending: false })
    if (error) { console.error('fetchNewlyAddedActivities error:', error); return [] }
    return (data || []).map(mapActivity)
}

/** Get all activities at a specific place */
export async function fetchActivitiesByPlace(placeId: string): Promise<Activity[]> {
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('place_id', placeId)
    if (error) { console.error('fetchActivitiesByPlace error:', error); return [] }
    return (data || []).map(mapActivity)
}

/** Get unique tags for a city's activities */
export async function fetchTagsByCity(cityId: string): Promise<string[]> {
    const activities = await fetchActivitiesByCity(cityId)
    const tagSet = new Set<string>()
    activities.forEach(a => a.tags?.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
}


// ═══════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════

/** Helper: get today's ISO date in IST */
function getTodayIsoInChennai(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
    const parts = formatter.formatToParts(new Date())
    const year = parts.find(part => part.type === 'year')?.value
    const month = parts.find(part => part.type === 'month')?.value
    const day = parts.find(part => part.type === 'day')?.value
    return `${year}-${month}-${day}`
}

/** Get all active events for a specific city (not expired, date >= today) */
export async function fetchEventsByCity(cityId: string): Promise<Event[]> {
    const today = getTodayIsoInChennai()
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('city_id', cityId)
        .eq('status', 'active')
        .gte('date', today)
    if (error) { console.error('fetchEventsByCity error:', error); return [] }
    return (data || []).map(mapEvent)
}

/** Get all events (including expired — for sitemap, saved page, etc.) */
export async function fetchAllEvents(): Promise<Event[]> {
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
    if (error) { console.error('fetchAllEvents error:', error); return [] }
    return (data || []).map(mapEvent)
}

/** Look up an event by its slug within a city */
export async function fetchEventBySlug(cityId: string, slug: string): Promise<Event | undefined> {
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('city_id', cityId)
        .eq('slug', slug)
        .single()
    if (error || !data) return undefined
    return mapEvent(data)
}

/** Get events filtered by category within a city (active only) */
export async function fetchEventsByCityAndCategory(cityId: string, category: string): Promise<Event[]> {
    const today = getTodayIsoInChennai()
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('city_id', cityId)
        .eq('status', 'active')
        .gte('date', today)
        .contains('categories', [category])
    if (error) { console.error('fetchEventsByCityAndCategory error:', error); return [] }
    return (data || []).map(mapEvent)
}

/** Get unique categories for a city's active events */
export async function fetchCategoriesByCity(cityId: string): Promise<string[]> {
    const events = await fetchEventsByCity(cityId)
    const catSet = new Set<string>()
    events.forEach(e => e.categories?.forEach(c => catSet.add(c)))
    return Array.from(catSet)
}

/** Get events for a specific date within a city (active only) */
export async function fetchEventsByDate(cityId: string, date: string): Promise<Event[]> {
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('city_id', cityId)
        .eq('date', date)
        .eq('status', 'active')
    if (error) { console.error('fetchEventsByDate error:', error); return [] }
    return (data || []).map(mapEvent)
}

/** Get upcoming events (today or later) for a city, sorted by date (active only) */
export async function fetchUpcomingEvents(cityId: string): Promise<Event[]> {
    const today = getTodayIsoInChennai()
    const { data, error } = await supabaseClient
        .from('events')
        .select('*')
        .eq('city_id', cityId)
        .eq('status', 'active')
        .gte('date', today)
        .order('date', { ascending: true })
    if (error) { console.error('fetchUpcomingEvents error:', error); return [] }
    return (data || []).map(mapEvent)
}

/** Get unique dates for a city's active events */
export async function fetchDatesByCity(cityId: string): Promise<string[]> {
    const events = await fetchEventsByCity(cityId)
    const dateSet = new Set<string>()
    events.forEach(e => dateSet.add(e.date))
    return Array.from(dateSet).sort()
}


// ═══════════════════════════════════════════════════════════════════
// WALKS
// ═══════════════════════════════════════════════════════════════════

/** Get all walks for a specific city */
export async function fetchWalksByCity(cityId: string): Promise<Walk[]> {
    const { data, error } = await supabaseClient
        .from('walks')
        .select('*')
        .eq('city_id', cityId)
    if (error) { console.error('fetchWalksByCity error:', error); return [] }
    return (data || []).map(mapWalk)
}

/** Get all walks (for sitemap, saved page, etc.) */
export async function fetchAllWalks(): Promise<Walk[]> {
    const { data, error } = await supabaseClient
        .from('walks')
        .select('*')
    if (error) { console.error('fetchAllWalks error:', error); return [] }
    return (data || []).map(mapWalk)
}

/** Look up a walk by its slug within a city */
export async function fetchWalkBySlug(cityId: string, slug: string): Promise<Walk | undefined> {
    const { data, error } = await supabaseClient
        .from('walks')
        .select('*')
        .eq('city_id', cityId)
        .eq('slug', slug)
        .single()
    if (error || !data) return undefined
    return mapWalk(data)
}

/** Get all walks for a specific area within a city */
export async function fetchWalksByCityAndArea(cityId: string, area: string): Promise<Walk[]> {
    const { data, error } = await supabaseClient
        .from('walks')
        .select('*')
        .eq('city_id', cityId)
        .eq('area', area)
    if (error) { console.error('fetchWalksByCityAndArea error:', error); return [] }
    return (data || []).map(mapWalk)
}

/** Get unique areas that have walks for a city */
export async function fetchWalkAreasByCity(cityId: string): Promise<string[]> {
    const walks = await fetchWalksByCity(cityId)
    const areaSet = new Set<string>()
    walks.forEach(w => areaSet.add(w.area))
    return Array.from(areaSet)
}


// ═══════════════════════════════════════════════════════════════════
// CLUBS
// ═══════════════════════════════════════════════════════════════════

/** Get all clubs for a specific city */
export async function fetchClubsByCity(cityId: string): Promise<Club[]> {
    const { data, error } = await supabaseClient
        .from('clubs')
        .select('*')
        .eq('city_id', cityId)
    if (error) { console.error('fetchClubsByCity error:', error); return [] }
    return (data || []).map(mapClub)
}

/** Look up a club by its slug within a city */
export async function fetchClubBySlug(cityId: string, slug: string): Promise<Club | undefined> {
    const { data, error } = await supabaseClient
        .from('clubs')
        .select('*')
        .eq('city_id', cityId)
        .eq('slug', slug)
        .single()
    if (error || !data) return undefined
    return mapClub(data)
}

/** Get clubs matching a specific tag within a city */
export async function fetchClubsByCityAndTag(cityId: string, tag: string): Promise<Club[]> {
    const { data, error } = await supabaseClient
        .from('clubs')
        .select('*')
        .eq('city_id', cityId)
        .contains('tags', [tag])
    if (error) { console.error('fetchClubsByCityAndTag error:', error); return [] }
    return (data || []).map(mapClub)
}

/** Get unique tags for a city's clubs */
export async function fetchClubTagsByCity(cityId: string): Promise<string[]> {
    const clubs = await fetchClubsByCity(cityId)
    const tagSet = new Set<string>()
    clubs.forEach(c => c.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
}
