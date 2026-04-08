import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Benefits from './components/sections/Benefits'
import Testimonials from './components/sections/Testimonials'
import MoreBenefits from './components/sections/MoreBenefits'
import Pricing from './components/sections/Pricing'
import ProductDetails from './components/sections/ProductDetails'
import FAQ from './components/sections/FAQ'
import CTA from './components/sections/CTA'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Testimonials />
        <MoreBenefits />
        <Pricing />
        <ProductDetails />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
