'use client'

/**
 * BookingCalendar
 * Custom calendar picker that greys out unavailable weekdays.
 * booking_days format: ["monday", "tuesday", "saturday"]
 */

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

const WEEKDAY_MAP: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6,
}

function getTodayIST(): Date {
    const nowIST = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
    return new Date(nowIST + 'T00:00:00')
}

function toYMD(d: Date): string {
    return d.toISOString().slice(0, 10)
}

interface Props {
    value: string                  // YYYY-MM-DD or ''
    onChange: (date: string) => void
    bookingDays: string[]          // ["monday", "tuesday", ...]
}

export default function BookingCalendar({ value, onChange, bookingDays }: Props) {
    const today = getTodayIST()

    // Start display on current month
    const [viewYear, setViewYear] = useState(today.getFullYear())
    const [viewMonth, setViewMonth] = useState(today.getMonth())

    // Which weekday numbers are available
    const availableWeekdays = new Set(
        (bookingDays ?? []).map(d => WEEKDAY_MAP[d.toLowerCase()]).filter(n => n !== undefined)
    )
    const allDaysAvailable = availableWeekdays.size === 0

    function isDisabled(date: Date): boolean {
        if (date < today) return true
        if (!allDaysAvailable && !availableWeekdays.has(date.getDay())) return true
        return false
    }

    function prevMonth() {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    function nextMonth() {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells: (Date | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
    ]
    // Pad to complete final row
    while (cells.length % 7 !== 0) cells.push(null)

    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            userSelect: 'none',
        }}>
            {/* ── Month navigation ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
            }}>
                <button
                    type="button"
                    onClick={prevMonth}
                    style={navBtnStyle}
                    aria-label="Previous month"
                >
                    <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                </span>
                <button
                    type="button"
                    onClick={nextMonth}
                    style={navBtnStyle}
                    aria-label="Next month"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* ── Day headers ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '10px 8px 4px' }}>
                {DAY_NAMES.map(name => {
                    const weekdayIndex = DAY_NAMES.indexOf(name)
                    const isUnavailableHeader = !allDaysAvailable && !availableWeekdays.has(weekdayIndex)
                    return (
                        <div key={name} style={{
                            textAlign: 'center',
                            fontSize: 11, fontWeight: 700,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            color: isUnavailableHeader ? 'var(--text-3)' : 'var(--text-2)',
                            paddingBottom: 6,
                            opacity: isUnavailableHeader ? 0.4 : 1,
                        }}>
                            {name}
                        </div>
                    )
                })}
            </div>

            {/* ── Date grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 12px', gap: 2 }}>
                {cells.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} />

                    const ymd = toYMD(date)
                    const disabled = isDisabled(date)
                    const selected = value === ymd
                    const isToday = toYMD(date) === toYMD(today)

                    return (
                        <button
                            key={ymd}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && onChange(ymd)}
                            style={{
                                width: '100%', aspectRatio: '1',
                                borderRadius: 8,
                                border: isToday && !selected ? '1.5px solid var(--border-hover)' : '1.5px solid transparent',
                                background: selected
                                    ? 'linear-gradient(135deg, #FF6B00, #FF8533)'
                                    : 'transparent',
                                color: selected
                                    ? 'white'
                                    : disabled
                                        ? 'var(--text-3)'
                                        : 'var(--text)',
                                fontSize: 13,
                                fontWeight: selected ? 800 : disabled ? 400 : 500,
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.3 : 1,
                                transition: 'all 0.12s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: selected ? '0 4px 12px rgba(255,107,0,0.4)' : 'none',
                            }}
                            aria-label={ymd}
                            aria-pressed={selected}
                            aria-disabled={disabled}
                        >
                            {date.getDate()}
                        </button>
                    )
                })}
            </div>

            {/* ── Legend ── */}
            {!allDaysAvailable && (
                <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '10px 16px',
                    display: 'flex', gap: 16, flexWrap: 'wrap',
                }}>
                    <LegendItem color="var(--accent)" label="Available" />
                    <LegendItem color="var(--text-3)" label="Closed" dim />
                </div>
            )}
        </div>
    )
}

function LegendItem({ color, label, dim }: { color: string; label: string; dim?: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
                width: 10, height: 10, borderRadius: 3,
                background: dim ? 'var(--bg-elevated)' : color,
                border: `1.5px solid ${dim ? 'var(--border)' : color}`,
                opacity: dim ? 0.4 : 1,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{label}</span>
        </div>
    )
}

const navBtnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 8,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    color: 'var(--text-2)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s ease',
}
