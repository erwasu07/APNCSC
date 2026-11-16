import type { SarkariItem } from '../data/sarkariData';
import { getNowInAsiaKolkata, parseDateToKolkataMs } from './sarkariStatus';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Returns true if the post's closing deadline (applyEnd || lastDate) passed more than `days` (default 90) ago
 * in Asia/Kolkata time.
 */
export function isStaleOver90Days(
  item: SarkariItem,
  customNow?: Date,
  days = 90
): boolean {
  const closingRaw = item.applyEnd || item.lastDate;
  if (!closingRaw) return false;
  const endParsed = parseDateToKolkataMs(closingRaw, item.closingTime, true);
  if (!endParsed) return false;
  const { nowMs } = getNowInAsiaKolkata(customNow);
  return nowMs - endParsed.timestampMs > days * DAY_MS;
}

/**
 * Returns true if a notice is older than 12 months (365 days) based on its postDate/documentDate/lastDate.
 * Used to move 12+ month notices off active feeds onto /archive while keeping live URLs accessible.
 */
export function isOlderThan12Months(
  item: SarkariItem,
  customNow?: Date,
  days = 365
): boolean {
  const dateRaw = item.postDate || item.documentDate || item.lastDate;
  if (!dateRaw) return false;
  const parsed = parseDateToKolkataMs(dateRaw, undefined, true);
  if (!parsed) return false;
  const { nowMs } = getNowInAsiaKolkata(customNow);
  return nowMs - parsed.timestampMs > days * DAY_MS;
}

/**
 * Computes exact whole days elapsed since lastDate/applyEnd (returns null if no valid past date).
 */
export function getDaysSinceClosing(
  item: SarkariItem,
  customNow?: Date
): number | null {
  const closingRaw = item.applyEnd || item.lastDate;
  if (!closingRaw) return null;
  const endParsed = parseDateToKolkataMs(closingRaw, item.closingTime, true);
  if (!endParsed) return null;
  const { nowMs } = getNowInAsiaKolkata(customNow);
  if (nowMs <= endParsed.timestampMs) return null;
  return Math.floor((nowMs - endParsed.timestampMs) / DAY_MS);
}
