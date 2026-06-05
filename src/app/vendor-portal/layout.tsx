import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Outsyd Vendor Portal',
    description: 'Manage your events, track bookings, and monitor payouts.',
    robots: 'noindex, nofollow', // Vendor portal should not be indexed
}

export default function VendorPortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={inter.className} data-portal="vendor">
            {children}
        </div>
    )
}
