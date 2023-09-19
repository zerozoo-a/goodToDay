import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { Payload } from './security/jwt_payload.interface';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async kakaoLogin(options: { code: string; domain: string }): Promise<any> {
    const { code, domain } = options;
    const kakaoRestApiKey = '8fc6587f15b62fcab9ddacd8950612df';
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const clientSecret = 'WEEfKIJ4n0MkplhfzQnRlXrujK9AhIjn';
    const body = {
      grant_type: 'authorization_code',
      client_id: kakaoRestApiKey,
      redirect_uri: `${domain}/kakao_login_res`,
      code,
      client_secret: clientSecret,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const data = qs.stringify(body);
    try {
      const response = await axios({
        method: 'POST',
        url: kakaoTokenUrl,
        timeout: 30000,
        headers,
        data,
      });

      if (response.status === 200) {
        // Token 을 가져왔을 경우 사용자 정보 조회
        const headerUserInfo = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: 'Bearer ' + response.data.access_token,
        };
        const responseUserInfo = await axios({
          method: 'GET',
          url: kakaoUserInfoUrl,
          timeout: 30000,
          headers: headerUserInfo,
        });
        if (responseUserInfo.status === 200) {
          return { userInfo: responseUserInfo.data, auth: response.data };
        } else {
          throw new UnauthorizedException();
        }
      } else {
        throw new UnauthorizedException();
      }
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }

  async kakaoToOwnServiceLogin(
    kakao: any,
  ): Promise<{ accessToken: string } | undefined> {
    // get user data from db
    const findUser = await this.usersService.findByFields({
      where: { kakaoId: kakao.id },
    });

    const user = findUser
      ? findUser
      : await this.usersService.createUserBy(kakao);

    const payload: Payload = {
      id: user.id,
      name: user.name,
      authorities: user.authorities,
    };

    const result = {
      accessToken: this.jwtService.sign(payload),
    };

    return result;
  }
}
