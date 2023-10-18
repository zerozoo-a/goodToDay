import { Controller, Get, Res, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/findBy/:prop')
  async findByUser(@Req() req, @Res() res: Response) {
    try {
      const data = await this.userService.findBy(
        req.params.prop,
        req.body[req.params.prop],
      );
      res.json(data);
    } catch (err) {
      res.json({ success: false, data: undefined, err });
    }
  }
}
