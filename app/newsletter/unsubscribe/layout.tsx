import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter Unsubscribe | 9jaDirectory',
  description: 'Manage your 9jaDirectory newsletter preferences or unsubscribe from email updates.',
  robots: { index: false, follow: false },
}

export default function NewsletterUnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children
}
