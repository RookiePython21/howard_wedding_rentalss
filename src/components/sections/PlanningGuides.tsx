import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getPostBySlugSync } from '../../services/blog'

export interface GuideLink {
  /** Frontmatter `slug` of a post in src/content/blog. */
  slug: string
  /** One line of context shown under the link. No prices, no "free", no timing promises. */
  blurb: string
}

interface PlanningGuidesProps {
  eyebrow?: string
  heading: string
  intro?: string
  guides: GuideLink[]
  className?: string
}

/**
 * Contextual links from a service page to the blog posts that support it.
 * The link text is the post's own title, read from the bundled markdown, so a
 * retitled post never leaves a stale anchor behind. A slug that no longer
 * exists is skipped rather than rendering a broken link.
 */
export default function PlanningGuides({
  eyebrow = 'Planning Guides',
  heading,
  intro,
  guides,
  className = '',
}: PlanningGuidesProps) {
  const items = guides
    .map((g) => ({ ...g, post: getPostBySlugSync(g.slug) }))
    .filter((g) => g.post !== null)

  if (items.length === 0) return null

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            {eyebrow}
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] leading-tight mb-4">
            {heading}
          </h2>
          {intro && (
            <p className="font-raleway text-[#6b5744] text-base max-w-2xl mx-auto">{intro}</p>
          )}
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {items.map(({ slug, blurb, post }) => (
            <li key={slug}>
              <Link
                to={`/blog/${slug}`}
                className="group block h-full bg-white border border-cream-200 rounded-sm p-6 hover:border-[#c9a96e] hover:shadow-md transition-all duration-300"
              >
                <span className="font-playfair text-lg text-[#2c1f0e] leading-snug group-hover:text-[#c9a96e] transition-colors">
                  {post!.title}
                </span>
                <span className="block font-raleway text-sm text-[#6b5744] leading-relaxed mt-2">
                  {blurb}
                </span>
                <span className="inline-flex items-center gap-1 font-raleway text-sm font-semibold text-[#c9a96e] mt-3 group-hover:gap-2 transition-all duration-200">
                  Read the guide <ArrowRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="text-center mt-8">
          <Link
            to="/blog"
            className="font-raleway text-sm font-semibold text-[#2c1f0e] underline underline-offset-4 decoration-[#c9a96e] hover:text-[#c9a96e] transition-colors"
          >
            See every article on the blog
          </Link>
        </div>
      </div>
    </section>
  )
}
