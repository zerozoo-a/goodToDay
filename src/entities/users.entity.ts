import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserAuthority } from './userAuthority.entity';
import { Articles } from './articles.entity';
import { Comments } from './comments.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  // @Column({ type: 'double', name: 'kakao_id', nullable: true })
  // kakaoId: number;

  @Index({ unique: true })
  @Column('varchar', {
    name: 'email',
    length: 100,
    nullable: false,
  })
  email: string;

  @Column('varchar', { name: 'name', nullable: true, length: 45, unique: true })
  name: string | null;

  @Column('varchar', { name: 'gender', length: 10, nullable: true })
  gender: string | null;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string | null;

  // @Column('varchar', {
  //   name: 'kakao_target_id_type',
  //   length: 50,
  //   nullable: true,
  // })
  // kakao_target_id_type: string | null;

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

  @Column('varchar', {
    nullable: false,
    name: 'password_hash',
    length: 255,
  })
  passwordHash: string;

  @OneToMany(() => UserAuthority, (userAuthority) => userAuthority.user, {
    eager: true,
  })
  authorities?: any[];

  @OneToMany(() => Articles, (articles) => articles.user)
  articles;

  @OneToMany(() => Comments, (comments) => comments.user)
  comments;
}
