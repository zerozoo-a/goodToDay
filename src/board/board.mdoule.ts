import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Articles } from 'src/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Articles])],
  controllers: [BoardController],
  providers: [BoardService],
})
export class BoardModule {}
