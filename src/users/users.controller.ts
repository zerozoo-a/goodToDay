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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/CreateUser.dto';
// import { genSalt, hash } from 'bcrypt';
import { genSalt, hash } from 'bcrypt';
import { Result } from 'src/board/board.service';

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
  async validateHouseToken(@Headers('access_token') access_token, @Res() res) {
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
  async createHouseUser(@Body() createUserDto: CreateUserDto, @Res() res) {
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

    if (!success) {
      res.json({ success: true, data });
    } else {
      res.status(409).json({ success: false, data });
    }
  }
}
