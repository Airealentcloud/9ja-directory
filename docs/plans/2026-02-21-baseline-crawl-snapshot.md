# P1-T1: Baseline Crawl Snapshot
**Date:** 2026-02-21
**Source:** Code-level analysis of all Next.js page templates
**Baseline issue counts:** `docs/plans/cyberlords.io_SEOAnalysisSummary_2_20_2026.csv`

---

## Page Template Inventory

### Static Pages (fixed URLs)

| URL | Title Pattern | Description Length (est.) | H1 | Schema | Indexable | Notes |
|---|---|---|---|---|---|---|
| `/` | "Nigeria Business Directory \| Find Local Businesses..." | ~175 chars | **MISSING** | Organization, WebSite, FAQ | YES | Critical: no H1 on homepage |
| `/about` | "About Us \| Nigeria Premier Business Directory \| 9jaDirectory" | ~210 chars | YES | Breadcrumb, Organization, AboutPage, FAQ | YES | |
| `/blog` | "Business Blog & Guides \| 9jaDirectory" | ~130 chars | YES | Breadcrumb, Blog | YES | |
| `/categories` | "Browse Business Categories in Nigeria \| 9jaDirectory" | ~155 chars | YES | Breadcrumb, CollectionPage, ItemList | YES | |
| `/contact` | "Contact 9jaDirectory \| Support & Business Listing Help" | ~140 chars | YES | Breadcrumb, ContactPage | YES | |
| `/faq` | "Frequently Asked Questions \| 9jaDirectory" | ~155 chars | YES | Breadcrumb, FAQPage | YES | |
| `/featured` | "Featured Businesses in Nigeria \| 9jaDirectory" | ~155 chars | YES | Breadcrumb, ItemList | YES | |
| `/pricing` | (none — client component, no metadata export) | N/A | YES | NONE | YES | **Bug: no server metadata** |
| `/privacy` | "Privacy Policy \| 9jaDirectory" | ~130 chars | YES | Breadcrumb, PrivacyPolicy | YES | |
| `/search` | Dynamic: "{query} in {state} \| Search Results \| 9jaDirectory" | Dynamic | YES | FAQPage | **NO (noindex)** | Correct — search results excluded |
| `/states` | "Find Businesses by Location - All Nigerian States \| 9jaDirectory" | ~205 chars | YES | Breadcrumb, CollectionPage, ItemList | YES | |
| `/terms` | "Terms of Service \| 9jaDirectory" | ~110 chars | YES | Breadcrumb, TermsOfService | YES | |

### Dynamic Template Pages

| Template | URL Pattern | Title Pattern | Description Pattern | H1 | Indexable | Issue |
|---|---|---|---|---|---|---|
| Category | `/categories/{slug}` | `{Category Name} in Nigeria \| 9jaDirectory` | `seoContent.introText` OR `category.description` OR fallback generic | YES | YES | If introText + description both null → generic fallback = duplicate risk |
| State | `/states/{slug}` | `Find Businesses in {State Name} State \| 9jaDirectory` | `Discover verified businesses...in {State Name} State, Nigeria...` | Needs verification | YES | Template is unique per state |
| Category + State | `/categories/{cat}/{state}` | `Best {Category} in {State} \| Top Rated {Category} {State} 2025 \| 9jaDirectory` | `Find the best verified {category} in {state}...Updated 2025.` | Needs verification | YES | **"Updated 2025" is hardcoded year** |
| Blog Post | `/blog/{slug}` | `{post.title} \| 9jaDirectory` | Post excerpt | YES | YES | |
| Listing | `/listings/{slug}` | `{Business Name} \| {Category} in {City}, {State} \| 9jaDirectory` | Dynamic ~160 chars with rating + excerpt | YES | YES | |

### Blocked / Noindex Pages (confirmed correct)

| URL Pattern | Method | Status |
|---|---|---|
| `/search?*` | robots.txt Disallow + noindex meta | Correct |
| `/api/*` | robots.txt Disallow | Correct |
| `/admin/*` | robots.txt Disallow | Correct |
| `/dashboard/*` | robots.txt Disallow | Correct |
| `/auth/*` | robots.txt Disallow | Correct |
| `/login` | robots.txt Disallow | Correct |
| `/signup` | robots.txt Disallow | Correct |
| `/add-business` | robots.txt Disallow | Correct |
| `/payment/*` | robots.txt Disallow | Correct |
| `/press-release/checkout` | robots.txt Disallow | Correct |
| `/press-release/order-success` | robots.txt Disallow | Correct |
| `/press-release/order-pending` | robots.txt Disallow | Correct |

---

## Key Issues Identified (code-level)

| Issue | Location | Severity | Tracker Reference |
|---|---|---|---|
| Missing H1 on homepage | `app/page.tsx` | HIGH | P4-T1 |
| No server-side metadata on `/pricing` | `app/pricing/page.tsx` (use client) | HIGH | P3-T4 |
| Category description fallback to generic when `introText` and `category.description` are null | `app/categories/[categorySlug]/page.tsx:62` | MODERATE | P3-T3 |
| Hardcoded `2025` in category+state title and description templates | `app/categories/[categorySlug]/[stateSlug]/page.tsx:42,45` | LOW | P4-T3 |
| `/terms` description ~110 chars (below 140 floor) | `app/terms/page.tsx` | MODERATE | P3-T1 |
| `/pricing` description missing (no metadata) | `app/pricing/page.tsx` | HIGH | P3-T1 |

---

## Sitemap Scope (from `app/sitemap.ts`)

| URL Group | Estimated Count | Priority |
|---|---|---|
| Core static pages | ~10 | 0.7–1.0 |
| Legal pages | 2 | 0.3 |
| Press release pages | ~5 | 0.8–0.9 |
| Blog posts | ~20+ | 0.7 |
| Categories | ~30 | 0.8 |
| States | 37 | 0.8 |
| Category + State combos | ~540 | 0.75 |
| Business listings | up to 40,000 | 0.6 |
| **Total** | **~40,600** | |

No listing count threshold currently applied to category/state combo URLs — all 540 combinations are included regardless of whether listings exist. Addressed in P2-T1.

---

*Deliverable for: P1-T1 | Phase 1: Baseline & Measurement*
