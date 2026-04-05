#!/usr/bin/env node
/**
 * CSV → places.ts importer
 *
 * CSV columns (order matters):
 *   id, name, area, cityId
 *
 * Usage:
 *   node scripts/import-places.js path/to/places.csv
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
if (!csvPath) { console.error('Usage: node scripts/import-places.js <path-to-csv>'); process.exit(1) }

const raw = fs.readFileSync(csvPath, 'utf-8')
const rows = parseCSV(raw)
const headers = rows[0].map(h => h.toLowerCase().trim())
const dataRows = rows.slice(1)

console.log(`📂 Read ${dataRows.length} place rows from CSV\n`)

const col = (name) => { const idx = headers.indexOf(name.toLowerCase()); return idx }

const entries = dataRows.map(row => {
    const get = (name) => (col(name) >= 0 && col(name) < row.length) ? row[col(name)] : ''
    const name = get('name')
    const area = get('area')
    const cityId = (get('cityid') || get('cityId') || 'chennai').toLowerCase()
    return `    { name: '${escapeTS(name)}', area: '${escapeTS(area)}', cityId: '${escapeTS(cityId)}' }`
})

const output = `export interface Place {
    name: string     // display name — also used as the key to link with activities
    area: string     // area within the city
    cityId: string   // references City.id
}

export const PLACES: Place[] = [
${entries.join(',\n')}
]

/** Get all places for a city */
export function getPlacesByCity(cityId: string): Place[] {
    return PLACES.filter(p => p.cityId === cityId)
}

/** Look up a single place by its name */
export function getPlaceByName(name: string): Place | undefined {
    return PLACES.find(p => p.name === name)
}
`

const outPath = path.resolve(__dirname, '../src/data/places.ts')
fs.writeFileSync(outPath, output)
console.log(`✅ Wrote ${entries.length} places to src/data/places.ts`)

