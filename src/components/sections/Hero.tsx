import Button from '../ui/Button'

export default function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/pew1.jpg')" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-[#c9a96e]/50 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
          <span className="font-raleway text-xs text-white/90 tracking-widest uppercase">
            Serving Couples Since 2010
          </span>
        </div>

        <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
          Timeless Pews for Your{' '}
          <span className="italic text-[#c9a96e]">Perfect Day</span>
        </h1>

        <p className="font-raleway text-white/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          Authentic wooden church pews that bring classic elegance to any venue — indoors or outdoors. Delivery, setup, and teardown included.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => scrollTo('#pricing')}
            className="text-base px-10 py-4 shadow-xl"
          >
            View Packages
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollTo('#gallery')}
            className="text-base px-10 py-4 text-white border-white hover:bg-white hover:text-[#2c1f0e]"
          >
            See Our Work
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-10 max-w-xl mx-auto">
          {[
            { value: '500+', label: 'Weddings Served' },
            { value: '200+', label: 'Pews Available' },
            { value: '5★', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-playfair text-2xl sm:text-3xl text-[#c9a96e] font-bold">{stat.value}</p>
              <p className="font-raleway text-white/60 text-xs sm:text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="font-raleway text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
