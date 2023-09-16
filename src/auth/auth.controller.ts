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
  async kakaoLogin(@Body('body') req: any, @Response() res): Promise<any> {
    try {
      // 카카오 토큰 조회 후 계정 정보 가져오기
      const { code, domain } = JSON.parse(req.body);
      if (!code || !domain) {
        throw new BadRequestException('카카오 정보가 없습니다.');
      }

      const kakao = await this.authService.kakaoLogin({ code, domain });
      if (!kakao.id) {
        throw new BadRequestException('카카오 정보가 없습니다.');
      }

      res.send({
        user: kakao,
        message: 'success',
      });
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }
}
