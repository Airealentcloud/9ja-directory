'use client'

import { useEffect, useState } from 'react'

type GalleryImage = {
  src: string
  alt: string
}

type Props = {
  images: GalleryImage[]
  intervalMs?: number
}

export default function CopywritingGallery({ images, intervalMs = 5000 }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs])

  const current = images[active]

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-xl border border-gray-200">
      <img
        src={current.src}
        alt={current.alt}
        className="h-full w-full object-cover transition-opacity duration-500 max-h-[360px] sm:max-h-[480px]"
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to image ${idx + 1}`}
              className={`h-2.5 w-2.5 rounded-full border border-white/70 transition ${
                active === idx ? 'bg-white' : 'bg-white/30'
              }`}
              onClick={() => setActive(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
