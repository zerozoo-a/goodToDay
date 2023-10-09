import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserAuthority } from './userAuthority.entity';
import { Articles } from './board.entity';

@Entity('user', { schema: 'boarder' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'double', name: 'kakao_id' })
  kakaoId: number;

  @Column('varchar', { name: 'email', length: 100 })
  email: string;

  @Column('varchar', { name: 'name', nullable: true, length: 45 })
  name: string | null;

  @Column('varchar', { name: 'gender', length: 10, nullable: true })
  gender: string | null;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column('varchar', {
    name: 'kakao_target_id_type',
    length: 50,
    nullable: true,
  })
  kakao_target_id_type: string | null;

  @Column('varchar', { name: 'birth', length: 10, nullable: true })
  birth: string | null;

  @Column('varchar', { name: 'profile_image', nullable: true, length: 200 })
  profileImage: string | null;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp', {
    name: 'updated_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @OneToMany(() => UserAuthority, (userAuthority) => userAuthority.user, {
    eager: true,
  })
  authorities?: any[];

  @OneToMany(() => Articles, (articles) => articles.user)
  articles;
}
