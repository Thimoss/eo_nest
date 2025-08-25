import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { SectorModule } from './sector/sector.module';
import { ItemModule } from './item/item.module';
import { DocumentModule } from './document/document.module';
import { JobSectionModule } from './job-section/job-section.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    CategoryModule,
    SectorModule,
    ItemModule,
    DocumentModule,
    JobSectionModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
