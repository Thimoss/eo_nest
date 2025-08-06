import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('create')
  async create(@Body() data: CreateItemDto) {
    return this.itemService.create(data);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() data: UpdateItemDto) {
    return this.itemService.update(+id, data);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
