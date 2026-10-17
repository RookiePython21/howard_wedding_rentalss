import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import PricingCalculator from '../components/sections/Pricing'
import { SEO } from '../components/SEO'

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Get a Quote"
        description="Get an instant estimate for your church pew rental. Enter your guest count and venue, and we'll show you an estimate in seconds — then give us a call to hold your date."
      />
      <Navbar />
      <main className="flex-1 pt-16">
        <PricingCalculator />
      </main>
      <Footer />
    </div>
  )
}
