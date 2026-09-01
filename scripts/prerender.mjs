/**
 * Build-time prerendering.
 *
 * After `vite build` produces the client bundle in dist/, this script:
 *   1. enumerates every route (static pages + one per blog post),
 *   2. serves dist/ with `vite preview` (real SPA fallback + correct MIME types),
 *   3. loads each route in a real headless Chrome (puppeteer) so React, the
 *      router, react-helmet-async and react-markdown all run exactly as in
 *      production, then
 *   4. writes the fully-rendered HTML to dist/<route>/index.html.
 *
 * The result: crawlers that do not execute JavaScript (Ahrefs, Bing, social
 * scrapers, AI search) receive complete HTML — real <h1>, body copy, a correct
 * self-referencing <link rel="canonical">, and internal <a> links — instead of
 * an empty <div id="root"></div> shell. This is the fix for the Ahrefs issues:
 * duplicate-without-canonical, orphan pages, missing H1, and low word count.
 */
import { preview } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Resolve a headless Chrome to drive.
 *
 * Locally we use the full `puppeteer` package, which downloads a complete
 * Chromium that relies on the host's system shared libraries (present on a
 * normal dev machine).
 *
 * On Vercel (and other serverless build containers) those libraries — e.g.
 * libnspr4.so — are NOT installed, so that same Chromium fails to launch with
 * "cannot open shared object file". There we instead drive `puppeteer-core`
 * with `@sparticuz/chromium`, a self-contained Chromium build that ships the
 * libraries it needs and is designed for exactly these environments.
 */
async function resolveBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = (await import('puppeteer-core')).default
    return {
      puppeteer,
      launchOptions: {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      },
    }
  }
  const puppeteer = (await import('puppeteer')).default
  return {
    puppeteer,
    launchOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  }
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog')
const PORT = 4180

// Static routes (must match the <Route> paths in src/App.tsx).
const STATIC_ROUTES = [
  '/about',
  '/contact',
  '/services',
  '/chair-rentals',
  '/table-rentals',
  '/shop',
  '/seating-chart-tool',
  '/blog',
  '/privacy-policy',
  '/terms-of-service',
  '/success',
  '/', // render the home page LAST — see note below.
]

/** Read the frontmatter `slug:` from every markdown file → /blog/<slug>. */
function blogRoutes() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf8')
      const m = raw.match(/^slug:\s*(.+)$/m)
      return m ? `/blog/${m[1].trim()}` : null
    })
    .filter(Boolean)
}

// Blog post routes first, home ('/') last. Home is rendered last on purpose:
// each route is served via the SPA fallback (dist/index.html). Rendering home
// overwrites dist/index.html with populated markup, so any route rendered after
// it would be served non-empty markup for the wrong path and hit a hydration
// mismatch. Keeping the empty shell until the end avoids that entirely.
const ROUTES = [...blogRoutes(), ...STATIC_ROUTES]

async function run() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('[prerender] dist/index.html not found — run `vite build` first.')
    process.exit(1)
  }

  const server = await preview({ preview: { port: PORT, strictPort: true } })
  const base = `http://localhost:${PORT}`

  const { puppeteer, launchOptions } = await resolveBrowser()
  const browser = await puppeteer.launch(launchOptions)

  const failures = []
  console.log(`[prerender] rendering ${ROUTES.length} routes…`)

  for (const route of ROUTES) {
    const page = await browser.newPage()
    try {
      await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
      // Wait until React has mounted real content into #root.
      await page.waitForFunction(
        () => {
          const r = document.getElementById('root')
          return !!r && r.children.length > 0
        },
        { timeout: 45000 }
      )
      // Brief settle for react-helmet-async (<head> tags) and markdown rendering.
      await new Promise((r) => setTimeout(r, 500))

      // Firebase Analytics injects a gtag loader at runtime; strip it so it is
      // not baked into the static HTML (it re-initialises on its own on the
      // client — baking it would cause a double load).
      const html = (await page.content()).replace(
        /<script[^>]*googletagmanager\.com[^>]*><\/script>/g,
        ''
      )
      const outDir = route === '/' ? DIST : path.join(DIST, route)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8')
      console.log(`[prerender]  ✓ ${route}`)
    } catch (err) {
      failures.push({ route, message: err.message })
      console.warn(`[prerender]  ✗ ${route} — ${err.message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  await server.httpServer.close()

  if (failures.length) {
    console.warn(
      `[prerender] done with ${failures.length} route(s) not prerendered ` +
        `(they will still work via SPA fallback): ${failures.map((f) => f.route).join(', ')}`
    )
  } else {
    console.log(`[prerender] done — all ${ROUTES.length} routes prerendered.`)
  }
}

run().catch((err) => {
  console.error('[prerender] fatal:', err)
  process.exit(1)
})
