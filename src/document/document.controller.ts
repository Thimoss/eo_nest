import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { UpdateDocumentApprovalDto } from './dto/update-document-approval.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('document')
@UseGuards(AuthGuard)
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

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentService.update(+id, updateDocumentDto);
  }

  @Patch('update/general-info/:slug')
  updateGeneralInfo(
    @Param('slug') slug: string,
    @Body() updateGeneralDocument: UpdateGeneralDocumentDto,
  ) {
    return this.documentService.updateGeneralInfo(slug, updateGeneralDocument);
  }

  @Patch('update/percentage/:slug')
  updatePercentageProject(
    @Param('slug') slug: string,
    @Body() updatePercentageDto: UpdatePercentageDto,
  ) {
    return this.documentService.updatePercentage(slug, updatePercentageDto);
  }

  @Patch('update/approval/:slug')
  updateApproval(
    @Param('slug') slug: string,
    @Body() updateDocumentApproval: UpdateDocumentApprovalDto,
  ) {
    return this.documentService.updateApproval(slug, updateDocumentApproval);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(+id);
  }
}
