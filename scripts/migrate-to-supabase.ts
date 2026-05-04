/**
 * Migration Script: Import all data from TypeScript files into Supabase
 * 
 * Run with: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { CITIES } from '../src/data/cities'
import { PLACES } from '../src/data/places'
import { ACTIVITIES } from '../src/data/activities'
import { EVENTS } from '../src/data/events'
import { WALKS } from '../src/data/walks'
import { CLUBS } from '../src/data/clubs'
import * as dotenv from 'dotenv'

// Load env vars from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ── Helpers ───────────────────────────────────────────────────────

/** Insert data in batches to avoid payload limits. Uses upsert to be idempotent. */
async function batchInsert(table: string, rows: any[], batchSize = 50, onConflict?: string) {
    let inserted = 0
    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const query = onConflict
            ? supabase.from(table).upsert(batch, { onConflict })
            : supabase.from(table).upsert(batch)
        const { error } = await query
        if (error) {
            console.error(`  ❌ Error inserting batch ${i / batchSize + 1} into ${table}:`, error.message)
            console.error('  First row of failed batch:', JSON.stringify(batch[0], null, 2))
            return false
        }
        inserted += batch.length
        console.log(`  ✅ ${table}: ${inserted}/${rows.length} rows upserted`)
    }
    return true
}

// ── 1. Migrate Cities ─────────────────────────────────────────────

async function migrateCities() {
    console.log('\n🏙️  Migrating Cities...')
    const rows = CITIES.map(c => ({
        id: c.id,
        name: c.name,
    }))
    return batchInsert('cities', rows, 50, 'id')
}

// ── 2. Migrate Places ─────────────────────────────────────────────

async function migratePlaces() {
    console.log('\n📍 Migrating Places...')
    // Deduplicate by (name, city_id) — source data has duplicates
    const seen = new Set<string>()
    const rows = PLACES
        .map(p => ({
            name: p.name,
            area: p.area || null,
            city_id: p.cityId,
        }))
        .filter(r => {
            const key = `${r.name}::${r.city_id}`
            if (seen.has(key)) return false
            seen.add(key)
            return true
        })
    console.log(`  (${PLACES.length} source rows → ${rows.length} unique)`)
    return batchInsert('places', rows, 50, 'name,city_id')
}

// ── 3. Migrate Activities ─────────────────────────────────────────

async function migrateActivities() {
    console.log('\n🎯 Migrating Activities...')
    const rows = ACTIVITIES.map(a => ({
        slug: a.slug || null,
        title: a.title,
        description: a.description || null,
        location: a.location || null,
        area: a.area || null,
        image: a.image || null,
        location_link: a.locationLink || null,
        address: a.address || null,
        timings: a.timings || null,
        tags: a.tags || [],
        booking_link: a.bookingLink || null,
        pricing_type: a.pricingType || null,
        pricing: a.pricing || null,
        city_id: a.cityId,
        place_id: a.placeId || null,
        added_date: a.addedDate || null,
    }))
    return batchInsert('activities', rows, 50, 'slug')
}

// ── 4. Migrate Events ─────────────────────────────────────────────

async function migrateEvents() {
    console.log('\n🎪 Migrating Events...')
    const rows = EVENTS.map(e => ({
        slug: e.slug,
        title: e.title,
        description: e.description || null,
        city_id: e.cityId,
        venue: e.venue || null,
        address: e.address || null,
        maps_link: e.mapsLink || null,
        booking_link: e.bookingLink || null,
        image: e.image || null,
        date: e.date,
        time: e.time || null,
        categories: e.categories || [],
        pricing_type: e.pricingType || null,
        pricing: e.pricing || null,
        status: e.status || 'active',
    }))
    return batchInsert('events', rows, 50, 'slug')
}

// ── 5. Migrate Walks ──────────────────────────────────────────────

async function migrateWalks() {
    console.log('\n🚶 Migrating Walks...')
    const rows = WALKS.map(w => ({
        slug: w.slug,
        title: w.title,
        city_id: w.cityId,
        area: w.area || null,
        image: w.image || null,
        maps_link: w.mapsLink || null,
        places: w.places,  // JSONB — array of {title, image}
    }))
    return batchInsert('walks', rows, 50, 'slug')
}

// ── 6. Migrate Clubs ──────────────────────────────────────────────

async function migrateClubs() {
    console.log('\n🏟️  Migrating Clubs...')
    if (CLUBS.length === 0) {
        console.log('  ⏭️  No clubs to migrate (empty array)')
        return true
    }
    const rows = CLUBS.map(c => ({
        slug: c.slug,
        name: c.name,
        description: c.description || null,
        what_happens: c.whatHappens,
        when_they_meet: c.whenTheyMeet,
        joining_link: c.joiningLink || null,
        instagram_link: c.instagramLink || null,
        website_link: c.websiteLink || null,
        image: c.image || null,
        tags: c.tags || [],
        city_id: c.cityId,
    }))
    return batchInsert('clubs', rows, 50, 'slug')
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════')
    console.log('  OUTSYD — Supabase Data Migration')
    console.log('═══════════════════════════════════════════════')
    console.log(`  Supabase URL: ${supabaseUrl}`)
    console.log(`  Cities:      ${CITIES.length}`)
    console.log(`  Places:      ${PLACES.length}`)
    console.log(`  Activities:  ${ACTIVITIES.length}`)
    console.log(`  Events:      ${EVENTS.length}`)
    console.log(`  Walks:       ${WALKS.length}`)
    console.log(`  Clubs:       ${CLUBS.length}`)
    console.log('═══════════════════════════════════════════════')

    // Order matters: cities first (other tables FK to it)
    const steps: { name: string; fn: () => Promise<boolean> }[] = [
        { name: 'Cities', fn: migrateCities },
        { name: 'Places', fn: migratePlaces },
        { name: 'Activities', fn: migrateActivities },
        { name: 'Events', fn: migrateEvents },
        { name: 'Walks', fn: migrateWalks },
        { name: 'Clubs', fn: migrateClubs },
    ]

    for (const step of steps) {
        const success = await step.fn()
        if (!success) {
            console.error(`\n❌ Migration failed at: ${step.name}`)
            console.error('   Fix the error above and re-run the script.')
            console.error('   Tip: If data already exists, clear the table first:')
            console.error(`   DELETE FROM ${step.name.toLowerCase()};`)
            process.exit(1)
        }
    }

    console.log('\n═══════════════════════════════════════════════')
    console.log('  ✅ All data migrated successfully!')
    console.log('═══════════════════════════════════════════════\n')
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
