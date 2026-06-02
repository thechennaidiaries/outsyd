export interface PaatifyPuzzle {
  id: string
  date: string                        // YYYY-MM-DD (IST)
  song: string                        // Display song name
  movie: string                       // Movie the song is from
  year?: number                       // Release year
  hints: [string, string, string, string] // 4 lyric lines: hint 1 (hardest) → hint 4 (easiest)
  acceptedPatterns: string[]          // regex pattern strings for answer matching
}

export function getTodayISTPatify(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function checkPaatifyAnswer(input: string, puzzle: PaatifyPuzzle): boolean {
  const norm = input.trim().toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
  return puzzle.acceptedPatterns.some(p => {
    try { return new RegExp(p, 'i').test(norm) } catch { return false }
  })
}

export function formatPaatifyTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getPaatifyPuzzleForToday(): PaatifyPuzzle {
  const today = getTodayISTPatify()
  return PAATIFY_PUZZLES.find(p => p.date === today)
    ?? PAATIFY_PUZZLES[0]   // fallback to first puzzle
}

// ── Puzzle Schedule ───────────────────────────────────────────────
export const PAATIFY_PUZZLES: PaatifyPuzzle[] = [

  {
    id: 'paatify-001',
    date: '2026-06-02',
    song: 'Mutta Kalakki',
    movie: 'Youth',
    year: 2026,
    hints: [
      'When night comes, come into my dreams, my love\nI keep thinking brightly about you',
      'Nothing I study stays inside my head\nThere is no one who can beat you in beauty',
      'Shining girl, you make my heart tremble',
      'Come here, you sassy girl, my egg scrambler!'
    ],
    acceptedPatterns: [
      'mutta\\s*kalakki',
      'muttai\\s*kalakki',
      'kalakki',
    ],
  },

  {
    id: 'paatify-002',
    date: '2026-06-03',
    song: 'Saachitale',
    movie: 'Love Today',
    year: 2022,
    hints: [
      'The whole town looked at her\nBut she looked only at me',
      'She won’t believe whatever anyone says\nShe’s the one who asked for my number',
      'If boys try to show off infront of her\nshe wouldn’t even notice them',
      'She started talking with me\nAm I really that smart?'
    ],
    acceptedPatterns: [
      'saachitale',
      'sachitale',
      'saachi\\s*tale',
    ],
  },

  {
    id: 'paatify-003',
    date: '2026-06-04',
    song: 'Chinna Chinna Aasai',
    movie: 'Roja',
    year: 1992,
    hints: [
      'Come inside, O gentle breeze, carrying my flower\'s fragrance...',
      'A desire to spread wings and fly away...',
      'The sky leans down and gently touches the moon...',
      'Little little wishes, little little wishes...',
    ],
    acceptedPatterns: [
      'chinna\\s*chinna\\s*aasai',
      'china\\s*china\\s*asai',
      'chinna\\s*aasai',
      'sinna\\s*aasai',
      'little\\s*little\\s*wish',
      'small\\s*small\\s*wish',
    ],
  },

  {
    id: 'paatify-004',
    date: '2026-06-05',
    song: 'Uyire',
    movie: 'Bombay',
    year: 1995,
    hints: [
      'Are two eyes even enough to express this love?',
      'This entire love bloomed like a flower from a single drop of rain...',
      'O glowing lamp, you are the garland of all my love...',
      'My life, my life, my life, my very life...',
    ],
    acceptedPatterns: [
      '^uyire?$',
      'uyir[ei]\\s*uyir[ei]',
    ],
  },

  {
    id: 'paatify-005',
    date: '2026-06-06',
    song: 'Vinnaithaandi Varuvaayaa',
    movie: 'Vinnaithaandi Varuvaayaa',
    year: 2010,
    hints: [
      'A single drop of damp breeze brings your scent...',
      'O love, O love, please don\'t kill me...',
      'My love has dissolved into an illusion...',
      'Will you cross the skies to come to me?',
    ],
    acceptedPatterns: [
      'vinnai?thaa?ndi?\\s*varuvaa?yaa?',
      'vinnai\\s*thandi',
      '\\bvtv\\b',
      'cross\\s*the\\s*sk(y|ies)',
    ],
  },

  {
    id: 'paatify-006',
    date: '2026-06-07',
    song: 'Munbe Vaa',
    movie: 'Sillunu Oru Kaadhal',
    year: 2006,
    hints: [
      'I walked into a place where I didn\'t even know the way...',
      'I will rent space from the moon and make you reside in my eyes...',
      'You came as a dream that my eyes had never seen...',
      'Come before me, my love, come to me...',
    ],
    acceptedPatterns: [
      'munbe?\\s*vaa?',
      'munbe\\s*va',
      'en\\s*anbe\\s*vaa?',
    ],
  },

  {
    id: 'paatify-007',
    date: '2026-06-08',
    song: 'Nenjukkul Peidhidum',
    movie: 'Vaaranam Aayiram',
    year: 2010,
    hints: [
      'Suddenly the weather changes completely, and the mistake is all yours, my girl...',
      'You left, forgetting me — and then came back searching for me...',
      'O rain, O rain, come along with me...',
      'The rain that keeps falling deep inside my heart...',
    ],
    acceptedPatterns: [
      'nenjuk+ul\\s*peidhidum',
      'nenjukkul\\s*pedhidum',
      'nenjukul\\s*peidhidum',
      'nenjukkul',
    ],
  },

  {
    id: 'paatify-008',
    date: '2026-06-09',
    song: 'Kannaana Kanney',
    movie: 'Viswasam',
    year: 2019,
    hints: [
      'Who am I to you? And who are you to me?',
      'You touched and touched just to look; you asked and asked just to listen...',
      'You threw a stone at my glass heart, breaking it into pieces...',
      'Apple of my eye, you are the dizziness behind my gaze...',
    ],
    acceptedPatterns: [
      'kannaa?na\\s*kanne?y?',
      'kanana\\s*kaney',
      'kannaana\\s*kanne',
    ],
  },

]
