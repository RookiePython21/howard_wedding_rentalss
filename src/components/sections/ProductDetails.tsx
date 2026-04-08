import { Armchair, Ruler, Palette, Flower2, Users, BarChart3 } from 'lucide-react'

const specs = [
  {
    icon: Ruler,
    title: 'Dimensions',
    detail: '7 ft long × 18 in deep × 34 in tall',
    sub: 'Standard church pew sizing',
  },
  {
    icon: Users,
    title: 'Capacity',
    detail: '4–6 adults per pew',
    sub: 'Comfortably seated with aisle spacing',
  },
  {
    icon: Armchair,
    title: 'Construction',
    detail: 'Solid hardwood — oak & pine',
    sub: 'Durable, polished, splinter-free',
  },
  {
    icon: Palette,
    title: 'Finishes Available',
    detail: 'Natural · Walnut · Whitewash',
    sub: 'Choose what matches your theme',
  },
  {
    icon: Flower2,
    title: 'Decorating',
    detail: 'Ribbons, sashes, florals',
    sub: 'Coordinate with your florist or we can assist',
  },
  {
    icon: BarChart3,
    title: 'Availability',
    detail: '200+ pews in inventory',
    sub: 'Accommodates up to 240 guests',
  },
]

const included = [
  'White-glove delivery to your venue',
  'Professional placement per your seating layout',
  'Aisle runner placement (if provided)',
  'Post-ceremony teardown & retrieval',
  'Clean, polished pews — ready for photos',
  'Coordination call prior to your wedding day',
]

export default function ProductDetails() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            What You Get
          </p>
          <h2 className="section-title mb-4">Pew Specs & What's Included</h2>
          <div className="gold-divider" />
          <p className="section-subtitle mt-6 max-w-2xl mx-auto">
            Our pews are in immaculate condition, carefully maintained between every event. Here's everything you need to know.
          </p>
        </div>

        {/* Spec grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-16">
          {specs.map((spec) => (
            <div
              key={spec.title}
              className="bg-[#fdfcf8] border border-cream-200 rounded-sm p-5 hover:border-[#c9a96e]/50 transition-colors"
            >
              <div className="w-9 h-9 bg-[#c9a96e]/10 rounded-sm flex items-center justify-center mb-3">
                <spec.icon size={18} className="text-[#c9a96e]" />
              </div>
              <p className="font-raleway font-semibold text-xs uppercase tracking-wider text-[#6b5744] mb-1">
                {spec.title}
              </p>
              <p className="font-playfair text-[#2c1f0e] text-base leading-snug">{spec.detail}</p>
              <p className="font-raleway text-xs text-[#9b836e] mt-1">{spec.sub}</p>
            </div>
          ))}
        </div>

        {/* Included items */}
        <div className="bg-[#2c1f0e] rounded-sm p-8 sm:p-10">
          <h3 className="font-playfair text-2xl text-white mb-2 text-center">Every Package Includes</h3>
          <div className="w-12 h-0.5 bg-[#c9a96e] mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="text-[#c9a96e] text-lg leading-none mt-0.5">✓</span>
                <span className="font-raleway text-sm text-white/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
