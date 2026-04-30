import { Suspense } from 'react'
import LivePlanClient from './LivePlanClient'
import { fetchCityBySlug } from '@/lib/supabase-data'

interface Props {
    params: { city: string; id: string }
}

export async function generateMetadata({ params }: Props) {
    const city = await fetchCityBySlug(params.city)
    const cityName = city?.name ?? 'City'
    return {
        title: `Shared Plan — TBOC ${cityName}`,
        description: `View and edit a shared day-out plan in ${cityName} — no account needed. Add activities and plan together in real time.`,
    }
}

export default function LivePlanPage({ params }: Props) {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
            <LivePlanClient planId={params.id} />
        </Suspense>
    )
}
