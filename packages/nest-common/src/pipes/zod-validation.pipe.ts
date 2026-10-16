import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/app-error';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata?: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const zodError = result.error as ZodError;
      throw new AppError(
        'VALIDATION_ERROR',
        'Validation failed',
        HttpStatus.BAD_REQUEST,
        zodError.errors,
      );
    }

    return result.data;
  }
}
