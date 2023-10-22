import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  KakaoLoginResponse,
  LoginKakaoInfo,
  LogoutKakaoResponse,
} from './auth.type';
import { LoginUserDto } from 'src/dto/LoginUser.dto';
import { Result } from 'src/board/board.service';
import { genSalt, hash, compare } from 'bcrypt';
import { CreateUserDto } from 'src/dto/CreateUser.dto';

interface ErrorDto {
  path: string[];
  message: string;
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
    redirectURI: string;
  }): Promise<KakaoLoginResponse> {
    const { code, domain, redirectURI } = options;
    const kakaoRestApiKey = '8fc6587f15b62fcab9ddacd8950612df';
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const clientSecret = 'WEEfKIJ4n0MkplhfzQnRlXrujK9AhIjn';
    const body = {
      grant_type: 'authorization_code',
      client_id: kakaoRestApiKey,
      redirect_uri: `${domain}${redirectURI}`,
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

  async logoutKakao(access_token: string): Promise<LogoutKakaoResponse> {
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
      return { id: response.data.id, status: response.status, redirect: '/' };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  async createTokenWith<P extends object>(payload: P) {
    const accessToken = await this.jwtService.signAsync(payload);
    return accessToken;
  }

  async checkHouseToken(token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token);
      return {
        success: true,
        data: { result },
        err: undefined,
      };
    } catch (err) {
      return {
        success: false,
        data: undefined,
        err: { message: 'token expired' },
      };
    }
  }

  getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   *
   * at의 유효성을 kakao server를 통해 확인합니다.
   *
   * @param access_token kakao로 부터 받은 client의 at
   */
  async loginKakaoInfo(access_token: string): Promise<LoginKakaoInfo> {
    const access_token_info =
      'https://kapi.kakao.com/v1/user/access_token_info';
    const response = await axios.get<LoginKakaoInfo>(access_token_info, {
      headers: {
        Authorization: `${access_token}`,
      },
    });

    return response.data;
  }

  async loginHouseUser(loginUserDto: LoginUserDto): Promise<Result> {
    const existEmailUser = await this.usersService.findBy(
      'email',
      loginUserDto.email,
    );

    /** 유저를 찾지 못한 경우 에러 반환 */
    if (!existEmailUser.success) {
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [
            {
              path: ['email'],
              message: '오류: 계정을 찾지 못했습다.',
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

    const isCorrectPassword =
      (await compare(
        loginUserDto.password,
        existEmailUser.data[0].password_hash,
      )) || false;

    if (!isCorrectPassword)
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [
            {
              path: ['password'],
              message: '비밀번호를 확인해주세요.',
            },
          ],
        },
        404,
      );

    const token = await this.createTokenWith(existEmailUser.data[0]);

    return { success: true, data: token, err: undefined };
  }

  async createHouseUser(createUserDto: CreateUserDto) {
    const [existUserEmail, existUserName] = await Promise.all([
      this.usersService.findBy('email', createUserDto.email),
      this.usersService.findBy('name', createUserDto.name),
    ]);

    if (existUserName.data.length !== 0) {
      throw new HttpException(
        <Result<ErrorDto>>{
          success: false,
          data: undefined,
          err: [{ path: ['name'], message: '사용 할 수 없는 값입니다.' }],
        },
        409,
      );
    } else if (existUserEmail.data.length !== 0) {
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

    /** db에 hashing된 비밀번호로 저장 */
    const { success, data } = await this.usersService.createHouseUser(
      createUserDto,
    );

    if (success) {
      return { success: true, data, err: undefined };
    } else {
      data.message = 'An unknown error occurred.';
      return { success: false, data, err: undefined };
    }
  }
}
