import type { Metadata } from 'next'
import Link from 'next/link'
import CopywritingGallery from '@/components/copywriting-gallery'
import CopywritingConfigurator from '@/components/copywriting-configurator'

const offer = {
  priceLabel: 'NGN 100,000',
  scope: '1000 words + logo creation',
  turnaround: '2-4 business days',
  cta: 'Order copy + logo',
  bullets: [
    'Publication-ready press release copy',
    'Aligned with your brand voice and positioning',
    '4 headline options that grab attention',
    'Includes basic brand logo creation',
    '1 round of revisions included',
  ],
}

const extras = [
  { id: 'speed', title: 'Speed upgrade', desc: '48-hour delivery', price: 30000 },
  { id: 'revision', title: 'Additional revision', desc: 'One more iteration', price: 15000 },
  { id: 'social', title: 'Social snippets', desc: '3 posts for LinkedIn/Twitter/IG', price: 20000 },
]

const galleryImages = [
  { src: '/images/copywriting-hand.jpg', alt: 'Signing and writing a press release draft' },
  { src: '/images/press-starter-logos.png', alt: 'Sample outlet logos for press release distribution' },
]

const whatsappBase = 'https://wa.me/2349160023442?text='
const heroMessage = "Hi 9jaDirectory, I'd like the press release copy + logo service."

export const metadata: Metadata = {
  title: 'Press Release Copywriting + Logo | 9jaDirectory',
  description:
    'Get 1000 words of publication-ready press release copy plus a custom logo for NGN 100,000. Aligned to your brand voice and optimized for pickup.',
  alternates: { canonical: '/press-release/copywriting' },
}

export default function CopywritingPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-4 sm:px-6 lg:px-8 py-14 lg:py-20 items-center">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-green-700">Copywriting that gets you noticed</p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Publication-ready press release copy plus a logo, in one package.
            </h1>
            <p className="text-lg text-gray-600">
              We write, polish, and package your story for fast media pickup. Clean structure, headlines that click, and
              brand visuals that reinforce credibility.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${whatsappBase}${encodeURIComponent(heroMessage)}`}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-white font-semibold shadow-sm hover:bg-green-700"
              >
                {offer.cta}
              </a>
              <Link
                href="/press-release"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-green-200 bg-white px-5 py-3 text-green-700 font-semibold hover:border-green-300"
              >
                See distribution options
              </Link>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              <span>Turnaround: {offer.turnaround}</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-green-100 blur-2xl opacity-60" aria-hidden />
            <div className="relative">
              <CopywritingGallery images={galleryImages} intervalMs={5000} />
            </div>
          </div>
        </div>
      </section>

      {/* Offer card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-green-700">Single package</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">Press release copy + logo</h2>
              <p className="text-gray-600 mt-2">{offer.scope}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-4xl font-bold text-gray-900">{offer.priceLabel}</p>
              <p className="text-sm text-gray-600">{offer.turnaround}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offer.bullets.map((item) => (
              <div key={item} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-800">
                <div className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`${whatsappBase}${encodeURIComponent(heroMessage)}`}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700"
            >
              Select service
            </a>
            <Link
              href="/contact"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 font-semibold hover:border-gray-300"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Extras / configurator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <CopywritingConfigurator basePrice={100000} extras={extras} whatsappLink={whatsappBase} />
      </section>
    </div>
  )
}
