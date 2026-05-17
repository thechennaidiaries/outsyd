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

export function getPuzzleForToday(): GamePuzzle {
  const today = getTodayIST()
  return PUZZLES.find(p => p.date === today)
    ?? PUZZLES.find(p => p.id === 'game-006')!  // fallback: Alandur
}

// ── Puzzle Schedule ───────────────────────────────────────────────
export const PUZZLES: GamePuzzle[] = [

  {
    id: 'game-006',
    date: '2026-05-13',
    location: 'Alandur',
    area: 'Alandur',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/Screenshot%202026-05-13%20at%201.13.30%E2%80%AFPM.png',
      'https://ik.imagekit.io/zxnq8x4yz/alandur2.png',
      'https://ik.imagekit.io/zxnq8x4yz/alandur3.png',
    ],
    acceptedPatterns: [
      'alandur',
      'aalandur',
      'alandhur',
    ],
  },
  {
    id: 'game-007',
    date: '2026-05-14',
    location: 'Nandanam',
    area: 'Nandanam',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/nandanam1.png',
      'https://ik.imagekit.io/zxnq8x4yz/Screenshot%202026-05-14%20at%201.53.29%E2%80%AFAM.png',
      'https://ik.imagekit.io/zxnq8x4yz/Screenshot%202026-05-14%20at%201.54.30%E2%80%AFAM.png',
    ],
    acceptedPatterns: [
      'nandanam',
      'nandhannam',
      'nandnam',
    ],
  },
  {
    id: 'game-008',
    date: '2026-05-15',
    location: 'Pondy Bazaar',
    area: 'T Nagar',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue1.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondyclue2.png',
      'https://ik.imagekit.io/zxnq8x4yz/pondy3.png',
    ],
    acceptedPatterns: [
      'pond[yi]\\s*baz?aa?r',
      'pandy\\s*baz?aa?r',
      'pondi\\s*bazaar',
      '^pondy$',
      'pondybazar',
    ],
    mapsLink: 'https://maps.app.goo.gl/6bWVGiKM5C7dqfBP9',
  },
  {
    id: 'game-009',
    date: '2026-05-16',
    location: 'Kapaleeshwarar Temple',
    area: 'Mylapore',
    placeType: 'Temple',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/kapaleeswarartemple2.png?updatedAt=1778568484990',
      'https://ik.imagekit.io/zxnq8x4yz/kapaleeswarar%20temple3.png?updatedAt=1778568484107',
      'https://ik.imagekit.io/zxnq8x4yz/temple3.png',
    ],
    acceptedPatterns: [
      'kapale[ei]?s[h]?warar',
      'kapaliswarar',
      'kapaleeshwar',
      'kapaleeswarar\\s*temple',
      'kapaleeshwarar\\s*temple',
      'mylapore\\s*temple',
    ],
  },
  {
    id: 'game-010',
    date: '2026-05-17',
    location: 'Sholinganallur',
    area: 'Sholinganallur',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/shollinganallur1.png?updatedAt=1778568484842',
      'https://ik.imagekit.io/zxnq8x4yz/shollinganallur2.png?updatedAt=1778568484685',
      'https://ik.imagekit.io/zxnq8x4yz/shollinganallur3.png?updatedAt=1778568484330',
    ],
    acceptedPatterns: [
      'shol+ingan(a|al)lur',
      'sholinganalur',
      'sholingnallur',
      'shollinganallur',
    ],
  },
  {
    id: 'game-011',
    date: '2026-05-18',
    location: 'Chennai Central Railway Station',
    area: 'Chennai Central',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/central1.png',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/central2.png',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/central3.png',
    ],
    acceptedPatterns: [
      '^(chennai|chenai|madras)?\\s*cen?tr[ea]l\\s*(railway[s]?|rail)?\\s*(station|stn|staiton)?$',
    ],
  },
  {
    id: 'game-012',
    date: '2026-05-19',
    location: 'Loyola College',
    area: 'Nungambakkam',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/loyola1.png',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/loyola2.png',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/loyola3.png',
    ],
    acceptedPatterns: [
      '^l[oaiy]+l+[ao]\\s*(col+ege|college|clg|collge)?$',
    ],
  },
  {
    id: 'game-013',
    date: '2026-05-20',
    location: 'Perumbakkam',
    area: 'Perumbakkam',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/perumbakkam1.png?updatedAt=1778568484564',
      'https://ik.imagekit.io/zxnq8x4yz/perumbakkam2.png?updatedAt=1778568484814',
      'https://ik.imagekit.io/zxnq8x4yz/perumbakkam3.png?updatedAt=1778568483986',
    ],
    acceptedPatterns: [
      'perumbak+am',
      'perumbakam',
      'perumbakkam',
    ],
  },
]
