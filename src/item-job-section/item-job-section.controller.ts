import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ItemJobSectionService } from './item-job-section.service';
import { CreateItemJobSectionDto } from './dto/create-item-job-section.dto';
import { UpdateItemJobSectionDto } from './dto/update-item-job-section.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('item-job-section')
@UseGuards(AuthGuard)
export class ItemJobSectionController {
  constructor(private readonly itemJobSectionService: ItemJobSectionService) {}

  @Post('create')
  create(@Body() createItemJobSectionDto: CreateItemJobSectionDto) {
    return this.itemJobSectionService.create(createItemJobSectionDto);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateItemJobSectionDto: UpdateItemJobSectionDto,
  ) {
    return this.itemJobSectionService.update(+id, updateItemJobSectionDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.itemJobSectionService.remove(+id);
  }
}
