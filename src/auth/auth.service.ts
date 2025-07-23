import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Register new user
   * @param data
   * @returns
   */
  async create(data: CreateUserDto) {
    const checkUserExists = await this.prisma.user.findFirst({
      where: { email: data.email },
    });

    if (checkUserExists) {
      throw new HttpException('User already registered', HttpStatus.FOUND);
    }
    const createUser = await this.prisma.user.create({
      data: data,
    });
    if (createUser) {
      return {
        statusCode: 200,
        message: 'Register Successfull',
      };
    }
  }
}
