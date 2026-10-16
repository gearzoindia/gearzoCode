import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export class AppError extends HttpException {
  readonly code: string;
  readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    statusCode: HttpStatus | number = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super(
      {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      statusCode,
    );
    this.code = code;
    this.details = details;
  }
}

export function validationError(details: unknown): AppError {
  return new AppError('VALIDATION_ERROR', 'Validation failed', HttpStatus.BAD_REQUEST, details);
}

export function otpInvalidOrExpired(): AppError {
  return new AppError('OTP_INVALID_OR_EXPIRED', 'Invalid or expired OTP', HttpStatus.BAD_REQUEST);
}

export function invalidCredentials(): AppError {
  return new AppError('INVALID_CREDENTIALS', 'Invalid credentials provided', HttpStatus.UNAUTHORIZED);
}

export function tokenExpired(): AppError {
  return new AppError('TOKEN_EXPIRED', 'Token has expired', HttpStatus.UNAUTHORIZED);
}

export function sessionRevoked(): AppError {
  return new AppError('SESSION_REVOKED', 'Session has been revoked', HttpStatus.UNAUTHORIZED);
}

export function sessionExpired(): AppError {
  return new AppError('SESSION_EXPIRED', 'Session has expired', HttpStatus.UNAUTHORIZED);
}

export function accountBlocked(): AppError {
  return new AppError('ACCOUNT_BLOCKED', 'Account has been blocked', HttpStatus.FORBIDDEN);
}

export function wrongApp(): AppError {
  return new AppError('WRONG_APP', 'Account not permitted for this application audience', HttpStatus.FORBIDDEN);
}

export function accountLocked(retryAfter?: number): AppError {
  return new AppError(
    'ACCOUNT_LOCKED',
    'Account is temporarily locked due to failed attempts',
    423,
    retryAfter !== undefined ? { retryAfter } : undefined,
  );
}

export function tooManyRequests(retryAfter?: number): AppError {
  return new AppError(
    'TOO_MANY_REQUESTS',
    'Too many requests, please slow down',
    HttpStatus.TOO_MANY_REQUESTS,
    retryAfter !== undefined ? { retryAfter } : undefined,
  );
}

export function notFound(resource = 'Resource'): AppError {
  return new AppError('NOT_FOUND', `${resource} not found`, HttpStatus.NOT_FOUND);
}

export function forbidden(message = 'Access denied'): AppError {
  return new AppError('FORBIDDEN', message, HttpStatus.FORBIDDEN);
}

export function conflict(message: string): AppError {
  return new AppError('CONFLICT', message, HttpStatus.CONFLICT);
}

export function bookingNotFound(): AppError {
  return new AppError('BOOKING_NOT_FOUND', 'Booking not found', HttpStatus.NOT_FOUND);
}

export function notServiceable(): AppError {
  return new AppError(
    'NOT_SERVICEABLE',
    'Requested location or service is not serviceable',
    HttpStatus.BAD_REQUEST,
  );
}

export function quoteExpired(): AppError {
  return new AppError('QUOTE_EXPIRED', 'Service quote has expired', HttpStatus.BAD_REQUEST);
}

export function offerTaken(): AppError {
  return new AppError(
    'OFFER_TAKEN',
    'Job offer has already been accepted by another mechanic',
    HttpStatus.CONFLICT,
  );
}

export function offerExpired(): AppError {
  return new AppError('OFFER_EXPIRED', 'Job offer has expired', HttpStatus.BAD_REQUEST);
}

export function duplicateEntry(field?: string): AppError {
  return new AppError(
    'DUPLICATE_ENTRY',
    field ? `Duplicate entry for ${field}` : 'A duplicate entry already exists',
    HttpStatus.CONFLICT,
  );
}

export function insufficientBalance(): AppError {
  return new AppError(
    'INSUFFICIENT_BALANCE',
    'Insufficient balance for this transaction',
    HttpStatus.BAD_REQUEST,
  );
}

export function paymentFailed(): AppError {
  return new AppError('PAYMENT_FAILED', 'Payment transaction failed', HttpStatus.BAD_REQUEST);
}
