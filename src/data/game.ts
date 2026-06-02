export interface GamePuzzle {
  id: string
  date: string                        // YYYY-MM-DD (IST)
  location: string                    // Display name
  area: string
  placeType: string                   // e.g. 'Area', 'Landmark', 'Temple'
  images: [string, string, string]    // clue 1 (hardest) → clue 3 (easiest)
  acceptedPatterns: string[]          // regex pattern strings
  aliases?: string[]                  // optional plain text aliases for fuzzy matching/typo tolerance
  funFact?: string
  mapsLink?: string
}

export function getTodayIST(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function normalizeString(str: string): string {
  return str.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
}

export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }
  return dp[m][n]
}

export function isFuzzyMatch(inputNorm: string, targetNorm: string): boolean {
  if (!inputNorm || !targetNorm) return false
  const dist = levenshteinDistance(inputNorm, targetNorm)
  const len = targetNorm.length

  if (len <= 4) {
    return dist === 0 // exact match only for very short targets (e.g. "au")
  } else if (len <= 8) {
    return dist <= 1  // 1 typo allowed for medium targets
  } else {
    return dist <= 2  // 2 typos allowed for long targets
  }
}

export function checkAnswer(input: string, puzzle: GamePuzzle): boolean {
  const normInput = normalizeString(input)
  if (!normInput) return false

  // 1. Regular Expression / Exact Matching (First priority, ensures backwards compatibility)
  const matchedRegex = puzzle.acceptedPatterns.some(p => {
    try { return new RegExp(p, 'i').test(normInput) } catch { return false }
  })
  if (matchedRegex) return true

  // 2. Fuzzy Matching & Typo Tolerance (Fallback)
  const targets: string[] = []
  const addTarget = (val: string) => {
    const norm = normalizeString(val)
    if (norm && targets.indexOf(norm) === -1) {
      targets.push(norm)
    }
  }

  addTarget(puzzle.location)
  if (puzzle.aliases) {
    puzzle.aliases.forEach(addTarget)
  }

  for (let i = 0; i < targets.length; i++) {
    if (isFuzzyMatch(normInput, targets[i])) {
      return true
    }
  }

  return false
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
    location: 'Urban Square',
    area: 'Guindy',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/kathipara1.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/kathi2.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/Screenshot%202026-05-19%20at%2010.56.24%E2%80%AFPM.png',
    ],
    acceptedPatterns: [
      'kathipara',
      'katipara',
      'kattipara',
      'khatipara',
      'katheepara',
      'kadhipara',
      'urban\\s*sq',
      'urben\\s*sq',
      'up\\s*town',
    ],
  },
  {
    id: 'game-014',
    date: '2026-05-21',
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
  {
    id: 'game-015',
    date: '2026-05-22',
    location: 'VR Mall',
    area: 'Anna Nagar',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/vr1_compressed.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/vr2_compressed.png',
      'https://ik.imagekit.io/zxnq8x4yz/vr3_compressed.jpg',
    ],
    acceptedPatterns: [
      'v\\s*r\\b',
      'v\\s*r\\s*mall',
      'v\\s*r\\s*chennai',
      'virtuous\\s*retail',
    ],
  },
  {
    id: 'game-016',
    date: '2026-05-23',
    location: 'Madras Christian College',
    area: 'Tambaram',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/mcc1.png',
      'https://ik.imagekit.io/zxnq8x4yz/mcc2.png',
      'https://ik.imagekit.io/zxnq8x4yz/mcc3.png',
    ],
    acceptedPatterns: [
      '\\bmcc\\b',
      'madras\\s*christ[ia]+n',
      'mcc\\s*col+ege',
      'mcc\\s*chennai',
    ],
  },
  {
    id: 'game-017',
    date: '2026-05-24',
    location: 'Thoraipakkam',
    area: 'Thoraipakkam',
    placeType: 'Area',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/THORAIPAKKAM1.png',
      'https://ik.imagekit.io/zxnq8x4yz/THORAIPAKKAM2.png',
      'https://ik.imagekit.io/zxnq8x4yz/thoraipakkam3.png',
    ],
    acceptedPatterns: [
      'th[ou]raipakk?am',
      'thorapakkam',
      'thurapakkam',
    ],
  },
  {
    id: 'game-018',
    date: '2026-05-25',
    location: 'Broken Bridge',
    area: 'Besant Nagar',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/brokenbridge1.png',
      'https://ik.imagekit.io/zxnq8x4yz/brokenbridge2.png',
      'https://ik.imagekit.io/zxnq8x4yz/brokenbridge3.png',
    ],
    acceptedPatterns: [
      'broken\\s*bridge',
      'brok+en\\s*bridge',
    ],
  },
  {
    id: 'game-019',
    date: '2026-05-26',
    location: 'Guru Nanak College',
    area: 'Velachery',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/gurunanak1.png',
      'https://ik.imagekit.io/zxnq8x4yz/gurunanak2.png',
      'https://ik.imagekit.io/zxnq8x4yz/gurunanak3.png',
    ],
    acceptedPatterns: [
      'guru\\s*nanak',
      'gurunanak',
    ],
  },
  {
    id: 'game-020',
    date: '2026-05-27',
    location: 'Anna Centenary Library',
    area: 'Kotturpuram',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/annalibrary1.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/annalibrary2.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/annalibrary3.jpg',
    ],
    acceptedPatterns: [
      'anna\\s*cent[ae]n[ae]ry\\s*lib(rary)?',
      'cent[ae]n[ae]ry\\s*lib(rary)?',
      'anna\\s*lib(rary)?',
      'anna\\s*lib',
    ],
  },

  {
    id: 'game-021',
    date: '2026-05-28',
    location: 'Bask by Coffee',
    area: 'Teynampet',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/bask1.jpeg',
      'https://ik.imagekit.io/zxnq8x4yz/bask2.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/bask3.jpg',
    ],
    acceptedPatterns: [
      'bask\\s*by\\s*cof+e+',
      'bask\\s*(caf[eé]|cafe)',
      'bask\\s*teyn[ae]mp[ae]t',
      '\\bbask\\b',
    ],
  },

  {
    id: 'game-022',
    date: '2026-05-29',
    location: 'Vandalur Zoo',
    area: 'Vandalur',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/vandalur1.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/vandalur22.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/vandalur3.jpg',
    ],
    acceptedPatterns: [
      'van?dal[uo]r\\s*(zoo)?',
      'arignar\\s*anna\\s*(zoo(logical)?\\s*(park)?)?',
      'anna\\s*zoo(logical)?\\s*(park)?',
      'anna\\s*park',
    ],
  },

  {
    id: 'game-023',
    date: '2026-05-30',
    location: 'Ciclo Cafe',
    area: 'Nungambakkam',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ciclo1.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/%20ciclo2.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/ciclo3.jpg',
    ],
    acceptedPatterns: [
      'c[iy]cl[ao]\\s*(caf[eé]|cafe)?',
      'siklo\\s*(caf[eé]|cafe)?',
    ],
  },

  {
    id: 'game-024',
    date: '2026-05-31',
    location: 'Kamala Cinemas',
    area: 'Thousand Lights',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kamala1.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kamala2.jpg',
      'https://ik.imagekit.io/zxnq8x4yz/images%20of%20things%20to%20do/kamala3.jpg',
    ],
    acceptedPatterns: [
      'kamal+a\\s*(cinema[s]?|theatre|theater|t[h]?eatre)?',
      '\\bkamala\\b',
    ],
  },
  {
    id: 'game-025',
    date: '2026-06-01',
    location: 'Anna University',
    area: 'Guindy',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/annauniv1.webp',
      'https://ik.imagekit.io/zxnq8x4yz/anna2.webp',
      'https://ik.imagekit.io/zxnq8x4yz/annauniv3.webp',
    ],
    acceptedPatterns: [
      'anna\\s*university',
      'anna\\s*univ',
      '\\ba\\s*u\\b',
    ],
    aliases: [
      'anna university',
      'anna univ',
      'au',
    ],
  },
  {
    id: 'game-026',
    date: '2026-06-02',
    location: 'Chennai Trade Centre',
    area: 'Nandambakkam',
    placeType: 'Place',
    images: [
      'https://ik.imagekit.io/zxnq8x4yz/tradecentreone.webp',
      'https://ik.imagekit.io/zxnq8x4yz/tradecentre2.webp',
      'https://ik.imagekit.io/zxnq8x4yz/tradecentre3.webp',
    ],
    acceptedPatterns: [
      'chennai\\s*trade\\s*cen?tr[ea]',
      'trade\\s*cen?tr[ea]',
      '\\bc\\s*t\\s*c\\b',
    ],
    aliases: [
      'chennai trade centre',
      'trade centre',
      'ctc',
    ],
  },

]
