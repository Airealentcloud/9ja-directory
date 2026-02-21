import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account | 9jaDirectory',
  description: 'Create your 9jaDirectory account to list and promote your business across Nigeria.',
  robots: { index: false, follow: false },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
