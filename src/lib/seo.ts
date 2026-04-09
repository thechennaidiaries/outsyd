export interface SeoMetadataInput {
  title: string
  placeName?: string
  area?: string
  city: string
  tags?: string[]
}

/**
 * Generates SEO metadata for activities based on specific business rules.
 */
export function generateActivitySeo(input: SeoMetadataInput) {
  const { title, placeName, area, city, tags = [] } = input

  // Helper to clean titles if they are too long
  const cleanTitle = (t: string) => {
    return t
      .replace(/ with your friends/i, '')
      .replace(/ with friends/i, '')
      .replace(/ with your gang/i, '')
      .trim()
  }

  const baseTitle = title
  const shortTitle = cleanTitle(title)

  // --- Meta Title Logic ---
  // Try Best: {title} at {placeName}, {city} | Things to Do
  let finalTitle = `${baseTitle} at ${placeName}, ${city} | Things to Do`

  // If too long, try with shortTitle
  if (finalTitle.length > 60 && placeName) {
    finalTitle = `${shortTitle} at ${placeName}, ${city} | Things to Do`
  }

  // Fallback: {title} in {city} | Things to Do
  if (finalTitle.length > 60 || !placeName) {
    const candidate = `${baseTitle} in ${city} | Things to Do`
    if (candidate.length <= 60) {
      finalTitle = candidate
    } else {
      finalTitle = `${shortTitle} in ${city} | Things to Do`
    }
  }

  // Long-title fallback: {title} | Things to Do in {city}
  if (finalTitle.length > 60) {
    const candidate = `${baseTitle} | Things to Do in ${city}`
    if (candidate.length <= 65) { // Slightly more lenient for this format
       finalTitle = candidate
    } else {
       finalTitle = `${shortTitle} | Things to Do in ${city}`
    }
  }

  // --- Meta Description Logic ---
  const isSocial = tags.some(t => 
    ['sports activities', 'night activities', 'gaming activities', 'group activities'].includes(t.toLowerCase())
  ) || title.toLowerCase().includes('friends') || title.toLowerCase().includes('gang') || title.toLowerCase().includes('showdown')

  const callToAction = isSocial ? 'plan your next game with friends.' : 'plan your next outing.'
  
  let description = ''
  if (placeName) {
    description = `Discover ${title} at ${placeName} in ${city}. Check timings, pricing, location, and ${callToAction}`
  } else if (area) {
    description = `Discover ${title} in ${area}, ${city}. Check timings, pricing, location, and ${callToAction}`
  } else {
    description = `Discover ${title} in ${city}. Check timings, pricing, location, and ${callToAction}`
  }

  // Ensure description is within 140-160 (basic trim if extreme)
  if (description.length > 165) {
     description = description.substring(0, 162) + '...'
  }

  return {
    metaTitle: finalTitle,
    metaDescription: description
  }
}
