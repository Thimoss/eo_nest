import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemJobSectionService } from './item-job-section.service';
import { CreateItemJobSectionDto } from './dto/create-item-job-section.dto';
import { UpdateItemJobSectionDto } from './dto/update-item-job-section.dto';

@Controller('item-job-section')
export class ItemJobSectionController {
  constructor(private readonly itemJobSectionService: ItemJobSectionService) {}

  @Post()
  create(@Body() createItemJobSectionDto: CreateItemJobSectionDto) {
    return this.itemJobSectionService.create(createItemJobSectionDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemJobSectionDto: UpdateItemJobSectionDto,
  ) {
    return this.itemJobSectionService.update(+id, updateItemJobSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemJobSectionService.remove(+id);
  }
}
