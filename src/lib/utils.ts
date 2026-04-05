import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: string) {
    const map: Record<string, string> = {
        free: 'Free',
        under_100: 'Under ₹100',
        under_500: 'Under ₹500',
        under_1000: 'Under ₹1,000',
        above_1000: '₹1,000+',
    }
    return map[price] ?? price
}
