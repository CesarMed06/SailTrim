import { useTranslation } from 'react-i18next'
import type { WindAngle } from '../types'
import { useTrim } from '../context/TrimContext'
import CompassRose from './CompassRose'

function WindSelector() {
  const { conditions, setWindAngle } = useTrim()
  const { t } = useTranslation()
  const angle = conditions.windAngle

  return (
    <section id="compass" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            {t('wind.step')}
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            {t('wind.title')}
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            {t('wind.subtitle')}
          </p>
        </div>

        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-8 md:p-12">
          <CompassRose angle={angle} onChange={setWindAngle} />

          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {([0, 30, 45, 90, 135, 180] as WindAngle[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setWindAngle(preset)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  angle === preset
                    ? 'bg-wind-500/20 border-wind-500/50 text-wind-300 shadow-lg shadow-wind-500/10'
                    : 'border-ocean-700/40 text-sail-600 hover:text-sail-300 hover:border-ocean-600/50'
                }`}
              >
                {preset}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WindSelector
