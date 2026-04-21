import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, Home } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Success() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c9a96e]/15 mb-8">
            <CheckCircle2 size={40} className="text-[#c9a96e]" />
          </div>

          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Order Confirmed
          </p>
          <h1 className="font-playfair text-4xl sm:text-5xl text-[#2c1f0e] leading-tight mb-4">
            Thank you for your order
          </h1>
          <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-6" />
          <p className="font-raleway text-sm sm:text-base text-[#6b5744] leading-relaxed mb-10">
            Your payment was received successfully. A receipt is on its way to your email.
            We'll reach out shortly with delivery details.
          </p>

          {sessionId && (
            <div className="bg-[#fdfcf8] border border-cream-200 rounded-sm px-4 py-3 mb-10 inline-block">
              <p className="font-raleway text-xs text-[#9b836e] mb-1">Confirmation #</p>
              <p className="font-raleway text-xs text-[#2c1f0e] font-mono tracking-tight break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="btn-gold flex items-center justify-center gap-2 px-6 py-3 text-sm"
            >
              <ShoppingBag size={15} />
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm border border-cream-200 rounded-sm font-raleway text-[#2c1f0e] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors"
            >
              <Home size={15} />
              Back to Home
            </Link>
          </div>

          <p className="font-raleway text-xs text-[#9b836e] mt-10">
            Questions about your order? Call us at{' '}
            <a href="tel:2709035890" className="text-[#c9a96e] hover:underline">
              270.903.5890
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
