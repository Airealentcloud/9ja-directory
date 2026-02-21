import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | 9jaDirectory',
  description: 'Complete your business listing checkout and payment on 9jaDirectory.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
