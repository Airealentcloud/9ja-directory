'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Extra = {
  id: string
  title: string
  desc: string
  price: number
}

type Props = {
  basePrice: number
  extras: Extra[]
  whatsappLink: string
}

export default function CopywritingConfigurator({ basePrice, extras, whatsappLink }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])

  const formatNaira = (amount: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

  const total = useMemo(() => {
    const extrasTotal = extras
      .filter((extra) => selectedExtras.includes(extra.id))
      .reduce((sum, extra) => sum + extra.price, 0)
    return basePrice * quantity + extrasTotal
  }, [basePrice, extras, quantity, selectedExtras])

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const buildWhatsAppLink = () => {
    const extrasList = extras
      .filter((extra) => selectedExtras.includes(extra.id))
      .map((extra) => `${extra.title} (${formatNaira(extra.price)})`)
      .join(', ')
    const message = `Hi, I'd like ${quantity} x 1000-word copywriting + logo (${formatNaira(
      basePrice
    )} each). Extras: ${extrasList || 'None'}. Total: ${formatNaira(total)}.`
    return `${whatsappLink}${encodeURIComponent(message)}`
  }

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-green-700">Build your order</p>
          <h3 className="text-2xl font-bold text-gray-900">Add more words or extras</h3>
          <p className="text-gray-600 mt-1">Each block is 1000 words + logo. Increase quantity for larger releases.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold text-gray-900">{formatNaira(total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-700">Word blocks</p>
          <h4 className="text-xl font-bold text-gray-900 mt-1">1000 words + logo each</h4>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-semibold text-gray-900"
              aria-label="Quantity (1000-word blocks)"
            />
            <button
              type="button"
              className="h-10 w-10 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">Base: {formatNaira(basePrice)} per 1000 words + logo.</p>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-700">Extras</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {extras.map((extra) => {
              const selected = selectedExtras.includes(extra.id)
              return (
                <button
                  key={extra.id}
                  type="button"
                  onClick={() => toggleExtra(extra.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    selected ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900">{extra.title}</h4>
                    <span className="text-sm font-semibold text-green-700">{formatNaira(extra.price)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{extra.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-green-700">
                    <span
                      className={`h-2 w-2 rounded-full ${selected ? 'bg-green-600' : 'bg-gray-300'}`}
                      aria-hidden
                    />
                    {selected ? 'Added' : 'Tap to add'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={buildWhatsAppLink()}
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700"
        >
          Send order via WhatsApp
        </a>
        <Link
          href="/contact"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-gray-800 font-semibold hover:border-gray-300"
        >
          Contact sales
        </Link>
      </div>
    </div>
  )
}
