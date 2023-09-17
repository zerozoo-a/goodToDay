import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserAuthority } from 'src/entities/userAuthority.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { RoleType } from './role_type';
import { KakaoUser } from './kakao.user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuthority)
    private userAuthorityRepository: Repository<UserAuthority>,
  ) {}

  async createUserBy(kakao: KakaoUser): Promise<User | undefined> {
    const user = new User();

    if (kakao.id) user.kakaoId = `${kakao.id}`;
    if (!kakao.kakao_account.has_email)
      throw new HttpException('Kakao email is not provided', 416);

    user.email = kakao.kakao_account.email;
    user.name = kakao.kakao_account.profile.nickname;

    return await this.registerUser(user);
  }

  async findByFields(options: FindOneOptions<User>): Promise<User | undefined> {
    try {
      return await this.userRepository.findOne(options);
    } catch (err) {
      return undefined;
    }
  }

  async registerUser(user: User): Promise<User | undefined> {
    const savedUser = await this.save(user);

    await this.saveUserAuthority(savedUser.id);

    return savedUser;
  }

  async save(user: User): Promise<User | undefined> {
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
}
