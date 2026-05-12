/**
 * Generates a human-readable booking reference.
 * Format: OT-YYYYMMDD-XXXX (e.g. OT-20240512-4721)
 *
 * Used in WhatsApp messages so vendors can reference bookings easily.
 * Collision probability at MVP scale (<100 bookings/day) is negligible.
 */
export function generateBookingReference(): string {
    const now = new Date()
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '') // 20240512
    const rand = Math.floor(Math.random() * 9000) + 1000              // 1000–9999
    return `OT-${datePart}-${rand}`
}

/**
 * Calculates the response deadline timestamp.
 * @param fromDate  base time (defaults to now)
 * @param minutes   timeout window from the place settings (default 30)
 */
export function calculateResponseDeadline(minutes: number = 30, fromDate: Date = new Date()): string {
    const deadline = new Date(fromDate.getTime() + minutes * 60 * 1000)
    return deadline.toISOString()
}
