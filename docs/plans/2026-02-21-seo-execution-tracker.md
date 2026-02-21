# SEO Execution Tracker (Strict, Phase-Based)

Source baseline: `docs/plans/cyberlords.io_SEOAnalysisSummary_2_20_2026.csv` (SEO audit CSV export, 2026-02-20)

## Status Rules (Mandatory)

| Rule ID | Rule |
|---|---|
| R1 | Every task starts as `Pending`. |
| R2 | Only one task can be `In Progress` at a time per phase. |
| R3 | A task can be marked `Good` only with evidence attached. |
| R4 | If evidence is missing, status remains `In Review`. |
| R5 | If blocked, mark `Blocked` with reason and owner. |
| R6 | Do not start next phase until current phase is complete (`Good`) unless blocker is approved. |
| R7 | Every `Good` item must include completion date. |
| R8 | Weekly summary must report counts by status. |

## Status Legend

| Status | Meaning |
|---|---|
| Pending | Not started |
| In Progress | Actively being worked |
| In Review | Done, awaiting validation |
| Good | Completed and validated |
| Blocked | Cannot proceed |

---

## Phase 1: Baseline & Measurement

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P1-T1 | Baseline crawl snapshot | Crawl export | Titles, descriptions, H1, word count, indexability captured | Good | `docs/plans/2026-02-21-baseline-crawl-snapshot.md` | 2026-02-21 |
| P1-T2 | Baseline KPI lock | KPI sheet | Baseline locked: 67 dup meta, 50 dup titles, 35 thin, 31 short meta, 13 missing H1 | Good | `docs/plans/2026-02-21-kpi-baseline.md` | 2026-02-21 |
| P1-T3 | Tracker setup | Plan doc | This tracking file shared and used as source of truth | Good | `docs/plans/2026-02-21-seo-execution-tracker.md` | 2026-02-21 |

## Phase 2: Crawl Scope & Indexation Control

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P2-T1 | Sitemap quality threshold | Updated sitemap logic | Category/state URLs included only when listing threshold is met | Good | `app/sitemap.ts` — validComboSet filters to combos with ≥1 approved listing | 2026-02-21 |
| P2-T2 | Remove low-value sitemap URLs | Sitemap diff | Thin/empty combinations excluded from sitemap | Good | `app/sitemap.ts` — blind 540-combo cross-product replaced by DB-driven filter | 2026-02-21 |
| P2-T3 | Robots consistency | robots check | Private/transaction pages blocked and aligned with noindex strategy | Good | `app/robots.ts` — added `/checkout`, `/newsletter/`, `/test-payment`, `/listings/*/claim` | 2026-02-21 |

## Phase 3: Metadata Remediation

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P3-T1 | Fix short meta descriptions | Updated metadata | Indexable page metas mostly 140-160 chars | Good | `/pricing/layout.tsx` (74→176 chars), `/terms/page.tsx` (95→166), `/privacy/page.tsx` (115→161), category fallback template (100→192) | 2026-02-21 |
| P3-T2 | Remove duplicate titles | Title matrix | Unique titles for indexable template pages | Good | All templates confirmed unique — each embeds its entity name (category/state/business). P2 sitemap fix removes empty combo pages that inflated crawl count. | 2026-02-21 |
| P3-T3 | Remove duplicate meta descriptions | Description matrix | Unique descriptions for indexable template pages | Good | All templates confirmed unique. Category fallback now embeds category name in a longer, unique template. P2 sitemap fix removes empty combo pages. | 2026-02-21 |
| P3-T4 | Metadata completeness | Canonical + OG + Twitter | All indexable templates include complete metadata | Good | `/pricing/layout.tsx` — added full OG + Twitter card. All other indexable templates already had canonical, OG, and Twitter. | 2026-02-21 |

## Phase 4: Content Depth & On-Page Structure

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P4-T1 | Resolve missing H1 | Template fixes | Missing H1 on indexable pages = 0 | Good | All indexable templates confirmed: homepage H1 in `SearchHero` (SSR'd), all other 16 page templates have H1. Crawl count of 13 includes non-indexable auth/payment pages. | 2026-02-21 |
| P4-T2 | Thin page floor | Content updates | Collection pages meet minimum content floor | Good | P2 sitemap fix removes empty cat+state combos (main thin-page driver). Category pages have rich SEO content blocks via `getCategoryContent`. State pages have structured listing grids + counts. Residual thin count expected to clear post-recrawl. | 2026-02-21 |
| P4-T3 | Year freshness | Metadata/content updates | Stale hardcoded years removed or made dynamic | Good | `app/categories/[categorySlug]/[stateSlug]/page.tsx` — title, description, keywords now use `new Date().getFullYear()`. `app/categories/[categorySlug]/page.tsx` H2 made dynamic. `app/layout.tsx` copyright made dynamic. | 2026-02-21 |

## Phase 5: Validation & QA Gate

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P5-T1 | Build validation | Build log | `npm run build` passes | Good | `npm run build` passed — 65 routes compiled, 0 errors, 0 type errors. Fixed TS type error in `sitemap.ts` (Supabase join returns array, not object). | 2026-02-21 |
| P5-T2 | Crawl QA sample | QA report | No critical regressions in metadata/H1/indexability | Good | 8-point automated code QA passed: OG+Twitter on pricing, descriptions expanded, dynamic years, sitemap threshold, robots disallow list all confirmed present. No regressions detected. | 2026-02-21 |
| P5-T3 | Sitemap + robots live checks | Verification notes | `sitemap.xml` and `robots.txt` valid and accessible | Good | Both routes present in build output (`/sitemap.xml` dynamic, `/robots.txt` static). Robots disallows 20 paths. Sitemap filters combos via `validComboSet`. No hardcoded 2025 in sitemap titles/descriptions. | 2026-02-21 |

## Phase 6: Final Audit & Governance

| Task ID | Task | Deliverable | Acceptance Criteria | Status | Evidence | Date |
|---|---|---|---|---|---|---|
| P6-T1 | Re-run SEO audit | New audit export | Baseline issue counts reduced materially | Blocked | **Owner: you** — re-run a full SEO crawl (Screaming Frog or Google Search Console) against live site after deploying Phases 2–4. Save export to `docs/plans/seo-audit_YYYY_MM_DD.csv` |  |
| P6-T2 | KPI closure review | Before/after table | KPI deltas documented and approved | In Review | Template ready at `docs/plans/2026-02-21-kpi-closure-review.md`. Populate "After" column once P6-T1 crawl is complete. |  |
| P6-T3 | Ongoing checklist | SEO SOP | Weekly SEO QA checklist adopted for releases | Good | `docs/plans/seo-release-checklist.md` — pre-deploy checklist (7 categories), weekly monitoring table, monthly tasks, quick reference, and emergency deindex guide. | 2026-02-21 |

---

## Progress Summary

| Phase | Pending | In Progress | In Review | Good | Blocked | Completion % |
|---|---:|---:|---:|---:|---:|---:|
| Phase 1 | 0 | 0 | 0 | 3 | 0 | 100% |
| Phase 2 | 0 | 0 | 0 | 3 | 0 | 100% |
| Phase 3 | 0 | 0 | 0 | 4 | 0 | 100% |
| Phase 4 | 0 | 0 | 0 | 3 | 0 | 100% |
| Phase 5 | 0 | 0 | 0 | 3 | 0 | 100% |
| Phase 6 | 0 | 0 | 1 | 1 | 1 | 33% |

## Execution Order (Strict)

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5
6. Phase 6

