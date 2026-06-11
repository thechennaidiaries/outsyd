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
    song: 'Uyirin Uyire',
    movie: 'Kaakha Kaakha',
    year: 2003,
    hints: [
      'For every second you delay, death happens in installment',
      "Won't you come near? Won't you give your fingers? You.. you..",
      'Life of life, life of life, I am waiting on the lap of the river',
      'The wet waves collect water and splash it on my face, but I am still sweating'
    ],
    acceptedPatterns: [
      'uyirin\\s*uyire',
      'uyirinuyire',
    ],
  },

  {
    id: 'paatify-004',
    date: '2026-06-05',
    song: 'Kadhaippoma',
    movie: 'Oh My Kadavule',
    year: 2020,
    hints: [
      "Even though I know it's true\nMy heart hesitates to say it",
      'If we hold hands and talk together\nCourage will begin to appear',
      'Shall we talk?\nShall we talk?',
      'Shall we talk?\nThe more you speak, The more my wounds will heal'
    ],
    acceptedPatterns: [
      'kadhaippoma',
      'kadhaippomaa',
      'kadhaipoma',
    ],
  },

  {
    id: 'paatify-005',
    date: '2026-06-06',
    song: 'Nenjame Nenjame',
    movie: 'Maamannan',
    year: 2023,
    hints: [
      'Oh heart, my heart\nIt whispers softly with affection',
      'Oh shelter, my shelter\nIt has come to me as my own',
      'The wounds you suffered when you were young\nYou never told anyone before',
      'Whether you plead or stand strong\nLove will always triumph, no matter the day'
    ],
    acceptedPatterns: [
      'nenjame\\s*nenjame',
      'nenjamey\\s*nenjamey',
      'nenjame',
    ],
  },

  {
    id: 'paatify-006',
    date: '2026-06-07',
    song: 'Vaarayo Vaarayo',
    movie: 'Aadhavan',
    year: 2009,
    hints: [
      'Will you come, will you come, to fall in love?',
      'There is no breeze that doesn’t speak with the flowers.',
      'Why didn’t this love exist yesterday?',
      'You tell me, my heart'
    ],
    acceptedPatterns: [
      'vaarayo\\s*vaarayo',
      'varayo\\s*varayo',
      'vaarayo',
      'varayo',
    ],
  },

  {
    id: 'paatify-007',
    date: '2026-06-08',
    song: 'Nee Singam Dhan',
    movie: 'Pathu Thala',
    year: 2023,
    hints: [
      'As the whole town stands around watching,\nHe will face the battlefield.',
      'So his army can live in his smile,\nHe will embrace the wounds.',
      'Even when many elephants gather together,\nYou are the lion.',
      'A bird for whom that sky is not enough,\nLooking at the river as a mirror, Its heart is fulfilled today.'
    ],
    acceptedPatterns: [
      'nee\\s*singam\\s*dha?n',
      'nee\\s*singam\\s*tha?n',
      'singam\\s*dha?n',
      'singam\\s*tha?n',
    ],
  },

  {
    id: 'paatify-008',
    date: '2026-06-09',
    song: 'Pathikichu',
    movie: 'Vidaamuyarchi',
    year: 2025,
    hints: [
      'A monster fuse has caught on fire!\nIt will only end after it completely explodes.',
      'A hidden nuclear weapon\nMay now demand the whole world as sacrifice.',
      'Even if a single drop of blood is left remaining,\nThe story hasn\'t ended yet, watch it continue',
      'Forever, keep trying!\nNever lose hope, keep trying.'
    ],
    acceptedPatterns: [
      'pa[td]h?ikich[ui]',
      'pathikichu',
      'patikichu',
      'padhikichu',
      'padikichu',
      'pathikichi',
      'patikichi',
    ],
  },

  {
    id: 'paatify-009',
    date: '2026-06-10',
    song: 'Kanave Kanave',
    movie: 'David',
    year: 2013,
    hints: [
      'The music is gone, My arrogance is gone\nI suffered in the fire of loneliness',
      'My shadow is gone, The reality is gone\nI searched for myself, within me',
      'Oh dream, oh dream, why are you dissolving\nWhy are my hands full of pain',
      'Oh memory, oh memory, why are you slapping me\nWhy is my world falling apart'
    ],
    acceptedPatterns: [
      'kanave\\s*kanave',
      'kanavey\\s*kanavey',
      'kanave',
    ],
  },

  {
    id: 'paatify-010',
    date: '2026-06-11',
    song: 'Pirai Thedum',
    movie: 'Mayakkam Enna',
    year: 2011,
    hints: [
      'A heart that lives only for you',
      'As long as I am alive, I belong to you',
      'In this moon-seeking night, my love\nWhat are you searching for?',
      'I am calling you to tell a story, my love\nCome, my dear'
    ],
    acceptedPatterns: [
      'pirai\\s*thedum',
      'pirai\\s*thedum\\s*iravilae',
      'pirai\\s*thedum\\s*iravil',
      'pirai\\s*theydum',
    ],
  },

  {
    id: 'paatify-011',
    date: '2026-06-12',
    song: 'Thalli Pogathey',
    movie: 'Achcham Yenbadhu Madamaiyada',
    year: 2016,
    hints: [
      'I reached out my hand to touch you\nWhy did I fail there?',
      'Why is my first kiss taking so long?\nThe lotus is burning with longing',
      'Don\'t move away from me\nDon\'t ask me to move away',
      'The lips of both of us are like flowers with thorns'
    ],
    acceptedPatterns: [
      'thalli\\s*pogathey',
      'thalli\\s*pogathe',
      'thalli\\s*pogaadhey',
      'thalli\\s*pogaathe',
      'thallipogathey',
      'thallipogathe',
    ],
  },

  {
    id: 'paatify-012',
    date: '2026-06-13',
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
    id: 'paatify-013',
    date: '2026-06-14',
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
    id: 'paatify-014',
    date: '2026-06-15',
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
    id: 'paatify-015',
    date: '2026-06-16',
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
    id: 'paatify-016',
    date: '2026-06-17',
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
    id: 'paatify-017',
    date: '2026-06-18',
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
