import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Payment (Internal) | 9jaDirectory',
  description: 'Internal test payment route for payment integration validation.',
  robots: { index: false, follow: false },
}

export default function TestPaymentLayout({ children }: { children: React.ReactNode }) {
  return children
}
