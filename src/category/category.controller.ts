import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async create(@Body() data: CreateCategoryDto) {
    return this.categoryService.create(data);
  }

  @Get('list')
  async findAll(
    @Query('name') name: string,
    @Query('page') page: string = '1', // Default to page 1
    @Query('pageSize') pageSize: string = '10',
  ) {
    return this.categoryService.findAll({
      name,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateCategoryDto) {
    return this.categoryService.update(+id, data);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
