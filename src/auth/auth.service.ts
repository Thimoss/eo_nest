/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '@prisma/client';

export class LoginResponseDto {
  access_token: string;
  statusCode: number;
  message: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginData: LoginUserDto): Promise<LoginResponseDto> {
    const { email, password } = loginData;
    // Mencari user berdasarkan email
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    // Jika user tidak ditemukan atau password tidak cocok, lempar UnauthorizedException
    if (!user || !(await compare(password, user.password))) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      statusCode: 200,
      message: 'Login berhasil',
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(userId: number): Promise<any> {
    const getProfileDetail = await this.prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!getProfileDetail) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const { password, ...userWithoutPassword } = getProfileDetail;

    return {
      statusCode: 200,
      message: 'Profile details fetched successfully',
      data: userWithoutPassword,
    };
  }
}
