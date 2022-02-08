import { getConnection } from "typeorm";
import { Achievement } from "./entity/Achievement";

export const insertAchievementList = async () => {
  await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Achievement)
    .values([
      // {
      //   id: "astronaut:1",
      //   name: "Astronaut",
      //   description: "Win with a score of 100",
      // },
      {
        id: "getting_started",
        name: "Getting Started",
        description: "You rolled your first dice!",
        max_progress: 1,
      },
    ])
    .execute();
};
