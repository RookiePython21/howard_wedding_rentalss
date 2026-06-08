# Routine: New Service Pillar Seed — Howard Wedding Rentals

Run this manually when a new product or service launches. It performs a deep keyword
discovery pass for the new pillar and seeds the queue with 15–20 initial keywords so
the first article has a fully pre-researched brief ready immediately.

---

## Prerequisites

The user must have already added a new entry to `.claude/seo/pillars.json` with:
- A unique `id` (kebab-case)
- `label`, `description`, `service_url`
- At least 5 items in `seed_terms`
- `alignment_score` set: 3 for revenue service, 2 for tool/lead magnet, 1 for informational
- `status: "active"`
- `articles_published: 0` and `articles_queued: 0`

Before starting, read pillars.json and confirm a pillar with status "active" and
`articles_published: 0` exists. If you cannot identify which pillar is new, stop and ask the user.

---

## Step 1 — Load system state

Read:
- `.claude/seo/config.json` → phase, kd_ceiling, min_volume, guardrails
- `.claude/seo/keyword-queue.json` → build dedup set from all keywords + parent_topics
- `.claude/seo/published-map.json` → add all primary_keywords + secondary_keywords to dedup set
- `.claude/seo/research-log.json` → determine next run_id

---

## Step 2 — Deep keyword discovery (ALL seed terms)

Unlike the bi-weekly routine which only uses the first 2 seed terms, this routine
uses EVERY seed term in the new pillar's `seed_terms` array.

For each seed term:
- Call `mcp__ahrefs__keywords-explorer-search-suggestions` (limit: 30)
- Call `mcp__ahrefs__keywords-explorer-related-terms` (limit: 30)

Goal: collect 40–60 raw candidates before filtering.

---

## Step 3 — Relaxed guardrail filter

Apply the standard guardrail checks from keyword-research.md Steps 3A–3F, BUT use a
relaxed KD ceiling: `phase kd_ceiling + 10`. This gives the new pillar more runway
to build its initial cluster.

Example: If phase 1 normally caps at KD 25, new pillar seeding uses KD 35.

Note in the research-log entry: `"notes": "New pillar seed — KD ceiling relaxed by +10"`.

Apply volume floor and dedup checks normally.

---

## Step 4 — Priority scoring and SERP sampling

Score all passing keywords using the standard formula (keyword-research.md Step 4).
Take the top 15 for SERP sampling via `mcp__ahrefs__serp-overview`.

---

## Step 5 — Select and write queue entries

Select the top 20 keywords by priority score (or fewer if not enough pass guardrails).
Build queue entries using the same schema as keyword-research.md Step 6.

Target: the #1 keyword should become the pillar page (broad overview article).
The rest become cluster articles. Set a note in the #1 entry:
`"notes": "Suggested pillar page for this cluster — write this first"`

Write new entries to keyword-queue.json (merge, re-sort, update last_updated).
Update research-log.json with a new run entry (trigger: "new_pillar_seed").

Update `pillars.json` for the new pillar:
- Set `articles_queued` to the count of keywords added

---

## Step 6 — Summary output

Print:
```
=== New Pillar Seed Complete ===
Pillar: [label]
Raw candidates: [count] | After filter: [count] | Added to queue: [count]

Suggested first article (pillar page):
  Keyword:  [keyword]
  Score:    [score]
  Slug:     [suggested_slug]
  Angle:    [suggested_angle]
  Intent:   [search_intent]

Next step: Say "write next article from queue" to start the pillar page.
================================
```
