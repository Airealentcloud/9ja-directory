# Cloudflare Blog and Sitemap Stability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the intermittent Cloudflare 503/timeouts on the blog and sitemap while preserving every article URL and the sitemap's listing-quality rules.

**Architecture:** Keep full article HTML isolated in `lib/blog-data.ts`, and generate a small summary-only module for archive, home-page, and sitemap imports. Render a static, paginated blog archive and reduce sitemap database work to one listing query with cached output and a static fallback if Supabase is temporarily unavailable.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript, Supabase, OpenNext for Cloudflare Workers, Node test runner.

---

### Task 1: Add blog-data regression tooling

**Files:**
- Create: `scripts/generate-blog-index.mjs`
- Create: `tests/unit/blog-index.test.mjs`
- Create: `lib/blog-index-data.ts`
- Modify: `package.json`

**Steps:**
1. Add a generator that reads the TypeScript source and writes only public summary fields.
2. Add a unit test that checks unique slugs, source/index parity, newest-first sorting, and absence of known mojibake markers.
3. Run the test and confirm it catches the current corrupted text.
4. Repair the source encoding and regenerate the summary module.
5. Run the unit test and confirm it passes.

### Task 2: Make the blog archive lightweight and paginated

**Files:**
- Create: `components/blog/blog-index-page.tsx`
- Create: `app/blog/page/[page]/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `components/blog/blog-card.tsx`
- Modify: `app/page.tsx`

**Steps:**
1. Change archive/home imports from the full article module to the summary module.
2. Render 12 articles per archive page, with the newest article featured on page one.
3. Add crawlable previous/next links and page-specific canonical metadata.
4. Generate static page parameters and return 404 for invalid page numbers.
5. Build and verify `/blog`, `/blog/page/2`, and the last archive page.

### Task 3: Make sitemap generation bounded and resilient

**Files:**
- Modify: `app/sitemap.ts`
- Create: `tests/unit/sitemap-source.test.mjs`

**Steps:**
1. Import blog summaries instead of full article HTML.
2. Fetch categories, states, and listings in parallel.
3. Use one approved-listing query for both listing URLs and category/state counts.
4. Cache the metadata route for one hour and log only failures or unusually slow generation.
5. Return static, blog, category, and state URLs even if the listing query fails.
6. Add a source-level regression test preventing a second listing query or a full blog-data import.

### Task 4: Verify and release

**Files:**
- Modify as needed based on type/build review only.

**Steps:**
1. Run `npm run test:unit` and `npx tsc --noEmit`.
2. Read the React best-practices skill and review changed TSX files.
3. Run `npm run cf:build:production` and `npm run cf:dry-run:production`.
4. Deploy with `npm run cf:deploy:production`.
5. Repeatedly request `/`, `/blog`, archive pages, and `/sitemap.xml`, including concurrent requests.
6. Confirm all responses are successful, article slugs remain present, and known mojibake markers are absent.
7. Commit only the scoped tracked files and push `codex/cloudflare-migration`.
