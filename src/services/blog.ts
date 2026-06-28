export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  publishedAt: Date
  author: string
  tags: string[]
  published: boolean
}

const rawFiles = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const lines = raw.split('\n')
  if (lines[0].trim() !== '---') return { meta: {}, body: raw }
  const closeIdx = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (closeIdx === -1) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of lines.slice(1, closeIdx)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return { meta, body: lines.slice(closeIdx + 1).join('\n').trim() }
}

let _posts: BlogPost[] | null = null

function loadPosts(): BlogPost[] {
  if (_posts) return _posts
  _posts = Object.entries(rawFiles)
    .map(([path, raw]) => {
      const { meta, body } = parseFrontmatter(raw)
      const id = path.split('/').pop()?.replace('.md', '') ?? path
      return {
        id,
        title: meta.title ?? '',
        slug: meta.slug ?? '',
        excerpt: meta.excerpt ?? '',
        content: body,
        coverImage: meta.coverImage || undefined,
        publishedAt: new Date(meta.publishedAt ?? '2026-01-01'),
        author: meta.author ?? 'Howard Wedding Rentals',
        tags: meta.tags ? meta.tags.split(',').map((t) => t.trim()) : [],
        published: true,
      }
    })
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  return _posts
}

export async function getPosts(
  pageSize = 10,
  _cursor?: unknown
): Promise<{ posts: BlogPost[]; lastDoc: null }> {
  return { posts: loadPosts().slice(0, pageSize), lastDoc: null }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return loadPosts().find((p) => p.slug === slug) ?? null
}

// Synchronous accessors. Posts are bundled at build time (import.meta.glob with
// eager: true), so they are available on the very first render. Seeding React
// state from these keeps the initial client render identical to the prerendered
// HTML, which is required for clean hydration (and removes the loading flash).
export function getPostsSync(pageSize = 10): BlogPost[] {
  return loadPosts().slice(0, pageSize)
}

export function getPostBySlugSync(slug: string): BlogPost | null {
  return loadPosts().find((p) => p.slug === slug) ?? null
}
