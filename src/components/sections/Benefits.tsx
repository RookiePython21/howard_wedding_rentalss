import { Truck, Star, Package, Clock } from 'lucide-react'

const benefits = [
  {
    icon: Package,
    title: 'Extensive Inventory',
    description:
      'Over 200 authentic solid-wood church pews available in multiple finishes — natural, walnut, and whitewashed — to perfectly match your vision.',
  },
  {
    icon: Truck,
    title: 'Full-Service Delivery',
    description:
      'Our professional team handles everything: delivery, placement, and teardown. You focus on getting married — we handle the logistics.',
  },
  {
    icon: Star,
    title: 'Trusted & Experienced',
    description:
      'Over a decade of serving couples across the region. With 500+ weddings under our belt, we know exactly how to make your day seamless.',
  },
  {
    icon: Clock,
    title: 'Easy Booking Process',
    description:
      'Reserve your date in minutes. We confirm availability, send a quote, and handle all the details so you can enjoy the planning process.',
  },
]

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 sm:py-28 bg-[#fdfcf8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Why Choose Us
          </p>
          <h2 className="section-title mb-4">
            The Howard Difference
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6 max-w-2xl mx-auto">
            We believe every couple deserves a ceremony as beautiful as their love story. That's why we go above and beyond with every rental.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group bg-white border border-cream-200 rounded-sm p-7 hover:border-[#c9a96e] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-sm bg-[#c9a96e]/10 flex items-center justify-center mb-5 group-hover:bg-[#c9a96e] transition-colors duration-300">
                <benefit.icon
                  size={22}
                  className="text-[#c9a96e] group-hover:text-white transition-colors duration-300"
                />
              </div>
              <h3 className="font-playfair text-lg text-[#2c1f0e] mb-3">{benefit.title}</h3>
              <p className="font-raleway text-sm text-[#6b5744] leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
