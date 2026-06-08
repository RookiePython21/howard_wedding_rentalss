# Routine: Monthly SEO Performance Check — Howard Wedding Rentals

Run monthly. Checks current rankings for all published articles, flags near-ranking
opportunities (positions 5–15), and finds organic gap keywords to add to the queue.
Prints a report — does not send an SMS (no user action required until they log in next).

---

## Step 1 — Load published articles

Read `.claude/seo/published-map.json`. Extract:
- All article slugs, titles, URLs, and primary_keywords
- All pillar_ids (to group report by pillar)

---

## Step 2 — Pull domain organic keywords from Ahrefs

Call `mcp__ahrefs__site-explorer-organic-keywords` with:
- target: "howardweddingrentals.com"
- country: "us"
- limit: 100

This returns keywords where the domain currently has ranking pages.

---

## Step 3 — Match rankings to published articles

For each published article, look up its `primary_keyword` in the Ahrefs results.
Record the current position (or "not ranking" if not found).

Classify each article:
- **Healthy**: position 1–4
- **Priority Update**: position 5–15 (near page 1 — optimize these)
- **Not Yet Ranking**: position > 15 or not found

For **Priority Update** articles, note:
- Current position
- `traffic_potential` from Ahrefs if available
- Suggested optimization: "Add FAQ section", "Expand [thinnest H2]", "Add internal link from [cluster sibling]"

---

## Step 4 — Identify organic gap keywords

Scan the full Ahrefs organic keywords response for keywords where:
1. howardweddingrentals.com has a ranking (any position)
2. The keyword does NOT exist in `.claude/seo/published-map.json` (primary or secondary)
3. The keyword does NOT exist in `.claude/seo/keyword-queue.json`

These are pages ranking for keywords we never explicitly targeted — gaps to capture.

Read `.claude/seo/config.json` for the current phase kd_ceiling. Filter gap keywords:
- Volume ≥ min_volume
- KD ≤ kd_ceiling

For each gap keyword that passes: build a minimal queue entry and add it to
keyword-queue.json with `source_run: "organic-gap-[YYYY-MM]"` and `"notes": "Organic gap — domain already ranking, no article explicitly targets this"`.

---

## Step 5 — Check domain metrics (optional DR progress)

Call `mcp__ahrefs__site-explorer-metrics` with:
- target: "howardweddingrentals.com"
- mode: "domain"

Note the current Domain Rating (DR). If DR has increased since the last check (compare
to the previous performance-check entry in research-log.json), flag this as a signal to
consider advancing to the next phase (see quarterly phase-check routine).

---

## Step 6 — Append to research log

Append a run entry to research-log.json:
```json
{
  "run_id": "perf-check-[YYYY-MM]",
  "started_at": "[ISO timestamp]",
  "trigger": "scheduled_monthly",
  "articles_checked": [count],
  "healthy": [count],
  "priority_updates": [count],
  "not_yet_ranking": [count],
  "gap_keywords_added": [count],
  "domain_rating": [DR value or null]
}
```

---

## Step 7 — Print performance report

```
=== Monthly SEO Performance Check — [Month YYYY] ===
Domain: howardweddingrentals.com | DR: [value]

PRIORITY UPDATES (positions 5–15 — optimize these next):
  [slug]: "[keyword]" — position [n] — suggestion: [action]

HEALTHY (positions 1–4):
  [slug]: "[keyword]" — position [n]

NOT YET RANKING:
  [slug]: "[keyword]"

ORGANIC GAPS ADDED TO QUEUE: [count]
  [keyword] — position [n] — score [score]

Total published articles: [count]
Queue depth (queued status): [count]
====================================================
```
