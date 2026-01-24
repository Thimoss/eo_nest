import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const adminExists = await this.prisma.user.findFirst({
      where: { role: UserRole.ADMIN, deletedAt: null },
    });

    if (!adminExists) {
      const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
      if (!adminPassword) {
        throw new HttpException(
          'USER_DEFAULT_PASSWORD is not set in environment variables',
          HttpStatus.INTERNAL_SERVER_ERROR, // Internal Server Error karena konfigurasi yang hilang
        );
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await this.prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin Default',
          phoneNumber: '1234567890',
          position: 'Administrator',
          role: UserRole.ADMIN,
        },
      });
    }
  }

  /**
   *
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    const { name, email, phoneNumber, position } = createUserDto;

    const checkEmailExist = await this.prisma.user.findUnique({
      where: { email },
    });

    if (checkEmailExist) {
      throw new HttpException('Email already registered', HttpStatus.FOUND);
    }

    const checkPhoneNumberExist = await this.prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (checkPhoneNumberExist) {
      throw new HttpException(
        'Phone number already registered',
        HttpStatus.FOUND,
      );
    }

    const userDefaultPassword = process.env.USER_DEFAULT_PASSWORD;
    if (!userDefaultPassword) {
      throw new HttpException(
        'USER_DEFAULT_PASSWORD is not set in environment variables',
        HttpStatus.INTERNAL_SERVER_ERROR, // Internal Server Error karena konfigurasi yang hilang
      );
    }

    const hashedPassword = await bcrypt.hash(userDefaultPassword, 10);

    const createUser = await this.prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        position,
        password: hashedPassword,
        role: 'USER',
      },
    });

    if (createUser) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = createUser;
      return {
        statusCode: 200,
        message: 'User has been successfully created',
        data: userWithoutPassword,
      };
    }
  }

  /**
   *
   * @param filter
   * @returns
   */
  async findAll(filter: { name?: string; page?: number; pageSize?: number }) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const users = await this.prisma.user.findMany({
      where: {
        role: 'USER',
        deletedAt: null,
        name: filter.name
          ? { contains: filter.name, mode: 'insensitive' }
          : undefined,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
    });

    const totalCount = await this.prisma.user.count({
      where: {
        role: 'USER',
        deletedAt: null,
        name: filter.name
          ? { contains: filter.name, mode: 'insensitive' }
          : undefined,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    return {
      statusCode: 200,
      message: 'User list retrieved successfully',
      data: {
        list: usersWithoutPassword,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      },
    };
  }

  /**
   *
   * @param userId
   * @returns
   */
  async resetPassword(userId: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.role !== UserRole.USER) {
      throw new HttpException(
        'You can only reset users with user roles',
        HttpStatus.FORBIDDEN, // Menggunakan Forbidden karena hanya USER yang boleh di-reset
      );
    }

    const userDefaultPassword = process.env.USER_DEFAULT_PASSWORD;
    if (!userDefaultPassword) {
      throw new HttpException(
        'USER_DEFAULT_PASSWORD is not set in environment variables',
        HttpStatus.INTERNAL_SERVER_ERROR, // Internal Server Error karena konfigurasi yang hilang
      );
    }

    const hashedPassword = await bcrypt.hash(userDefaultPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      statusCode: 200,
      message: 'Password successfully reset',
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  /**
   *
   * @param id
   * @param updateUserDto
   * @returns
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (emailExists) {
        throw new Error('Email already in use');
      }
    }

    if (
      updateUserDto.phoneNumber &&
      updateUserDto.phoneNumber !== user.phoneNumber
    ) {
      const phoneNumberExists = await this.prisma.user.findFirst({
        where: { phoneNumber: updateUserDto.phoneNumber },
      });
      if (phoneNumberExists) {
        throw new Error('Phone number already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: id },
      data: {
        name: updateUserDto.name || user.name,
        email: updateUserDto.email || user.email,
        phoneNumber: updateUserDto.phoneNumber || user.phoneNumber,
        position: updateUserDto.position || user.position,
      },
    });
    return {
      statusCode: 200,
      message: 'Update Successful',
      data: updatedUser,
    };
  }

  /**
   *
   * @param userId
   * @param updateUserDto
   * @returns
   */
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmNewPassword } = changePasswordDto;

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newPassword !== confirmNewPassword) {
      throw new HttpException(
        'New password and confirmation do not match',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    return {
      statusCode: 200,
      message: 'Password successfully reset',
    };
  }

  /**
   *
   * @param id
   * @returns
   */
  async remove(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id: id, deletedAt: null },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: 'User deleted successfully',
    };
  }
}
