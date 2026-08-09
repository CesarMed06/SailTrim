import { useTranslation } from 'react-i18next'
import type { RigType, HullMaterial, NavigationPriority, NavigationZone, TimeOfDay } from '../hooks/useBoatProfile'
import { useBoatProfile } from '../hooks/useBoatProfile'

const RIG_OPTIONS: { value: RigType; icon: string }[] = [
  { value: 'sloop', icon: '⛵' },
  { value: 'ketch', icon: '🚢' },
  { value: 'yawl', icon: '🛥️' },
  { value: 'cutter', icon: '⛴️' },
  { value: 'catamaran', icon: '🛳️' },
  { value: 'schooner', icon: '🏴‍☠️' },
  { value: 'other', icon: '🔧' },
]

const MATERIAL_OPTIONS: { value: HullMaterial; icon: string }[] = [
  { value: 'fiberglass', icon: '🧪' },
  { value: 'aluminum', icon: '🪶' },
  { value: 'steel', icon: '⚙️' },
  { value: 'wood', icon: '🪵' },
  { value: 'carbon', icon: '🏎️' },
  { value: 'other', icon: '🔧' },
]

const PRIORITY_OPTIONS: { value: NavigationPriority; icon: string; color: string }[] = [
  { value: 'speed', icon: '🏎️', color: 'border-l-red-400' },
  { value: 'comfort', icon: '🛋️', color: 'border-l-amber-400' },
  { value: 'racing', icon: '🏁', color: 'border-l-cyan-400' },
  { value: 'safety', icon: '🛟', color: 'border-l-green-400' },
  { value: 'passage', icon: '🏝️', color: 'border-l-teal-400' },
  { value: 'other', icon: '🔧', color: 'border-l-purple-400' },
]

const ZONE_OPTIONS: { value: NavigationZone; icon: string }[] = [
  { value: 'mediterranean', icon: '🏖️' },
  { value: 'atlantic', icon: '🌊' },
  { value: 'caribbean', icon: '🏝️' },
  { value: 'pacific', icon: '🌏' },
  { value: 'cantabrian', icon: '🌫️' },
  { value: 'baltic', icon: '❄️' },
  { value: 'north_sea', icon: '🌬️' },
  { value: 'indian_ocean', icon: '🐋' },
  { value: 'other', icon: '🗺️' },
]

const TIME_OPTIONS: { value: TimeOfDay; icon: string }[] = [
  { value: 'morning', icon: '🌅' },
  { value: 'midday', icon: '☀️' },
  { value: 'afternoon', icon: '🌤️' },
  { value: 'night', icon: '🌙' },
  { value: 'other', icon: '🔧' },
]

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function resolvedZoneLabel(nav: { zone: NavigationZone; zoneOther: string }, t: (k: string) => string) {
  if (nav.zone === 'other') return nav.zoneOther || 'Otra zona'
  return t(`boatProfilePanel.zones.${nav.zone}`)
}

export default function BoatProfilePanel() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const months = isEn ? MONTHS_EN : MONTHS_ES
  const {
    profile, nav, crew,
    expanded, configured, hasProfile,
    setExpanded, updateProfile, updateNav, updateCrew, saveAll,
  } = useBoatProfile()

  if (!configured && !expanded) {
    return (
      <section className="py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setExpanded(true)}
            className="w-full bg-ocean-900/20 border border-dashed border-ocean-700/40 hover:border-cyan-500/40 rounded-2xl p-6 text-center transition-all duration-300 group cursor-pointer"
          >
            <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-300">🚢</span>
            <span className="text-sail-400 font-medium group-hover:text-cyan-300 transition-colors">
              {isEn ? 'Configure your boat so the AI knows you better' : 'Configura tu barco para que la IA te conozca mejor'}
            </span>
            <span className="block text-sail-700 text-sm mt-1">
              {isEn ? 'Model, rig, zone, crew — optional but recommended' : 'Modelo, aparejo, zona, tripulación — opcional pero recomendado'}
            </span>
          </button>
        </div>
      </section>
    )
  }

  if (!expanded && hasProfile) {
    const rigIcon = RIG_OPTIONS.find((r) => r.value === profile.rigType)?.icon ?? '⛵'
    const prio = PRIORITY_OPTIONS.find((p) => p.value === nav.priority)
    const zoneIcon = ZONE_OPTIONS.find((z) => z.value === nav.zone)?.icon ?? '🗺️'

    return (
      <section className="py-3 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-2xl px-5 py-3 flex items-center justify-between">
            <button onClick={() => setExpanded(true)} className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-2xl shrink-0">{rigIcon}</span>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-bold text-sm truncate">
                    {profile.boatName || profile.model || t('boatProfilePanel.untitled')}
                  </span>
                  {profile.model && profile.boatName && (
                    <span className="text-sail-600 text-xs truncate">{profile.model}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-sail-500 mt-0.5 flex-wrap">
                  {profile.lengthMeters && (
                    <span>{profile.lengthMeters} m</span>
                  )}
                  <span className="flex items-center gap-1">
                    {zoneIcon} {resolvedZoneLabel(nav, (k) => t(k))}
                  </span>
                  <span className="flex items-center gap-1">
                    {prio?.icon} {nav.priority === 'other' ? (nav.priorityOther || 'Otro') : t(`boatProfilePanel.priorities.${nav.priority}`)}
                  </span>
                </div>
              </div>
            </button>
            <button
              onClick={() => setExpanded(true)}
              className="shrink-0 text-sail-600 hover:text-cyan-400 text-xs font-medium px-3 py-1.5 border border-ocean-700/40 hover:border-cyan-500/40 rounded-lg transition-all cursor-pointer"
            >
              {isEn ? 'Edit' : 'Editar'}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-ocean-900/30 border border-ocean-800/30 rounded-3xl p-6 md:p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-white font-display text-2xl font-bold">
                {isEn ? 'My Boat' : 'Mi Barco'}
              </h3>
              <p className="text-sail-600 text-sm mt-1">
                {isEn ? 'The AI skipper will know your boat personally' : 'El patrón IA conocerá tu barco como si fuera suyo'}
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-sail-600 hover:text-sail-400 text-sm transition-colors cursor-pointer"
            >
              {isEn ? 'Collapse' : 'Minimizar'}
            </button>
          </div>

          {/* Nombre y modelo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Boat name' : 'Nombre del barco'}
              </label>
              <input
                type="text"
                value={profile.boatName}
                onChange={(e) => updateProfile({ boatName: e.target.value })}
                placeholder={isEn ? 'e.g. Sagres' : 'ej. Sagres'}
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Model' : 'Modelo'}
              </label>
              <input
                type="text"
                value={profile.model}
                onChange={(e) => updateProfile({ model: e.target.value })}
                placeholder={isEn ? 'e.g. Bavaria 34' : 'ej. Bavaria 34'}
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Dimensiones */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Length (m)' : 'Eslora (m)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profile.lengthMeters ?? ''}
                onChange={(e) => updateProfile({ lengthMeters: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="—"
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Beam (m)' : 'Manga (m)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profile.beamMeters ?? ''}
                onChange={(e) => updateProfile({ beamMeters: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="—"
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Draft (m)' : 'Calado (m)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profile.draftMeters ?? ''}
                onChange={(e) => updateProfile({ draftMeters: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="—"
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Aparejo, material, año */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Rig type' : 'Aparejo'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {RIG_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => updateProfile({ rigType: r.value })}
                    title={r.value === 'other' ? (isEn ? 'Other' : 'Otro') : t(`boatProfilePanel.rigTypes.${r.value}`)}
                    className={`text-lg p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                      profile.rigType === r.value
                        ? 'bg-cyan-500/15 border-cyan-500/40 scale-105'
                        : 'bg-ocean-950/40 border-ocean-700/20 hover:border-ocean-600/40'
                    }`}
                  >
                    {r.icon}
                  </button>
                ))}
              </div>
              {profile.rigType === 'other' && (
                <input
                  type="text"
                  value={profile.rigTypeOther}
                  onChange={(e) => updateProfile({ rigTypeOther: e.target.value })}
                  placeholder={isEn ? 'e.g. Gaff rig' : 'ej. Vela cangreja'}
                  className="mt-2 w-full bg-ocean-950/60 border border-cyan-500/30 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white text-xs placeholder-sail-700 outline-none transition-colors"
                />
              )}
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Hull material' : 'Material del casco'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {MATERIAL_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => updateProfile({ hullMaterial: m.value })}
                    title={m.value === 'other' ? (isEn ? 'Other' : 'Otro') : t(`boatProfilePanel.materials.${m.value}`)}
                    className={`text-lg p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                      profile.hullMaterial === m.value
                        ? 'bg-cyan-500/15 border-cyan-500/40 scale-105'
                        : 'bg-ocean-950/40 border-ocean-700/20 hover:border-ocean-600/40'
                    }`}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>
              {profile.hullMaterial === 'other' && (
                <input
                  type="text"
                  value={profile.hullMaterialOther}
                  onChange={(e) => updateProfile({ hullMaterialOther: e.target.value })}
                  placeholder={isEn ? 'e.g. Ferrocement' : 'ej. Ferrocemento'}
                  className="mt-2 w-full bg-ocean-950/60 border border-cyan-500/30 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white text-xs placeholder-sail-700 outline-none transition-colors"
                />
              )}
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Year' : 'Año'}
              </label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={profile.year ?? ''}
                onChange={(e) => updateProfile({ year: e.target.value ? parseInt(e.target.value) : null })}
                placeholder={isEn ? 'e.g. 2015' : 'ej. 2015'}
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-ocean-800/30 my-6" />

          {/* Prioridad */}
          <div className="mb-6">
            <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-2">
              {isEn ? 'Navigation priority' : 'Prioridad de navegación'}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => updateNav({ priority: p.value })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-l-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    nav.priority === p.value
                      ? `bg-ocean-950/60 ${p.color} border-ocean-700/40 scale-105`
                      : `bg-ocean-950/30 border-ocean-700/20 border-l-ocean-700/20 hover:border-ocean-600/40`
                  }`}
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sail-200">{p.value === 'other' ? (isEn ? 'Other' : 'Otro') : t(`boatProfilePanel.priorities.${p.value}`)}</span>
                </button>
              ))}
            </div>
            {nav.priority === 'other' && (
              <input
                type="text"
                value={nav.priorityOther}
                onChange={(e) => updateNav({ priorityOther: e.target.value })}
                placeholder={isEn ? 'e.g. Fishing, Training...' : 'ej. Pesca, Entrenamiento...'}
                className="mt-2 w-full bg-ocean-950/60 border border-cyan-500/30 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white text-xs placeholder-sail-700 outline-none transition-colors"
              />
            )}
          </div>

          {/* Zona y momento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Navigation zone' : 'Zona de navegación'}
              </label>
              <select
                value={nav.zone}
                onChange={(e) => updateNav({ zone: e.target.value as NavigationZone })}
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors appearance-none cursor-pointer"
              >
                {ZONE_OPTIONS.map((z) => (
                  <option key={z.value} value={z.value}>
                    {z.icon} {z.value === 'other' ? (isEn ? 'Other' : 'Otra zona') : t(`boatProfilePanel.zones.${z.value}`)}
                  </option>
                ))}
              </select>
              {nav.zone === 'other' && (
                <input
                  type="text"
                  value={nav.zoneOther}
                  onChange={(e) => updateNav({ zoneOther: e.target.value })}
                  placeholder={isEn ? 'e.g. Adriatic Sea' : 'ej. Mar Adriático'}
                  className="mt-2 w-full bg-ocean-950/60 border border-cyan-500/30 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white text-xs placeholder-sail-700 outline-none transition-colors"
                />
              )}
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Month' : 'Mes'}
              </label>
              <div className="grid grid-cols-6 gap-1">
                {months.map((m, i) => {
                  const monthNum = i + 1
                  return (
                    <button
                      key={m}
                      onClick={() => updateNav({ month: monthNum })}
                      className={`text-[10px] p-1.5 rounded-lg border transition-all cursor-pointer ${
                        nav.month === monthNum
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                          : 'bg-ocean-950/40 border-ocean-700/20 text-sail-500 hover:border-ocean-600/40'
                      }`}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
              <label className="block text-sail-500 text-[10px] font-semibold uppercase tracking-wider mt-2 mb-1">
                {isEn ? 'Day (optional)' : 'Día (opcional)'}
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={nav.day ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  updateNav({ day: v ? Math.max(1, Math.min(31, parseInt(v) || 1)) : null })
                }}
                placeholder="—"
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-lg px-3 py-1.5 text-white text-xs placeholder-sail-700 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {isEn ? 'Time of day' : 'Hora del día'}
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_OPTIONS.map((tOpt) => (
                  <button
                    key={tOpt.value}
                    onClick={() => updateNav({ timeOfDay: tOpt.value })}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-all cursor-pointer ${
                      nav.timeOfDay === tOpt.value
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                        : 'bg-ocean-950/40 border-ocean-700/20 text-sail-500 hover:border-ocean-600/40'
                    }`}
                  >
                    <span>{tOpt.icon}</span>
                    <span>{tOpt.value === 'other' ? (isEn ? 'Other' : 'Otro') : t(`boatProfilePanel.timeOfDay.${tOpt.value}`)}</span>
                  </button>
                ))}
              </div>
              {nav.timeOfDay === 'other' && (
                <input
                  type="text"
                  value={nav.timeOfDayOther}
                  onChange={(e) => updateNav({ timeOfDayOther: e.target.value })}
                  placeholder={isEn ? 'e.g. Dawn, Dusk...' : 'ej. Amanecer, Atardecer...'}
                  className="mt-2 w-full bg-ocean-950/60 border border-cyan-500/30 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white text-xs placeholder-sail-700 outline-none transition-colors"
                />
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-ocean-800/30 my-6" />

          {/* Tripulación */}
          <div className="mb-6">
            <label className="block text-sail-500 text-xs font-semibold uppercase tracking-wider mb-2">
              {isEn ? 'Crew' : 'Tripulación'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sail-600 text-xs mb-1">
                  {isEn ? 'Number of crew' : 'Número de tripulantes'}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCrew({ count: Math.max(1, crew.count - 1) })}
                    className="w-9 h-9 rounded-lg bg-ocean-950/60 border border-ocean-700/40 text-sail-400 hover:text-white hover:border-cyan-500/40 text-lg cursor-pointer transition-all"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-white font-bold text-lg">{crew.count}</span>
                  <button
                    onClick={() => updateCrew({ count: Math.min(12, crew.count + 1) })}
                    className="w-9 h-9 rounded-lg bg-ocean-950/60 border border-ocean-700/40 text-sail-400 hover:text-white hover:border-cyan-500/40 text-lg cursor-pointer transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sail-600 text-xs mb-1">
                  {isEn ? 'Roles (e.g. helmsman, bowman)' : 'Roles (ej. patrón, caña, proel)'}
                </label>
                <input
                  type="text"
                  value={crew.roles}
                  onChange={(e) => updateCrew({ roles: e.target.value })}
                  placeholder={isEn ? 'helmsman, trimmer, bow' : 'patrón, piano, proel'}
                  className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sail-600 text-xs mb-1">
                {isEn ? 'Notes (seasickness, children aboard...)' : 'Notas (mareos, niños a bordo...)'}
              </label>
              <input
                type="text"
                value={crew.notes}
                onChange={(e) => updateCrew({ notes: e.target.value })}
                placeholder={isEn ? 'e.g. wife gets seasick with heel' : 'ej. mi mujer se marea con escora'}
                className="w-full bg-ocean-950/60 border border-ocean-700/40 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-white text-sm placeholder-sail-700 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Botón guardar */}
          <button
            onClick={saveAll}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            {isEn ? 'Save profile' : 'Guardar perfil'}
          </button>
        </div>
      </div>
    </section>
  )
}
