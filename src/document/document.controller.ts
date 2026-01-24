/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

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
  Request,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { UpdateRecapitulationLocationDto } from './dto/update-recapitulation-location.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create')
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    const user = req.user;
    return this.documentService.create(createDocumentDto, user.sub);
  }

  @Get('list')
  async findAll(
    @Query('sortBy') sortBy: string,
    @Query('scope') scope: string,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.findAll(sortBy, user.sub, scope);
  }

  @Get('detail/:slug')
  async findOne(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.findOne(slug, user.sub);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.update(+id, updateDocumentDto, user.sub);
  }

  @Patch('update/general-info/:slug')
  updateGeneralInfo(
    @Param('slug') slug: string,
    @Body() updateGeneralDocument: UpdateGeneralDocumentDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.updateGeneralInfo(
      slug,
      updateGeneralDocument,
      user.sub,
    );
  }

  @Patch('update/percentage/:slug')
  updatePercentageProject(
    @Param('slug') slug: string,
    @Body() updatePercentageDto: UpdatePercentageDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.updatePercentage(
      slug,
      updatePercentageDto,
      user.sub,
    );
  }

  @Patch('update/recapitulation-location/:slug')
  updateRecapitulationLocation(
    @Param('slug') slug: string,
    @Body()
    updateRecapitulationLocationDto: UpdateRecapitulationLocationDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.updateRecapitulationLocation(
      slug,
      updateRecapitulationLocationDto,
      user.sub,
    );
  }

  @Patch('submit/:slug')
  submitForCheck(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.submitForCheck(slug, user.sub);
  }

  @Patch('approve/check/:slug')
  approveCheck(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.approveCheck(slug, user.sub);
  }

  @Patch('approve/confirm/:slug')
  approveConfirm(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.approveConfirm(slug, user.sub);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.documentService.remove(+id, user.sub);
  }
}
