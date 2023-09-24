import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { Payload } from './security/jwt_payload.interface';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { KakaoLoginResponse } from './auth.type';

interface loginKakaoInfo {
  expiresInMillis: number;
  id: number;
  expires_in: number;
  app_id: number;
  appId: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async loginKakao(options: {
    code: string;
    domain: string;
  }): Promise<KakaoLoginResponse> {
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

    // get token from kakao oAuth service
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
      throw new UnauthorizedException(error.message);
    }
  }

  async logoutKakao(
    access_token: string,
    // body: { target_id_type: string; target_id: number },
  ) {
    console.log(
      '🚀 ~ file: auth.service.ts:83 ~ AuthService ~ access_token:',
      access_token,
    );
    // console.log('🚀 ~ file: auth.service.ts:83 ~ AuthService ~ body:', body);
    // const form = new FormData();
    // form.append('target_id', `${body.target_id}`);
    // form.append('target_id_type', body.target_id_type);

    try {
      const response = await axios.post(
        'https://kapi.kakao.com/v1/user/logout',
        {},
        {
          headers: {
            Authorization: access_token,
            'Content-Type': 'application/json',
          },
        },
      );
      return response;
    } catch (error) {
      throw new UnauthorizedException(error.message || error);
    }
  }

  async kakaoToOwnServiceLogin(
    kakao: KakaoLoginResponse,
  ): Promise<{ accessToken: string } | undefined> {
    // get user data from db
    const findUser = await this.usersService.findByFields({
      where: { kakaoId: kakao.userInfo.id },
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

  /**
   *
   * at의 유효성을 kakao server를 통해 확인합니다.
   *
   * @param access_token kakao로 부터 받은 client의 at
   */
  async loginKakaoInfo(access_token: string): Promise<loginKakaoInfo> {
    const access_token_info =
      'https://kapi.kakao.com/v1/user/access_token_info';
    const response = await axios.get<loginKakaoInfo>(access_token_info, {
      headers: {
        Authorization: `${access_token}`,
      },
    });

    return response.data;
  }
}
