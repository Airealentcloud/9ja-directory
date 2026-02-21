# Nigeria Hosting + Agency SEO Content Hub Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a high-intent Nigeria SEO content hub that captures organic traffic and converts visitors into directory listing leads, paid listing upgrades, and service inquiries.

**Architecture:** Use `lib/blog-data.ts` as the content source of truth and publish one long-form article per keyword target. Each article will include direct internal links to category pages, city pages, listing pages, and conversion CTAs (`/pricing`, `/add-business`). Content is grouped into 4 funnels: transactional, local-city, best-of lists, and problem-solving guides.

**Tech Stack:** Next.js App Router, TypeScript, existing blog renderer (`app/blog/[slug]/page.tsx`), structured data via `schema` field in `lib/blog-data.ts`.

---

## Topic Priority (Write One by One)

1. `best web hosting in nigeria`
Use for: Core money keyword, anchors entire hosting cluster, drives commercial-intent visitors to hosting listings and paid placements.

2. `cheap web hosting in nigeria`
Use for: Price-sensitive buyers; converts via comparison tables + budget plans.

3. `wordpress hosting nigeria`
Use for: CMS-specific intent; converts WordPress users to specialized providers.

4. `vps hosting nigeria`
Use for: Mid/high-ticket buyers upgrading from shared hosting.

5. `cloud hosting nigeria`
Use for: Scalability intent; ideal for SaaS/startups traffic.

6. `reseller hosting nigeria`
Use for: Agency/freelancer B2B buyers.

7. `domain registration nigeria`
Use for: Top-of-funnel buyer entry; cross-sell hosting.

8. `buy .ng domain`
Use for: Brand-localization intent; fast transactional conversion.

9. `ssl certificate nigeria`
Use for: Security/compliance buyer intent; cross-sell hosting.

10. `website design company nigeria`
Use for: Service-buyer intent; sends leads to design listings.

11. `seo company nigeria`
Use for: High-LTV B2B leads for SEO agencies.

12. `digital marketing agency nigeria`
Use for: Broad agency demand + recurring service opportunities.

13. `web hosting in lagos`
Use for: Local paid listing monetization (Lagos).

14. `web hosting in abuja`
Use for: Local paid listing monetization (Abuja).

15. `web hosting in port harcourt`
Use for: Local paid listing monetization (Port Harcourt).

16. `website designers in lagos`
Use for: Local lead-gen for design listings.

17. `website designers in abuja`
Use for: Local lead-gen for design listings.

18. `seo agency in lagos`
Use for: Local SEO demand + premium leads.

19. `seo agency in abuja`
Use for: Local SEO demand + premium leads.

20. `digital marketing agency in lagos`
Use for: City-level acquisition intent.

21. `digital marketing agency in abuja`
Use for: City-level acquisition intent.

22. `wordpress developer in lagos`
Use for: Hire-intent keyword for freelance/agency leads.

23. `wordpress developer in abuja`
Use for: Hire-intent keyword for freelance/agency leads.

24. `ui ux designer in lagos`
Use for: Product/design hiring intent.

25. `ecommerce website developer nigeria`
Use for: Strong commercial buyer intent for store build projects.

26. `best web hosting companies in nigeria (2026)`
Use for: Listicle with high CTR; paid featured slots.

27. `best website designers in lagos (2026)`
Use for: City listicle + sponsored placements.

28. `best seo companies in nigeria (2026)`
Use for: National SEO listicle monetization.

29. `best digital marketing agencies in abuja (2026)`
Use for: City listicle monetization.

30. `best branding agencies in nigeria`
Use for: Brand service category expansion.

31. `best software companies in nigeria`
Use for: B2B software listing demand.

32. `best payment gateway in nigeria`
Use for: Fintech comparison traffic; affiliate/sponsor potential.

33. `best email marketing tools in nigeria`
Use for: SaaS affiliate/sponsor potential.

34. `how to buy a domain in nigeria`
Use for: Easy TOFU traffic; internal links to domain/hosting pages.

35. `how to connect domain to hosting`
Use for: Support-intent traffic; strong internal linking.

36. `how to move website to new hosting`
Use for: Migration-intent users close to switching providers.

37. `how much does a website cost in nigeria`
Use for: High-volume informational query; push to design/dev listings.

38. `wordpress website cost in nigeria`
Use for: Narrow buyer-intent cost guide.

39. `how to choose a web hosting company in nigeria`
Use for: Decision-stage users; comparison + lead conversion.

40. `shared hosting vs vps nigeria`
Use for: Evaluation-stage content that routes to hosting/VPS pages.

---

### Task 1: Create Editorial Tracking and Workflow

**Files:**
- Create: `docs/plans/2026-02-19-nigeria-hosting-topic-tracker.md`
- Modify: `PROGRESS.md`

**Step 1: Create tracker table**
- Columns: keyword, slug, funnel type, use-for goal, status, publish date, internal links added.

**Step 2: Add publishing states**
- States: `brief-ready`, `drafting`, `review`, `published`, `linked`, `indexed`.

**Step 3: Add weekly publishing target**
- Target: 3 posts/week until all 40 keywords are published.

**Step 4: Update progress log**
- Add section for this content campaign in `PROGRESS.md`.

**Step 5: Commit**
```bash
git add docs/plans/2026-02-19-nigeria-hosting-topic-tracker.md PROGRESS.md
git commit -m "chore: add nigeria hosting content campaign tracker"
```

### Task 2: Standardize Article Template in Existing Blog Structure

**Files:**
- Modify: `lib/blog-data.ts`
- Reference: `app/blog/[slug]/page.tsx`

**Step 1: Add one reusable post skeleton in comments or docs**
- Must include: intro, comparison table, FAQ, city links, CTA block, schema.

**Step 2: Define mandatory internal links per post**
- `>= 5` links to `/categories/*`, `/categories/*/*`, `/states/*`, or relevant `/blog/*`.

**Step 3: Define mandatory CTAs per post**
- Primary CTA: `/pricing`.
- Secondary CTA: `/add-business`.

**Step 4: Define schema minimum**
- Include `Article` + `FAQPage` + `BreadcrumbList` in `schema` field.

**Step 5: Commit**
```bash
git add lib/blog-data.ts
git commit -m "chore: standardize seo blog post template for hosting cluster"
```

### Task 3: Publish Topic 1 First

**Files:**
- Modify: `lib/blog-data.ts`
- Optional Create: `public/images/blog/best-web-hosting-nigeria-2026.webp`

**Step 1: Write the post**
- Topic: `best web hosting in nigeria`.
- Slug: `best-web-hosting-in-nigeria-2026`.

**Step 2: Add direct conversion paths**
- Include links to relevant listing/category pages.
- Include CTA to `Get Listed` and `See Premium Plans`.

**Step 3: Add JSON-LD schema**
- Add valid `Article`, `FAQPage`, and `BreadcrumbList`.

**Step 4: Validate build**
Run: `npm run build`
Expected: success, no TypeScript errors.

**Step 5: Commit**
```bash
git add lib/blog-data.ts public/images/blog/best-web-hosting-nigeria-2026.webp
git commit -m "feat: publish best web hosting in nigeria 2026 guide"
```

### Task 4: Publish Topics 2-12 (National Transactional Cluster)

**Files:**
- Modify: `lib/blog-data.ts`

**Step 1: Draft each post in priority order**
- 2 to 12 from the list above.

**Step 2: Enforce linking matrix**
- Each new post links to topic 1 and two sibling transactional posts.

**Step 3: Add comparison and FAQ blocks**
- Keep consistent structure for rich snippets and conversions.

**Step 4: Validate after every 3 posts**
Run: `npm run build`
Expected: success.

**Step 5: Commit every 1-2 posts**
```bash
git add lib/blog-data.ts
git commit -m "feat: add national hosting and agency transactional seo posts"
```

### Task 5: Publish City Intent Cluster (Topics 13-25)

**Files:**
- Modify: `lib/blog-data.ts`

**Step 1: Create Lagos/Abuja/Port Harcourt city pages first**
- Prioritize 13, 14, 15, 16, 18, 20.

**Step 2: Add city-specific internal links**
- Link to `/states/lagos`, `/states/fct`, `/states/rivers` and relevant category-state pages.

**Step 3: Add local conversion blocks**
- Include "Want top placement in [city]?" CTA to `/pricing`.

**Step 4: Validate and commit in batches**
Run: `npm run build`
Expected: success.

**Step 5: Commit**
```bash
git add lib/blog-data.ts
git commit -m "feat: add city-level hosting and agency seo landing posts"
```

### Task 6: Publish Best-in-City Listicles (Topics 26-33)

**Files:**
- Modify: `lib/blog-data.ts`

**Step 1: Publish annually dated listicles**
- Keep `(2026)` in title and slug where relevant.

**Step 2: Add transparent ranking criteria section**
- Trust signal and legal safety.

**Step 3: Add monetization placements**
- Featured listing CTA and inquiry CTA.

**Step 4: Validate schema and build**
Run: `npm run build`
Expected: success.

**Step 5: Commit**
```bash
git add lib/blog-data.ts
git commit -m "feat: add 2026 best-in-nigeria and best-in-city listicles"
```

### Task 7: Publish Problem-Solving Cluster (Topics 34-40)

**Files:**
- Modify: `lib/blog-data.ts`

**Step 1: Write tutorials in how-to format**
- Use numbered steps, screenshots optional.

**Step 2: Add "next step" links**
- Route users to transactional pages and relevant listings.

**Step 3: Add FAQs for featured snippets**
- Minimum 4 FAQs/post.

**Step 4: Validate build**
Run: `npm run build`
Expected: success.

**Step 5: Commit**
```bash
git add lib/blog-data.ts
git commit -m "feat: add problem-solving nigeria hosting and website cost guides"
```

### Task 8: Internal Linking QA and Indexing Readiness

**Files:**
- Modify: `lib/blog-data.ts`
- Review: `app/sitemap.ts`, `app/robots.ts`

**Step 1: Verify every post has required links**
- 2 cluster links, 2 category/location links, 1 conversion CTA minimum.

**Step 2: Confirm sitemap coverage**
- Ensure blog posts appear in sitemap output.

**Step 3: Run final checks**
Run: `npm run lint`
Expected: no critical errors.

Run: `npm run build`
Expected: production build success.

**Step 4: Commit**
```bash
git add lib/blog-data.ts app/sitemap.ts app/robots.ts
git commit -m "chore: finalize internal linking and indexing readiness for seo cluster"
```

---

## Reminder Framework (Use This Every Time You Ask for the Next Topic)

For each topic we produce, always state:

1. **Topic:** exact keyword.
2. **Use for:** primary business goal (traffic, listing leads, paid upgrades, affiliate/sponsor).
3. **Primary CTA:** where user should go (`/pricing`, `/add-business`, listing page).
4. **Required internal links:** minimum 5 links.
5. **Schema required:** `Article + FAQPage + BreadcrumbList`.

---

## First Topic to Start Now

**Start with:** `best web hosting in nigeria`

Why first:
- Highest commercial intent in your provided list.
- Supports all follow-up hosting keywords through internal linking.
- Can immediately route users to listings and paid placements.

