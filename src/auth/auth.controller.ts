import {
  Body,
  Controller,
  Post,
  Response,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  async kakaoLogin(
    @Body('body') req: { body: string },
    @Response() res,
  ): Promise<any> {
    try {
      // 카카오 토큰 조회 후 계정 정보 가져오기
      const { code, domain } = JSON.parse(req.body);
      if (!code || !domain) {
        if (!code) throw new BadRequestException(`code is missing`);
        if (!domain) throw new BadRequestException(`domain is missing`);
        throw new BadRequestException(`code, domain is missing`);
      }

      const kakao = await this.authService.kakaoLogin({ code, domain });

      const jwt = await this.authService.kakaoToOwnServiceLogin(kakao);

      res.send({
        accessToken: jwt.accessToken,
        message: 'success',
      });
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }
}
