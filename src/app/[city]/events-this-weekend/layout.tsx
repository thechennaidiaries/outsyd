import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events This Weekend in Chennai | Outsyd',
  description: 'Find the best events happening in Chennai this weekend. From concerts and workshops to food festivals and nightlife. Pick a plan, Go Outsyd & have fun.',
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
