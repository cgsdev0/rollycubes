import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PlayerStats } from "./PlayerStats";
import { RefreshToken } from "./RefreshToken";
import { TwitchIdentity } from "./TwitchIdentity";
import { UserToAchievement } from "./UserToAchievement";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
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
