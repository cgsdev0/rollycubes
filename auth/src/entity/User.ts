import {
  OneToOne,
  CreateDateColumn,
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { PlayerStats } from "./PlayerStats";
import { UserToAchievement } from "./UserToAchievement";
import { RefreshToken } from "./RefreshToken";
import { TwitchIdentity } from "./TwitchIdentity";

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

  @OneToOne(() => TwitchIdentity, (twitch) => twitch.user)
  twitch: TwitchIdentity;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(
    () => UserToAchievement,
    (userToAchievement) => userToAchievement.user
  )
  userToAchievements: UserToAchievement[];
}
