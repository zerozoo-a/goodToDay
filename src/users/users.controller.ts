import {
  Controller,
  Get,
  Res,
  UnauthorizedException,
  Headers,
  Post,
  Req,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/CreateUser.dto';

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

  @Post('/findBy/:prop')
  async findByUser(@Req() req, @Res() res) {
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

  @Post('/createHouseUser')
  async createHouseUser(@Body() createUserDto: CreateUserDto) {
    console.log(
      '🚀 ~ file: users.controller.ts:41 ~ UsersController ~ createHouseUser ~ createUserDto:',
      createUserDto,
    );
    Promise.resolve({ hi: 'done' });
  }
}
