import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
} from "typeorm";
import { User } from "./User";
import { Achievement } from "./Achievement";

@Entity()
export class UserToAchievement extends BaseEntity {
  @Column()
  progress: number;

  @Column()
  unlocked: Date;

  @ManyToOne(() => User, (user) => user.userToAchievements, { primary: true })
  user: User;

  @ManyToOne(
    () => Achievement,
    (achievement) => achievement.userToAchievements,
    { primary: true, eager: true }
  )
  achievement: Achievement;
}
