import { Body, Controller, Post } from '@nestjs/common';
import { Req, Res, Get } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private boardService: BoardService) {}

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
  async post(@Body() body, @Res() res) {
    const result = await this.boardService.postArticle({
      title: body.title,
      context: body.context,
      userId: body.userId,
    });

    res.json(result);
  }
}
