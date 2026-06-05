// Type declaration for @cashfreepayments/cashfree-js
// The package ships a JS bundle without .d.ts — this silences the TS error.

declare module '@cashfreepayments/cashfree-js' {
    interface LoadOptions {
        mode: 'sandbox' | 'production'
    }

    interface CheckoutOptions {
        paymentSessionId: string
        redirectTarget?: '_self' | '_blank' | '_top' | '_parent'
    }

    interface CashfreeInstance {
        checkout(options: CheckoutOptions): void
    }

    export function load(options: LoadOptions): Promise<CashfreeInstance>
}
