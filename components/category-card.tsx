'use client'

import Link from 'next/link'
import { getCategoryIcon, getCategoryColors } from '@/lib/category-icons'
import { ArrowRight, Building2 } from 'lucide-react'

interface CategoryCardProps {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  listingCount?: number
}

export function CategoryCard({
  name,
  slug,
  description,
  listingCount = 0
}: CategoryCardProps) {
  const Icon = getCategoryIcon(slug)
  const colors = getCategoryColors(slug)

  return (
    <Link
      href={`/categories/${slug}`}
      className={`group relative block bg-gradient-to-br ${colors.bg} p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-green-300 hover:-translate-y-1 overflow-hidden`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] bg-[size:20px_20px]" />

      {/* Icon container with gradient background */}
      <div className="relative mb-5">
        <div className={`w-14 h-14 ${colors.iconBg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className={`w-7 h-7 ${colors.iconColor}`} strokeWidth={1.5} />
        </div>
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 w-14 h-14 ${colors.iconBg} rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
      </div>

      <h3 className="relative font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors duration-200">
        {name}
      </h3>

      {description && (
        <p className="relative text-sm text-gray-500 mt-2 line-clamp-2">
          {description}
        </p>
      )}

      <div className="relative mt-4 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
          <span className="font-medium">{listingCount.toLocaleString()}</span>
          <span className="ml-1 text-gray-400">{listingCount === 1 ? 'listing' : 'listings'}</span>
        </div>

        {/* Arrow indicator */}
        <div className="flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </Link>
  )
}
