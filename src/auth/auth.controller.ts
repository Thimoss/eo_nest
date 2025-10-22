/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginUserDto) {
    return await this.authService.signIn(loginData);
  }

  @UseGuards(AuthGuard) // Menambahkan JWT Guard untuk memastikan hanya pengguna yang terautentikasi yang bisa mengakses
  @Get('profile')
  async getProfile(@Request() req) {
    const user = req.user;
    return await this.authService.getProfile(user.id);
  }
}
