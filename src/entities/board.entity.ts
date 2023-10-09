import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Users } from './users.entity';

@Entity('articles', { schema: 'articles' })
export class Articles {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'title', nullable: false, length: 50 })
  name: string;

  @Column('varchar', { name: 'context', nullable: false, length: 1000 })
  context: string;

  @Column('timestamp', {
    name: 'created_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('timestamp', {
    name: 'modified_at',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  modifiedAt: Date | null;

  @ManyToOne(() => Users, (user) => user.articles)
  user: Users;
}
