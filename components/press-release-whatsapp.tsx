import { MessageCircle } from 'lucide-react'

type Props = {
  number?: string
}

const DEFAULT_NUMBER = '2349160023442' // 09160023442 in international format

export default function PressReleaseWhatsApp({ number = DEFAULT_NUMBER }: Props) {
  const link = `https://wa.me/${number}`

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 sm:right-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-3 text-white shadow-lg shadow-green-600/30 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" aria-hidden />
      <span className="hidden sm:inline text-sm font-semibold">WhatsApp</span>
    </a>
  )
}
