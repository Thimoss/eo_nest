import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryResolver } from './category/category.resolver';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [UsersModule, AuthModule, PrismaModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CategoryResolver],
})
export class AppModule {}
