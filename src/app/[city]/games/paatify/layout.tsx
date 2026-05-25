import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paatify: Guess the Tamil Song from its English Translation',
  description:
    'Paatify is a daily Tamil song guessing game. You get 3 English translations of Tamil lyrics as hints — guess the original song name in as few tries as possible!',
  openGraph: {
    title: 'Paatify: Guess the Tamil Song from the Lyrics',
    description:
      'Paatify is a daily Tamil song guessing game. You get 3 lyric hints — guess the song name in as few tries as possible. A new song drops every day!',
    url: 'https://www.outsyd.in/chennai/games/paatify',
    siteName: 'Outsyd',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paatify: Guess the Tamil Song from the Lyrics',
    description:
      'Paatify is a daily Tamil song guessing game. You get 3 lyric hints — guess the song name in as few tries as possible. A new song drops every day!',
  },
  alternates: {
    canonical: 'https://www.outsyd.in/chennai/games/paatify',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PaatifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
