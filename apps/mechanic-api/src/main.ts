import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const env = process.env;

  // Mock OTP safety guard
  if (env.OTP_PROVIDER === 'mock' && env.NODE_ENV === 'production' && env.ALLOW_MOCK_OTP_IN_PROD !== 'true') {
    throw new Error('FATAL: OTP_PROVIDER=mock is not allowed in production. Set ALLOW_MOCK_OTP_IN_PROD=true to override.');
  }
  if (env.OTP_PROVIDER === 'mock') {
    Logger.warn('⚠️  Mock OTP provider is active. OTPs will not be sent.', 'Bootstrap');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (env.CORS_ORIGINS || 'https://mechanic.gearzo.in,http://localhost:3000,http://localhost:8081,http://localhost:8082')
      .split(',')
      .map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Device-Id'],
  });

  app.setGlobalPrefix('v1');

  const port = parseInt(env.PORT || '4002', 10);
  await app.listen(port);
  Logger.log(`🚀 mechanic-api running on http://localhost:${port}/v1`, 'Bootstrap');
}
bootstrap();
