import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import pino from 'pino';
import { AppError } from '../errors/app-error';

const logger = pino({
  name: 'GlobalExceptionFilter',
  level: process.env.LOG_LEVEL || 'info',
});

export interface ErrorResponsePayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'An unexpected error occurred. Please try again later.';
    let errorDetails: unknown = undefined;

    // 1. AppError (custom domain error)
    if (exception instanceof AppError) {
      statusCode = exception.getStatus();
      errorCode = exception.code;
      errorMessage = exception.message;
      errorDetails = exception.details;
    }
    // 2. Standard NestJS HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        errorCode =
          typeof resObj.code === 'string'
            ? resObj.code
            : this.getDefaultCodeForStatus(statusCode);
        errorMessage =
          typeof resObj.message === 'string'
            ? resObj.message
            : Array.isArray(resObj.message)
              ? resObj.message.join(', ')
              : exception.message;
        errorDetails = resObj.details;
      } else if (typeof res === 'string') {
        errorCode = this.getDefaultCodeForStatus(statusCode);
        errorMessage = res;
      } else {
        errorCode = this.getDefaultCodeForStatus(statusCode);
        errorMessage = exception.message;
      }
    }
    // 3. Prisma Client Errors
    else if (this.isPrismaError(exception)) {
      const prismaCode = (exception as { code: string }).code;

      if (prismaCode === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        errorCode = 'DUPLICATE_ENTRY';
        errorMessage = 'A record with this identifier already exists.';
      } else if (prismaCode === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        errorCode = 'NOT_FOUND';
        errorMessage = 'Requested record was not found.';
      } else if (prismaCode === 'P2003') {
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'FOREIGN_KEY_VIOLATION';
        errorMessage = 'Referenced related record does not exist or foreign key constraint failed.';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = 'DATABASE_ERROR';
        errorMessage = 'A database operation error occurred.';
      }
    }
    // 4. Other generic unhandled exceptions
    else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      errorMessage = 'An internal server error occurred. Please try again later.';
    }

    // Structured logging with pino (full details logged internally, never leaked to client)
    logger.error(
      {
        err: exception,
        statusCode,
        errorCode,
        path: request?.originalUrl || request?.url,
        method: request?.method,
      },
      'Unhandled exception intercepted',
    );

    const payload: ErrorResponsePayload = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        ...(errorDetails !== undefined ? { details: errorDetails } : {}),
      },
    };

    response.status(statusCode).json(payload);
  }

  private isPrismaError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const err = error as Record<string, unknown>;
    return (
      typeof err.code === 'string' &&
      err.code.startsWith('P') &&
      typeof err.name === 'string' &&
      err.name.includes('Prisma')
    );
  }

  private getDefaultCodeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
