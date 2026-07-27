function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-950 via-ocean-900/80 to-ocean-950" />

      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-10 pointer-events-none">
        <div className="compass-slow-spin w-full h-full" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="95" stroke="white" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="85" stroke="white" strokeWidth="0.3" />
            <line x1="100" y1="5" x2="100" y2="195" stroke="white" strokeWidth="0.5" />
            <line x1="5" y1="100" x2="195" y2="100" stroke="white" strokeWidth="0.5" />
            <line x1="32" y1="32" x2="168" y2="168" stroke="white" strokeWidth="0.3" />
            <line x1="168" y1="32" x2="32" y2="168" stroke="white" strokeWidth="0.3" />
            <polygon points="100,15 96,50 100,45 104,50" fill="white" opacity="0.8" />
            <polygon points="100,185 96,150 100,155 104,150" fill="white" opacity="0.4" />
            <polygon points="15,100 50,96 45,100 50,104" fill="white" opacity="0.4" />
            <polygon points="185,100 150,96 155,100 150,104" fill="white" opacity="0.4" />
            <text x="100" y="26" textAnchor="middle" fill="white" fontSize="7" fontFamily="serif" opacity="0.7">N</text>
            <text x="100" y="190" textAnchor="middle" fill="white" fontSize="7" fontFamily="serif" opacity="0.4">S</text>
            <text x="174" y="104" textAnchor="middle" fill="white" fontSize="7" fontFamily="serif" opacity="0.4">E</text>
            <text x="26" y="104" textAnchor="middle" fill="white" fontSize="7" fontFamily="serif" opacity="0.4">W</text>
          </svg>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ocean-950 to-transparent" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ocean-600/30 bg-ocean-800/40 mb-8">
          <span className="w-2 h-2 rounded-full bg-wind-400 animate-pulse" />
          <span className="text-sail-400 text-sm font-medium tracking-wide uppercase">
            Asistente IA de trimado
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6">
          <span className="bg-gradient-to-b from-sail-200 via-sail-400 to-sail-600 bg-clip-text text-transparent">
            Domina
          </span>
          <br />
          <span className="text-white">el trimado</span>
        </h1>

        <p className="text-sail-500 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Describe tu rumbo, viento y barco. La IA te guía en lenguaje marinero real
          sobre qué velas subir, cómo regularlas y por qué.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-8 py-3.5 bg-wind-500 hover:bg-wind-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-wind-500/25 hover:-translate-y-0.5"
          >
            Comenzar a trimar
            <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>

          <a
            href="#how-it-works"
            className="px-8 py-3.5 text-sail-500 hover:text-sail-300 font-medium rounded-xl border border-sail-800/50 hover:border-sail-600/50 transition-all duration-300"
          >
            Cómo funciona
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10" aria-hidden="true">
        <div className="scroll-indicator w-6 h-10 rounded-full border-2 border-sail-700/50 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 bg-sail-500/70 rounded-full scroll-dot" />
        </div>
      </div>
    </section>
  )
}

export default Hero
