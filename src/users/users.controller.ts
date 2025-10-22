import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('list')
  async findAll(
    @Query('name') name: string,
    @Query('page') page: string = '1', // Default to page 1
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.usersService.findAll({
      name,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Patch('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(+id, changePasswordDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch('reset-password/:id')
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(+id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete('remove/:id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
