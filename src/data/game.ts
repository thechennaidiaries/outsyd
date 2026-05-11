export interface GamePuzzle {
  id: string
  date: string                        // YYYY-MM-DD (IST)
  location: string                    // Display name
  area: string
  placeType: string                   // e.g. 'Area', 'Landmark', 'Temple'
  images: [string, string, string]    // clue 1 (hardest) → clue 3 (easiest)
  acceptedPatterns: string[]          // regex pattern strings
  funFact?: string
  mapsLink?: string
}

export function getTodayIST(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function checkAnswer(input: string, puzzle: GamePuzzle): boolean {
  const norm = input.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
  return puzzle.acceptedPatterns.some(p => {
    try { return new RegExp(p, 'i').test(norm) } catch { return false }
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getPuzzleForToday(): GamePuzzle | null {
  const today = getTodayIST()
  return PUZZLES.find(p => p.date === today) || null
}

// ── Puzzle Schedule ───────────────────────────────────────────────
export const PUZZLES: GamePuzzle[] = [
  {
    id: 'game-001',
    date: '2026-04-30',
    location: 'Pondy Bazaar',
    area: 'T Nagar',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue1.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue2.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue3.png',
    ],
    acceptedPatterns: [
      'pond[yi]\\s*baz?aa?r',
      'pandy\\s*baz?aa?r',
      'pondi\\s*bazaar',
      '^pondy$',
      'pondybazar',
    ],
    funFact: 'Pondy Bazaar is one of the busiest shopping hubs in Chennai, lined with street vendors, stores, and iconic food stalls.',
    mapsLink: 'https://maps.app.goo.gl/6bWVGiKM5C7dqfBP9',
  },
  {
    id: 'game-002',
    date: '2026-05-09',
    location: 'Pondy Bazaar',
    area: 'T Nagar',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue1.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue2.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue3.png',
    ],
    acceptedPatterns: [
      'pond[yi]\\s*baz?aa?r',
      'pandy\\s*baz?aa?r',
      'pondi\\s*bazaar',
      '^pondy$',
      'pondybazar',
    ],
    funFact: 'Pondy Bazaar is one of the busiest shopping hubs in Chennai, lined with street vendors, stores, and iconic food stalls.',
    mapsLink: 'https://maps.app.goo.gl/6bWVGiKM5C7dqfBP9',
  },
  {
    id: 'game-003',
    date: '2026-05-10',
    location: 'Pondy Bazaar',
    area: 'T Nagar',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue1.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue2.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue3.png',
    ],
    acceptedPatterns: [
      'pond[yi]\\s*baz?aa?r',
      'pandy\\s*baz?aa?r',
      'pondi\\s*bazaar',
      '^pondy$',
      'pondybazar',
    ],
    funFact: 'Pondy Bazaar is one of the busiest shopping hubs in Chennai, lined with street vendors, stores, and iconic food stalls.',
    mapsLink: 'https://maps.app.goo.gl/6bWVGiKM5C7dqfBP9',
  },
  {
    id: 'game-004',
    date: '2026-05-11',
    location: 'Pondy Bazaar',
    area: 'T Nagar',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue1.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue2.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue3.png',
    ],
    acceptedPatterns: [
      'pond[yi]\\s*baz?aa?r',
      'pandy\\s*baz?aa?r',
      'pondi\\s*bazaar',
      '^pondy$',
      'pondybazar',
    ],
    funFact: 'Pondy Bazaar is one of the busiest shopping hubs in Chennai, lined with street vendors, stores, and iconic food stalls.',
    mapsLink: 'https://maps.app.goo.gl/6bWVGiKM5C7dqfBP9',
  },
]
