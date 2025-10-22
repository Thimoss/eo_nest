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
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('item')
@UseGuards(AuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post('create')
  async create(@Body() data: CreateItemDto) {
    return this.itemService.create(data);
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return await this.itemService.searchItems(keyword);
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
