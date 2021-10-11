import { BaseEntity, Entity, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Achievement } from "./Achievement";

@Entity()
export class UserToAchievement extends BaseEntity {
  @Column()
  progress: number;

  @Column({ nullable: true, default: null })
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
