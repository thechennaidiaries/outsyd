import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/report — Save a report about an activity or event
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { item_title, item_type, reason, details } = body

        if (!item_title?.trim() || !item_type?.trim() || !reason?.trim()) {
            return NextResponse.json(
                { error: 'item_title, item_type, and reason are required' },
                { status: 400 }
            )
        }

        const { error } = await supabase.from('reports').insert({
            item_title: item_title.trim(),
            item_type: item_type.trim(),
            reason: reason.trim(),
            details: (details ?? '').trim(),
        })

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json(
                { error: 'Failed to save report' },
                { status: 500 }
            )
        }

        return NextResponse.json({ ok: true }, { status: 201 })
    } catch (err) {
        console.error('POST /api/report error:', err)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
