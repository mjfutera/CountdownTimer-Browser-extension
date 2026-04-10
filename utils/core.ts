export interface TimerBreakdown {
  days: number;
  hours: number;
  minutes: number;
}

export const MAX_TIMERS = 12;
export const MAX_TITLE_LENGTH = 20;
export const MAX_DESCRIPTION_LENGTH = 100;
export const TIMER_SCHEMA_VERSION = 1;

export function convertTimestampToDaysHoursMinutes(
  timestamp: number,
  showTime: boolean
): TimerBreakdown {
  const oneDay = 24 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const oneMinute = 60 * 1000;
  let days = Math.floor(timestamp / oneDay);
  if (!showTime) {
    days = days + 1;
  }
  const hours = Math.floor((timestamp % oneDay) / oneHour);
  const minutes = Math.floor((timestamp % oneHour) / oneMinute);
  return { days, hours, minutes };
}

export function calculateProgress(
  startTimestamp: number,
  endTimestamp: number,
  currentTimestamp: number
): number {
  const totalDuration = endTimestamp - startTimestamp;
  const elapsedDuration = currentTimestamp - startTimestamp;
  if (totalDuration <= 0 || elapsedDuration <= 0) {
    return 0;
  }
  const progressPercentage = (elapsedDuration / totalDuration) * 100;
  return Math.min(100, progressPercentage);
}

export function isValidUrl(url: string): boolean {
  return url.trim() !== "" && /^(https?:\/\/)([\w-]+(\.[\w-]+)+)\/?([^\s]*)?$/.test(url);
}

export function setDataFormat(fieldType: string, timestamp?: number): string {
  const date = timestamp ? new Date(timestamp) : new Date();
  const localIso = toLocalISOString(date);
  if (!localIso) {
    return "";
  }
  if (fieldType === "datetime-local") {
    return localIso.slice(0, 16);
  }
  if (fieldType === "date") {
    return localIso.slice(0, 10);
  }
  return "";
}

export function toLocalISOString(date: Date): string | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString();
}

export function pluralize(value: number, singular: string, plural: string): string {
  return value < 2 ? singular : plural;
}

export function getNumberOfDaysInMonth(month: number, year: number): number {
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonths[month - 1] + (isLeapYear && month === 2 ? 1 : 0);
}

export function getRandomIndex<T>(array: T[]): number {
  return Math.floor(Math.random() * array.length);
}
