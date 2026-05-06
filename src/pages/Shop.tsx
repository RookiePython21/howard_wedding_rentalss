import { useState } from 'react'
import { ShoppingBag, Loader2, AlertCircle, Minus, Plus } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useCheckout } from '../hooks/useCheckout'

interface ShopProduct {
  id: string
  name: string
  tagline: string
  description: string
  priceId: string | undefined
  priceDisplay: string | undefined
  images: { src: string; alt: string }[]
}

const PRODUCTS: ShopProduct[] = [
  {
    id: 'placecards',
    name: 'Name Placeholders',
    tagline: 'Elegant printed place cards for every guest',
    description:
      'Classic, beautifully printed place cards that finish each table setting. A refined detail that helps your guests find their seat effortlessly.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PLACECARDS,
    priceDisplay: import.meta.env.VITE_STRIPE_PRICE_DISPLAY_PLACECARDS,
    images: [
      { src: '/images/placecard.jpg', alt: 'Name placeholder on a wedding table setting' },
      { src: '/images/placecard_wedding.png', alt: 'Wedding place card styled for the reception' },
    ],
  },
  {
    id: 'foam-board',
    name: 'Seating Chart Foam Board',
    tagline: 'Custom-printed seating chart for your venue entry',
    description:
      'A polished, printed foam board that welcomes guests and shows them where to sit. Choose a list layout or include a QR code linked to your digital chart — generated right from our Seating Chart Tool.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_FOAM_BOARD,
    priceDisplay: import.meta.env.VITE_STRIPE_PRICE_DISPLAY_FOAM_BOARD,
    images: [
      { src: '/images/seating_chart_foam_board_list.png', alt: 'Seating chart foam board — list layout' },
      { src: '/images/seating_chart_foam_board_qr.png', alt: 'Seating chart foam board — QR code layout' },
    ],
  },
]

export default function Shop() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        {/* Hero banner */}
        <div className="relative py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/pew2.jpg')" }}
          />
          <div className="absolute inset-0 bg-[#2c1f0e]/80" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
              Shop
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white leading-tight mb-4">
              Wedding Day Essentials
            </h1>
            <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-4" />
            <p className="font-raleway text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              Thoughtful, printed pieces to finish your reception — delivered straight to your door.
            </p>
          </div>
        </div>

        {/* Product list */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-16">
          {PRODUCTS.map((product, idx) => (
            <ProductCard key={product.id} product={product} reversed={idx % 2 === 1} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

const MAX_QTY = 999

function ProductCard({ product, reversed }: { product: ShopProduct; reversed: boolean }) {
  const { initiateCheckout, loading, error } = useCheckout()
  const [qtyRaw, setQtyRaw] = useState('1')
  const [activeImg, setActiveImg] = useState(0)

  const qty = Math.max(1, Math.min(MAX_QTY, parseInt(qtyRaw, 10) || 1))
  const canBuy = Boolean(product.priceId)

  const handleBuy = () => {
    if (!product.priceId) return
    initiateCheckout(product.priceId, qty)
  }

  return (
    <div
      className={`grid gap-10 sm:gap-12 items-center lg:grid-cols-2 ${
        reversed ? 'lg:[&>div:first-child]:order-2' : ''
      }`}
    >
      {/* Image gallery */}
      <div>
        <div className="relative overflow-hidden rounded-sm border border-cream-200 bg-white shadow-sm">
          <img
            src={product.images[activeImg].src}
            alt={product.images[activeImg].alt}
            className="w-full h-[360px] sm:h-[460px] object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-3 mt-3">
            {product.images.map((img, i) => (
              <button
                key={img.src}
                onClick={() => setActiveImg(i)}
                className={`flex-1 overflow-hidden rounded-sm border transition-all ${
                  activeImg === i
                    ? 'border-[#c9a96e] ring-2 ring-[#c9a96e]/20'
                    : 'border-cream-200 hover:border-[#c9a96e]/60'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-20 sm:h-24 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
          {product.tagline}
        </p>
        <h2 className="font-playfair text-3xl sm:text-4xl text-[#2c1f0e] leading-tight mb-5">
          {product.name}
        </h2>
        <div className="gold-divider mb-6" />
        <p className="font-raleway text-sm sm:text-base text-[#6b5744] leading-relaxed mb-8">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-8">
          <span className="font-playfair text-3xl text-[#2c1f0e] font-bold">
            {product.priceDisplay || 'Price coming soon'}
          </span>
          {product.priceDisplay && (
            <span className="font-raleway text-xs text-[#9b836e]">each</span>
          )}
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <label className="block font-raleway text-xs tracking-widest uppercase text-[#6b5744] mb-3">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQtyRaw(String(Math.max(1, qty - 1)))}
              disabled={qty <= 1 || loading}
              className="w-10 h-10 rounded-sm border border-cream-200 text-[#2c1f0e] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_QTY}
              value={qtyRaw}
              onChange={(e) => setQtyRaw(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => setQtyRaw(String(qty))}
              onFocus={(e) => e.target.select()}
              disabled={loading}
              className="font-playfair text-2xl text-[#2c1f0e] w-20 h-10 text-center border border-cream-200 rounded-sm bg-white focus:outline-none focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 disabled:opacity-40 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              onClick={() => setQtyRaw(String(Math.min(MAX_QTY, qty + 1)))}
              disabled={qty >= MAX_QTY || loading}
              className="w-10 h-10 rounded-sm border border-cream-200 text-[#2c1f0e] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Buy button */}
        <button
          onClick={handleBuy}
          disabled={!canBuy || loading}
          className="btn-gold w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          title={canBuy ? 'Buy with Stripe Checkout' : 'This product is not available yet'}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Redirecting to checkout…
            </>
          ) : (
            <>
              <ShoppingBag size={16} />
              {canBuy ? 'Buy Now' : 'Available Soon'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-sm">
            <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="font-raleway text-xs text-red-600 leading-relaxed">{error}</p>
          </div>
        )}

        {!canBuy && (
          <p className="mt-4 font-raleway text-xs text-[#9b836e]">
            Check back soon — this product is being finalized.
          </p>
        )}
      </div>
    </div>
  )
}
