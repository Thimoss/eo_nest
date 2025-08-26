import { Module } from '@nestjs/common';
import { ItemJobSectionService } from './item-job-section.service';
import { ItemJobSectionController } from './item-job-section.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ItemJobSectionController],
  providers: [ItemJobSectionService],
})
export class ItemJobSectionModule {}
