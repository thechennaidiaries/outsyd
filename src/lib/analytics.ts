import { BetaAnalyticsDataClient } from '@google-analytics/data'

/**
 * NOTE: These environment variables must be set in your .env.local file
 * GA_PROPERTY_ID: Your 9-digit numeric Property ID
 * GA_CLIENT_EMAIL: The email from your service account JSON
 * GA_PRIVATE_KEY: The private_key from your service account JSON
 */

const propertyId = process.env.GA_PROPERTY_ID
const clientEmail = process.env.GA_CLIENT_EMAIL
const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n')

// Initialize client only if credentials are provided
const analyticsClient = (clientEmail && privateKey) 
    ? new BetaAnalyticsDataClient({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
      })
    : null

/**
 * Fetches the top active pages from the last 7 days
 * @param limit Number of pages to return
 */
export async function getTopPerformingPages(limit: number = 10) {
    if (!analyticsClient || !propertyId) {
        console.warn('Google Analytics API credentials not configured.')
        return []
    }

    try {
        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            limit,
        })

        return response.rows?.map(row => ({
            path: row.dimensionValues?.[0].value,
            title: row.dimensionValues?.[1].value,
            views: row.metricValues?.[0].value,
        })) || []
    } catch (error) {
        console.error('Error fetching GA report:', error)
        return []
    }
}

/**
 * Fetches active visitor count for the last 28 days
 */
export async function getTotalVisitors() {
    if (!analyticsClient || !propertyId) return 0

    try {
        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
            metrics: [{ name: 'activeUsers' }],
        })

        return parseInt(response.rows?.[0].metricValues?.[0].value || '0', 10)
    } catch (error) {
        console.error('Error fetching GA visitor count:', error)
        return 0
    }
}
