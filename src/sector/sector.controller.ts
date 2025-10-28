import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Controller('sector')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post('create')
  async create(@Body() data: CreateSectorDto) {
    return this.sectorService.create(data);
  }

  @Get()
  findAll() {
    return this.sectorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectorService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() data: UpdateSectorDto) {
    return this.sectorService.update(+id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.sectorService.remove(+id);
  }
}
