import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import SeatingChartTool from './pages/SeatingChartTool'
import Shop from './pages/Shop'
import Success from './pages/Success'
import Services from './pages/Services'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'

function Home() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/seating-chart-tool" element={<SeatingChartTool />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/success" element={<Success />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  )
}
