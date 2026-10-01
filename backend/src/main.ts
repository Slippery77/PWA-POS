import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // ตัด field ที่ไม่มีใน DTO ทิ้ง
    forbidNonWhitelisted: true,   // ส่ง field แปลกปลอมมา = 400 ไม่ใช่เงียบ ๆ ตัดทิ้ง
    transform: true,              // แปลง string เป็น number/Date ตาม type ของ DTO
    transformOptions: { enableImplicitConversion: true },
  }));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173'.split(','),
    credentials: true,
  });
  app.enableShutdownHooks(); // ปิด connection pool ให้เรียบร้อยตอน restart
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
