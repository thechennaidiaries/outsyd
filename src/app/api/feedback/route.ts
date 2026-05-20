import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/feedback — Save a feedback vote
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { usage, next_feature, suggestion } = body

        if (!usage?.trim() || !next_feature?.trim()) {
            return NextResponse.json(
                { error: 'usage and next_feature are required' },
                { status: 400 }
            )
        }

        const { error } = await supabase.from('feedback_votes').insert({
            usage: usage.trim(),
            next_feature: next_feature.trim(),
            suggestion: (suggestion ?? '').trim(),
        })

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json(
                { error: 'Failed to save feedback' },
                { status: 500 }
            )
        }

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (err) {
        console.error('POST /api/feedback error:', err)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
