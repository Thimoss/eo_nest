import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create')
  async register(@Body() data: CreateUserDto) {
    return await this.authService.create(data);
  }

  @Post('login')
  async login(@Body() data: LoginUserDto) {
    return await this.authService.login(data);
  }
}
