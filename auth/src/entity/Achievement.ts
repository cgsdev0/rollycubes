import {
  BaseEntity,
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { UserToAchievement } from "./UserToAchievement";

@Entity()
export class Achievement extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ default: true })
  is_boolean: boolean;

  @Column({ default: 1 })
  max_progress: number;

  @Column({ nullable: true })
  image_url: string;

  @OneToMany(
    () => UserToAchievement,
    (userToAchievement) => userToAchievement.achievement
  )
  userToAchievements: UserToAchievement[];
}
