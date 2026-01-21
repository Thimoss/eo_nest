import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
    'http://localhost:3000',
    'https://my.owner-estimate.web.id'
  ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metode HTTP yang diizinkan
    credentials: true, // Jika perlu mengizinkan cookies dan credentials
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use('/uploads', express.static('uploads'));
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
