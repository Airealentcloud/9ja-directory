import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press Release Payment Success | 9jaDirectory',
  description: 'Payment status page for 9jaDirectory press release orders.',
  robots: { index: false, follow: false },
}

export default function PressReleaseOrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return children
}
