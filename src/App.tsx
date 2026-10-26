import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SEO } from './components/SEO'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Hero from './components/sections/Hero'
import Benefits from './components/sections/Benefits'
import Testimonials from './components/sections/Testimonials'
import MoreBenefits from './components/sections/MoreBenefits'
import Pricing from './components/sections/Pricing'
import ProductDetails from './components/sections/ProductDetails'
import FAQ, { faqs as homeFaqs } from './components/sections/FAQ'
import CTA from './components/sections/CTA'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import PricingPage from './pages/Pricing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import SeatingChartTool from './pages/SeatingChartTool'
import Shop from './pages/Shop'
import Success from './pages/Success'
import Services from './pages/Services'
import ChairRentals from './pages/ChairRentals'
import TableRentals from './pages/TableRentals'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import PersonaLander from './pages/PersonaLander'
import { personas } from './content/personas'
import { graph, localBusinessSchema, pewServiceSchema, faqPageSchema } from './content/seoSchema'

function Home() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Church Pew Rentals for Weddings"
        description="Wooden church pews for rent for your wedding, indoors or outdoors. We deliver, set up and pick up. Get your instant estimate or call Howard Wedding Rentals in Owensboro, KY."
        schema={graph(
          localBusinessSchema,
          pewServiceSchema,
          faqPageSchema(homeFaqs.map((f) => ({ question: f.question, text: f.answer })))
        )}
      />
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
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/seating-chart-tool" element={<SeatingChartTool />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/success" element={<Success />} />
        <Route path="/services" element={<Services />} />
        <Route path="/chair-rentals" element={<ChairRentals />} />
        <Route path="/table-rentals" element={<TableRentals />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        {personas.map((p) => (
          <Route key={p.key} path={p.path} element={<PersonaLander persona={p} />} />
        ))}
      </Routes>
    </BrowserRouter>
  )
}
