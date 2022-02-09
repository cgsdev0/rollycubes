import { getConnection } from "typeorm";
import { Achievement } from "./entity/Achievement";

interface AchievementDescript {
  id: string;
  name: string;
  description: string;
  max_progress?: number;
}
export const insertAchievementList = async () => {
  const achievementList: AchievementDescript[] = [
    {
      id: "astronaut:1",
      name: "Astronaut",
      description: "Win with a score of 100",
    },
    {
      id: "getting_started",
      name: "Getting Started",
      description: "You rolled your first dice!",
      max_progress: 1,
    },
    {
      id: "win_games:1",
      name: "Beginner's Luck",
      description: "Win a game.",
      max_progress: 1,
    },
    {
      id: "win_games:2",
      name: "good job",
      description: "Win 10 games.",
      max_progress: 10,
    },
    {
      id: "win_games:3",
      name: "Addicted",
      description: "Win 100 games.",
      max_progress: 100,
    },
    {
      id: "doubles:1",
      name: "3x Doubles Streak",
      description: "Get doubles 3 times in a row.",
      max_progress: 1,
    },
    {
      id: "doubles:2",
      name: "5x Doubles Streak",
      description: "Get doubles 5 times in a row.",
      max_progress: 1,
    },
    {
      id: "doubles:3",
      name: "7x Doubles Streak",
      description: "Get doubles 7 times in a row.",
      max_progress: 1,
    },
    {
      id: "rude",
      name: "Just Plain Rude",
      description: "Reset another player instead of winning.",
      max_progress: 1,
    },
    {
      id: "negative",
      name: "Maybe Read the Rules...",
      description: "Reach a negative score.",
      max_progress: 1,
    },
    {
      id: "thief",
      name: "Roll Thief",
      description: "Get the roll the player after you needed to win.",
      max_progress: 1,
    },
  ];
  await Promise.all(
    achievementList.map((ach) =>
      getConnection()
        .createQueryBuilder()
        .insert()
        .into(Achievement)
        .values([ach])
        .execute()
    )
  );
};
