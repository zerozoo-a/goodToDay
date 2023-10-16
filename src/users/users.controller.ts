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
import { genSalt, hash, compare } from 'bcrypt';
import { Result } from 'src/board/board.service';
import type { Response } from 'express';
import { LoginUserDto } from 'src/dto/LoginUser.dto';

// type ErrorMessageKey = "name" | "email" | "password" | "confirm";
// errorDto
interface ErrorDto {
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

  @Post('/loginHouseUser')
  @HttpCode(200)
  async loginHouseUser(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ) {
    const existEmailUser = await this.userService.findBy(
      'email',
      loginUserDto.email,
    );
    console.log(
      '🚀 ~ file: users.controller.ts:68 ~ UsersController ~ existEmailUser:',
      existEmailUser,
    );

    // const salt = await genSalt(process.env.SALT);
    // const decodedPassword = await /** set MIME */

    /** set MIME  */
    // res.header('Content-Type', 'application/json');

    /** 유저를 찾지 못한 경우 에러 반환 */
    if (!existEmailUser.success) {
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [
            {
              path: ['email'],
              message: '오류가 발생했습니다.',
            },
          ],
        },
        500,
      );
    }

    if (existEmailUser.data.length === 0) {
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [
            {
              path: ['email'],
              message: '등록된 계정이 없습니다.',
            },
          ],
        },
        404,
      );
    }

    console.log(
      '🚀 ~ file: users.controller.ts:114 ~ UsersController ~ loginUserDto:',
      loginUserDto,
    );
    console.log(
      '🚀 ~ file: users.controller.ts:116 ~ UsersController ~ existEmailUser:',
      existEmailUser,
    );

    const t = await compare(
      loginUserDto.password,
      existEmailUser.data[0].password_hash,
    );
    console.log('🚀 ~ file: users.controller.ts:113 ~ UsersController ~ t:', t);

    res.send({ hi: process.env.SALT });
  }

  @Post('/createHouseUser')
  @Header('Cache-Control', 'none')
  @HttpCode(201)
  async createHouseUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const existEmailUser = await this.userService.findBy(
      'email',
      createUserDto.email,
    );

    if (existEmailUser.data.length !== 0) {
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [
            { path: ['email'], message: 'email이 이미 등록되어 있습니다.' },
          ],
        },
        409,
      );
    }

    /** salt 생성 */
    const salt = await genSalt(+process.env.SALT);

    /** 비밀번호 hashing */
    const hashedPassword = await hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;

    /** db에 hasing된 비밀번호로 저장 */
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
