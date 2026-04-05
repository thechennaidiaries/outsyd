import { Suspense } from 'react'
import PlanClient from './PlanClient'
import { getCityBySlug } from '@/data/cities'

interface Props {
    params: { city: string }
}

export async function generateMetadata({ params }: Props) {
    const city = getCityBySlug(params.city)
    const cityName = city?.name ?? 'City'
    return {
        title: `Plan My Day — TBOC ${cityName}`,
        description: `Build a day-out itinerary in ${cityName} and share it with friends — no account needed.`,
    }
}

export default function PlanPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
            <PlanClient />
        </Suspense>
    )
}
