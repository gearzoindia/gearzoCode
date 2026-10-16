import { addMinutes as dateFnsAddMinutes, addDays as dateFnsAddDays, format } from 'date-fns';

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +05:30 in milliseconds

/**
 * Converts a UTC Date into an Indian Standard Time Date representation.
 */
export function toIST(date: Date): Date {
  const utcMs = date.getTime();
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Formats a Date in Indian Standard Time (IST).
 * Default format is 'yyyy-MM-dd HH:mm:ss'.
 */
export function formatIST(date: Date, fmt = 'yyyy-MM-dd HH:mm:ss'): string {
  // Use Intl format with timeZone Asia/Kolkata to extract exact date parts
  const istDate = toIST(date);
  return format(istDate, fmt);
}

/**
 * Checks whether an expiration timestamp is in the past compared to now.
 */
export function isExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() <= Date.now();
}

/**
 * Adds minutes to a Date.
 */
export function addMinutes(date: Date, min: number): Date {
  return dateFnsAddMinutes(date, min);
}

/**
 * Adds days to a Date.
 */
export function addDays(date: Date, days: number): Date {
  return dateFnsAddDays(date, days);
}
