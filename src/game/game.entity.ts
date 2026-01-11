import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ['WIN', 'LOSE', 'DRAW'] })
  result: 'WIN' | 'LOSE' | 'DRAW';

  @CreateDateColumn()
  timestamp: Date;

  // Relationship to User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
