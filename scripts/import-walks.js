#!/usr/bin/env node
/**
 * CSV → walks.ts importer
 *
 * CSV columns (order matters):
 *   id, slug, title, cityId, area, image, mapsLink, place1Title, place1Image, place2Title, place2Image, ...
 *
 * Place columns are paired: place1Title, place1Image, place2Title, place2Image, etc.
 * You can have as many place pairs as needed (4+).
 * Empty place columns at the end are ignored.
 *
 * Usage:
 *   node scripts/import-walks.js path/to/walks.csv
 */

const fs = require('fs')
const path = require('path')

function parseCSV(text) {
    const rows = []
    let i = 0
    while (i < text.length) {
        const row = []
        while (i < text.length) {
            if (text[i] === '"') {
                i++
                let value = ''
                while (i < text.length) {
                    if (text[i] === '"') {
                        if (i + 1 < text.length && text[i + 1] === '"') { value += '"'; i += 2 }
                        else { i++; break }
                    } else { value += text[i]; i++ }
                }
                row.push(value.trim())
                if (i < text.length && text[i] === ',') i++
                else { if (text[i] === '\r' && text[i + 1] === '\n') i += 2; else if (i < text.length) i++; break }
            } else {
                let value = ''
                while (i < text.length && text[i] !== ',' && text[i] !== '\n' && text[i] !== '\r') { value += text[i]; i++ }
                row.push(value.trim())
                if (i < text.length && text[i] === ',') i++
                else { if (text[i] === '\r' && text[i + 1] === '\n') i += 2; else if (i < text.length) i++; break }
            }
        }
        if (row.length > 0 && !(row.length === 1 && row[0] === '')) rows.push(row)
    }
    return rows
}

function escapeTS(str) { return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'") }

const csvPath = process.argv[2]
if (!csvPath) { console.error('Usage: node scripts/import-walks.js <path-to-csv>'); process.exit(1) }

const raw = fs.readFileSync(csvPath, 'utf-8')
const rows = parseCSV(raw)
const headers = rows[0].map(h => h.toLowerCase().trim())
const dataRows = rows.slice(1)

console.log(`📂 Read ${dataRows.length} walk rows from CSV\n`)

const col = (name) => { const idx = headers.indexOf(name.toLowerCase()); return idx }

const entries = dataRows.map(row => {
    const get = (name) => (col(name) >= 0 && col(name) < row.length) ? row[col(name)] : ''

    const id = get('id')
    const slug = get('slug')
    const title = get('title')
    const cityId = (get('cityid') || get('cityId') || 'chennai').toLowerCase()
    const area = get('area')
    const image = get('image')
    const mapsLink = get('mapslink') || get('mapsLink')

    // Extract place pairs: place1title, place1image, place2title, place2image, ...
    const places = []
    for (let n = 1; n <= 20; n++) {
        const pTitle = get(`place${n}title`) || get(`place${n}Title`)
        const pImage = get(`place${n}image`) || get(`place${n}Image`)
        if (pTitle && pImage) {
            places.push({ title: pTitle, image: pImage })
        } else if (pTitle) {
            places.push({ title: pTitle, image: '' })
        }
    }

    const placesCode = places.map(p =>
        `            { title: '${escapeTS(p.title)}', image: '${escapeTS(p.image)}' }`
    ).join(',\n')

    return `    {
        id: '${escapeTS(id)}',
        slug: '${escapeTS(slug)}',
        title: '${escapeTS(title)}',
        cityId: '${escapeTS(cityId)}',
        area: '${escapeTS(area)}',
        image: '${escapeTS(image)}',
        mapsLink: '${escapeTS(mapsLink)}',
        places: [
${placesCode}
        ],
    }`
})

const output = `export interface WalkPlace {
    title: string       // Name of the place/stop
    image: string       // Image URL
}

export interface Walk {
    id: string          // unique identifier
    slug: string        // URL-friendly slug, e.g. "biriyani-hopping-anna-nagar"
    title: string       // Title of the walk
    cityId: string      // References City.id
    area: string        // Area within the city
    image: string       // Cover image for the walk
    mapsLink: string    // Google Maps link
    places: WalkPlace[] // Ordered list of stops (4+ places)
}

export const WALKS: Walk[] = [
${entries.join(',\n')}
]

// ── Helper functions ──────────────────────────────────────────────

/** Get all walks for a specific city */
export function getWalksByCity(cityId: string): Walk[] {
    return WALKS.filter(w => w.cityId === cityId)
}

/** Look up a walk by its slug within a city */
export function getWalkBySlug(cityId: string, slug: string): Walk | undefined {
    return WALKS.find(w => w.cityId === cityId && w.slug === slug)
}

/** Get all walks for a specific area within a city */
export function getWalksByCityAndArea(cityId: string, area: string): Walk[] {
    return WALKS.filter(w => w.cityId === cityId && w.area === area)
}

/** Get unique areas that have walks for a city */
export function getWalkAreasByCity(cityId: string): string[] {
    const cityWalks = getWalksByCity(cityId)
    const areaSet = new Set<string>()
    cityWalks.forEach(w => areaSet.add(w.area))
    return Array.from(areaSet)
}
`

const outPath = path.resolve(__dirname, '../src/data/walks.ts')
fs.writeFileSync(outPath, output)
console.log(`✅ Wrote ${entries.length} walks to src/data/walks.ts`)
