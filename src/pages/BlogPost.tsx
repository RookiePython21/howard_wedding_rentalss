import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'
import { getPostBySlug } from '../services/blog'
import type { BlogPost as BlogPostType } from '../services/blog'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    getPostBySlug(slug).then((result) => {
      if (!result) setNotFound(true)
      else setPost(result)
      setLoading(false)
    })
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-[#c9a96e] animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-playfair text-2xl text-[#2c1f0e]">Post not found</p>
          <Link to="/blog" className="font-raleway text-sm text-[#c9a96e] hover:underline">
            ← Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={post.title} description={post.excerpt} />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${post.coverImage || '/images/pew1.jpg'}')` }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            {post.tags?.length > 0 && (
              <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
                {post.tags[0]}
              </p>
            )}
            <h1 className="font-playfair text-3xl sm:text-5xl text-white leading-tight mb-4">
              {post.title}
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
            <div className="flex items-center justify-center gap-6 font-raleway text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#c9a96e]" />
                {post.publishedAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-[#c9a96e]" />
                {post.author}
              </span>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-raleway text-sm text-[#9b836e] hover:text-[#c9a96e] transition-colors mb-10"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          <div className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-[#2c1f0e] prose-p:font-raleway prose-p:text-[#6b5744] prose-a:text-[#c9a96e] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#2c1f0e] prose-li:font-raleway prose-li:text-[#6b5744]">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
