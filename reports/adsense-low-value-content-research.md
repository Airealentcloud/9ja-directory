# AdSense Low Value Content Research

Research date: 2026-06-12

## Objective

Research how to fix the AdSense low value content issue by comparing 9jaDirectory against directory competitors, identifying thin pages, similar category pages, duplicate listings, and listing inventory problems.

No website fixes were made in this research pass.

## Competitor Benchmarks

### Finelib

- Homepage title: `Finelib.com - Nigeria Business Directory and Search Engine`
- Homepage rendered text size sampled: about 1,772 words
- Positioning: Nigeria business directory and search engine with local businesses, reviews, cities, and towns.
- Pattern to learn from: broad directory pages contain a lot of navigational and category content, not only short listing cards.

### BusinessList Nigeria

- Homepage title: `Nigeria's Verified Online Business Directory Portal - BusinessList.com.ng`
- Homepage rendered text size sampled: about 606 words
- Positioning: verified Nigeria local businesses in categories, areas, and cities with human managed information.
- Sample listing page rendered text size: about 528 words
- Sample listing page signals detected: reviews, photos/images, contact details.
- Pattern to learn from: listing pages need trust signals and richer business information, not just a short imported description.

### ConnectNigeria

- Public pages were difficult to sample from command-line fetch because the site returned little static HTML.
- Pattern to learn from manually: competitors often depend on searchable business discovery, but AdSense approval still depends on content Google can render and evaluate.

## Current 9jaDirectory Evidence

### Live sitemap

- Total sitemap URLs: 1,085
- Listing URLs: 1,000
- Blog URLs: 56
- Category URLs: 3
- Category/state URLs: 2
- State URLs: 2
- Press release URLs: 11

This means Google and AdSense reviewers are mostly being shown listing pages.

### Imported listing inventory

Source file reviewed: `data from finlib.csv`

- Total imported listings: 1,235
- Listings under 45 description words: 1,235
- Listings under 25 description words: 649
- Duplicate business-name groups: 7
- Duplicate phone groups: 3

Quality bucket export:

- `reports/listing-inventory-research.csv`

Live sitemap listing export:

- `reports/live-sitemap-listings.csv`

## Duplicate Listing Groups Found

Duplicate names:

- Jubaili Agrotec Limited
- Nigeria Immigration Service
- Gbemiga Trust Badminton
- Ansel Computers
- National Gallery of Arts
- Leventis Motors
- Chisco Transport Nigeria Limited

Duplicate phones:

- Gbemiga Trust Badminton
- Rokswoodgroup / Hiaiw farms
- National Youth Service Corps / Rivers Nysc State Secretariat

Some duplicates may be legitimate branch/location listings. They still need canonical handling, branch labels, or merge decisions so Google does not see them as accidental duplication.

## Why AdSense May See Low Value

Google AdSense says pages should have unique, relevant content, easy navigation, and a good user experience before approval. Google Publisher Policies also mention low-value content under inventory value.

For 9jaDirectory, the risk is not one single broken page. The risk is the page mix:

- Too many listing URLs compared with richer editorial/category pages.
- Many business descriptions are very short.
- Some category/state pages reuse a common template with only location/category replacements.
- State pages are useful but still light compared with competitor directory pages.
- Imported listings can look scraped or shallow if they are not expanded with original business information.

## Fix Plan

### Phase 1: Stop weak pages from being judged

1. Tighten listing indexability rules.
2. Remove weak listing pages from sitemap unless they have stronger content.
3. Add or preserve `noindex, follow` on weak listing pages.
4. Raise the quality threshold from the current low bar to something closer to:
   - 100+ description words, or
   - 700+ description characters, and
   - at least 3 business signals such as phone, address, website, image, opening hours, category, state, verified/claimed status.

### Phase 2: Upgrade the best listings first

Start with commercial categories that can attract buyers and useful searches:

- Real estate
- Legal services
- Solar energy
- Security services
- Insurance
- Hotels/accommodation
- Healthcare
- Technology/IT

For each upgraded listing, add:

- Original 120-250 word description
- Services offered
- Business address/location
- Phone and website
- Photos/logo
- Opening hours
- FAQs or review snippets where available
- Branch/location distinction if the same brand appears more than once

### Phase 3: Improve category and state pages

Category/state pages should not all read the same. Add unique local content:

- Why that category matters in the state
- Common services offered
- Popular cities/areas
- Buyer checklist
- Price/fee expectations where appropriate
- Local FAQs
- Top verified listings

Index only category/state pages with enough depth, for example:

- At least 5 quality listings, or
- At least 800-1,200 words of unique useful content, or
- Strong editorial intro plus real business listings.

### Phase 4: Clean duplicates

For duplicate business names:

- If they are branches, label them as branches and use unique page copy.
- If they are duplicates, merge them.
- If uncertain, keep only one indexable page and noindex/canonical the weaker page.

For duplicate phone numbers:

- Check whether they belong to the same organization.
- Merge accidental duplicates.
- Add branch schema or location notes for legitimate branches.

### Phase 5: Rebalance the sitemap

The sitemap should show Google a stronger site:

- Fewer weak listing URLs
- More improved category/state pages
- Strong blog guides
- Main legal/contact/about pages
- Only listings that are rich enough to stand alone

## First Fixes Recommended

1. Tighten the sitemap quality gate.
2. Generate a thin-listing report from the database.
3. Noindex all listing pages below the new threshold.
4. Upgrade the first 50-100 highest-value listings.
5. Rewrite top category/state pages.
6. Merge or label duplicate listings.
7. Resubmit sitemap and request AdSense review after Google sees the cleaner inventory.

