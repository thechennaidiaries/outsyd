/**
 * WaSender API wrapper
 * Docs: https://www.wasenderapi.com
 *
 * Uses session-based WhatsApp API.
 * Set WASENDER_API_KEY in your .env.local and Vercel environment variables.
 * Set OUTSYD_OPS_PHONE to your internal ops WhatsApp number (e.g. +919876543210)
 */

const WASENDER_ENDPOINT = 'https://www.wasenderapi.com/api/send-message'

interface SendResult {
    success: boolean
    error?: string
}

/**
 * Send a plain text WhatsApp message via WaSender.
 * @param to    Recipient phone in international format: +919876543210
 * @param text  Message body (plain text, supports \n line breaks)
 */
export async function sendWhatsApp(to: string, text: string): Promise<SendResult> {
    const apiKey = process.env.WASENDER_API_KEY
    if (!apiKey) {
        console.error('[WaSender] WASENDER_API_KEY is not set')
        return { success: false, error: 'WASENDER_API_KEY not configured' }
    }

    // WaSender expects number without + prefix
    const normalizedTo = to.startsWith('+') ? to.slice(1) : to

    try {
        const res = await fetch(WASENDER_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ to: normalizedTo, text }),
        })

        if (!res.ok) {
            const body = await res.text()
            console.error(`[WaSender] API error ${res.status}:`, body)
            return { success: false, error: `WaSender error: ${res.status}` }
        }

        return { success: true }
    } catch (err) {
        console.error('[WaSender] Network error:', err)
        return { success: false, error: 'Network error sending WhatsApp' }
    }
}

// ── Message templates ────────────────────────────────────────────────────────

/**
 * Message sent to the VENDOR when a new booking request arrives.
 */
export function vendorBookingMessage({
    bookingRef,
    activityTitle,
    customerName,
    customerPhone,
    bookingDate,
    timeSlot,
    peopleCount,
}: {
    bookingRef: string
    activityTitle: string
    customerName: string
    customerPhone: string
    bookingDate: string
    timeSlot: string
    peopleCount: number
}): string {
    return [
        `📅 *New Booking Request — Outsyd*`,
        ``,
        `*Ref:* ${bookingRef}`,
        `*Activity:* ${activityTitle}`,
        ``,
        `*Customer:* ${customerName}`,
        `*Phone:* ${customerPhone}`,
        ``,
        `*Date:* ${bookingDate}`,
        `*Time:* ${timeSlot}`,
        `*People:* ${peopleCount}`,
        ``,
        `Please reply *CONFIRM ${bookingRef}* or *REJECT ${bookingRef}* within 30 minutes.`,
        ``,
        `_Powered by Outsyd_`,
    ].join('\n')
}

/**
 * Message sent to OPS when a vendor hasn't responded within the timeout window.
 */
export function opsEscalationMessage({
    bookingRef,
    activityTitle,
    placeName,
    customerName,
    customerPhone,
    bookingDate,
    timeSlot,
    peopleCount,
    vendorPhone,
}: {
    bookingRef: string
    activityTitle: string
    placeName: string
    customerName: string
    customerPhone: string
    bookingDate: string
    timeSlot: string
    peopleCount: number
    vendorPhone?: string
}): string {
    return [
        `⚠️ *Booking Escalation — No Vendor Response*`,
        ``,
        `*Ref:* ${bookingRef}`,
        `*Activity:* ${activityTitle}`,
        `*Venue:* ${placeName}`,
        `*Vendor Phone:* ${vendorPhone ?? 'Not set'}`,
        ``,
        `*Customer:* ${customerName}`,
        `*Customer Phone:* ${customerPhone}`,
        ``,
        `*Date:* ${bookingDate}`,
        `*Time:* ${timeSlot}`,
        `*People:* ${peopleCount}`,
        ``,
        `Vendor did not respond in time. Please follow up manually.`,
    ].join('\n')
}
