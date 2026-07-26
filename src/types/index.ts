export type BeaufortForce = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type WindAngle = 0 | 15 | 30 | 45 | 60 | 75 | 90 | 105 | 120 | 135 | 150 | 165 | 180

export type BoatType = 'monohull' | 'catamaran' | 'trimaran' | 'cruiser' | 'racer' | 'dinghy'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type SailPoint =
  | 'close_hauled'
  | 'close_reach'
  | 'beam_reach'
  | 'broad_reach'
  | 'running'

export interface TrimConditions {
  boatType: BoatType
  windForce: BeaufortForce
  windAngle: WindAngle
  experience: ExperienceLevel
  seaState?: 'calm' | 'moderate' | 'rough'
  sailInventory?: string[]
}

export interface TrimRecommendation {
  summary: string
  mainsail: string
  headsail: string
  additionalSails: string
  crewActions: string
  safetyNotes: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type AppMode = 'trim' | 'diagnostic'
