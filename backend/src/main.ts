import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
    credentials: true,
  });
  
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(8000);
  console.log('🚀 Backend running on http://localhost:8000');
}
bootstrap();