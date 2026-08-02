import { useTrim } from '../context/TrimContext'
import BoatTypeSelector from './BoatTypeSelector'
import BeaufortPicker from './BeaufortPicker'
import ExperienceToggle from './ExperienceToggle'
import SeaStateSelector from './SeaStateSelector'

function ConditionsPanel() {
  const { conditions, setBoatType, setWindForce, setExperience, setSeaState } = useTrim()
  const { boatType, windForce, experience, seaState } = conditions

  return (
    <section id="conditions" className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-wind-400 text-sm font-semibold tracking-widest uppercase">
            Paso 2
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mt-4 mb-4">
            Condiciones
          </h2>
          <p className="text-sail-600 text-lg max-w-lg mx-auto">
            Configura tu barco, la fuerza del viento y tu nivel de experiencia para obtener recomendaciones personalizadas.
          </p>
        </div>

        <div className="space-y-10">
          <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-sail-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              Tipo de embarcación
            </h3>
            <BoatTypeSelector value={boatType} onChange={setBoatType} />
          </div>

          <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-sail-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>
              Fuerza del viento
            </h3>
            <BeaufortPicker value={windForce} onChange={setWindForce} />
          </div>

          <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-sail-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Nivel de experiencia
            </h3>
            <ExperienceToggle value={experience} onChange={setExperience} />
          </div>

          <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-8">
            <h3 className="text-sm font-semibold text-sail-500 uppercase tracking-wider mb-5 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 16c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 11c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>
              Estado del mar{' '}
              <span className="text-sail-700 font-normal normal-case">(opcional)</span>
            </h3>
            <SeaStateSelector value={seaState} onChange={setSeaState} />
          </div>
        </div>

        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-ocean-900/40 border border-ocean-800/30 rounded-full">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-sail-500">Barco</span>
            </div>
            <div className="w-px h-3 bg-ocean-700/50" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-sail-500">Viento</span>
            </div>
            <div className="w-px h-3 bg-ocean-700/50" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-sail-500">Experiencia</span>
            </div>
          </div>
          <p className="text-sail-700 text-xs mt-3">Próximo paso: conectar la IA para recibir recomendaciones</p>
        </div>
      </div>
    </section>
  )
}

export default ConditionsPanel
