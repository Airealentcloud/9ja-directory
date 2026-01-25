'use client'

import Link from 'next/link'
import { getCategoryIcon, getCategoryColors } from '@/lib/category-icons'

interface HomeCategoryCardProps {
  id: string
  name: string
  slug: string
  icon?: string
}

export function HomeCategoryCard({ name, slug }: HomeCategoryCardProps) {
  const Icon = getCategoryIcon(slug)
  const colors = getCategoryColors(slug)

  return (
    <Link
      href={`/categories/${slug}`}
      className={`group relative bg-gradient-to-br ${colors.bg} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-center border border-white/50 hover:border-green-300 hover:-translate-y-1 overflow-hidden`}
    >
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] bg-[size:16px_16px]" />

      {/* Icon container */}
      <div className="relative flex justify-center mb-4">
        <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className={`w-7 h-7 ${colors.iconColor}`} strokeWidth={1.5} />
        </div>
        {/* Glow effect */}
        <div className={`absolute w-14 h-14 ${colors.iconBg} rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
      </div>

      <h3 className="relative font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">
        {name}
      </h3>
    </Link>
  )
}
