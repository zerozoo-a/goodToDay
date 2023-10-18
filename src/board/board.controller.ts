import { Controller, Post, Req, Res, Get, Headers, Body } from '@nestjs/common';
import { BoardService } from './board.service';
import { UsersService } from 'src/users/users.service';
import { Result } from './board.service';

@Controller('board')
export class BoardController {
  constructor(
    private boardService: BoardService,
    private usersService: UsersService,
  ) {}

  @Get()
  async board(@Req() req, @Res() res) {
    try {
      const articles = await this.boardService.articles();
      res.json(articles);
    } catch (err) {
      console.error(err);
    }
  }

  @Post()
  async post(
    @Headers('Authorization') authorization,
    @Body() body,
    @Res() res,
  ): Promise<Result> {
    const isUserTokenValid = await this.usersService.validateHouseToken(
      authorization.split(' ')[1],
    );
    /** 인증 실패 */
    if (!isUserTokenValid.status) {
      return res.json({
        success: false,
        data: { redirect: '/dashboard' },
        err: isUserTokenValid.err,
      });
    }

    /** 글 작성 성공 */
    const result = await this.boardService.postArticle({
      title: body.title,
      context: body.context,
      userId: isUserTokenValid.userId,
    });

    res.json({ success: true, data: { ...result, redirect: '/dashboard' } });
  }
}
