import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // Validate env
  const env = process.env;

  // Mock OTP safety guard
  if (env.OTP_PROVIDER === 'mock' && env.NODE_ENV === 'production' && env.ALLOW_MOCK_OTP_IN_PROD !== 'true') {
    throw new Error('FATAL: OTP_PROVIDER=mock is not allowed in production. Set ALLOW_MOCK_OTP_IN_PROD=true to override.');
  }
  if (env.OTP_PROVIDER === 'mock') {
    Logger.warn('⚠️  Mock OTP provider is active. OTPs will not be sent.', 'Bootstrap');
  }

  const app = await NestFactory.create(AppModule);

  app.use((req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace('/api/v1/', '/v1/');
    } else if (req.url === '/api/v1') {
      req.url = '/v1';
    }
    next();
  });

  const allowedOrigins = (env.ALLOWED_ORIGINS || env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8081,http://localhost:19006')
    .split(',')
    .map((s) => s.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Device-Id', 'Accept'],
  });

  const prefix = env.API_PREFIX?.replace(/^\//, '') || 'v1';
  app.setGlobalPrefix(prefix);

  const port = parseInt(env.PORT || '4001', 10);
  await app.listen(port);
  Logger.log(`🚀 customer-api running on http://localhost:${port}/${prefix}`, 'Bootstrap');
}
bootstrap();
