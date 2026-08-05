import { useTranslation } from 'react-i18next'

const STEP_ICONS = [
  (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20" />
      <path d="M12 2a6 6 0 0 0 0 20" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
]

function HowItWorks() {
  const { t } = useTranslation()
  const numbers = ['01', '02', '03']

  return (
    <section id="how-it-works" className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            {t('howItWorks.tagline')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((step, i) => (
            <div
              key={step}
              className="group relative bg-ocean-900/50 border border-ocean-800/40 rounded-2xl p-8 hover:border-ocean-700/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-ocean-950/50 animate-slide-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="text-ocean-600 text-5xl font-display font-bold mb-4 group-hover:text-ocean-500 transition-colors duration-500">
                {numbers[i]}
              </div>
              <div className="text-wind-400 mb-4">
                {STEP_ICONS[i]}
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">
                {t(`howItWorks.step${step}.title`)}
              </h3>
              <p className="text-sail-600 leading-relaxed">
                {t(`howItWorks.step${step}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
