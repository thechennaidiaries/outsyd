#!/usr/bin/env node
/**
 * CSV → activities.ts importer
 *
 * CSV columns (order matters):
 *   id, slug, title, description, location, area, image, locationLink, address, timings, tags, bookingLink, pricingType, pricing, cityId, placeId
 *
 * Notes:
 *   - "tags" column: separate multiple tags with a pipe |   e.g.  Slow Living Activity|Exploring
 *   - "pricingType" column: must be "free" or "paid"
 *   - "description", "bookingLink", "pricing" can be empty
 *   - First row must be the header row
 *
 * Usage:
 *   node scripts/import-activities.js path/to/activities.csv
 */

const fs = require('fs')
const path = require('path')

// ── CSV parser (handles quoted fields with commas & newlines) ─────
function parseCSV(text) {
    const rows = []
    let i = 0
    while (i < text.length) {
        const row = []
        while (i < text.length) {
            if (text[i] === '"') {
                // Quoted field
                i++ // skip opening quote
                let value = ''
                while (i < text.length) {
                    if (text[i] === '"') {
                        if (i + 1 < text.length && text[i + 1] === '"') {
                            value += '"'
                            i += 2
                        } else {
                            i++ // skip closing quote
                            break
                        }
                    } else {
                        value += text[i]
                        i++
                    }
                }
                row.push(value.trim())
                if (i < text.length && text[i] === ',') i++
                else if (i < text.length && (text[i] === '\n' || text[i] === '\r')) {
                    if (text[i] === '\r' && i + 1 < text.length && text[i + 1] === '\n') i += 2
                    else i++
                    break
                }
            } else {
                // Unquoted field
                let value = ''
                while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') {
                    value += text[i]
                    i++
                }
                row.push(value.trim())
                if (i < text.length && text[i] === ',') i++
                else {
                    if (text[i] === '\r' && i + 1 < text.length && text[i + 1] === '\n') i += 2
                    else if (i < text.length) i++
                    break
                }
            }
        }
        if (row.length > 0 && !(row.length === 1 && row[0] === '')) {
            rows.push(row)
        }
    }
    return rows
}

function escapeTS(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '')
}

// Clean a tag string: trim, lowercase, remove trailing commas
function cleanTag(t) {
    return t.trim().toLowerCase().replace(/,+$/, '')
}

// ── Main ─────────────────────────────────────────────────────────
const csvPath = process.argv[2]
if (!csvPath) {
    console.error('Usage: node scripts/import-activities.js <path-to-csv>')
    process.exit(1)
}

const raw = fs.readFileSync(csvPath, 'utf-8')
const rows = parseCSV(raw)
const headers = rows[0].map(h => h.toLowerCase().trim())
const dataRows = rows.slice(1)

console.log(`📂 Read ${dataRows.length} activity rows from CSV\n`)

// Map header names to indices
const col = (name) => {
    const idx = headers.indexOf(name.toLowerCase())
    if (idx === -1) return -1
    return idx
}

// Collect unique tags for ALL_TAGS
const allTags = new Set()

const entries = dataRows.map((row, ri) => {
    const get = (name) => (col(name) >= 0 && col(name) < row.length) ? row[col(name)] : ''

    const id = get('id') || String(ri + 1)
    const slug = get('slug')
    const title = get('title')
    const description = get('description')
    const location = get('location')
    const area = get('area')
    const image = get('image')
    const locationLink = get('locationlink') || get('locationLink')
    const address = get('address')
    const timings = get('timings')
    const tagsRaw = get('tags')
    const tags = tagsRaw ? tagsRaw.split('|').map(t => cleanTag(t)).filter(Boolean) : []
    tags.forEach(t => allTags.add(t))
    const bookingLink = get('bookinglink') || get('bookingLink')
    const pricingType = get('pricingtype') || get('pricingType') || 'free'
    const pricing = get('pricing')
    const cityId = (get('cityid') || get('cityId') || 'chennai').toLowerCase()
    const placeId = get('placeid') || get('placeId') || slug

    let code = `    {\n`
    code += `        title: '${escapeTS(title)}',\n`
    code += `        cityId: '${escapeTS(cityId)}',\n`
    code += `        placeId: '${escapeTS(placeId)}',\n`
    if (id) code += `        id: '${escapeTS(id)}',\n`
    if (slug) code += `        slug: '${escapeTS(slug)}',\n`
    if (description) code += `        description: '${escapeTS(description)}',\n`
    if (location) code += `        location: '${escapeTS(location)}',\n`
    if (area) code += `        area: '${escapeTS(area)}',\n`
    if (image) code += `        image: '${escapeTS(image)}',\n`
    if (locationLink) code += `        locationLink: '${escapeTS(locationLink)}',\n`
    if (address) code += `        address: '${escapeTS(address)}',\n`
    if (timings) code += `        timings: '${escapeTS(timings)}',\n`
    if (tags.length > 0) code += `        tags: [${tags.map(t => `'${escapeTS(t)}'`).join(', ')}],\n`
    if (bookingLink) code += `        bookingLink: '${escapeTS(bookingLink)}',\n`
    if (pricingType && pricingType !== 'free') code += `        pricingType: '${pricingType === 'paid' ? 'paid' : 'free'}',\n`
    if (pricing) code += `        pricing: '${escapeTS(pricing)}',\n`
    code += `    }`
    return code
})

// Read current file to preserve TAG_META and helper functions
const currentFile = fs.readFileSync(path.resolve(__dirname, '../src/data/activities.ts'), 'utf-8')

// Extract TAG_META block + everything after it
const tagMetaMatch = currentFile.match(/(\/\/ ── Tag \/ Category metadata[\s\S]*)$/)
const tagMetaBlock = tagMetaMatch ? tagMetaMatch[1] : ''

const allTagsArr = Array.from(allTags)

const output = `export type PricingType = 'free' | 'paid'

export interface Activity {
    id?: string
    slug?: string             // URL-friendly slug, e.g. "semmozhi-poonga"
    title: string
    description?: string     // Optional long description — shown on detail page
    location?: string        // "Locations in Chennai" — shown on card
    area?: string            // Area
    image?: string
    locationLink?: string    // Google Maps link
    address?: string         // Address
    timings?: string         // Timings
    tags?: string[]          // Tags — used for filter strip
    bookingLink?: string     // Booking URL (if applicable)
    pricingType?: PricingType // 'free' or 'paid'
    pricing?: string         // Pricing details text, e.g. "₹200 per person"
    cityId: string           // References City.id
    placeId: string          // References Place.id
}

export const ACTIVITIES: Activity[] = [
${entries.join(',\n')}
]

// All unique tags derived from activities
export const ALL_TAGS: string[] = [
${allTagsArr.map(t => `    '${escapeTS(t)}',`).join('\n')}
]

${tagMetaBlock}
`

const outPath = path.resolve(__dirname, '../src/data/activities.ts')
fs.writeFileSync(outPath, output)
console.log(`✅ Wrote ${entries.length} activities to src/data/activities.ts`)
console.log(`🏷️  Tags found: ${allTagsArr.join(', ')}`)
console.log(`\n⚠️  Remember to update TAG_META if you added new tags!`)

