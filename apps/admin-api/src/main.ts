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

  // Global API Route Prefix
  app.setGlobalPrefix('v1');

  // CORS: Strictest scope - only admin portal origins + staging
  const allowedOrigins = [
    'https://admin.gearzo.in',
    'https://staging-admin.gearzo.in',
  ];

  if (env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3002');
  }

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-reauth-timestamp',
      'x-app-audience',
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
