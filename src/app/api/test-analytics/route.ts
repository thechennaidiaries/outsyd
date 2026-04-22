import { NextResponse } from 'next/server'
import { getTopPerformingPages, getTotalVisitors } from '@/lib/analytics'

export async function GET() {
    try {
        const topPages = await getTopPerformingPages(5)
        const visitors = await getTotalVisitors()

        return NextResponse.json({
            success: true,
            data: {
                totalVisitorsLast28Days: visitors,
                topPerformingPagesLast7Days: topPages
            }
        })
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error occurred'
        }, { status: 500 })
    }
}
