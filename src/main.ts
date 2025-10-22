import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.5:3000',
      'https://xtjrxg9t-3000.asse.devtunnels.ms',
    ], // Ganti dengan URL frontend kamu
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metode HTTP yang diizinkan
    credentials: true, // Jika perlu mengizinkan cookies dan credentials
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
