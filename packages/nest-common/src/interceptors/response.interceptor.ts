import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginatedMeta } from '../dto/pagination.dto';

export interface StandardSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginatedMeta;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardSuccessResponse<unknown>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardSuccessResponse<unknown>> {
    return next.handle().pipe(
      map((response: unknown) => {
        // If response is already formatted as { success: true, ... }, return as-is
        if (
          typeof response === 'object' &&
          response !== null &&
          'success' in response &&
          (response as Record<string, unknown>).success === true
        ) {
          return response as StandardSuccessResponse<unknown>;
        }

        // If response has paginated { items, meta }
        if (
          typeof response === 'object' &&
          response !== null &&
          'items' in response &&
          'meta' in response
        ) {
          const { items, meta } = response as { items: unknown; meta: PaginatedMeta };
          return {
            success: true,
            data: items,
            meta,
          };
        }

        // If response has { data, meta }
        if (
          typeof response === 'object' &&
          response !== null &&
          'data' in response &&
          'meta' in response
        ) {
          const { data, meta } = response as { data: unknown; meta: PaginatedMeta };
          return {
            success: true,
            data,
            meta,
          };
        }

        // Default wrapping for standard responses
        return {
          success: true,
          data: response ?? null,
        };
      }),
    );
  }
}
