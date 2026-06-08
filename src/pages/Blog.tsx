import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowRight, Loader2 } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { SEO } from '../components/SEO'
import { getPosts } from '../services/blog'
import type { BlogPost } from '../services/blog'

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastDoc, setLastDoc] = useState<null>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    getPosts(10).then(({ posts, lastDoc }) => {
      setPosts(posts)
      setLastDoc(lastDoc)
      setHasMore(posts.length === 10)
      setLoading(false)
    })
  }, [])

  async function loadMore() {
    if (!lastDoc) return
    setLoadingMore(true)
    const { posts: more, lastDoc: next } = await getPosts(10, lastDoc)
    setPosts((prev) => [...prev, ...more])
    setLastDoc(next)
    setHasMore(more.length === 10)
    setLoadingMore(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Blog"
        description="Wedding planning tips, pew styling ideas, and ceremony décor inspiration from the team at Howard Wedding Rentals."
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-20">

        {/* Hero */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew1.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Articles &amp; Ideas
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Our Blog
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
            <p className="font-raleway text-white/70 text-base max-w-xl mx-auto">
              Wedding planning tips, pew styling inspiration, and ceremony décor ideas from our team.
            </p>
          </div>
        </div>

        {/* Post grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="text-[#c9a96e] animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-playfair text-2xl text-[#2c1f0e] mb-3">No posts yet</p>
              <p className="font-raleway text-[#6b5744] text-sm">
                Check back soon — articles are on their way.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group bg-white border border-cream-200 rounded-sm overflow-hidden hover:shadow-lg hover:border-[#c9a96e] transition-all duration-300 flex flex-col"
                  >
                    {/* Cover */}
                    <div className="aspect-[16/9] overflow-hidden bg-cream-100">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: `url('${post.coverImage || '/images/pew1.jpg'}')`,
                        }}
                      />
                    </div>

                    {/* Body */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={13} className="text-[#c9a96e] shrink-0" />
                        <span className="font-raleway text-xs text-[#9b836e]">
                          {post.publishedAt.toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {post.tags?.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="font-raleway text-[10px] tracking-wide uppercase text-[#c9a96e] bg-[#c9a96e]/10 px-2 py-0.5 rounded-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="font-playfair text-xl text-[#2c1f0e] mb-3 leading-snug group-hover:text-[#c9a96e] transition-colors">
                        {post.title}
                      </h2>
                      <p className="font-raleway text-sm text-[#6b5744] leading-relaxed flex-1 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="font-raleway text-sm font-semibold text-[#c9a96e] flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        Read Article <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="font-raleway text-sm font-semibold text-[#2c1f0e] border border-[#2c1f0e] px-8 py-3 hover:bg-[#2c1f0e] hover:text-white transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingMore && <Loader2 size={15} className="animate-spin" />}
                    {loadingMore ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
