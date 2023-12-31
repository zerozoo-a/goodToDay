import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { Articles } from 'src/entities/articles.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Articles]), UsersModule],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
