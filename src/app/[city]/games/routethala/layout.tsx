import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Route Thala: Guess the Mystery Chennai Spot',
  description: 'Route Thala is a daily Chennai guessing game where you identify local streets, landmarks, and hidden corners from just 3 picture clues. Guess a new Chennai spot every day.',
  openGraph: {
    title: 'Route Thala: Guess the Mystery Chennai Spot',
    description: 'Route Thala is a daily Chennai guessing game where you identify local streets, landmarks, and hidden corners from just 3 picture clues. Guess a new Chennai spot every day.',
  },
}

export default function RouteThalaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
