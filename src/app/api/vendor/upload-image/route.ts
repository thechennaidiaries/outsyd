/**
 * POST /api/vendor/upload-image
 *
 * Accepts a multipart form upload, uploads to ImageKit on behalf of the vendor,
 * and returns the public URL. Requires vendor to be authenticated and active.
 *
 * Body: FormData with field `file` (image) and optional `folder` (string)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabase } from '@/lib/supabase'

const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify vendor is active
    const { data: vendor } = await supabase
        .from('vendors')
        .select('id, status')
        .eq('owner_user_id', session.userId)
        .single()

    if (!vendor || vendor.status !== 'active') {
        return NextResponse.json({ error: 'Vendor not active' }, { status: 403 })
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
    if (!privateKey) {
        return NextResponse.json({ error: 'ImageKit not configured' }, { status: 500 })
    }

    // Parse multipart form
    let formData: FormData
    try {
        formData = await req.formData()
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || '/vendor-events'

    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large. Max 5 MB.' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Build multipart for ImageKit
    const ikForm = new FormData()
    ikForm.append('file', file)
    ikForm.append('fileName', `event-${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`)
    ikForm.append('folder', folder)
    ikForm.append('useUniqueFileName', 'true')

    const credentials = Buffer.from(`${privateKey}:`).toString('base64')

    const ikRes = await fetch(IMAGEKIT_UPLOAD_URL, {
        method: 'POST',
        headers: { Authorization: `Basic ${credentials}` },
        body: ikForm,
    })

    const ikData = await ikRes.json()

    if (!ikRes.ok) {
        console.error('[upload-image] ImageKit error:', ikData)
        return NextResponse.json({ error: ikData.message || 'Upload failed' }, { status: 500 })
    }

    return NextResponse.json({ url: ikData.url, fileId: ikData.fileId })
}
