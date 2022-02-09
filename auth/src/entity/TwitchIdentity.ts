import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class TwitchIdentity extends BaseEntity {
  @PrimaryColumn()
  twitch_id: string;

  @Column()
  twitch_login: string;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
