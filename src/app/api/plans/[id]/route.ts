import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteContext {
    params: { id: string }
}

// GET /api/plans/[id] — Fetch a plan
export async function GET(_req: NextRequest, { params }: RouteContext) {
    const { id } = params

    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !data) {
        return NextResponse.json(
            { error: 'Plan not found' },
            { status: 404 }
        )
    }

    return NextResponse.json(data)
}

// PATCH /api/plans/[id] — Update a plan's activities
export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { id } = params

    try {
        const body = await req.json()
        const { activities } = body

        if (!Array.isArray(activities)) {
            return NextResponse.json(
                { error: 'activities must be an array' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('plans')
            .update({
                activities,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: 'Plan not found or update failed' },
                { status: 404 }
            )
        }

        return NextResponse.json(data)
    } catch (err) {
        console.error('PATCH /api/plans/[id] error:', err)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
