const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmailAddress(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export function isValidEmailAddress(value: unknown): boolean {
  const normalized = normalizeEmailAddress(value)
  return Boolean(normalized && normalized.length <= 254 && EMAIL_PATTERN.test(normalized))
}

export function resolveListingEmail(value: unknown, fallback: unknown): string | null {
  const candidate = normalizeEmailAddress(value)
  if (isValidEmailAddress(candidate)) return candidate

  const fallbackEmail = normalizeEmailAddress(fallback)
  return isValidEmailAddress(fallbackEmail) ? fallbackEmail : null
}
