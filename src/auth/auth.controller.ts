import {
  Controller,
  Post,
  Res,
  BadRequestException,
  Get,
  Headers,
  Req,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/loginKakao')
  async loginKakao(@Req() req, @Res() res: Response): Promise<any> {
    try {
      // 카카오 토큰 조회 후 계정 정보 가져오기
      const { code, domain, redirectURI } = req.body;
      if (!code || !domain) {
        if (!code) throw new BadRequestException(`code is missing`);
        if (!domain) throw new BadRequestException(`domain is missing`);
        throw new BadRequestException(`code, domain is missing`);
      }

      const kakao = await this.authService.loginKakao({
        code,
        domain,
        redirectURI,
      });
      const jwt = await this.authService.kakaoToOwnServiceLogin(kakao);
      res.send({
        domain: kakao,
        accessToken: jwt.accessToken,
        message: 'success',
        redirectURL: '/dashboard',
      });
    } catch (e) {
      throw new HttpException('message', 400, {
        cause: new Error('Some Error'),
      });
    }
  }

  @Get('/loginKakaoInfo')
  async loginKakaoInfo(@Headers('authorized') authorized, @Res() res) {
    // try catch를 통해 로그아웃 상태에서의 핸들링이 필요함
    // 로그아웃 상태인 경우 token을 인식못하니까 catch에서 처리 필요
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
  async logoutKakao(@Headers('access_token') access_token, @Res() res) {
    const response = await this.authService.logoutKakao(access_token);

    res.json(response);
  }
}
