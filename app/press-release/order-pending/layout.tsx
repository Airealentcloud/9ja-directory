import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Press Release Order Pending | 9jaDirectory',
  description: 'Pending payment and transfer confirmation details for 9jaDirectory press release orders.',
  robots: { index: false, follow: false },
}

export default function PressReleaseOrderPendingLayout({ children }: { children: React.ReactNode }) {
  return children
}
