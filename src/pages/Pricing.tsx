import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PricingCalculator from '../components/sections/Pricing'
import { SEO } from '../components/SEO'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Pricing"
        description="Get an instant quote for your church pew rental. $50 per pew, with travel fees calculated automatically based on your venue's location."
      />
      <Navbar />
      <main className="flex-1 pt-16">
        <PricingCalculator />
      </main>
      <Footer />
    </div>
  )
}
