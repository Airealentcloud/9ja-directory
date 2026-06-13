type ListingQualityInput = {
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  website_url?: string | null
  address?: string | null
  image_url?: string | null
  logo_url?: string | null
  images?: unknown
  opening_hours?: unknown
  services_offered?: unknown
  amenities?: string | null
  verified?: boolean | null
  claimed?: boolean | null
}

export const MIN_INDEXABLE_DESCRIPTION_WORDS = 100
export const MIN_INDEXABLE_DESCRIPTION_CHARS = 700
export const MIN_BUSINESS_SIGNALS = 3
export const MIN_INDEXABLE_CATEGORY_STATE_LISTINGS = 3

function textValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function hasImages(images: unknown): boolean {
  if (Array.isArray(images)) {
    return images.some((image) => textValue(image).length > 0)
  }

  if (typeof images === 'string') {
    const value = images.trim()
    return value.length > 0 && value !== '[]'
  }

  return false
}

function hasStructuredValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => textValue(item).length > 0)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return textValue(value).length > 0
}

export function getListingDescriptionWordCount(description: unknown): number {
  return textValue(description)
    .split(/\s+/)
    .filter(Boolean).length
}

export function getListingQualitySignals(listing: ListingQualityInput): number {
  return [
    textValue(listing.phone),
    textValue(listing.email),
    textValue(listing.website_url || listing.website),
    textValue(listing.address),
    textValue(listing.image_url || listing.logo_url) || hasImages(listing.images),
    hasStructuredValue(listing.opening_hours),
    hasStructuredValue(listing.services_offered),
    textValue(listing.amenities),
    Boolean(listing.verified),
    Boolean(listing.claimed),
  ].filter(Boolean).length
}

export function isIndexableListing(listing: ListingQualityInput): boolean {
  const description = textValue(listing.description)
  const descriptionWords = getListingDescriptionWordCount(description)
  const hasSubstantialDescription =
    description.length >= MIN_INDEXABLE_DESCRIPTION_CHARS ||
    descriptionWords >= MIN_INDEXABLE_DESCRIPTION_WORDS

  return (
    hasSubstantialDescription &&
    getListingQualitySignals(listing) >= MIN_BUSINESS_SIGNALS
  )
}
