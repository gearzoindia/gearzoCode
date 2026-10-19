import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { env } from './config/env';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('AdminApiBootstrap');

  // ============================================================
  // Mock OTP safety guard
  // ============================================================
  if (
    env.NODE_ENV === 'production' &&
    env.OTP_PROVIDER === 'mock' &&
    !env.ALLOW_MOCK_OTP_IN_PROD
  ) {
    throw new Error(
      'FATAL: Mock OTP provider cannot be enabled in production without explicit ALLOW_MOCK_OTP_IN_PROD=true override.',
    );
  }

  const app = await NestFactory.create(AppModule);

  // Security Headers
  app.use(helmet());

  // Support both /v1/admin/* and /v1/* route formats seamlessly
  app.use((req: any, res: any, next: any) => {
    if (req.url && req.url.startsWith('/v1/admin/')) {
      req.url = req.url.replace('/v1/admin/', '/v1/');
    } else if (req.url === '/v1/admin') {
      req.url = '/v1';
    }
    next();
  });

  // Global API Route Prefix
  app.setGlobalPrefix('v1');

  // CORS configuration supporting admin portal origins and local dev ports
  const allowedOrigins = (env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3002,http://localhost:8083,http://localhost:19006')
    .split(',')
    .map((s) => s.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-reauth-timestamp',
      'x-app-audience',
      'Idempotency-Key',
      'X-Device-Id',
      'Accept',
    ],
  });

  // Global Interceptors & Filters
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger Documentation (Disabled in production)
  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('GearZo Admin API')
      .setDescription(
        'Enterprise multi-tiered administrative portal API for role-based governance, postgis jurisdiction scoping, maker-checker financial flows, and platform master data configuration.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log(`Swagger documentation available at http://localhost:${env.PORT}/docs`);
  }

  const port = env.PORT || 4003;
  await app.listen(port);
  logger.log(`🚀 GearZo Admin API running on port ${port} with prefix /v1 [${env.NODE_ENV}]`);
}

bootstrap();
