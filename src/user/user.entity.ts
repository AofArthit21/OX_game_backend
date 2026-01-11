import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  providerUserId: string; // ID จาก Google/OAuth Provider

  @Column()
  displayName: string;

  @Column({ default: 0 })
  totalScore: number;

  @Column({ default: 0 })
  consecutiveWins: number; // สำหรับนับโบนัส

  @Column({ nullable: true })
  email: string;
}
