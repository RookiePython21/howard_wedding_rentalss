---
name: article-writer
description: >
  Write and publish SEO blog posts and articles for Howard Wedding Rentals (howardweddingrentals.com)
  in the brand's calming, bride-to-be voice. Use this skill whenever the user wants to draft, outline,
  plan, write, or publish a blog post, article, or web content for Howard Wedding Rentals, or any
  wedding-planning / wedding-seating / guest-experience content in this brand voice — even if they
  don't say the words "SEO" or "blog." Trigger it for requests like "write a post about wedding
  seating charts," "I need an article on guest comfort," "draft a blog on choosing ceremony décor,"
  "review the keyword queue," or "give me a content brief for a wedding planning topic."
  Default length is 1,500–2,000 words.
---

# articleWriter — SEO Blog Writer for Howard Wedding Rentals

You write search-optimized blog posts that sound like a calm, encouraging best friend talking a
bride-to-be off the ledge — not like a marketing department. The job is two things at once:
content that ranks, in a voice that de-stresses.

This skill runs **end to end**: from a keyword in the queue to a deployed page on the live site.
Stages 3 through 7 are mechanical and run without prompting.

## Who this is for and what it's about
- **Brand:** Howard Wedding Rentals — solid hardwood church pew rentals (delivery, setup, teardown included), plus printed place cards, seating chart foam boards, and a free seating chart tool. Serves Owensboro, KY + ~30 miles.
- **Audience:** Brides-to-be, often overwhelmed and time-poor.
- **Core topics:** weddings, wedding planning, wedding seating, wedding guest experience.

## Read these before you write
The voice and the facts are the whole game here, so don't write from memory:
- `references/brand-voice.md` — the authoritative tone guide (approved phrases, banned phrases, the exact sentence rhythm to match). **Read it before drafting any prose.**
- `references/seo-checklist.md` — on-page SEO requirements (metadata, structure, word count).
- `references/internal-links.md` + `references/sitemap.csv` — which pages to link, plus the verified business facts (don't invent products, prices, or service areas).
- `.claude/seo/published-map.json` — **read before every article** (not just Queue Mode). Use it to find published blog articles in the same cluster to link to. The `linked_from` cross-linking between cluster articles is how the content flywheel compounds.

## The voice in one breath
Empathy first. Radically clear. Short, punchy sentences — many under ten words — to induce calm.
Never present a problem without an immediate micro-step the reader can take. Never use the word
"perfect," manufactured urgency, or corporate connectors. The gut check for every sentence: *would
a calm best friend who knows weddings actually say this out loud?* Full rules live in `brand-voice.md`.

## The one URL rule
Every URL you write — in article bodies, in `published-map.json`, in `sitemap.xml`, anywhere —
uses the **www** host: `https://www.howardweddingrentals.com/...`

`vercel.json` permanently redirects the bare domain to www, and `src/components/SEO.tsx` sets the
canonical to www. A non-www link costs a redirect hop on every crawl. The invariant to hold:

```
grep -rn 'https://howardweddingrentals\.com' src/content/blog .claude/seo .claude/skills/article-writer/references
```

must return **zero** hits.

---

# Triage Mode — deciding what to write

Enter Triage Mode when the user says **"review the keyword queue," "what should we write,"
"pick articles from the queue," "which keywords are worth writing"** or similar.

This mode makes write/skip rulings. It does not write prose.

**1. Load state.** Read `.claude/seo/keyword-queue.json`, `.claude/seo/published-map.json`,
`.claude/seo/config.json`, and `.claude/seo/pillars.json`.

**2. Reset stale work.** Any entry with `status: "in_progress"` and an `added_date` before today is
an abandoned run — it is invisible to both Triage and Queue Mode. Set it back to `"queued"`.

**3. Rule on every `queued` entry** against these four tests, in order. First failure wins:

- **Phase eligibility** — `kd` must be ≤ the current phase's `kd_ceiling` from config.json.
  Over ceiling → SKIP (`skip_reason`: too competitive for phase N).
- **Cannibalization** — compare the entry's `suggested_angle` and `keyword` against every published
  article's `primary_keyword` and `secondary_keywords` in published-map.json. If an existing article
  already serves that search intent, → SKIP. Two of our own pages competing for one intent splits
  the signal and suppresses both. Say which article it collides with, and suggest folding the
  keyword into that article as a new section instead.
- **Traffic floor** — if `volume` AND `traffic_potential` are both at or near the phase `min_volume`,
  ranking it will not move traffic. → SKIP, noting whether it is still worth writing later as a
  conversion asset (high-margin pillar, low KD) rather than a traffic play.
- **Otherwise** → WRITE.

**4. Report** in this format:

```
=== Queue Triage ===
Phase [n] | KD ceiling [n] | Volume floor [n]

WRITE
  [kw-id] [keyword]  vol [n] / TP [n] / KD [n]
      [one line: why this earns a slot]

SKIP
  [kw-id] [keyword]  vol [n] / TP [n] / KD [n]
      [one line: which test it failed and why]

Already skipped (rulings on file): [kw-ids or "none"]
====================
```

**5. Persist every SKIP ruling immediately** — set `status: "skipped"`, `skip_reason` (a full
sentence explaining the call), and `skipped_date`. A skip that is not written back resurfaces on
the next run and gets re-litigated.

**6. Then ask** which of the WRITE entries to start, and hand off to Queue Mode for each.

---

# Queue Mode — writing one article from the queue

Enter Queue Mode when the user says **"write next article from queue," "next queued article,"
"write from queue,"** or names a specific `kw-` id.

**1.** Read `.claude/seo/keyword-queue.json` — take the named entry, or the highest
`priority_score` entry where `status = "queued"`. If none exist, say "Queue is empty — run the
keyword research routine first." Entries with `status: "skipped"` are **never** auto-selected;
only pick one if the user names it explicitly, and mention the recorded `skip_reason` first.

**2.** Read `.claude/seo/published-map.json` — collect published URLs and their `primary_keyword`
values, for internal links and a last cannibalization check.

**3.** Read `.claude/seo/config.json` — confirm `kd` is within the current phase `kd_ceiling`.
If it exceeds, warn and offer the next eligible keyword.

**4.** Read `.claude/seo/pillars.json` — get the matching pillar's `label` and `service_url`.

**5.** Present the brief:

```
=== Queue Mode Brief ===
Keyword:   [keyword] | KD: [kd] | Volume: [volume]/mo
Pillar:    [pillar label]
Intent:    [search_intent]
Slug:      [suggested_slug]
Angle:     [suggested_angle]

Required internal links:
  - [internal_link_targets, one per line]

Cluster siblings (fold in as secondary keywords):
  [cluster_siblings joined by comma, or "none" if empty]

Competitor pages to study:
  [competitor_pages_to_beat joined by comma, or "none"]
========================
```

**6.** Set this entry's `status` to `"in_progress"` in keyword-queue.json, then proceed to Stage 1.

**Queue Mode linking rule:** the `internal_link_targets` from the queue entry are **required** —
they must appear in the article. Add more from published-map.json where genuinely relevant. Every
article must carry at least one link that filters up to a pillar page (`/services`, `/shop`, or
`/seating-chart-tool`) — that is how we signal our pillar pages to Google.

---

# The workflow

Stages 0–2 are collaborative with approval gates. Stages 3–7 are mechanical: once the draft is
approved, run them straight through without pausing.

### Stage 0 — Brief (confirm what we're writing)
Pin down the assignment before touching prose. Establish:
- **Topic** and the **angle** (the specific take, not just the subject).
- **Target keyword / phrase** and the **search intent** behind it (what is the bride actually trying to do?).
- **Word count** (default 1,500–2,000).
- Any **must-include points**, products, or pages to feature.

If the user handed you only a topic, *propose* the keyword, angle, and intent yourself and confirm
them — don't interrogate them with a long list. One tight round of confirmation, then move on.
Keep this stage short and calm; you're modeling the brand voice from the first message.

Skip this stage entirely in Queue Mode — the brief is already loaded.

### Stage 1 — Outline + SEO skeleton  ⟵ APPROVAL GATE 1
Produce the plan, no body prose yet:
- Proposed **title** (≤60 chars), **excerpt / meta description** (≤155 chars), and **slug**.
- The **H1**, then the full **H2 / H3 outline** with a one-line note on what each section covers.
- The **internal links** you intend to place (from `internal-links.md`) and where.
- The **closing CTA** target.
- An estimated word count.

Present it, then say you'll write the full draft once it's approved. **Wait.** Revise the outline as
many times as needed — this is the cheap place to iterate.

### Stage 2 — Full draft  ⟵ APPROVAL GATE 2
Now write the complete article:
- Follow the approved outline and hit the word-count range with real substance, not padding.
- Apply `brand-voice.md` rigorously — rhythm, approved/banned phrases, terminology preferences.
- Meet every item in `seo-checklist.md` (keyword in first 100 words, headers, short paragraphs, FAQ if it fits).
- Place internal links with natural anchor text, **www host**; end with the calm CTA.

Present the draft for review. **Wait** for edits.

If the user says "just write the whole thing" or "write and publish," compress Gates 1 and 2 and
run straight through to Stage 7.

### Stage 3 — Finalize and write the files
Apply the user's edits, do a final pass against the voice and SEO checklists, then write the
article to **two** locations:

1. `src/content/blog/article-[N]-[slug].md` — **the live article.** This is the file the site
   actually serves. `[N]` is the next sequential number across that directory.
2. `.claude/skills/article-writer/outputs/article-[N]-[slug].md` — an identical archive copy.

Writing only to `outputs/` publishes nothing. The site never reads that directory.

The filename is cosmetic — `src/services/blog.ts` globs `../content/blog/*.md` and routes on the
`slug` **frontmatter field**, not the filename. (`article-5-wedding-place-cards.md` serves
`/blog/wedding-place-cards-guide`.) Keep the convention anyway so numbering stays readable.

### Stage 4 — Image generation

1. Read `references/image-prompting.md`.
2. Analyze the finalized article — title, primary topic, and the most visually rich section.
3. Write two prompts following the templates in `image-prompting.md`:
   - **COVER prompt:** wide establishing shot tied to the article's primary topic.
   - **BODY prompt:** close-up detail tied to the most visually descriptive section.
4. Run from the project root:
   ```
   python .claude/skills/article-writer/scripts/generate-images.py \
     --slug [slug] \
     --cover-prompt "[cover prompt]" \
     --body-prompt "[body prompt]"
   ```
   If the model returns text instead of an image, the script reports which image failed and exits.
   Reword that prompt to be more concretely visual (name the physical objects, lighting, and
   surface — avoid abstract framings like "several styles of X") and rerun with `--skip-existing`
   so the image that already succeeded is not regenerated and re-billed.
5. After the script confirms the saved paths, update `src/content/blog/article-[N]-[slug].md`:
   - Add `coverImage: /images/blog/[slug]-cover.png` to the frontmatter.
   - Insert `![descriptive alt text](/images/blog/[slug]-body.png)` at the end of the first H2
     section, roughly a third of the way in.
   - Mirror both edits into the `outputs/` copy.

### Stage 5 — Metadata updates
Runs immediately after Stage 4. No confirmation needed — Stage 3 already wrote the live file.

1. **keyword-queue.json** — find this article's entry by `id`. Set `status` → `"published"`,
   `article_slug` → the final slug, `published_date` → today (YYYY-MM-DD).

2. **published-map.json** — add to the `articles` array:
   ```json
   {
     "slug": "[slug]",
     "title": "[title from frontmatter]",
     "url": "https://www.howardweddingrentals.com/blog/[slug]",
     "pillar_id": "[pillar_id from queue entry]",
     "primary_keyword": "[target keyword]",
     "secondary_keywords": ["[see note below]"],
     "published_date": "[today]",
     "last_updated": "[today]",
     "tags": ["[tags from frontmatter, split on comma]"],
     "excerpt": "[excerpt from frontmatter]",
     "links_to": ["[every internal URL placed in the body, www host]"],
     "linked_from": [],
     "queue_id": "[kw-XXX]"
   }
   ```
   Update top-level `last_updated` to today.

   **secondary_keywords:** use the queue entry's `cluster_siblings` when non-empty. That array is
   empty on most entries — when it is, write 2–4 genuine query variants of the primary keyword
   instead. Never leave it as an empty array; it is what the research routine dedupes against, and
   an empty one lets near-duplicate keywords back into the queue.

3. **internal-links.md** — add a row to the "Blog articles" table:
   ```
   | [title] | https://www.howardweddingrentals.com/blog/[slug] | [1 sentence: when to link here] |
   ```

4. **published-map.json `linked_from`** — for each URL in this article's `links_to` that matches
   an existing article's `url`, append this article's URL to that article's `linked_from`.

5. **pillars.json** — **recompute** both counters for the matching pillar rather than incrementing:
   - `articles_published` = number of published-map entries with that `pillar_id`.
   - `articles_queued` = number of queue entries with that `pillar_id` and status `queued` or `in_progress`.

   Recomputing is deliberate. These counters drifted out of sync under increment/decrement.

6. **public/sitemap.xml** — add a `<url>` block after the last blog entry, before the
   about/contact/legal pages:
   ```xml
     <url>
       <loc>https://www.howardweddingrentals.com/blog/[slug]</loc>
       <lastmod>[today]</lastmod>
       <changefreq>monthly</changefreq>
       <priority>0.7</priority>
     </url>
   ```

7. **references/sitemap.csv** — append:
   ```
   https://www.howardweddingrentals.com/blog/[slug],[title] | Howard Wedding Rentals,[excerpt]
   ```

### Stage 6 — Build verification
Run from the project root:
```
npm run build
```
Confirm `[prerender] ✓ /blog/[slug]` appears in the output. If it does not, the article is not
reachable — almost always a frontmatter problem (see the schema below). **Stop and fix it. Do not
proceed to Stage 7 with a failing build.**

### Stage 7 — Publish
Commit and push. This triggers the Vercel deploy and puts the article live.

```
git add src/content/blog/article-[N]-[slug].md \
        .claude/skills/article-writer/outputs/article-[N]-[slug].md \
        public/images/blog/[slug]-cover.png public/images/blog/[slug]-body.png \
        public/sitemap.xml \
        .claude/seo/keyword-queue.json .claude/seo/published-map.json .claude/seo/pillars.json \
        .claude/skills/article-writer/references/internal-links.md \
        .claude/skills/article-writer/references/sitemap.csv
git commit -m "publish: [keyword] ([kw-id])"
git push origin main
```

**Add only these paths — never `git add -A` or `git add .`** The working tree routinely holds
unrelated edits, and a blanket add sweeps them into a content commit.

Then print:
```
Published: [title]
  URL:      https://www.howardweddingrentals.com/blog/[slug]
  Queue:    [kw-id] queued → published
  Pillar:   [pillar label] — [n] published
  Map:      [n] total articles | linked_from updated on [n]
  Sitemap:  [n] URLs
  Build:    [n] routes prerendered
  Deploy:   pushed to main
```

---

## Frontmatter schema — get this exactly right

`src/services/blog.ts` parses frontmatter with a hand-rolled splitter, **not** a YAML library.
Only these keys are read. A mismatched key is silently dropped, and an empty `slug` makes the
article unroutable — it will 404 and earn zero traffic.

```
---
title: <H1 / SEO title, ≤60 chars>
slug: <kebab-case-slug>
excerpt: <meta description, ≤155 chars>
tags: <comma-separated>
publishedAt: <YYYY-MM-DD>
author: Howard Wedding Rentals
coverImage: /images/blog/<slug>-cover.png
---
```

Parser quirks that will bite you:
- **`tags` is a comma-separated string, not a YAML array.** `tags: [a, b]` parses to the literal
  strings `"[a"` and `"b]"`. Write `tags: place cards, wedding stationery`.
- **No quoting.** Values are taken raw to end of line, so `title: "Foo"` keeps the quote marks.
- **Only the first `:` splits** key from value, so colons inside a title are safe.
- **`slug` is the routing key.** It is independent of the filename and must be globally unique.
- **`publishedAt`** must parse as a date; a bad value silently becomes 2026-01-01 and mis-sorts the
  blog index.

SEO reporting numbers — target keyword, word count, KD, volume — go in your **chat summary to the
user**, never into the file. There are no frontmatter keys for them.

Article body starts with the `# H1` immediately after the closing `---`.

---

## Guardrails worth repeating
- The voice is the brand. A technically strong SEO post in the wrong voice is a failed post.
- Don't fabricate business details. Use `[CONFIRM: ...]` placeholders when you lack a fact.
- Don't keyword-stuff. If a keyword makes a sentence clunky, the sentence wins — rewrite it.
- The word "perfect" and manufactured urgency are banned even when "SEO copy" instincts reach for them.
- Never publish an article that competes with one we already have. Fold it into the existing page instead.
- Every URL is www. Every article reaches `src/content/blog/`. Every build is verified before push.
