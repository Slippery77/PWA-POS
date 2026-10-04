import { NestFactory } from '@nestjs/core';
import { ValidationPipe} from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // security header พื้นฐาน — CSP, X-Frame-Options, HSTS
  app.use(helmet());

  // บีบ response — รายงานยอดขายย้อนหลังจะเล็กลงมาก
  app.use(compression());

  // ถ้า deploy หลัง nginx หรือ Cloudflare ต้องเปิด
  // ไม่งั้น req.ip ได้ IP ของ proxy แล้ว audit log กับ rate limit พัง
  app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // ตัด field ที่ไม่มีใน DTO ทิ้ง
    forbidNonWhitelisted: true,   // ส่ง field แปลกปลอมมา = 400 ไม่ใช่เงียบ ๆ ตัดทิ้ง
    transform: true,              // แปลง string เป็น number/Date ตาม type ของ DTO
    transformOptions: { enableImplicitConversion: true },
  }));
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173').split(','),
    credentials: true,
  });
  app.enableShutdownHooks(); // ปิด connection pool ให้เรียบร้อยตอน restart
  await app.listen(config.get<number>('PORT') ?? 3000);
}
bootstrap();
