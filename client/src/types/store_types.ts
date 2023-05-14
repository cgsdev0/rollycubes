type integer = number;

export interface Player {
  connected: boolean;
  name?: string;
  score: integer;
  win_count: integer;
  user_id?: string;
  crowned?: boolean;
}

export type UserId =
  | {
      type: 'User';
      id: string;
    }
  | { type: 'Anonymous'; id: string };

export interface AchievementProgress {
  achievement_id: string;
  user_id: UserId;
  user_index: integer;
  progress: integer;
  type: 'achievement_progress';
}

export interface AchievementUnlock {
  id: string;
  image_url: string | null;
  name: string;
  description: string;
  user_index: integer;
  max_progress: integer;
  user_id: string;
  type: 'achievement_unlock';
}

export interface ReportStats {
  user_id: UserId;
  rolls: integer;
  wins: integer;
  games: integer;
  doubles: integer;
}
export interface ServerPlayer extends Player {
  session: string;
  turn_count: integer;
  roll_count: integer;
  doubles_count: integer;
}

export interface UserStats {
  rolls: integer;
  doubles: integer;
  games: integer;
  wins: integer;
}

export interface Achievement {
  id: string;
  progress: integer;
  unlocked: string;
  rn: number | null;
  rd: number | null;
}

export type AchievementData = {
  description: string;
  image_url: string | null;
  id: string;
  name: string;
  max_progress: integer;
};

const enum DiceType {
  D6,
  D20,
}

export interface UserData {
  id: string;
  username: string;
  image_url?: string | null;
  stats?: UserStats | null;
  dice: {
    type: DiceType;
  };
  color: {
    hue: number;
    sat: number;
  };
  achievements?: Achievement[] | null;
  createdDate: string;
  donor: boolean;
}

export interface DieRoll {
  used: boolean;
  value: integer;
}
