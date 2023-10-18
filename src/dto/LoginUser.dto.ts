import { IsEmail, IsInt, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  // @IsInt()
  // id: number;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
