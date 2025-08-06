import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir requests desde otros dominios
  app.enableCors({
    origin: true, // Permitir cualquier origen para la API pública
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Referer'],
    credentials: false // No necesario para API pública
  });

  app.setGlobalPrefix('');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
