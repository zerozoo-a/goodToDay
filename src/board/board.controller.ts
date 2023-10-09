import { Controller, Post } from '@nestjs/common';
import { Req, Res, Get } from '@nestjs/common';
import { BoardService } from './board.service';
import { UsersService } from 'src/users/users.service';

@Controller('board')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private usersService: UsersService,
  ) {}

  @Get('/')
  async board(@Req() req, @Res() res) {
    try {
      const articles = await this.boardService.articles();
      res.json(articles);
    } catch (err) {
      console.error(err);
    }
  }

  @Post('/')
  async post(@Req() req, @Res() res) {
    const isUserTokenValid = await this.usersService.validateHouseToken(
      req.headers.access_token,
    );
    if (!isUserTokenValid.status) {
      console.log(
        '🚀 ~ file: board.controller.ts:29 ~ BoardController ~ post ~ isUserTokenValid:',
        isUserTokenValid,
      );
      return res.json({ success: false, err: isUserTokenValid.err });
    }

    const result = await this.boardService.postArticle({
      title: req.body.title,
      context: req.body.context,
      userId: isUserTokenValid.userId,
    });

    res.json({ success: true });
  }
}
