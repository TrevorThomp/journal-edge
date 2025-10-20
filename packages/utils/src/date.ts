import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

/**
 * Format date to display string
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Get all days in a month
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  return eachDayOfInterval({ start, end });
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get day of week from date (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj.getDay();
}

/**
 * Get day name from day number
 */
export function getDayName(dayNumber: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayNumber];
}

/**
 * Get hour from datetime string
 */
export function getHourFromDateTime(datetime: string): number {
  return parseISO(datetime).getHours();
}
