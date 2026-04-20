/**
 * Appends ImageKit transformation parameters to an image URL.
 * Safely handles absolute URLs without breaking existing query parameters.
 * 
 * @param url The absolute ImageKit URL
 * @param tr Transformation parameters (e.g. 'w-400,q-60,f-auto')
 * @returns The optimized URL string, or original URL if invalid
 */
export function optimizeImageUrl(url: string | undefined | null, tr: string = 'w-640,q-60,f-auto'): string {
    if (!url) return ''

    try {
        const u = new URL(url)
        
        // Only apply transformations to ImageKit domains to avoid breaking external links
        if (u.hostname === 'ik.imagekit.io') {
            u.searchParams.set('tr', tr)
        }
        
        return u.toString()
    } catch {
        // Fallback for relative paths or invalid URLs
        return url
    }
}
