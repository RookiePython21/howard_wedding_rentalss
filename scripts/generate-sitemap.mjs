/**
 * Build-time sitemap generation (ops to-do #35, 2026-11-10).
 *
 * public/sitemap.xml used to be edited by hand when a post was published, so a
 * post's <lastmod> only moved if someone remembered to move it. This script
 * rebuilds the sitemap from src/content/blog/*.md on every `npm run build`:
 *
 *   - every post with a `slug:` gets a <url>, so a new post can't be missed;
 *   - a post's <lastmod> is the later of its `publishedAt:` and optional
 *     `updatedAt:` frontmatter. When you edit a published post, set
 *     `updatedAt: YYYY-MM-DD` in its frontmatter and the sitemap follows;
 *   - /blog's <lastmod> is the newest post's date.
 *
 * It writes dist/sitemap.xml (what is deployed) and public/sitemap.xml (the
 * committed copy, so the repo always shows what is live). Every URL uses the
 * www host. Persona landers (/pews/*) are noindex and stay out.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog')
const SITE = 'https://www.howardweddingrentals.com'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Static routes before the blog posts, in sitemap order.
const HEAD_ROUTES = [
  { path: '/', changefreq: 'monthly', priority: '1.0' },
  { path: '/services', changefreq: 'monthly', priority: '0.9' },
  { path: '/chair-rentals', changefreq: 'monthly', priority: '0.8' },
  { path: '/table-rentals', changefreq: 'monthly', priority: '0.8' },
  { path: '/shop', changefreq: 'weekly', priority: '0.9' },
  { path: '/seating-chart-tool', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.8', lastmodFromPosts: true },
]

// Static routes after the blog posts.
const TAIL_ROUTES = [
  { path: '/about', changefreq: 'yearly', priority: '0.5' },
  { path: '/contact', changefreq: 'yearly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms-of-service', changefreq: 'yearly', priority: '0.2' },
]

function frontmatter(raw) {
  const lines = raw.split('\n')
  if (lines[0].trim() !== '---') return {}
  const close = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (close === -1) return {}
  const meta = {}
  for (const line of lines.slice(1, close)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return meta
}

function blogPosts() {
  if (!fs.existsSync(BLOG_DIR)) return []
  const posts = []
  for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
    const meta = frontmatter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'))
    if (!meta.slug) {
      console.warn(`[sitemap] ${file} has no slug, skipped`)
      continue
    }
    const dates = [meta.publishedAt, meta.updatedAt].filter((d) => d && DATE_RE.test(d))
    if (dates.length === 0) console.warn(`[sitemap] ${file} has no valid publishedAt`)
    posts.push({
      slug: meta.slug,
      published: meta.publishedAt ?? '',
      lastmod: dates.sort().at(-1) ?? null,
    })
  }
  // Oldest first, matching the order the hand-kept file used.
  return posts.sort((a, b) => a.published.localeCompare(b.published) || a.slug.localeCompare(b.slug))
}

function urlBlock({ loc, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

const posts = blogPosts()
const newestPost = posts.map((p) => p.lastmod).filter(Boolean).sort().at(-1) ?? null

const staticBlock = (r) =>
  urlBlock({
    loc: r.path === '/' ? `${SITE}/` : `${SITE}${r.path}`,
    lastmod: r.lastmodFromPosts ? newestPost : null,
    changefreq: r.changefreq,
    priority: r.priority,
  })

const blocks = [
  ...HEAD_ROUTES.map(staticBlock),
  ...posts.map((p) =>
    urlBlock({ loc: `${SITE}/blog/${p.slug}`, lastmod: p.lastmod, changefreq: 'monthly', priority: '0.7' })
  ),
  ...TAIL_ROUTES.map(staticBlock),
]

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  blocks.join('\n') +
  '\n</urlset>\n'

const targets = [path.join(ROOT, 'public', 'sitemap.xml')]
if (fs.existsSync(path.join(ROOT, 'dist'))) targets.push(path.join(ROOT, 'dist', 'sitemap.xml'))
for (const t of targets) fs.writeFileSync(t, xml, 'utf8')

console.log(
  `[sitemap] ${blocks.length} URLs (${posts.length} posts, newest ${newestPost ?? 'n/a'}) -> ` +
    targets.map((t) => path.relative(ROOT, t)).join(', ')
)
