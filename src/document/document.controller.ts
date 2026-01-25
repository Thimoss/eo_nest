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
  Res,
  HttpStatus,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { UpdateGeneralDocumentDto } from './dto/update-general-document.dto';
import { UpdatePercentageDto } from './dto/update-percentage.dto';
import { UpdateRecapitulationLocationDto } from './dto/update-recapitulation-location.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Response } from 'express';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    const user = req.user;
    return this.documentService.create(createDocumentDto, user.sub);
  }

  @Get('list')
  @UseGuards(AuthGuard)
  async findAll(
    @Query('sortBy') sortBy: string,
    @Query('scope') scope: string,
    @Query('limit') limit: string,
    @Request() req,
  ) {
    const user = req.user;
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.documentService.findAll(sortBy, user.sub, scope, parsedLimit);
  }

  @Get('detail/:slug')
  @UseGuards(AuthGuard)
  async findOne(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.findOne(slug, user.sub);
  }

  @Patch('update/:id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    const user = req.user;
    return this.documentService.update(+id, updateDocumentDto, user.sub);
  }

  @Patch('update/general-info/:slug')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  submitForCheck(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.submitForCheck(slug, user.sub);
  }

  @Patch('approve/check/:slug')
  @UseGuards(AuthGuard)
  approveCheck(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.approveCheck(slug, user.sub);
  }

  @Patch('approve/confirm/:slug')
  @UseGuards(AuthGuard)
  approveConfirm(@Param('slug') slug: string, @Request() req) {
    const user = req.user;
    return this.documentService.approveConfirm(slug, user.sub);
  }

  @Delete('delete/:id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.documentService.remove(+id, user.sub);
  }

  @Get('download-pdf/:slug')
  @UseGuards(AuthGuard)
  async downloadPDF(
    @Param('slug') slug: string,
    @Res() res: Response,
    @Request() req,
  ) {
    const user = req.user;
    const pdfBuffer = await this.documentService.generatePDF(slug, user.sub);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=document-${slug}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('verify/:slug')
  async verifyDocument(@Param('slug') slug: string) {
    return this.documentService.getPublicDocumentInfo(slug);
  }

  @Post('verify/:slug')
  async verifyDocumentPost(@Param('slug') slug: string) {
    return this.documentService.getPublicDocumentInfo(slug);
  }
}
