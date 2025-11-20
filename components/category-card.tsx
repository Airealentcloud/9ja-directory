import Link from 'next/link'

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
  icon,
  listingCount = 0
}: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-green-500 hover:-translate-y-1"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon || ''}
      </div>

      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
        {name}
      </h3>

      {description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-3 flex items-center text-sm text-gray-500">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span>{listingCount.toLocaleString()} {listingCount === 1 ? 'listing' : 'listings'}</span>
      </div>

      <div className="mt-4 flex items-center text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-sm font-medium">Browse</span>
        <svg
          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  )
}
