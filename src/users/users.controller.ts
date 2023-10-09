import {
  Controller,
  Get,
  Res,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  @Get('/validateHouseToken')
  async validateHouseToken(@Headers('access_token') access_token, @Res() res) {
    if (!access_token) throw new UnauthorizedException();
    const isValid = await this.userService.validateHouseToken(access_token);

    if (isValid.status) {
    } else {
    }
  }
}
