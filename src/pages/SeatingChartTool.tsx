import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Phone, ArrowLeft, ChevronDown } from 'lucide-react'
import SeatingChartApp from '../components/seating/SeatingChartApp'
import { SEO } from '../components/SEO'

const NAV_LINKS = [
  { label: 'About',   href: '#benefits' },
  { label: 'Gallery', href: '#gallery'  },
  { label: 'Pricing', href: '#pricing'  },
  { label: 'FAQ',     href: '#faq'      },
  { label: 'Contact', href: '#contact'  },
]

export default function SeatingChartTool() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const goToSection = (href: string) => {
    setMenuOpen(false)
    navigate('/' + href)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <SEO
        title="Free Seating Chart Tool"
        description="Design your wedding reception layout with our free drag-and-drop seating chart tool. Arrange tables, assign guests, and export your floor plan."
      />

      {/* Accessible heading + intro — present in the HTML for crawlers and
          screen readers without altering the full-screen tool layout. */}
      <h1 className="sr-only">Free Wedding Seating Chart Tool</h1>
      <p className="sr-only">
        Plan your wedding reception layout with Howard Wedding Rentals' free
        drag-and-drop seating chart tool. Add round or rectangular tables, assign
        each guest to a seat, rearrange your floor plan in seconds, and export the
        finished chart as a PDF or image to share with your venue, caterer, and
        wedding party. No account or sign-up is required to start designing your
        perfect seating arrangement.
      </p>

      {/* ── Slim top bar ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm z-40">

        {/* Main bar — always visible */}
        <div className="flex items-center justify-between px-4 h-11">

          {/* Back link */}
          <Link
            to="/"
            className="flex items-center gap-1.5 font-raleway text-xs text-gray-400 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft size={13} />
            Back to site
          </Link>

          {/* Logo + tool name */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <img
              src="/images/logo.png"
              alt="Howard Wedding Rentals"
              className="h-7 w-auto object-contain"
            />
            <span className="font-playfair text-sm text-gray-600 hidden sm:block">
              Seating Chart Tool
            </span>
          </div>

          {/* Menu toggle */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-1.5 font-raleway text-xs text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Site navigation"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
            <span className="hidden sm:block">{menuOpen ? 'Close' : 'Menu'}</span>
            <ChevronDown
              size={12}
              className="transition-transform duration-200"
              style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>

        {/* Collapsible nav drawer */}
        <div
          style={{
            maxHeight: menuOpen ? 200 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 bg-gray-50">
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => goToSection(link.href)}
                className="font-raleway text-sm text-gray-600 hover:text-gold-600 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <a
              href="tel:2709035890"
              className="ml-auto flex items-center gap-1.5 font-raleway text-sm text-gold-700 font-medium hover:text-gold-800 transition-colors"
            >
              <Phone size={13} />
              270.903.5890
            </a>
          </div>
        </div>
      </div>

      {/* ── Tool — fills every remaining pixel ───────────────────── */}
      <main className="flex-1 overflow-hidden">
        <SeatingChartApp />
      </main>

    </div>
  )
}
