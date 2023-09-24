import {
  Body,
  Controller,
  Post,
  Res,
  BadRequestException,
  UnauthorizedException,
  Get,
  Headers,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/loginKakao')
  async loginKakao(@Body('body') req, @Res() res): Promise<any> {
    console.log(
      '🚀 ~ file: auth.controller.ts:19 ~ AuthController ~ loginKakao ~ req:',
      req,
    );
    try {
      const { body }: { body: { code: string; domain: string } } =
        JSON.parse(req);
      // 카카오 토큰 조회 후 계정 정보 가져오기
      const { code, domain } = body;
      if (!code || !domain) {
        if (!code) throw new BadRequestException(`code is missing`);
        if (!domain) throw new BadRequestException(`domain is missing`);
        throw new BadRequestException(`code, domain is missing`);
      }

      const kakao = await this.authService.loginKakao(body);
      const jwt = await this.authService.kakaoToOwnServiceLogin(kakao);

      res.send({
        domain: kakao,
        accessToken: jwt.accessToken,
        message: 'success',
        redirectURL: '/dashboard',
      });
    } catch (e) {
      console.log('🚀 ~ file: auth.controller.ts:50 ~ AuthController ~ e:', e);
      throw new UnauthorizedException(e.message);
    }
  }

  @Get('/loginKakaoInfo')
  async loginKakaoInfo(@Headers('authorized') authorized, @Res() res) {
    const response = await this.authService.loginKakaoInfo(authorized);
    res.json({
      ...response,
      meta: {
        id: { type: 'Long', mean: '회원번호', necessary: true },
        expires_in: {
          type: 'Integer',
          mean: '엑세스 토큰 만료 시간(초)',
          necessary: true,
        },
        app_id: {
          type: 'Integer',
          mean: '토큰이 발급된 앱 ID',
          necessary: true,
        },
      },
    });
  }

  @Post('/logoutKakao')
  async logoutKakao(@Req() req, @Res() res) {
    this.authService.logoutKakao(req.headers.authorized);

    res.json({ done: true });
  }
}
