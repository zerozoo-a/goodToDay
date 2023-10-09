import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('user_authority')
export class UserAuthority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id', default: 0 })
  userId: number;

  @Column('varchar', { name: 'authority_name' })
  authorityName: string;

  @ManyToOne(() => Users, (user) => user.authorities)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;
}
