import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/users.entity';
import { UserAuthority } from 'src/entities/userAuthority.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { RoleType } from './role_type';
// import { KakaoLoginResponse } from 'src/auth/auth.type';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/board/board.service';
import { CreateUserDto } from 'src/dto/CreateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(UserAuthority)
    private userAuthorityRepository: Repository<UserAuthority>,
    private jwtService: JwtService,
  ) {}

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

  async validateHouseToken(token: string): Promise<{
    status: boolean;
    data: { userId?: number; userName?: string };
    err?: any;
  }> {
    try {
      /** token 분석 */
      const decoded = this.jwtService.decode(token) as {
        [key: string]: any;
      };

      if (decoded.id === undefined && decoded.email !== undefined) {
        const { success, data, err } = await this.findByUserEmail(
          decoded.email,
        );
        if (success) decoded.id = data[0].id;
        else throw new HttpException({ message: err }, 500);
      }

      const userId: number | undefined = decoded.id;
      if (userId === undefined)
        return { status: false, data: undefined, err: 'userId is undefined' };

      return { status: true, data: { userId, ...decoded } };
    } catch (err) {
      return { status: false, data: undefined, err };
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

      return { success: true, data, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async findBy(prop: 'email' | 'id' | 'name', value: string): Promise<Result> {
    try {
      const data = await this.userRepository.query(
        `
      SELECT *
      FROM users
      WHERE ${prop}=?
      `,
        [value],
      );

      return { success: true, data, err: undefined };
    } catch (err) {
      return { success: false, data: undefined, err };
    }
  }

  async createHouseUser(createUserDto: CreateUserDto) {
    try {
      const data = await this.userRepository.query(
        `
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?);
        `,
        [createUserDto.email, createUserDto.password, createUserDto.name],
      );

      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        data: undefined,
        err: { ...err, message: '이미 존재하는 email입니다.' },
      };
    }
  }
}
