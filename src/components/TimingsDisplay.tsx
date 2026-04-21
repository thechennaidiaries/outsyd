'use client'
import { useState, useEffect } from 'react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function expandTimings(raw: string): { day: string; short: string; time: string }[] {
    const result: Record<string, string> = {}

    // Strip "Suggest new hours" (Google Maps artifact)
    const cleaned = raw.replace(/\s*Suggest new hours\s*/gi, '').trim()

    if (/open 24 hours/i.test(cleaned)) {
        DAY_NAMES.forEach(d => (result[d] = 'Open 24 hours'))
        return DAY_NAMES.map((d, i) => ({ day: d, short: DAY_SHORT[i], time: result[d] }))
    }

    // ── Smart Regex Detection ──
    // Detects day names followed by their timings, handles single-line or multi-line
    const dayRegex = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)(?:\s*[:\-–\s]\s*|\s+)([\w\d\s\–\-\:apm,]+?)(?=\s*(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)|$)/gi
    
    let match
    let foundDays = false
    while ((match = dayRegex.exec(cleaned)) !== null) {
        foundDays = true
        const dayName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
        const timeValue = match[2].trim().replace(/^[:\-–\s]+/, '')
        result[dayName] = timeValue
    }

    if (!foundDays) {
        // ── Fallback: Old format "All days 9AM-6PM" ──
        let main = cleaned
        main = main.replace(/^All days\s+/i, '')
        main = main.replace(/^Daily\s+/i, '')
        main = main.replace(/\s+daily$/i, '')
        main = main.trim()

        DAY_NAMES.forEach(d => (result[d] = main))

        // Sunday exception "(Sunday 5 am–1 pm, 3–9 pm)"
        const sunEx = cleaned.match(/\(Sunday\s+([^)]+)\)/i)
        if (sunEx) result['Sunday'] = sunEx[1].trim()
    }

    // Always check for explicit "Closed" overrides regardless of format
    const closedDays = cleaned.matchAll(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\s+Closed/gi)
    for (const c of closedDays) {
        const dayName = c[1].charAt(0).toUpperCase() + c[1].slice(1).toLowerCase()
        result[dayName] = 'Closed'
    }

    return DAY_NAMES.map((d, i) => ({ 
        day: d, 
        short: DAY_SHORT[i], 
        time: result[d] || 'Closed' 
    }))
}

export default function TimingsDisplay({ timings }: { timings: string }) {
    const [today, setToday] = useState(0)

    // Only runs on client — avoids server/client mismatch
    useEffect(() => {
        setToday(new Date().getDay())
    }, [])

    const allDays = expandTimings(timings)

    // Reorder so today is first
    const ordered = [...allDays.slice(today), ...allDays.slice(0, today)]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ordered.map(({ day, short, time }, i) => {
                const isToday = i === 0
                const isClosed = time.toLowerCase() === 'closed'

                return (
                    <div key={day} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 10,
                        background: isToday ? 'rgba(255,107,0,0.08)' : 'transparent',
                        border: `1px solid ${isToday ? 'rgba(255,107,0,0.2)' : 'transparent'}`,
                    }}>
                        <span style={{
                            fontSize: 13, fontWeight: isToday ? 700 : 500,
                            color: isToday ? 'var(--accent)' : 'var(--text-3)',
                            minWidth: 80,
                        }}>
                            {isToday ? `Today (${short})` : day}
                        </span>
                        <span style={{
                            fontSize: 13, fontWeight: isToday ? 600 : 400,
                            color: isClosed ? '#f87171' : isToday ? 'var(--text)' : 'var(--text-2)',
                            textAlign: 'right',
                        }}>
                            {time}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
