import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Things To Do Chennai | Discover Activities in Chennai',
  description: 'Discover the best things to do in Chennai — beaches, food, nightlife, culture, hidden gems and more. Never be bored in Chennai again.',
  keywords: 'things to do in Chennai, Chennai activities, Chennai guide, places to visit Chennai',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
