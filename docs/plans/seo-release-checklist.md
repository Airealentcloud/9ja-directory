# SEO Release Checklist (SOP)
**Owner:** Engineering lead
**Cadence:** Run before every production deployment that touches pages, metadata, routing, or sitemap logic.

---

## Pre-Deploy Checks (Every Release)

### 1. Build & Types
- [ ] `npm run build` passes with 0 errors and 0 type errors
- [ ] No new TypeScript `any` types introduced in metadata functions

### 2. Metadata — New or Modified Pages
For every new `page.tsx` or `layout.tsx` added or changed:
- [ ] `title` is set — unique, 50–60 chars, includes primary keyword
- [ ] `description` is set — 140–160 chars, unique per page, includes keyword
- [ ] `alternates.canonical` is set to the correct absolute URL
- [ ] `openGraph` block present: `title`, `description`, `url`, `siteName`, `locale`, `type`, `images`
- [ ] `twitter` card present: `card`, `title`, `description`, `images`
- [ ] Non-indexable pages (auth, payment, transactional) have `robots: { index: false, follow: false }` in layout

### 3. H1 Tags
- [ ] Every new indexable page has exactly one `<h1>` (either directly or in a SSR'd child component)
- [ ] No page has more than one `<h1>`

### 4. Robots.txt Alignment
- [ ] Any new route that should not be indexed is added to `app/robots.ts` Disallow list
- [ ] Any new indexable route is NOT in the Disallow list
- [ ] Run: verify `app/robots.ts` exports cover all noindex layout paths

### 5. Sitemap
- [ ] New indexable public routes are reachable from `app/sitemap.ts`
- [ ] New noindex or private routes are NOT included in the sitemap
- [ ] If a new dynamic route template is added, confirm it has listing-threshold logic before bulk-including URLs

### 6. Year / Date Freshness
- [ ] No hardcoded calendar years in titles, descriptions, or JSX visible text — use `new Date().getFullYear()`
- [ ] Schema `datePublished` / `dateModified` fields use real dates or are omitted

### 7. Schema Markup
- [ ] New pages that represent a `LocalBusiness`, `Article`, `FAQPage`, or `CollectionPage` have the appropriate JSON-LD block
- [ ] Existing schema blocks not broken by changes (check with [Google Rich Results Test](https://search.google.com/test/rich-results) post-deploy)

---

## Weekly Monitoring Tasks

| Task | Tool | Action if issue found |
|---|---|---|
| Check Google Search Console for new Coverage errors | GSC → Index → Pages | Fix noindex/robots conflicts; resubmit sitemap |
| Check for new crawl errors (404, 5xx) | GSC → Index → Pages | Fix or 301-redirect broken URLs |
| Review Core Web Vitals regressions | GSC → Experience → Core Web Vitals | Investigate LCP/CLS regressions with Lighthouse |
| Spot-check 5 random listing pages for metadata | Browser DevTools / `curl -s <url> \| grep "<title>"` | Fix template if metadata is wrong |
| Confirm sitemap is accessible | `curl https://www.9jadirectory.org/sitemap.xml \| head -5` | Re-deploy if 404 or malformed |
| Confirm robots.txt is accessible | `curl https://www.9jadirectory.org/robots.txt` | Re-deploy if 404 |

---

## Monthly Tasks

- [ ] Re-run full crawl (Screaming Frog or Google Search Console) and compare KPIs against baseline in `docs/plans/2026-02-21-kpi-baseline.md`
- [ ] Review GSC "Top queries" for new keyword opportunities
- [ ] Check for new categories or states added to DB — confirm they appear in sitemap only if they have listings
- [ ] Review thin pages report — any new pages with word count < 300?
- [ ] Archive completed SEO tracker and open a new one if major work is planned

---

## Quick Reference — Key Files

| Concern | File |
|---|---|
| Global metadata defaults | `app/layout.tsx` |
| Sitemap generation | `app/sitemap.ts` |
| Robots.txt | `app/robots.ts` |
| Category page metadata | `app/categories/[categorySlug]/page.tsx` |
| State page metadata | `app/states/[slug]/page.tsx` |
| Category+State metadata | `app/categories/[categorySlug]/[stateSlug]/page.tsx` |
| Listing page metadata | `app/listings/[slug]/page.tsx` (generateMetadata) |
| Pricing page metadata | `app/pricing/layout.tsx` |
| Schema helpers | `lib/schema/` |

---

## Emergency: Page Accidentally Deindexed

1. Check `app/robots.ts` — is the path in Disallow?
2. Check the page's layout or page file — is `robots: { index: false }` set?
3. Check if a `<meta name="robots" content="noindex">` tag exists in rendered HTML
4. Remove the noindex, deploy, then submit URL to GSC for recrawl

---

*Deliverable for: P6-T3 | Phase 6: Final Audit & Governance*
*Created: 2026-02-21*
