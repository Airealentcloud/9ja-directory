import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter Verification | 9jaDirectory',
  description: 'Confirm your email to verify your 9jaDirectory newsletter subscription.',
  robots: { index: false, follow: false },
}

export default function NewsletterVerifyLayout({ children }: { children: React.ReactNode }) {
  return children
}
