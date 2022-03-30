import { getConnection } from "typeorm";
import { Achievement } from "./entity/Achievement";

interface AchievementDescript {
  id: string;
  name: string;
  description: string;
  max_progress?: number;
  image_url?: string;
}
export const insertAchievementList = async () => {
  const achievementList: AchievementDescript[] = [
    {
      id: "astronaut:1",
      name: "Astronaut",
      description: "Win with a score of 100",
      image_url: "https://static.rollycubes.com/astronaut.png",
    },
    {
      id: "getting_started",
      name: "Getting Started",
      description: "You rolled your first dice!",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/getting_started.png",
    },
    {
      id: "win_games:1",
      name: "Beginner's Luck",
      description: "Win a game.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/beginners_luck.png",
    },
    {
      id: "win_games:2",
      name: "good job",
      description: "Win 10 games.",
      max_progress: 10,
      image_url: "https://static.rollycubes.com/good_job.png",
    },
    {
      id: "win_games:3",
      name: "Addicted",
      description: "Win 100 games.",
      max_progress: 100,
      image_url: "https://static.rollycubes.com/addicted.png",
    },
    {
      id: "doubles:1",
      name: "3x Doubles Streak",
      description: "Get doubles 3 times in a row.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/3x_doubles.png",
    },
    {
      id: "doubles:2",
      name: "5x Doubles Streak",
      description: "Get doubles 5 times in a row.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/5x_doubles.png",
    },
    {
      id: "doubles:3",
      name: "7x Doubles Streak",
      description: "Get doubles 7 times in a row.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/7x_doubles.png",
    },
    {
      id: "rude",
      name: "Just Plain Rude",
      description: "Reset another player instead of winning.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/rude.png",
    },
    {
      id: "negative",
      name: "Maybe Read the Rules...",
      description: "Reach a negative score.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/negative.png",
    },
    {
      id: "thief",
      name: "Roll Thief",
      description: "Get the roll the player after you needed to win.",
      max_progress: 1,
      image_url: "https://static.rollycubes.com/thief.png",
    },
    {
      id: "oops",
      name: "Oops...",
      description: "Miss an opportunity to win the game.",
      max_progress: 1,
    },
    {
      id: "perfect",
      name: "Perfect Game",
      description: "Win a game in a single turn.",
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
        .orUpdate(["name", "description", "image_url", "max_progress"], ["id"])
        .execute()
    )
  );
};
