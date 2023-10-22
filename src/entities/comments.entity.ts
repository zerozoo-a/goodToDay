import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './users.entity';
import { Articles } from './articles.entity';

@Entity('comments')
export class Comments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id', default: 0 })
  userId: number;

  @Column('varchar', { name: 'authority_name' })
  authorityName: string;

  @ManyToOne(() => Users, (user) => user.comments)
  user: Users;

  @ManyToOne(() => Articles, (articles) => articles.comments)
  article: Articles;
}
