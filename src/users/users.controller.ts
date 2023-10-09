import {
  Controller,
  Get,
  Res,
  UnauthorizedException,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Result } from 'src/board/board.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('/validateHouseToken')
  async validateHouseToken(@Headers('access_token') access_token, @Res() res) {
    if (!access_token) throw new UnauthorizedException();
    const isValid = await this.userService.validateHouseToken(access_token);

    if (isValid.status) {
    } else {
    }
  }

  // @Post('/findbyuseremail')
  // async findByUserEmail(@Req() req, @Res() res) {
  //   try {
  //     const data = await this.userService.findByUserEmail(req.body.email);

  //     res.json({ success: true, data });
  //   } catch (err) {
  //     res.json({ success: false, data: undefined, err });
  //   }
  // }

  // @Post('/findbyusernickname')
  // async findByUserNickname(@Req() req, @Res() res) {
  //   try {
  //     const data = await this.userService.findByUserNickname(req.body.nickname);

  //     res.json({ success: true, data });
  //   } catch (err) {
  //     res.json({ success: false, data: undefined, err });
  //   }
  // }

  @Post('/findBy/:prop')
  async findByUser(@Req() req, @Res() res) {
    try {
      const data = await this.userService.findBy(
        req.params.prop,
        req.body[req.params.prop],
      );

      res.json({ success: true, data });
    } catch (err) {
      res.json({ success: false, data: undefined, err });
    }
  }
}
