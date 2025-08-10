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
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document } from '@prisma/client';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create')
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get('list')
  async findAll(@Query('sortBy') sortBy: string) {
    return this.documentService.findAll(sortBy);
  }

  @Get('detail/:slug')
  findOne(@Param('slug') slug: string) {
    return this.documentService.findOne(slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(+id);
  }
}
