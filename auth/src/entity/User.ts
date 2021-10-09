import {
  OneToOne,
  CreateDateColumn,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { PlayerStats } from "./PlayerStats";
import { UserToAchievement } from "./UserToAchievement";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  hashed_password: string;

  @Column({ nullable: true })
  image_url: string;

  @CreateDateColumn()
  createdDate: Date;

  @OneToOne(() => PlayerStats, (stats) => stats.user)
  stats: PlayerStats;

  @OneToMany(
    () => UserToAchievement,
    (userToAchievement) => userToAchievement.user
  )
  userToAchievements: UserToAchievement[];
}
