#!/usr/bin/env python3
"""No-Ahrefs keyword candidate generator for the HWR article pipeline.

Sources: Google autocomplete (live, keyless), optional GSC query export (CSV), optional
Google Ads search-term export (CSV). Method, scoring and thresholds: research-method-no-ahrefs.md.

  python -I no-ahrefs-candidates.py --pillars ceremony-planning,church-pew-rentals,nashville-pew-rentals
  python -I no-ahrefs-candidates.py --pillars ... --gsc gsc-queries.csv --ads ads-terms.csv
  python -I no-ahrefs-candidates.py --pillars ... --apply "kw one" "kw two"   # append chosen to the queue

Without --apply it only writes .claude/seo/research-runs/<run>-candidates.json (dry run).
Never fabricates volume: volume/kd/traffic_potential are written as null for non-Ahrefs entries.
"""
import argparse, csv, json, re, string, sys, time, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

SEO = Path(__file__).resolve().parent.parent
Q, P, CFG, MAP, LOG = (SEO / n for n in ("keyword-queue.json", "pillars.json", "config.json",
                                         "published-map.json", "research-log.json"))
AC = "https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q="
# Claims rules (business-profile.md): no prices, no "free". Applied to candidate keywords.
CLAIMS_BLOCK = re.compile(r"\b(free|price|prices|pricing|cost|costs|cheap|cheapest|discount|how much|"
                          r"affordable|per day|rates?|quote|deal|deals|sale|buy|for sale|used)\b", re.I)
STOP = {"a", "an", "the", "for", "of", "to", "in", "on", "and", "or", "with", "how", "do", "i", "my", "your"}
STEM = lambda w: w[:-1] if len(w) > 3 and w.endswith("s") else w


def toks(s):
    return {STEM(w) for w in re.findall(r"[a-z0-9]+", s.lower()) if w not in STOP}


def jaccard(a, b):
    return len(a & b) / len(a | b) if a | b else 0.0


def suggest(q):
    try:
        with urllib.request.urlopen(urllib.request.Request(AC + urllib.parse.quote(q), headers={"User-Agent": "Mozilla/5.0"}), timeout=15) as r:
            return json.loads(r.read().decode("utf-8", "replace"))[1]
    except Exception as e:
        print(f"  autocomplete fail {q!r}: {e}", file=sys.stderr)
        return []


def load_csv(path, qcol_names, metric_names):
    out = {}
    if not path:
        return out
    with open(path, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            low = {k.lower().strip(): v for k, v in row.items()}
            q = next((low[c] for c in qcol_names if c in low), None)
            m = next((low[c] for c in metric_names if c in low), "0")
            if q:
                out[q.strip().lower()] = out.get(q.strip().lower(), 0) + int(float(str(m).replace(",", "") or 0))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pillars", required=True)
    ap.add_argument("--gsc"), ap.add_argument("--ads")
    ap.add_argument("--run-id", default=None)
    ap.add_argument("--alpha", type=int, default=1, help="1 = also expand seed+a..z (default)")
    ap.add_argument("--apply", nargs="*", default=None, help="keywords (exact) to append to the queue")
    a = ap.parse_args()

    cfg, pillars = json.load(open(CFG)), {p["id"]: p for p in json.load(open(P))["pillars"]}
    qd = json.load(open(Q)); queue = qd["queue"]
    pm = json.load(open(MAP))["articles"]
    run_id = a.run_id or "research-run-%03d" % (len(json.load(open(LOG))["runs"]) + 1)
    gsc, ads = load_csv(a.gsc, ["query", "top queries", "keys"], ["impressions"]), \
        load_csv(a.ads, ["search term", "search_term"], ["impr.", "impressions"])

    existing = [(k["keyword"], toks(k["keyword"])) for k in queue]
    for art in pm:
        for kw in [art["primary_keyword"]] + art.get("secondary_keywords", []):
            existing.append((kw, toks(kw)))
    inc = [s.lower() for s in cfg["guardrails"]["inclusion_required_any"]]
    exc = [s.lower() for s in cfg["guardrails"]["exclusion_any"]]

    cands = {}
    for pid in a.pillars.split(","):
        pl = pillars[pid]
        for seed in pl["seed_terms"]:
            variants = [seed] + [f"{seed} {s}" for s in ("for", "near", "ideas", "how to", "vs")]
            if a.alpha:
                variants += [f"{seed} {c}" for c in string.ascii_lowercase]
            for v in variants:
                for rank, s in enumerate(suggest(v)[:8]):
                    s = s.strip().lower()
                    c = cands.setdefault(s, {"keyword": s, "pillar_id": pid, "ac_hits": [], "seeds": set()})
                    c["ac_hits"].append(rank + 1); c["seeds"].add(seed)
                time.sleep(0.25)

    rows = []
    for s, c in cands.items():
        why = None
        if len(s.split()) < 3: why = "too short/broad"
        elif not any(w in s for w in inc): why = "guardrail: no inclusion term"
        elif any(re.search(r"\b" + re.escape(w) + r"\b", s) for w in exc): why = "guardrail: exclusion term"
        elif CLAIMS_BLOCK.search(s): why = "claims rule (price/free/cost wording)"
        else:
            t = toks(s)
            for kw, kt in existing:
                if jaccard(t, kt) >= 0.6 or t <= kt or kt <= t and len(kt) >= 3:
                    why = f"cannibalizes/duplicates '{kw}'"; break
        # score: autocomplete breadth/rank (0-40), GSC (0-30), Ads (0-10), pillar alignment (0-20)
        ac = min(1.0, sum((9 - r) / 8 for r in c["ac_hits"]) / 3) * 40
        g, d = gsc.get(s, 0), ads.get(s, 0)
        gs, ds = min(g / 50, 1) * 30, min(d / 30, 1) * 10
        al = pillars[c["pillar_id"]]["alignment_score"] / 3 * 20
        score = round(ac + gs + ds + al, 1)
        if not (g or d): score = min(score, 44.0)   # autocomplete-only sits behind hand-ordered plan
        keep = why is None and (ac >= 16 or g >= 20 or d >= 10)
        rows.append({"keyword": s, "pillar_id": c["pillar_id"], "score": score, "keep": keep, "drop_reason": why or (None if keep else "weak autocomplete evidence"),
                     "ac_hits": len(c["ac_hits"]), "best_rank": min(c["ac_hits"]), "seed_count": len(c["seeds"]), "gsc_impr_90d": g or None, "ads_impr": d or None})
    rows.sort(key=lambda r: (-r["keep"], -r["score"]))
    out = SEO / "research-runs"; out.mkdir(exist_ok=True)
    (out / f"{run_id}-candidates.json").write_text(json.dumps({"run_id": run_id, "date": str(date.today()), "gsc_loaded": bool(gsc), "ads_loaded": bool(ads), "candidates": rows}, indent=1))
    print(f"{len(rows)} raw, {sum(r['keep'] for r in rows)} kept -> {out / (run_id + '-candidates.json')}")
    for r in [r for r in rows if r["keep"]][:40]: print(f"{r['score']:5} {r['pillar_id']:24} {r['keyword']}  (hits {r['ac_hits']}, best #{r['best_rank']}, seeds {r['seed_count']})")

    if a.apply:
        by = {r["keyword"]: r for r in rows}
        nxt = max(int(k["id"].split("-")[1]) for k in queue) + 1
        for kw in a.apply:
            r = by[kw.lower()]; assert r["keep"], kw
            pl = pillars[r["pillar_id"]]
            sib = [x["keyword"] for x in rows if x["pillar_id"] == r["pillar_id"] and x["keep"] and x["keyword"] != kw and jaccard(toks(x["keyword"]), toks(kw)) >= 0.4][:3]
            queue.append({"id": f"kw-{nxt:03d}", "keyword": kw, "pillar_id": r["pillar_id"], "volume": None, "traffic_potential": None, "kd": None,
                          "parent_topic": None, "search_intent": "informational/commercial: surfaced by Google autocomplete (demand evidence, no volume figure)",
                          "serp_features": [], "priority_score": r["score"], "phase_eligible": 1, "cluster_siblings": sib,
                          "suggested_slug": re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", kw)).strip("-"),
                          "suggested_angle": f"Practical guide for '{kw}' in the brand voice; tie back to {pl['label']}. Delivery within about 120 miles of Owensboro incl. Nashville where relevant. No prices, no 'free'. Check SERP before drafting.",
                          "internal_link_targets": [pl["service_url"], "https://www.howardweddingrentals.com/contact"],
                          "competitor_pages_to_beat": [], "added_date": str(date.today()), "source_run": run_id, "status": "queued",
                          "article_slug": None, "published_date": None, "source": "autocomplete" + ("+gsc" if r["gsc_impr_90d"] else "") + ("+ads" if r["ads_impr"] else ""),
                          "evidence": {"autocomplete_hits": r["ac_hits"], "best_rank": r["best_rank"], "seed_count": r["seed_count"], "gsc_impr_90d": r["gsc_impr_90d"], "ads_impr": r["ads_impr"]},
                          "notes": "No-Ahrefs entry: volume/KD/TP are null by design (see research-method-no-ahrefs.md). GSC/Ads evidence " + ("loaded." if (r["gsc_impr_90d"] or r["ads_impr"]) else "pending (MCPs offline at run time).")})
            nxt += 1
        queue.sort(key=lambda k: -(k["priority_score"] or 0)) if False else None
        qd["last_updated"] = str(date.today())
        json.dump(qd, open(Q, "w"), indent=2, ensure_ascii=False)
        lg = json.load(open(LOG)); lg["runs"].append({"run_id": run_id, "started_at": str(date.today()), "completed_at": str(date.today()), "trigger": "no_ahrefs_rebuild",
            "phase_at_time": cfg["phase"]["current"], "pillars_researched": a.pillars.split(","), "raw_keywords_found": len(rows), "keywords_after_guardrail": sum(r["keep"] for r in rows),
            "keywords_added_to_queue": len(a.apply), "sources": ["google_autocomplete"] + (["gsc_csv"] if gsc else []) + (["ads_csv"] if ads else []),
            "notes": "No Ahrefs. GSC and Google Ads pending." if not (gsc or ads) else "No Ahrefs."})
        json.dump(lg, open(LOG, "w"), indent=2, ensure_ascii=False)
        print("applied", len(a.apply))


if __name__ == "__main__":
    main()
