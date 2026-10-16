import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import pino from 'pino';

const logger = pino({
  name: 'HTTP',
  level: process.env.LOG_LEVEL || 'info',
});

const SENSITIVE_FIELDS = new Set([
  'password',
  'otp',
  'token',
  'refreshtoken',
  'code',
  'codehash',
  'secret',
  'currentpassword',
  'newpassword',
  'authorization',
  'accesstoken',
]);

function sanitize(data: unknown, depth = 0): unknown {
  if (depth > 5) return '[DEPTH_LIMIT]';
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const startTime = Date.now();
    const method = req?.method;
    const path = req?.originalUrl || req?.url;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = res?.statusCode ?? 200;

          logger.info(
            {
              method,
              path,
              statusCode,
              duration,
              body: sanitize(req?.body),
            },
            `${method} ${path} ${statusCode} - ${duration}ms`,
          );
        },
        error: (err: unknown) => {
          const duration = Date.now() - startTime;
          const statusCode =
            typeof err === 'object' && err !== null && 'status' in err
              ? (err as { status: number }).status
              : typeof err === 'object' && err !== null && 'statusCode' in err
                ? (err as { statusCode: number }).statusCode
                : 500;

          logger.warn(
            {
              method,
              path,
              statusCode,
              duration,
              body: sanitize(req?.body),
            },
            `${method} ${path} ${statusCode} - ${duration}ms`,
          );
        },
      }),
    );
  }
}
