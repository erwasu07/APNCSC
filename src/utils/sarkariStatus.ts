import { SarkariItem, NoticeStage, VerificationStatus, ApplicationStatus } from '../data/sarkariData';

export interface ComputedSarkariStatus {
  applicationStatus: ApplicationStatus;
  stage: NoticeStage;
  verificationStatus: VerificationStatus;
  badgeLabel: string;
  badgeTone: 'emerald' | 'amber' | 'slate' | 'rose' | 'blue';
  canApplyOnline: boolean;
  isClosingSoon: boolean;
  closingTimeNote?: string;
  timeRemainingText?: string;
  daysRemaining: number | null;
  officialNotificationUrl?: string;
  officialApplicationUrl?: string;
}

export type SarkariStatusResult = ComputedSarkariStatus;

/**
 * Returns the current date and time normalized to Asia/Kolkata (IST).
 */
export function getNowInAsiaKolkata(customDate?: Date): {
  nowDate: Date;
  nowMs: number;
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const target = customDate || new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(target);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '10', 10);
  const day = parseInt(partMap.day || '30', 10);
  const hours = parseInt(partMap.hour || '0', 10);
  const minutes = parseInt(partMap.minute || '0', 10);
  const seconds = parseInt(partMap.second || '0', 10);

  // UTC equivalent representation of the IST moment
  const nowMs = Date.UTC(year, month - 1, day, hours, minutes, seconds);

  return {
    nowDate: target,
    nowMs,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
  };
}

/**
 * Parses time strings like "23:00 IST", "17:00", "5:00 PM", "23:59" into hours (0-23) and minutes (0-59).
 */
export function parseTimeString(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim().toLowerCase();

  // 12-hour format: "11:59 pm", "5:00 pm"
  const m12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = m12[2] ? parseInt(m12[2], 10) : 0;
    const meridian = m12[3].toLowerCase();
    if (meridian === 'pm' && h < 12) h += 12;
    if (meridian === 'am' && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

  // 24-hour format: "23:00", "23:59:59", "17:00 ist"
  const m24 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const m = parseInt(m24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { hours: h, minutes: m };
    }
  }

  return null;
}

/**
 * Extracts the first DD/MM/YYYY or DD-MM-YYYY pattern from a string.
 */
export function extractDatePattern(str?: string): { day: number; month: number; year: number } | null {
  if (!str || typeof str !== 'string') return null;

  // Search for DD/MM/YYYY or DD-MM-YYYY
  const match = str.match(/(\b\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) {
    return null;
  }

  return { day, month, year };
}

/**
 * Parses an explicit date string and optional time string into UTC epoch milliseconds
 * corresponding to Asia/Kolkata (IST).
 *
 * If endOfDayDefault is true and no time is provided, defaults to 23:59:59.999 IST.
 * If endOfDayDefault is false and no time is provided, defaults to 00:00:00.000 IST.
 */
export function parseDateToKolkataMs(
  dateStr?: string,
  timeStr?: string,
  endOfDayDefault = false
): { timestampMs: number; isTimeExplicit: boolean } | null {
  const d = extractDatePattern(dateStr);
  if (!d) return null;

  const explicitTime = parseTimeString(timeStr);
  const isTimeExplicit = explicitTime !== null;

  const hours = explicitTime ? explicitTime.hours : endOfDayDefault ? 23 : 0;
  const minutes = explicitTime ? explicitTime.minutes : endOfDayDefault ? 59 : 0;
  const seconds = explicitTime ? 0 : endOfDayDefault ? 59 : 0;
  const ms = explicitTime ? 0 : endOfDayDefault ? 999 : 0;

  const timestampMs = Date.UTC(d.year, d.month - 1, d.day, hours, minutes, seconds, ms);
  return { timestampMs, isTimeExplicit };
}

/**
 * Infers the Notice Stage from categories, titles, and explicit attributes.
 */
export function inferNoticeStage(item: SarkariItem): NoticeStage {
  if (item.stage) return item.stage;

  if (item.category === 'results') return 'result';
  if (item.category === 'answer_keys') return 'answer_key';
  if (item.category === 'admit_cards') return 'admit_card';
  if (item.category === 'syllabus') return 'examination';
  if (item.category === 'exam_forms') return 'exam_form';
  if (item.category === 'admissions') return 'admission';

  const titleUpper = item.title.toUpperCase();
  if (titleUpper.includes('ADMIT CARD') || titleUpper.includes('HALL TICKET') || titleUpper.includes('CITY SLIP') || titleUpper.includes('CITY INTIMATION')) {
    return 'admit_card';
  }
  if (titleUpper.includes('RESULT') || titleUpper.includes('MERIT LIST') || titleUpper.includes('SCORECARD') || titleUpper.includes('SELECTION LIST')) {
    return 'result';
  }
  if (titleUpper.includes('ANSWER KEY') || titleUpper.includes('RESPONSE SHEET')) {
    return 'answer_key';
  }
  if (titleUpper.includes('CORRECTION WINDOW') || titleUpper.includes('EDIT WINDOW')) {
    return 'correction';
  }
  if (titleUpper.includes('EXAM FORM') || titleUpper.includes('EXAMINATION FORM')) {
    return 'exam_form';
  }
  if (titleUpper.includes('ADMISSION') || titleUpper.includes('COUNSELLING') || titleUpper.includes('SPOT ROUND')) {
    return 'admission';
  }
  if (titleUpper.includes('DATE SHEET') || titleUpper.includes('EXAM SCHEDULE')) {
    return 'examination';
  }

  return 'recruitment';
}

/**
 * Authoritative status computation for any SarkariItem using Asia/Kolkata time.
 */
export function computeSarkariStatus(item: SarkariItem, customNow?: Date): ComputedSarkariStatus {
  const stage = inferNoticeStage(item);
  const verificationStatus: VerificationStatus =
    item.verification?.verificationStatus || item.verificationStatus || 'verified';

  // Direct URLs
  const officialNotificationUrl =
    item.verification?.officialNotificationUrl ||
    item.officialNotificationUrl ||
    (item.officialLink && /\.pdf($|\?)/i.test(item.officialLink) ? item.officialLink : undefined);

  const officialApplicationUrl =
    item.verification?.officialApplicationUrl ||
    item.officialApplicationUrl ||
    item.officialLink;

  // 1. Explicit Cancellation
  if (item.isCancelled) {
    return {
      applicationStatus: 'cancelled',
      stage,
      verificationStatus,
      badgeLabel: 'Notice Cancelled',
      badgeTone: 'rose',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'This notification or recruitment cycle has been formally cancelled by the authority.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 2. Informational stages (Admit card, Result, Answer key, Exam date sheets)
  // An admit card or result notice does NOT have an open application window for new applicants.
  if (stage === 'admit_card') {
    return {
      applicationStatus: 'closed',
      stage: 'admit_card',
      verificationStatus,
      badgeLabel: 'Admit Card Available',
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'New applications closed. Candidates can download admit cards via the official portal.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  if (stage === 'result') {
    return {
      applicationStatus: 'closed',
      stage: 'result',
      verificationStatus,
      badgeLabel: 'Result Declared',
      badgeTone: 'emerald',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'Recruitment stage concluded. Results / scorecards published.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  if (stage === 'answer_key') {
    return {
      applicationStatus: 'closed',
      stage: 'answer_key',
      verificationStatus,
      badgeLabel: 'Answer Key Published',
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'Provisional / final answer keys available for download.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  if (stage === 'examination') {
    return {
      applicationStatus: 'closed',
      stage: 'examination',
      verificationStatus,
      badgeLabel: 'Exam Schedule Published',
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'Date sheet / exam schedule active. Applications closed.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  if (stage === 'correction') {
    return {
      applicationStatus: 'closed',
      stage: 'correction',
      verificationStatus,
      badgeLabel: 'Application Window Closed (Correction Stage)',
      badgeTone: 'amber',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'New applications are not accepted. Only registered candidates may edit submitted forms during the correction window.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 3. Verification check: If marked "needs_verification", do NOT show as open
  if (verificationStatus === 'needs_verification') {
    return {
      applicationStatus: 'unknown',
      stage,
      verificationStatus: 'needs_verification',
      badgeLabel: 'Needs Verification',
      badgeTone: 'amber',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: item.verification?.verificationReason || 'Information requires authoritative verification from the issuing portal before assisted applications can be accepted.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 4. Date Parsing
  const { nowMs } = getNowInAsiaKolkata(customNow);

  const startParsed = parseDateToKolkataMs(item.startDate, undefined, false);
  const endParsed = parseDateToKolkataMs(item.lastDate, item.closingTime, true);

  // Missing or ambiguous end date must never default to "Open"
  if (!endParsed) {
    return {
      applicationStatus: 'unknown',
      stage,
      verificationStatus,
      badgeLabel: 'Check Official Notice',
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: 'Closing deadline was not explicitly published or could not be parsed from the notice.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 5. Future Start Date -> "Upcoming"
  if (startParsed && nowMs < startParsed.timestampMs) {
    return {
      applicationStatus: 'upcoming',
      stage,
      verificationStatus,
      badgeLabel: item.startDate ? `Upcoming (Opens ${item.startDate})` : 'Upcoming Application',
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: `Applications scheduled to open on ${item.startDate} at 00:00 IST.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 6. After End Date -> "Closed"
  if (nowMs > endParsed.timestampMs) {
    return {
      applicationStatus: 'closed',
      stage,
      verificationStatus,
      badgeLabel: 'Applications Closed',
      badgeTone: 'slate',
      canApplyOnline: false,
      isClosingSoon: false,
      closingTimeNote: `The online application deadline concluded on ${item.lastDate}${endParsed.isTimeExplicit ? ` at ${item.closingTime}` : ' (23:59 IST)'}.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 7. Currently Open (now >= startMs and now <= endMs)
  const diffMs = endParsed.timestampMs - nowMs;
  const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const isClosingSoon = daysRemaining <= 7;
  const timeRemainingText =
    daysRemaining > 0
      ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} ${hoursRemaining}h remaining`
      : `${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'} remaining`;

  const closingTimeNote = endParsed.isTimeExplicit
    ? `Closing deadline: ${item.lastDate} at ${item.closingTime}.`
    : `Closing deadline: ${item.lastDate}. Exact closing time was not specified in the notice; treated as inclusive through 23:59 IST.`;

  return {
    applicationStatus: 'open',
    stage,
    verificationStatus,
    badgeLabel: isClosingSoon ? `Closing Soon (${daysRemaining}d left)` : 'Open & Active',
    badgeTone: isClosingSoon ? 'amber' : 'emerald',
    canApplyOnline: true,
    isClosingSoon,
    closingTimeNote,
    timeRemainingText,
    daysRemaining,
    officialNotificationUrl,
    officialApplicationUrl,
  };
}

/**
 * Helper to determine if online assistance can be requested for this post.
 */
export function canApplyForSarkariItem(item?: SarkariItem | null, customNow?: Date): boolean {
  if (!item) return false;
  const computed = computeSarkariStatus(item, customNow);
  return computed.canApplyOnline;
}

/**
 * Backwards compatibility helper for components expecting the old JobDeadlineStatus shape.
 */
export type JobDeadlineStatus = {
  code: 'open' | 'closing_soon' | 'closed' | 'check_notice' | 'upcoming' | 'cancelled';
  label: 'Open' | 'Closing Soon' | 'Closed' | 'Check Notice' | 'Upcoming' | 'Cancelled';
  daysRemaining: number | null;
  canApply: boolean;
};

export function computeJobDeadlineStatus(lastDateStr?: string, item?: SarkariItem): JobDeadlineStatus {
  if (item) {
    const computed = computeSarkariStatus(item);
    let code: JobDeadlineStatus['code'] = 'open';
    if (computed.applicationStatus === 'closed') code = 'closed';
    else if (computed.applicationStatus === 'cancelled') code = 'cancelled';
    else if (computed.applicationStatus === 'upcoming') code = 'upcoming';
    else if (computed.applicationStatus === 'unknown') code = 'check_notice';
    else if (computed.isClosingSoon) code = 'closing_soon';

    let label: JobDeadlineStatus['label'] = 'Open';
    if (code === 'closed') label = 'Closed';
    else if (code === 'closing_soon') label = 'Closing Soon';
    else if (code === 'upcoming') label = 'Upcoming';
    else if (code === 'cancelled') label = 'Cancelled';
    else if (code === 'check_notice') label = 'Check Notice';

    return {
      code,
      label,
      daysRemaining: computed.daysRemaining,
      canApply: computed.canApplyOnline,
    };
  }

  // Fallback for string-only invocations
  const pseudoItem: SarkariItem = {
    id: 'temp',
    title: 'Temporary Notice',
    category: 'jobs',
    postDate: '',
    lastDate: lastDateStr,
    shortInfo: '',
  };
  const computed = computeSarkariStatus(pseudoItem);
  let code: JobDeadlineStatus['code'] = 'open';
  if (computed.applicationStatus === 'closed') code = 'closed';
  else if (computed.applicationStatus === 'cancelled') code = 'cancelled';
  else if (computed.applicationStatus === 'upcoming') code = 'upcoming';
  else if (computed.applicationStatus === 'unknown') code = 'check_notice';
  else if (computed.isClosingSoon) code = 'closing_soon';

  let label: JobDeadlineStatus['label'] = 'Open';
  if (code === 'closed') label = 'Closed';
  else if (code === 'closing_soon') label = 'Closing Soon';
  else if (code === 'upcoming') label = 'Upcoming';
  else if (code === 'cancelled') label = 'Cancelled';
  else if (code === 'check_notice') label = 'Check Notice';

  return {
    code,
    label,
    daysRemaining: computed.daysRemaining,
    canApply: computed.canApplyOnline,
  };
}
