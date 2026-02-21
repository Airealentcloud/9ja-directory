import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Verification | 9jaDirectory',
  description: 'Verify your transaction status for 9jaDirectory listing and promotion payments.',
  robots: { index: false, follow: false },
}

export default function PaymentVerifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
