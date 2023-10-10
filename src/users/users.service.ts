import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { UserAuthority } from 'src/entities/userAuthority.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { RoleType } from './role_type';
import { KakaoLoginResponse } from 'src/auth/auth.type';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/board/board.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UserAuthority)
    private userAuthorityRepository: Repository<UserAuthority>,
    private jwtService: JwtService,
  ) {}

  async createUserWithKakao(
    kakao: KakaoLoginResponse,
  ): Promise<Users | undefined> {
    const user = new Users();

    if (kakao.userInfo.id) user.kakaoId = kakao.userInfo.id;
    if (!kakao.userInfo.kakao_account.email)
      throw new HttpException('Kakao email is not provided', 416);

    user.email = kakao.userInfo.kakao_account.email;
    user.name = kakao.userInfo.kakao_account.profile.nickname;
    user.kakao_target_id_type = 'user_id';

    return await this.registerUser(user);
  }

  async findByFields(
    options: FindOneOptions<Users>,
  ): Promise<Users | undefined> {
    try {
      return await this.userRepository.findOne(options);
    } catch (err) {
      return undefined;
    }
  }

  async registerUser(user: Users): Promise<Users | undefined> {
    const savedUser = await this.save(user);

    await this.saveUserAuthority(savedUser.id);

    return savedUser;
  }

  async save(user: Users): Promise<Users | undefined> {
    const newUser = await this.userRepository.save(user);
    return newUser;
  }

  async saveUserAuthority(id: number): Promise<UserAuthority | undefined> {
    try {
      const userAuthority = new UserAuthority();
      userAuthority.id = id;
      userAuthority.authorityName = RoleType.USER;

      return await this.userAuthorityRepository.save(userAuthority);
    } catch (err) {
      throw new HttpException(
        'user authority error' + id,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateHouseToken(
    token: string,
  ): Promise<{ status: boolean; userId?: number; err?: any }> {
    try {
      await this.jwtService.verifyAsync(token);

      /** token 분석 */
      const decoded = this.jwtService.decode(token) as {
        [key: string]: any;
      };

      const userId: number | undefined = decoded.id;
      if (userId === undefined)
        return { status: false, err: 'userId is undefined' };

      /** user 정보 가져오기 */
      await this.findByUserId(userId);

      return { status: true, userId };
    } catch (err) {
      return { status: false, userId: undefined, err };
    }
  }

  async findByUserId(
    userId: number,
  ): Promise<{ status: boolean; data?: any; err?: any } | undefined> {
    try {
      const response = await this.userAuthorityRepository.query(
        'SELECT * FROM users WHERE id=?',
        [userId],
      );
      return { status: false, data: response };
    } catch (err) {
      return { status: false, data: undefined, err };
    }
  }

  async findByUserEmail(email: string): Promise<Result> {
    try {
      const data = await this.userRepository.query(
        `
      SELECT *
      FROM users
      WHERE email=?
      `,
        [email],
      );

      return { success: true, data };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async findBy(prop: 'nickname' | 'email', value: string): Promise<Result> {
    try {
      const data = await this.userRepository.query(
        `
      SELECT *
      FROM users
      WHERE ${prop}=?
      `,
        [value],
      );

      return { success: true, data };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }
}
