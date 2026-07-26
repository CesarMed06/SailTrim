import type { BeaufortForce, BoatType, ExperienceLevel } from '../types'

export const BEAUFORT_SCALE: Record<BeaufortForce, { label: string; description: string; windSpeed: string; seaState: string }> = {
  0: { label: 'Calma', description: 'Mar como un espejo', windSpeed: '< 1 kn', seaState: 'Plana' },
  1: { label: 'Ventolina', description: 'Pequeñas arrugas en el mar', windSpeed: '1-3 kn', seaState: 'Rizos sin espuma' },
  2: { label: 'Flojito', description: 'Olas pequeñas, crestas vítreas', windSpeed: '4-6 kn', seaState: 'Olas pequeñas' },
  3: { label: 'Flojo', description: 'Olas medianas, borreguitos', windSpeed: '7-10 kn', seaState: 'Olas moderadas' },
  4: { label: 'Bonancible', description: 'Se forman olas más largas', windSpeed: '11-16 kn', seaState: 'Olas con espuma' },
  5: { label: 'Fresquito', description: 'Olas moderadas y alargadas', windSpeed: '17-21 kn', seaState: 'Borreguitos abundantes' },
  6: { label: 'Fresco', description: 'Olas grandes, crestas de espuma', windSpeed: '22-27 kn', seaState: 'Mar gruesa' },
  7: { label: 'Frescachón', description: 'Mar gruesa, espuma arrastrada', windSpeed: '28-33 kn', seaState: 'Mar muy gruesa' },
  8: { label: 'Temporal', description: 'Olas altas, rompientes', windSpeed: '34-40 kn', seaState: 'Mar arbolada' },
  9: { label: 'Temporal fuerte', description: 'Olas muy altas, visibilidad reducida', windSpeed: '41-47 kn', seaState: 'Mar montañosa' },
  10: { label: 'Temporal duro', description: 'Olas muy altas y largas', windSpeed: '48-55 kn', seaState: 'Mar muy montañosa' },
  11: { label: 'Temporal muy duro', description: 'Olas excepcionalmente altas', windSpeed: '56-63 kn', seaState: 'Mar excepcional' },
  12: { label: 'Huracán', description: 'Aire lleno de espuma y rocío', windSpeed: '64+ kn', seaState: 'Mar confusa' },
}

export const BOAT_TYPES: { value: BoatType; label: string; icon: string }[] = [
  { value: 'monohull', label: 'Monocasco / Velero', icon: '⛵' },
  { value: 'catamaran', label: 'Catamarán', icon: '🛥️' },
  { value: 'trimaran', label: 'Trimarán', icon: '⛵' },
  { value: 'cruiser', label: 'Crucero', icon: '🚢' },
  { value: 'racer', label: 'Regata', icon: '🏁' },
  { value: 'dinghy', label: 'Vela ligera / Dinghy', icon: '🛶' },
]

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
]

export const WIND_ANGLE_LABELS: Record<number, { short: string; full: string }> = {
  0: { short: 'Proa', full: 'Proa al viento' },
  15: { short: 'Ceñida cerrada', full: 'Ceñida muy cerrada' },
  30: { short: 'Ceñida', full: 'Ceñida' },
  45: { short: 'Ceñida abierta', full: 'Ceñida abierta' },
  60: { short: 'Descuartelar', full: 'De través' },
  75: { short: 'Través', full: 'De través' },
  90: { short: 'Través', full: 'De través' },
  105: { short: 'Largo', full: 'De aleta' },
  120: { short: 'Largo', full: 'De aleta' },
  135: { short: 'Largo abierto', full: 'Largo abierto' },
  150: { short: 'Empopada', full: 'De empopada' },
  165: { short: 'Empopada', full: 'Empopada cerrada' },
  180: { short: 'Popa', full: 'Popa cerrada' },
}

export const GEMINI_API_KEY_STORAGE = 'sailtrim-gemini-key'
