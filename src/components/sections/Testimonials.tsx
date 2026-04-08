import { Quote } from 'lucide-react'

const testimonials = [
  {
    id: '1',
    quote:
      "Howard Wedding Rentals made our outdoor ceremony absolutely magical. The wooden pews transformed our backyard into something out of a fairytale. The team arrived early, set everything up perfectly, and cleaned up without us even noticing. We couldn't have asked for more!",
    name: 'Sarah & James Thompson',
    location: 'Married in June 2024',
    initials: 'SJ',
  },
  {
    id: '2',
    quote:
      "We were hesitant about renting pews for our rustic barn wedding, but Howard's team helped us choose the perfect finish and style. Our photos look incredible — so many guests asked where we got them. Booking was easy and the price was very fair.",
    name: 'Emily & Michael Rodriguez',
    location: 'Married in September 2023',
    initials: 'EM',
  },
  {
    id: '3',
    quote:
      "From the first inquiry to the day after our wedding, the Howard team was professional, responsive, and kind. The pews were in beautiful condition and exactly what we envisioned. I recommend them to every couple I know!",
    name: 'Ashley & David Chen',
    location: 'Married in May 2024',
    initials: 'AD',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-[#2c1f0e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-3">
            Love Stories
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4">
            Happy Couples
          </h2>
          <div className="gold-divider" />
          <p className="font-raleway text-white/60 text-lg mt-6 max-w-xl mx-auto">
            Don't just take our word for it — hear from the couples who celebrated with us.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white/5 border border-white/10 rounded-sm p-7 hover:border-[#c9a96e]/40 transition-colors duration-300"
            >
              <Quote size={28} className="text-[#c9a96e] mb-5 opacity-70" />
              <p className="font-raleway text-white/70 text-sm leading-relaxed mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                <div className="w-10 h-10 rounded-full bg-[#c9a96e] flex items-center justify-center shrink-0">
                  <span className="font-raleway text-white text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="font-raleway font-semibold text-white text-sm">{t.name}</p>
                  <p className="font-raleway text-white/40 text-xs">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Star rating summary */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-[#c9a96e]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="font-raleway text-white/60 text-sm">
            5.0 average rating across 500+ weddings
          </p>
        </div>
      </div>
    </section>
  )
}
