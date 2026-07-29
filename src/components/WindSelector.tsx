import { useState } from 'react'
import type { WindAngle } from '../types'
import CompassRose from './CompassRose'

function WindSelector() {
  const [angle, setAngle] = useState<WindAngle>(45)

  return (
    <section id="compass" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            Paso 1
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Ángulo de viento
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            Selecciona el ángulo del viento respecto a tu rumbo. Arrastra el indicador o haz clic en la rosa de los vientos.
          </p>
        </div>

        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-8 md:p-12">
          <CompassRose angle={angle} onChange={setAngle} />

          <div className="flex justify-center gap-3 mt-8 flex-wrap">
            {([0, 30, 45, 90, 135, 180] as WindAngle[]).map((preset) => (
              <button
                key={preset}
                onClick={() => setAngle(preset)}
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
