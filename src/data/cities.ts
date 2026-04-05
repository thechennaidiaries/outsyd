export interface City {
    id: string       // slug used in URL, e.g. "chennai"
    name: string     // display name, e.g. "Chennai"
}

export const CITIES: City[] = [
    { id: 'chennai', name: 'Chennai' },
]

/** Look up a city by its URL slug */
export function getCityBySlug(slug: string): City | undefined {
    return CITIES.find(c => c.id === slug)
}
