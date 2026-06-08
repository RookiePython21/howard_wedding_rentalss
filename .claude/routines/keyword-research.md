# Routine: Bi-Weekly Keyword Research — Howard Wedding Rentals

You are an SEO research agent for howardweddingrentals.com running a fully headless,
scheduled keyword discovery session. Work through every step below in order without
stopping for confirmation. Write all outputs to the filesystem before sending the SMS.

---

## Step 0 — Load system state

Read these four files from the project root:
- `.claude/seo/config.json` → extract: current phase number, kd_ceiling, min_volume, scoring weights, guardrail lists
- `.claude/seo/pillars.json` → extract all pillars where status = "active"
- `.claude/seo/keyword-queue.json` → load entire queue array
- `.claude/seo/published-map.json` → load all articles

Build the **dedup set** — a flat list of lowercase strings to check against:
- Every `keyword` in the queue (all statuses)
- Every `primary_keyword` from published-map.json
- Every item in every `secondary_keywords` array from published-map.json
- Every `parent_topic` in the queue

Also read the next sequential `run_id` from research-log.json (e.g., "research-run-002").
If research-log.json has no runs yet, use "research-run-001".

---

## Step 1 — Competitor identification (first run only)

Check `config.ahrefs.competitor_identification_done`. If it is `false`:

Call `mcp__ahrefs__site-explorer-organic-competitors` with:
- target: "howardweddingrentals.com"
- mode: "domain"

Extract the top 5 competitor domains from the response. Write them into config.json at
`ahrefs.competitor_domains` and set `ahrefs.competitor_identification_done` to `true`.
Save config.json before continuing.

If `competitor_identification_done` is already `true`, skip this step.

---

## Step 2 — Keyword discovery (repeat for each active pillar)

For EACH active pillar, use the first two items in its `seed_terms` array:

For each seed term:
- Call `mcp__ahrefs__keywords-explorer-search-suggestions` with:
  - keyword: [seed term]
  - country: "us"
  - limit: 30
- Call `mcp__ahrefs__keywords-explorer-related-terms` with:
  - keyword: [seed term]
  - country: "us"
  - limit: 30

Collect all returned keywords from both calls. De-duplicate within this raw batch
(same string → keep one). Track which pillar each keyword came from.

---

## Step 3 — Guardrail filter

For each candidate keyword, apply ALL checks in order. Discard on first failure.

**Check A — Inclusion filter**
The keyword must contain at least one term from `guardrails.inclusion_required_any`
(case-insensitive substring match). Example: "pew rental owensboro" matches "pew rental" ✓

**Check B — Exclusion filter**
The keyword must NOT contain any term from `guardrails.exclusion_any`.

**Check C — Volume floor**
`volume` must be ≥ `min_volume` from the current phase config.

**Check D — KD ceiling**
`kd` must be ≤ `kd_ceiling` from the current phase config.

**Check E — Dedup check**
The keyword string (lowercase, trimmed) must NOT exist in the dedup set from Step 0.

**Check F — Parent topic dedup**
If the keyword's `parent_topic` already exists in the dedup set (as a keyword or
parent_topic of a queued/published item), do NOT create a new queue entry.
Instead, find the existing queue entry for that parent_topic and add this keyword
to its `cluster_siblings` array (then update keyword-queue.json). Move to next candidate.

---

## Step 4 — Priority scoring

For each keyword that passes all guardrail checks, compute a priority score:

```
kd_ceiling     = config.phase.phases[current].kd_ceiling
volume_norm    = min(volume, 5000) / 5000
tp_norm        = min(traffic_potential, 5000) / 5000
kd_inv         = (kd_ceiling - kd) / kd_ceiling
pillar_align   = pillar.alignment_score / 3

score = (volume_norm * 0.30 + tp_norm * 0.25 + kd_inv * 0.25 + pillar_align * 0.20) * 100
```

Round to one decimal. Discard any keyword with score < 20.

Determine `phase_eligible`:
- 1 if kd <= 25
- 2 if kd <= 40
- 3 if kd <= 55

---

## Step 5 — SERP sampling (top 10 new keywords only)

Sort the passing keywords by score descending. Take the top 10.

For each, call `mcp__ahrefs__serp-overview` with:
- keyword: [keyword]
- country: "us"

Extract from results:
- `competitor_pages_to_beat`: URLs of the top 3 ranking pages
- `serp_features`: list of feature strings (local_pack, ai_overview, featured_snippet, etc.)

Add these to each keyword's data.

---

## Step 6 — Build queue entries

For each passing keyword, construct this object:

```json
{
  "id": "kw-[next 3-digit sequential number across entire queue]",
  "keyword": "[exact keyword string]",
  "pillar_id": "[pillar id]",
  "volume": [number],
  "traffic_potential": [number or 0 if unavailable],
  "kd": [number],
  "parent_topic": "[from Ahrefs response, or keyword itself if not provided]",
  "search_intent": "[one sentence: informational | transactional | navigational + what bride is trying to do]",
  "serp_features": ["[list of strings, empty array if SERP not checked]"],
  "priority_score": [score],
  "phase_eligible": [1, 2, or 3],
  "cluster_siblings": [],
  "suggested_slug": "[kebab-case 3-6 words built from keyword]",
  "suggested_angle": "[one sentence: specific article angle that avoids duplicating existing content]",
  "internal_link_targets": ["[3-4 URLs from published-map.json and service pages most relevant to this keyword]"],
  "competitor_pages_to_beat": ["[from SERP step, empty array if not checked]"],
  "added_date": "[today YYYY-MM-DD]",
  "source_run": "[run_id from Step 0]",
  "status": "queued",
  "article_slug": null,
  "published_date": null
}
```

For `internal_link_targets`, select the 3-4 most topically relevant URLs by:
1. Matching the pillar's `service_url`
2. Matching published articles in the same pillar (from published-map.json)
3. The contact page if the keyword has transactional intent

---

## Step 7 — Write all outputs

**keyword-queue.json:**
Merge the new entries into the existing queue array. Keep all existing entries unchanged.
Re-sort the ENTIRE array by `priority_score` descending before writing.
Update `last_updated` to today's date.

**research-log.json:**
Append a new entry:
```json
{
  "run_id": "[run_id]",
  "started_at": "[ISO timestamp]",
  "completed_at": "[ISO timestamp]",
  "trigger": "scheduled",
  "phase_at_time": [current phase number],
  "pillars_researched": ["[list of pillar ids]"],
  "raw_keywords_found": [count],
  "keywords_after_guardrail": [count],
  "keywords_after_dedup": [count],
  "keywords_added_to_queue": [count],
  "cluster_siblings_updated": [count],
  "keywords_discarded_low_score": [count],
  "competitor_domains_identified": ["[list, empty if already done]"],
  "sms_sent": true,
  "notes": ""
}
```

**config.json:**
Update `content_cadence.last_research_run` to today's date (YYYY-MM-DD).
Update `content_cadence.next_research_run` to today + 14 days.

---

## Step 8 — Build SMS message

Compose a message under 320 characters total:

```
HWR Research [M/DD]
[N] new keywords (queue: [total queued])
Top picks:
1. [keyword1] ([score1])
2. [keyword2] ([score2])
3. [keyword3] ([score3])
Log in & write 2 articles.
```

Use the top 3 newly added keywords sorted by priority_score. If fewer than 3 were added,
list however many there are. Keep keyword strings short if needed (truncate at 30 chars).

---

## Step 9 — Send SMS (fire-and-forget)

Run from the project root:
```
python .claude/seo/scripts/send-sms.py "[message from Step 8]"
```

If the script exits with an error, print the error to console but DO NOT abort or
re-run — the research data is already saved. Log `"sms_sent": false` in research-log.json.

---

## Step 10 — Final console summary

Print:
```
=== HWR Keyword Research Complete ===
Run ID: [run_id]
Phase: [phase] | KD ceiling: [kd_ceiling] | Volume floor: [min_volume]
Pillars researched: [count]
Raw keywords found: [count]
Added to queue: [count] | Queue depth: [total queued status count]
SMS: [sent / failed]
Next run: [next_research_run date]
=====================================
```
