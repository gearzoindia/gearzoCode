import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const uuidParam = z.string().uuid('Invalid UUID');

export const latLngSchema = z.object({
  lat: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime({ message: 'Must be a valid ISO-8601 UTC datetime' }),
  to: z.string().datetime({ message: 'Must be a valid ISO-8601 UTC datetime' }),
});

export const moneySchema = z.number().int().nonnegative('Amount in paise must be non-negative');

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type LatLng = z.infer<typeof latLngSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
