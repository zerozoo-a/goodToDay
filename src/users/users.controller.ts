import {
  Controller,
  Get,
  Res,
  UnauthorizedException,
  Headers,
  Post,
  Req,
  Body,
  HttpException,
  HttpCode,
  Header,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/CreateUser.dto';
// import { genSalt, hash } from 'bcrypt';
import { genSalt, hash } from 'bcrypt';
import { Result } from 'src/board/board.service';
import type { Response } from 'express';

// type ErrorMessageKey = "name" | "email" | "password" | "confirm";
// errorDto
interface CreateHouseUserErrorDto {
  path: string[];
  message: string;
}

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('/validateHouseToken')
  async validateHouseToken(
    @Headers('access_token') access_token,
    @Res() res: Response,
  ) {
    if (!access_token) throw new UnauthorizedException();
    const isValid = await this.userService.validateHouseToken(access_token);

    if (isValid.status) {
    } else {
    }
  }

  @Get('/findBy/:prop')
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
  @Header('Cache-Control', 'none')
  @HttpCode(201)
  async createHouseUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const [existEmailUser] = await Promise.all([
      this.userService.findBy('email', createUserDto.email),
    ]);

    if (existEmailUser.data.length !== 0) {
      throw new HttpException(
        <Result<CreateHouseUserErrorDto>>{
          success: false,
          data: undefined,
          err: [
            { path: ['email'], message: 'email이 이미 등록되어 있습니다.' },
          ],
        },
        409,
      );
    }

    const saltRound = 10;
    const salt = await genSalt(saltRound);
    const hashedPassword = await hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    const { success, data } = await this.userService.createHouseUser(
      createUserDto,
    );

    /** set MIME */
    res.header('Content-Type', 'application/json');

    if (success) {
      /** set HTTP message */
      data.message = '계정이 생성되었습니다.';
      res.json({
        success: true,
        data,
      });
    } else {
      /** set HTTP message */
      data.message = 'An unknown error occurred.';
      res.status(500).json({ success: false, data });
    }
  }
}
