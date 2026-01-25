import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QRCodeService } from './qrcode.service';
import { PDFService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [DocumentController],
  providers: [DocumentService, QRCodeService, PDFService],
})
export class DocumentModule {}
