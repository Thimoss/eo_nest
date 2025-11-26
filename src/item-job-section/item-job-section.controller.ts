/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
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
  create(
    @Body() createItemJobSectionDto: CreateItemJobSectionDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.itemJobSectionService.create(createItemJobSectionDto, userId);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateItemJobSectionDto: UpdateItemJobSectionDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.itemJobSectionService.update(
      +id,
      updateItemJobSectionDto,
      userId,
    );
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.itemJobSectionService.remove(+id, userId);
  }
}
