import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { JwtStrategy } from './security/passport.jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuthority } from 'src/entities/userAuthority.entity';
import { Users } from 'src/entities/users.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '5s' },
      }),
    }),
    PassportModule,
    UsersModule,
    TypeOrmModule.forFeature([Users, UserAuthority]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy],
})
export class AuthModule {}
