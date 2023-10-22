import {
  Controller,
  Post,
  Res,
  BadRequestException,
  Get,
  Headers,
  Req,
  HttpException,
  HttpCode,
  Body,
  Header,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginUserDto } from 'src/dto/LoginUser.dto';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/dto/CreateUser.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('/validateHouseToken')
  async validateHouseToken(
    @Headers('access_token') access_token,
    @Res() _res: Response,
  ) {
    if (!access_token) throw new UnauthorizedException();
    const isValid = await this.usersService.validateHouseToken(access_token);

    if (isValid.status) {
    } else {
    }
  }

  // @Post('/loginKakao')
  // async loginKakao(@Req() req, @Res() res: Response): Promise<any> {
  //   try {
  //     // 카카오 토큰 조회 후 계정 정보 가져오기
  //     const { code, domain, redirectURI } = req.body;
  //     if (!code || !domain) {
  //       if (!code) throw new BadRequestException(`code is missing`);
  //       if (!domain) throw new BadRequestException(`domain is missing`);
  //       throw new BadRequestException(`code, domain is missing`);
  //     }

  //     const kakao = await this.authService.loginKakao({
  //       code,
  //       domain,
  //       redirectURI,
  //     });
  //     const jwt = await this.authService.kakaoToOwnServiceLogin(kakao);
  //     res.send({
  //       domain: kakao,
  //       accessToken: jwt.accessToken,
  //       message: 'success',
  //       redirectURL: '/dashboard',
  //     });
  //   } catch (e) {
  //     throw new HttpException('message', 400, {
  //       cause: new Error('Some Error'),
  //     });
  //   }
  // }

  // @Get('/loginKakaoInfo')
  // async loginKakaoInfo(@Headers('authorized') authorized, @Res() res) {
  //   // try catch를 통해 로그아웃 상태에서의 핸들링이 필요함
  //   // 로그아웃 상태인 경우 token을 인식못하니까 catch에서 처리 필요
  //   const response = await this.authService.loginKakaoInfo(authorized);
  //   res.json({
  //     ...response,
  //     meta: {
  //       id: { type: 'Long', mean: '회원번호', necessary: true },
  //       expires_in: {
  //         type: 'Integer',
  //         mean: '엑세스 토큰 만료 시간(초)',
  //         necessary: true,
  //       },
  //       app_id: {
  //         type: 'Integer',
  //         mean: '토큰이 발급된 앱 ID',
  //         necessary: true,
  //       },
  //     },
  //   });
  // }

  // @Post('/logoutKakao')
  // async logoutKakao(
  //   @Headers('access_token') access_token,
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const response = await this.authService.logoutKakao(access_token);
  //     res.json(response);
  //   } catch (err) {
  //     res.send(err);
  //   }
  // }

  @Get('/checkHouseToken')
  async checkHouseToken(
    @Headers('Authorization') token: string,
    @Res() res: Response,
  ) {
    const response = await this.authService.checkHouseToken(
      token.split(' ')[1],
    );

    res.json(response);
  }

  @Post('/loginHouseUser')
  @HttpCode(200)
  async loginHouseUser(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: Response,
  ) {
    const response = await this.authService.loginHouseUser(loginUserDto);
    res.header('Content-Type', 'application/json');
    res.send(response);
  }

  @Post('/createHouseUser')
  @Header('Cache-Control', 'none')
  @HttpCode(201)
  async createHouseUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const { success, data } = await this.authService.createHouseUser(
      createUserDto,
    );

    res.header('Content-Type', 'application/json');
    if (success) {
      /** set HTTP message */
      res.json({
        success: true,
        data: {
          message: `${createUserDto.email} 계정이 성공적으로 생성되었습니다.`,
        },
      });
    } else {
      /** set HTTP message */
      data.message = 'An unknown error occurred.';
      res.status(500).json({ success: false, data });
    }
  }
}
