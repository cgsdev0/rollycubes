import { BaseEntity, Entity, Column, JoinColumn, OneToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class PlayerStats extends BaseEntity {
  @Column({ default: 0 })
  rolls: number;

  @Column({ default: 0 })
  doubles: number;

  @Column({ default: 0 })
  games: number;

  @Column({ default: 0 })
  wins: number;

  @OneToOne(() => User, (user) => user.stats, { primary: true })
  @JoinColumn()
  user: User;
}
