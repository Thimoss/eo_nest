import { Module } from '@nestjs/common';
import { JobSectionService } from './job-section.service';
import { JobSectionController } from './job-section.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobSectionController],
  providers: [JobSectionService],
})
export class JobSectionModule {}
