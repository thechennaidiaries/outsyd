'use client'
import { useState, useEffect } from 'react'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInRange(startDay: string, endDay: string): string[] {
    const getIdx = (str: string) => {
        const clean = str.trim().toLowerCase();
        for (let i = 0; i < 7; i++) {
            if (DAY_NAMES[i].toLowerCase() === clean || DAY_SHORT[i].toLowerCase() === clean) return i;
        }
        return -1;
    }
    
    const startIdx = getIdx(startDay);
    const endIdx = getIdx(endDay);
    
    if (startIdx === -1 || endIdx === -1) return [];
    
    const days = [];
    let curr = startIdx;
    while (true) {
        days.push(DAY_NAMES[curr]);
        if (curr === endIdx) break;
        curr = (curr + 1) % 7;
    }
    return days;
}

function expandTimings(raw: string): { day: string; short: string; time: string }[] {
    const result: Record<string, string> = {}
    const cleaned = raw.replace(/\s*Suggest new hours\s*/gi, '').trim()

    if (/open 24 hours/i.test(cleaned)) {
        DAY_NAMES.forEach(d => (result[d] = 'Open 24 hours'))
        return DAY_NAMES.map((d, i) => ({ day: d, short: DAY_SHORT[i], time: result[d] }))
    }

    // Normalize dashes and hyphens
    const normalized = cleaned.replace(/–/g, '-').replace(/—/g, '-');

    // Check if there are day names or short day names in the string
    const dayPatternStr = `(?:${DAY_NAMES.join('|')}|${DAY_SHORT.join('|')})`
    const hasAnyDay = new RegExp(dayPatternStr, 'i').test(normalized)

    if (!hasAnyDay) {
        // Fallback: simple daily timing
        let main = normalized.replace(/^All days\s+/i, '').replace(/^Daily\s+/i, '').replace(/\s+daily$/i, '').trim()
        DAY_NAMES.forEach(d => (result[d] = main))
    } else {
        // Set all to Closed first
        DAY_NAMES.forEach(d => (result[d] = 'Closed'))

        // Detect explicit "Closed" overrides (e.g., "Friday: Closed" or "Friday Closed")
        const closedRegex = new RegExp(`(${dayPatternStr})\\s*(?::\\s*)?Closed`, 'gi')
        let closedMatch
        const explicitlyClosed = new Set()
        while ((closedMatch = closedRegex.exec(normalized)) !== null) {
            const dayName = DAY_NAMES.find(d => d.toLowerCase() === closedMatch[1].toLowerCase() || DAY_SHORT[DAY_NAMES.indexOf(d)].toLowerCase() === closedMatch[1].toLowerCase())
            if (dayName) {
                result[dayName] = 'Closed'
                explicitlyClosed.add(dayName)
            }
        }

        // Try to match day ranges: E.g., "Saturday to Thursday" or "Saturday-Thursday"
        const rangeRegex = new RegExp(`(${dayPatternStr})\\s*(?:to|\\-|through)\\s*(${dayPatternStr})`, 'gi')
        let rangeMatch
        let rangeFound = false
        
        // Find timings like "9 AM - 5 PM" or "10:30 am - 8:30 pm"
        const timePattern = /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?\s*(?:-|to)\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b/gi
        const times = normalized.match(timePattern)
        
        if (times && times.length > 0) {
            const ranges = []
            while ((rangeMatch = rangeRegex.exec(normalized)) !== null) {
                ranges.push({
                    start: rangeMatch[1],
                    end: rangeMatch[2]
                })
            }
            
            if (ranges.length > 0) {
                rangeFound = true
                ranges.forEach((r, idx) => {
                    const timeValue = times[idx] || times[0]
                    const days = getDaysInRange(r.start, r.end)
                    days.forEach(d => {
                        if (!explicitlyClosed.has(d)) {
                            result[d] = timeValue.trim()
                        }
                    })
                })
            }
        }

        if (!rangeFound) {
            // Fallback to standard day-by-day regex
            const dayRegex = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)(?:\s*[:\-–\s]\s*|\s+)([\w\d\s\–\-\:apm,]+?)(?=\s*(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)|$)/gi
            let match
            let foundDays = false
            while ((match = dayRegex.exec(normalized)) !== null) {
                foundDays = true
                const dayName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()
                const timeValue = match[2].trim().replace(/^[:\-–\s]+/, '')
                if (!explicitlyClosed.has(dayName)) {
                    result[dayName] = timeValue
                }
            }
            
            // If still nothing matched, try matching a single general time and applying it to all non-closed days
            if (!foundDays) {
                const singleTime = normalized.match(timePattern)
                if (singleTime) {
                    DAY_NAMES.forEach(d => {
                        if (!explicitlyClosed.has(d)) {
                            result[d] = singleTime[0]
                        }
                    })
                }
            }
        }
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
                            color: (isClosed && isToday) ? '#f87171' : isToday ? 'var(--text)' : 'var(--text-2)',
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
