#!/usr/bin/env node
/**
 * CSV → clubs.ts importer
 *
 * CSV columns (order matters):
 *   id, slug, name, description, whatHappens, whenTheyMeet, joiningLink, instagramLink, websiteLink, image, tags, cityId
 *
 * Notes:
 *   - "tags" column: separate multiple tags with a pipe |   e.g.  Running|Fitness
 *   - "description", "joiningLink", "instagramLink", "websiteLink", "image" can be empty
 *
 * Usage:
 *   node scripts/import-clubs.js path/to/clubs.csv
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
if (!csvPath) { console.error('Usage: node scripts/import-clubs.js <path-to-csv>'); process.exit(1) }

const raw = fs.readFileSync(csvPath, 'utf-8')
const rows = parseCSV(raw)
const headers = rows[0].map(h => h.toLowerCase().trim())
const dataRows = rows.slice(1)

console.log(`📂 Read ${dataRows.length} club rows from CSV\n`)

const col = (name) => { const idx = headers.indexOf(name.toLowerCase()); return idx }

const entries = dataRows.map(row => {
    const get = (name) => (col(name) >= 0 && col(name) < row.length) ? row[col(name)] : ''

    const id = get('id')
    const slug = get('slug')
    const name = get('name')
    const description = get('description')
    const whatHappens = get('whathappens') || get('whatHappens')
    const whenTheyMeet = get('whentheymeet') || get('whenTheyMeet')
    const joiningLink = get('joininglink') || get('joiningLink')
    const instagramLink = get('instagramlink') || get('instagramLink')
    const websiteLink = get('websitelink') || get('websiteLink')
    const image = get('image')
    const tagsRaw = get('tags')
    const tags = tagsRaw ? tagsRaw.split('|').map(t => t.trim()).filter(Boolean) : []
    const cityId = (get('cityid') || get('cityId') || 'chennai').toLowerCase()

    let code = `    {\n`
    code += `        id: '${escapeTS(id)}',\n`
    code += `        slug: '${escapeTS(slug)}',\n`
    code += `        name: '${escapeTS(name)}',\n`
    if (description) code += `        description: '${escapeTS(description)}',\n`
    code += `        whatHappens: '${escapeTS(whatHappens)}',\n`
    code += `        whenTheyMeet: '${escapeTS(whenTheyMeet)}',\n`
    if (joiningLink) code += `        joiningLink: '${escapeTS(joiningLink)}',\n`
    if (instagramLink) code += `        instagramLink: '${escapeTS(instagramLink)}',\n`
    if (websiteLink) code += `        websiteLink: '${escapeTS(websiteLink)}',\n`
    if (image) code += `        image: '${escapeTS(image)}',\n`
    code += `        tags: [${tags.map(t => `'${escapeTS(t)}'`).join(', ')}],\n`
    code += `        cityId: '${escapeTS(cityId)}',\n`
    code += `    }`
    return code
})

const output = `export interface Club {
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
${entries.join(',\n')}
]

/** Get all clubs for a specific city */
export function getClubsByCity(cityId: string): Club[] {
    return CLUBS.filter(c => c.cityId === cityId)
}

/** Look up a club by its slug within a city */
export function getClubBySlug(cityId: string, slug: string): Club | undefined {
    return CLUBS.find(c => c.cityId === cityId && c.slug === slug)
}

/** Get unique tags for a city's clubs */
export function getClubTagsByCity(cityId: string): string[] {
    const cityClubs = getClubsByCity(cityId)
    const tagSet = new Set<string>()
    cityClubs.forEach(c => c.tags.forEach(t => tagSet.add(t)))
    return Array.from(tagSet)
}
`

const outPath = path.resolve(__dirname, '../src/data/clubs.ts')
fs.writeFileSync(outPath, output)
console.log(`✅ Wrote ${entries.length} clubs to src/data/clubs.ts`)
