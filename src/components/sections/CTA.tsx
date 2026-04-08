import Button from '../ui/Button'

export default function CTA() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/pew1.jpg')" }}
      />
      <div className="absolute inset-0 bg-[#2c1f0e]/80" />

      {/* Decorative lines */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#c9a96e]/40" />
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-8 bg-[#c9a96e]/40" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="font-raleway text-xs tracking-widest uppercase text-[#c9a96e] mb-4">
          Your Date is Waiting
        </p>
        <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6">
          Ready to Make Your Ceremony Unforgettable?
        </h2>
        <div className="gold-divider mb-8" />
        <p className="font-raleway text-white/70 text-lg max-w-xl mx-auto mb-10">
          Dates fill up fast. Reserve your pews today and give your guests a ceremony they'll talk about for years.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => scrollTo('#pricing')}
            className="px-10 py-4 text-base shadow-xl"
          >
            Reserve Your Date
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollTo('#contact')}
            className="px-10 py-4 text-base text-white border-white/50 hover:bg-white hover:text-[#2c1f0e]"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  )
}
