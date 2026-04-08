import { CheckCircle } from 'lucide-react'

const features = [
  'Solid hardwood construction — not plastic or metal',
  'Multiple wood finish options: natural, walnut, and whitewashed',
  'Cushioned or uncushioned seating available',
  'Decorated with ribbons, florals, or fabric per your request',
  'Seats 4–6 adults comfortably per pew',
  'Available for indoor venues, outdoor gardens, farms, and beaches',
]

export default function MoreBenefits() {
  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#fdfcf8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Row 1: Image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20">
          <div className="order-2 lg:order-1 rounded-sm overflow-hidden shadow-xl">
            <img
              src="/images/pew2.jpg"
              alt="Outdoor wedding ceremony with wooden pews at sunset"
              className="w-full h-[380px] object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
              Our Pews
            </p>
            <h2 className="section-title mb-4">
              Real Wood. Real Elegance.
            </h2>
            <div className="w-12 h-0.5 bg-[#c9a96e] mb-6" />
            <p className="section-subtitle mb-8">
              Our authentic solid-wood church pews bring a warmth and character that no chair can match. Perfect for couples who want their ceremony to feel rooted, intimate, and beautifully timeless.
            </p>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-[#c9a96e] shrink-0 mt-0.5" />
                  <span className="font-raleway text-sm text-[#6b5744]">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 2: Text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
              Any Venue, Any Vision
            </p>
            <h2 className="section-title mb-4">
              We Set Up, You Show Up.
            </h2>
            <div className="w-12 h-0.5 bg-[#c9a96e] mb-6" />
            <p className="section-subtitle mb-6">
              Whether you're saying "I do" in a sun-drenched field, a rustic barn, or your own backyard, our team delivers your pews on time and arranges them exactly how you've envisioned.
            </p>
            <p className="section-subtitle">
              After the ceremony, we return and handle full teardown — no stress, no hauling, no hassle. Just memories.
            </p>
          </div>
          <div className="rounded-sm overflow-hidden shadow-xl">
            <img
              src="/images/pew3.jpg"
              alt="Freshly setup wedding pews with floral arch"
              className="w-full h-[380px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
