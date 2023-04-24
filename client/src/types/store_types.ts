export interface Player {
  connected: boolean
  name?: string
  score: number
  win_count: number
  user_id?: string
  crowned?: boolean
  userData?: UserData
}

export interface AchievementProgress {
  achievement_id: string
  user_id: string
  progress: number
  type: 'achievement_progress'
}

export interface AchievementUnlock {
  id: string
  image_url: string | null
  name: string
  description: string
  max_progress: number | null
  type: 'achievement_unlock'
}

export interface ReportStats {
  id: string
  rolls: number
  wins: number
  games: number
  doubles: number
}
export interface ServerPlayer extends Player {
  session: string
  turn_count: number
  roll_count: number
  doubles_count: number
}

export interface UserStats {
  rolls: number
  doubles: number
  games: number
  wins: number
}

export interface Achievement {
  id: string
  progress: number
  unlocked: string
}

export type AchievementData = {
  description: string
  image_url: string | null
  id: string
  name: string
  max_progress: number | null
}

export interface UserData {
  id: string
  username: string
  image_url?: string | null
  stats?: UserStats | null
  achievements?: Achievement[] | null
  createdDate: string
}

export interface DieRoll {
  used: boolean
  value: number
}
