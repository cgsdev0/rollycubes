export interface Player {
  connected: boolean;
  name: string;
  score: number;
  win_count: number;
  user_id?: string;
  crowned?: boolean;
  userData?: UserData;
}

export interface UserStats {
  rolls: number;
  doubles: number;
  games: number;
  wins: number;
}

export interface Achievement {
  progress: number;
  unlocked: string;
  achievement: {
    description: string;
    image_url: string | null;
    id: string;
    name: string;
    max_progress: number;
  };
}

export interface UserData {
  id: string;
  username: string;
  image_url?: string | null;
  stats?: UserStats;
  userToAchievements: Achievement[];
  createdDate: string;
}

export interface DieRoll {
  used: boolean;
  value: number;
}
