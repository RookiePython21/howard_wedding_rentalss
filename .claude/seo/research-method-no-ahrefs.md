# Keyword research without Ahrefs

Approved by owner 2026-10-28 (to-do #40b). Replaces the Ahrefs volume / KD / traffic-potential inputs
of the research half of the article pipeline. The queue format, `priority_score` ordering and the
Friday publisher (`_PM\scripts\hwr-article-publisher.ps1`, reads `keyword-queue.json`, takes the top
queued entries by `priority_score`) are unchanged.

## Sources, in order of trust

| # | Source | Gives | Status 2026-11-02 |
|---|---|---|---|
| 1 | Google Search Console (queries, 90 days) | Real impressions / clicks / position for queries we already show for. Ground truth. | PENDING. `google-search-console-mcp` timed out this run. Load via `--gsc <csv>` (Performance > Queries export, or MCP dump) once readable. |
| 2 | Google Ads search terms | Real impressions / clicks for terms people typed into our ads. | PENDING. `just_google_ads_mcp` timed out. Load via `--ads <csv>`. |
| 3 | Google autocomplete (`suggestqueries.google.com`, keyless) | Demand evidence only: a phrase that autocompletes is searched often enough to be learned. No volume number. | LIVE. Used this run. |
| 4 | Manual SERP check by the writer at draft time | Intent and competitor read. | Existing article-writer step, unchanged. |

No third-party volume estimate is used and none is invented. For autocomplete-only entries
`volume`, `traffic_potential` and `kd` are written as `null`, never as a guess.

## Candidate generation

`.claude/seo/scripts/no-ahrefs-candidates.py --pillars <ids>`:
1. For each `seed_terms` entry of the chosen pillars, request autocomplete for the seed, seed + (for, near, ideas, how to, vs) and seed + a..z (top 8 each, 0.25 s apart).
2. Drop: under 3 words; fails `config.json` `guardrails` inclusion/exclusion; fails the claims filter (free, price, cost, cheap, discount, how much, rates, quote, buy, used...); cannibalizes anything already in the queue or in `published-map.json` (token-set Jaccard >= 0.6, or one token set contains the other).
3. Score the survivors, write `research-runs/<run-id>-candidates.json` (dry run, nothing queued).
4. A human or agent curates (drops off-topic autocomplete noise such as other countries, reception-only and "near me" generic terms), then reruns with `--apply "kw" ...` to append chosen entries to `keyword-queue.json` and a row to `research-log.json`.

## Score (replaces the volume/KD formula), 0 to 100

| Component | Max | Rule |
|---|---|---|
| Autocomplete | 40 | sum over hits of (9 - rank)/8, divided by 3, capped at 1. Many seeds surfacing the phrase and high rank both raise it. |
| GSC | 30 | 90-day impressions / 50, capped at 1 |
| Google Ads | 10 | search-term impressions / 30, capped at 1 |
| Pillar alignment | 20 | `alignment_score` / 3 * 20 |

Autocomplete-only entries are capped at **44.0** so they sit behind the hand-ordered plan entries
(46-58) and ahead of the low-value supporting posts (19.9). Once GSC or Ads evidence exists the cap lifts.

## Thresholds (replace `min_volume` and `kd_ceiling`)

- **Keep** if autocomplete component >= 16 (about one top-3 hit across 2+ seeds, or many lower hits), OR GSC impressions >= 20 in 90 days, OR Ads impressions >= 10.
- **Phase gates**: KD is gone, so the KD ceiling cannot be tested. Proxy: only long-tail phrases (3+ words) are admitted, and the writer must look at the SERP before drafting; if page one is all high-authority national sites (Brides, The Knot, Zola, Pinterest) with no small-site result, rule SKIP "SERP too strong for phase 1". The article-writer Triage section carries this rule for entries where `kd` is null.
- **Traffic floor**: replaced by the keep rule above. An entry with `volume: null` is never skipped for low volume.
- **Local pages** (Nashville, Kentucky, "near me"): autocomplete returned nothing for "pew rental nashville", "church pew rental tennessee", "wedding pew rental kentucky" (checked 2026-11-02), matching Ahrefs' 0-volume finding. Do not spend article slots on them; build service-area landing pages and rely on GBP instead.

## Claims rules for every entry

No prices, no "free", no "starting at", no timing or results claims. Suggested angles must say delivery is within about 120 miles of Owensboro, not quote numbers. Candidates containing price/free/cost wording are filtered out up front.

## Queue entry additions

Existing fields are kept. New fields: `source` (`autocomplete`, `autocomplete+gsc`, `autocomplete+ads`), `evidence` (autocomplete_hits, best_rank, seed_count, gsc_impr_90d, ads_impr). `source_run` points at the research-log run. Entries lacking `source` are Ahrefs-era.

## Cadence and what to do when GSC / Ads come back

1. Biweekly (or when fewer than 6 queued): run the script for pillars with fewer than 4 queued entries.
2. When GSC is readable: export Performance > Queries (90 days, page filter `/blog/` and all), run with `--gsc`. Striking-distance queries (position 8-20, impressions >= 20) outrank new topics: refresh the existing article first (to-do for content-writer-agent) rather than queue a new one.
3. When Ads is readable: export search terms (last 90 days) and run with `--ads`; converting terms get the 10-point bonus and go to the top of the queue.
4. Re-score existing autocomplete-only entries after each GSC load.

## Run log

- research-run-008 (2026-11-02): autocomplete only; 816 raw phrases, 65 passed filters, 6 curated into the queue (see `research-runs/research-run-008-candidates.json`). GSC and Ads pending.
