import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Best Shawarma in Chennai — Top 22 Spots | Outsyd',
    description: 'Discover the best shawarma spots in Chennai — from Triplicane classics to loaded ECR wraps. Reviews, maps, and everything you need to find your next shawarma fix.',
}

export default function ShawarmaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
