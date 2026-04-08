import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { nanoid } from 'nanoid'

// POST /api/plans — Create a new plan
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, date, city, activities } = body

        if (!name?.trim() || !date || !city?.trim()) {
            return NextResponse.json(
                { error: 'name, date, and city are required' },
                { status: 400 }
            )
        }

        const id = nanoid(8)

        const { error } = await supabase.from('plans').insert({
            id,
            name: name.trim(),
            date,
            city: city.trim(),
            activities: activities ?? [],
        })

        if (error) {
            console.error('Supabase insert error:', error)
            return NextResponse.json(
                { error: 'Failed to create plan' },
                { status: 500 }
            )
        }

        return NextResponse.json({ id }, { status: 201 })
    } catch (err) {
        console.error('POST /api/plans error:', err)
        return NextResponse.json(
            { error: 'Invalid request' },
            { status: 400 }
        )
    }
}
