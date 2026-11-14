import type {
  SarkariItem,
  NoticeStage,
  VerificationStatus,
  ApplicationStatus,
  PostComputedStatus,
} from '../data/sarkariData';

export interface ComputedSarkariStatus {
  applicationStatus: ApplicationStatus;
  computedStatus: PostComputedStatus;
  stage: NoticeStage;
  verificationStatus: VerificationStatus;
  badgeLabel: string;
  badgeTone: 'emerald' | 'amber' | 'slate' | 'rose' | 'blue';
  canApplyOnline: boolean;
  isClosingSoon: boolean;
  isUrgentUnder7Days: boolean;
  isClosed: boolean;
  isUpcoming: boolean;
  isCancelled: boolean;
  isOpen: boolean;
  isArchiveBucket: boolean;
  dateLabel: string;
  dateValue: string;
  dateHint?: string;
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
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(target);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = parseInt(partMap.year || '2026', 10);
  const month = parseInt(partMap.month || '11', 10);
  const day = parseInt(partMap.day || '14', 10);
  const rawHours = parseInt(partMap.hour || '0', 10);
  const hours = rawHours === 24 ? 0 : rawHours;
  const minutes = parseInt(partMap.minute || '0', 10);
  const seconds = parseInt(partMap.second || '0', 10);

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

  const m12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const m = m12[2] ? parseInt(m12[2], 10) : 0;
    const meridian = m12[3].toLowerCase();
    if (meridian === 'pm' && h < 12) h += 12;
    if (meridian === 'am' && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

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

export function formatCleanDateStr(str?: string): string {
  const parsed = extractDatePattern(str);
  if (!parsed) return '';
  const dd = String(parsed.day).padStart(2, '0');
  const mm = String(parsed.month).padStart(2, '0');
  return `${dd}/${mm}/${parsed.year}`;
}

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

function isOlderThanDays(dateStr: string | undefined, nowMs: number, days: number): boolean {
  const parsed = parseDateToKolkataMs(dateStr, undefined, true);
  if (!parsed) return false;
  return nowMs - parsed.timestampMs > days * 24 * 60 * 60 * 1000;
}

/**
 * Infers the Notice Stage from explicit attributes, categories, and titles.
 */
export function inferNoticeStage(item: SarkariItem): NoticeStage {
  if (item.stage) return item.stage;
  if (item.noticeType === 'date_sheet') return 'date_sheet';
  if (item.noticeType === 'objection_window') return 'objection_window';
  if (item.noticeType === 'document_verification') return 'document_verification';
  if (item.noticeType) return item.noticeType as NoticeStage;

  // Specific legacy overrides where title keywords mislead naive substring matching
  if (item.id === 'cus-ug-reevaluation-form-2026') return 'correction';
  if (item.id === 'cus-ug-1st-sem-self-reg-2026') return 'admission';

  if (item.category === 'results') return 'result';
  if (item.category === 'answer_keys') return 'answer_key';
  if (item.category === 'admit_cards') return 'admit_card';
  if (item.category === 'syllabus') return 'examination';
  if (item.category === 'nta') {
    const tUpper = item.title.toUpperCase();
    if (tUpper.includes('ADMIT CARD') || tUpper.includes('HALL TICKET')) return 'admit_card';
    if (tUpper.includes('RESULT') || tUpper.includes('SCORECARD')) return 'result';
    if (tUpper.includes('ANSWER KEY')) return 'answer_key';
    return 'admission';
  }
  if (item.category === 'exam_forms') {
    const tUpper = item.title.toUpperCase();
    if (tUpper.includes('DATE SHEET') || tUpper.includes('DATESHEET') || tUpper.includes('EXAM SCHEDULE')) {
      return 'date_sheet';
    }
    return 'exam_form';
  }
  if (item.category === 'admissions') return 'admission';

  const titleUpper = item.title.toUpperCase();
  if (titleUpper.includes('ADMIT CARD') || titleUpper.includes('HALL TICKET') || titleUpper.includes('CITY SLIP') || titleUpper.includes('CITY INTIMATION')) {
    return 'admit_card';
  }
  if (titleUpper.includes('RE-EVALUATION') || titleUpper.includes('REEVALUATION') || titleUpper.includes('XEROX')) {
    return 'correction';
  }
  if (titleUpper.includes('RESULT') || titleUpper.includes('MERIT LIST') || titleUpper.includes('SCORECARD') || titleUpper.includes('SELECTION LIST')) {
    return 'result';
  }
  if (titleUpper.includes('GRADE CARD')) {
    return 'grade_card';
  }
  if (titleUpper.includes('OBJECTION')) {
    return 'objection_window';
  }
  if (titleUpper.includes('ANSWER KEY') || titleUpper.includes('RESPONSE SHEET')) {
    return 'answer_key';
  }
  if (titleUpper.includes('DOCUMENT VERIFICATION') || titleUpper.includes('DV SCHEDULE') || titleUpper.includes('SCRUTINY')) {
    return 'document_verification';
  }
  if (titleUpper.includes('DATE SHEET') || titleUpper.includes('DATESHEET') || titleUpper.includes('EXAM SCHEDULE')) {
    return 'date_sheet';
  }
  if (titleUpper.includes('CORRECTION WINDOW') || titleUpper.includes('EDIT WINDOW') || titleUpper.includes('EDIT OPTION')) {
    return 'correction';
  }
  if (titleUpper.includes('RE-REGISTRATION') || titleUpper.includes('RE REGISTRATION')) {
    return 're_registration';
  }
  if (titleUpper.includes('ASSIGNMENT')) {
    return 'assignment';
  }
  if (titleUpper.includes('EXAM FORM') || titleUpper.includes('EXAMINATION FORM')) {
    return 'exam_form';
  }
  if (titleUpper.includes('ADMISSION') || titleUpper.includes('COUNSELLING') || titleUpper.includes('SPOT ROUND')) {
    return 'admission';
  }

  return 'recruitment';
}

/**
 * Authoritative status computation for any SarkariItem using Asia/Kolkata time.
 * Always computes status dynamically from dates and notice type (never trusts stale hardcoded status).
 */
function rawComputeSarkariStatus(
  item: SarkariItem,
  customNow?: Date
): Omit<ComputedSarkariStatus, 'isClosed' | 'isUpcoming' | 'isCancelled' | 'isOpen' | 'isUrgentUnder7Days'> {
  const stage = inferNoticeStage(item);
  const verificationStatus: VerificationStatus =
    item.verification?.verificationStatus || item.verificationStatus || 'verified';

  const officialNotificationUrl =
    item.notificationPdfUrl ||
    item.verification?.officialNotificationUrl ||
    item.officialNotificationUrl ||
    (item.officialLink && /\.pdf($|\?)/i.test(item.officialLink) ? item.officialLink : undefined);

  const officialApplicationUrl =
    item.officialUrl ||
    item.verification?.officialApplicationUrl ||
    item.officialApplicationUrl ||
    item.officialLink;

  const { nowMs } = getNowInAsiaKolkata(customNow);
  const cleanStart = formatCleanDateStr(item.applyStart || item.startDate);
  const cleanEnd = formatCleanDateStr(item.applyEnd || item.lastDate);
  const cleanPost = formatCleanDateStr(item.postDate);
  const cleanEvent = formatCleanDateStr(item.eventDate);

  // 1. Explicit Cancellation
  if (item.isCancelled) {
    return {
      applicationStatus: 'cancelled',
      computedStatus: 'closed',
      stage,
      verificationStatus,
      badgeLabel: 'Notice Cancelled',
      badgeTone: 'rose',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: true,
      dateLabel: 'Status',
      dateValue: 'Cancelled',
      closingTimeNote: 'This notification or recruitment cycle has been formally cancelled by the authority.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 2. Verification check
  if (verificationStatus === 'needs_verification') {
    const fallbackDate = cleanEvent || cleanEnd || cleanPost || 'As per official notice';
    return {
      applicationStatus: 'unknown',
      computedStatus: 'closed',
      stage,
      verificationStatus: 'needs_verification',
      badgeLabel: 'Needs Verification',
      badgeTone: 'amber',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: true,
      dateLabel: 'Posted on',
      dateValue: fallbackDate,
      dateHint: 'Pending live portal check',
      closingTimeNote:
        item.verification?.verificationReason ||
        'Information requires authoritative verification from the issuing portal before assisted applications can be accepted.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 3. Date Sheet / Examination Timetable
  if (stage === 'date_sheet' || stage === 'examination') {
    const isTentativeSheet =
      Boolean(item.isTentative) || item.title.toLowerCase().includes('tentative');
    const eventEnd = parseDateToKolkataMs(item.lastDate || item.eventDate, item.closingTime, true);
    const isPast = Boolean(eventEnd && nowMs > eventEnd.timestampMs);
    const windowValue =
      cleanStart && cleanEnd && cleanStart !== cleanEnd
        ? `${cleanStart} – ${cleanEnd}`
        : cleanEvent || cleanEnd || cleanStart || cleanPost || 'As per official notice';

    return {
      applicationStatus: 'closed',
      computedStatus: isPast ? 'closed' : 'exam',
      stage,
      verificationStatus,
      badgeLabel: isPast
        ? 'Exam Concluded'
        : isTentativeSheet
        ? 'Tentative Date Sheet'
        : 'Exam Schedule Active',
      badgeTone: isPast ? 'slate' : 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isPast || (!eventEnd && isOlderThanDays(item.postDate, nowMs, 35)),
      dateLabel: 'Exam on',
      dateValue: windowValue,
      dateHint: isPast ? 'Concluded' : isTentativeSheet ? 'Tentative' : undefined,
      closingTimeNote: `${
        isTentativeSheet ? 'Tentative' : 'Official'
      } examination schedule published${
        item.learnerGroup ? ` (${item.learnerGroup} learners)` : ''
      }. Scheduled window: ${windowValue}. Verify final dates on your official Hall Ticket.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 4. Regional Centre Update
  if (stage === 'rc_update') {
    const eventEnd = parseDateToKolkataMs(item.lastDate || item.eventDate, item.closingTime, true);
    const isPast = Boolean(eventEnd && nowMs > eventEnd.timestampMs);
    const eventVal =
      cleanStart && cleanEnd && cleanStart !== cleanEnd
        ? `${cleanStart} – ${cleanEnd}`
        : cleanEvent || cleanEnd || cleanStart || cleanPost || 'As per official notice';
    return {
      applicationStatus: 'closed',
      computedStatus: isPast ? 'closed' : 'exam',
      stage: 'rc_update',
      verificationStatus,
      badgeLabel: isPast ? 'Event Concluded' : 'RC Update',
      badgeTone: isPast ? 'slate' : 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isPast,
      dateLabel: isPast ? 'Held on' : 'Scheduled on',
      dateValue: eventVal,
      dateHint: isPast ? 'Concluded' : undefined,
      closingTimeNote: isPast
        ? `Regional Centre update concluded on ${eventVal}. Check official announcements for latest updates.`
        : `Official Regional Centre notice scheduled for ${eventVal}.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 5. Admit Card / Hall Ticket
  if (stage === 'admit_card') {
    const examEnd = parseDateToKolkataMs(item.lastDate || item.eventDate, item.closingTime, true);
    const isPast = Boolean(
      (examEnd && nowMs > examEnd.timestampMs) ||
      (!examEnd && isOlderThanDays(item.postDate, nowMs, 35))
    );
    const displayDate =
      cleanStart && cleanEnd && cleanStart !== cleanEnd
        ? `${cleanStart} – ${cleanEnd}`
        : cleanEvent || cleanEnd || cleanPost || 'As per official notice';
    return {
      applicationStatus: 'closed',
      computedStatus: isPast ? 'closed' : 'exam',
      stage: 'admit_card',
      verificationStatus,
      badgeLabel: isPast ? 'Exam Concluded' : 'Admit Card Out',
      badgeTone: isPast ? 'slate' : 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isPast,
      dateLabel: cleanEvent || cleanEnd ? 'Exam / Window' : 'Admit card out',
      dateValue: displayDate,
      dateHint: isPast ? 'Concluded' : 'Download active',
      closingTimeNote: isPast
        ? 'Examination window for this admit card notice has concluded.'
        : 'Candidates can download admit cards / hall tickets via the official portal.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 6. Result / Grade Card
  if (stage === 'result' || stage === 'grade_card') {
    const isOld = isOlderThanDays(item.postDate, nowMs, 35);
    const resultDate = cleanPost || cleanEvent || 'As per official notice';
    return {
      applicationStatus: 'closed',
      computedStatus: 'result',
      stage,
      verificationStatus,
      badgeLabel: stage === 'grade_card' ? 'Grade Card Out' : 'Result Out',
      badgeTone: 'emerald',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isOld,
      dateLabel: 'Result out',
      dateValue: resultDate,
      dateHint: isOld ? 'Archived' : 'Published',
      closingTimeNote: `Result / merit list published on ${resultDate} on the official portal.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 7. Answer Key / Objection Window
  if (stage === 'answer_key' || stage === 'objection_window') {
    const startParsed = parseDateToKolkataMs(item.startDate, undefined, false);
    const endParsed = parseDateToKolkataMs(item.lastDate, item.closingTime, true);
    const isChallengeActive = Boolean(
      endParsed &&
      nowMs <= endParsed.timestampMs &&
      (!startParsed || nowMs >= startParsed.timestampMs) &&
      cleanEnd !== cleanPost
    );
    const isOld = !isChallengeActive && isOlderThanDays(item.postDate, nowMs, 35);
    const daysRem =
      isChallengeActive && endParsed
        ? Math.max(0, Math.floor((endParsed.timestampMs - nowMs) / (1000 * 60 * 60 * 24)))
        : null;

    return {
      applicationStatus: 'closed',
      computedStatus: isChallengeActive ? 'closing_soon' : 'result',
      stage,
      verificationStatus,
      badgeLabel: isChallengeActive
        ? `Objections till ${cleanEnd}`
        : stage === 'objection_window'
        ? 'Objection Window Closed'
        : 'Answer Key Out',
      badgeTone: isChallengeActive ? 'amber' : 'blue',
      canApplyOnline: false,
      isClosingSoon: isChallengeActive,
      isArchiveBucket: isOld,
      dateLabel: isChallengeActive ? 'Objections till' : 'Key out',
      dateValue: isChallengeActive ? cleanEnd : cleanPost || cleanEnd || 'As per official notice',
      dateHint: isChallengeActive && daysRem !== null ? (daysRem === 0 ? 'Closes today' : `${daysRem}d left`) : undefined,
      closingTimeNote: isChallengeActive
        ? `Answer key / objection representation window is open until ${cleanEnd}.`
        : 'Answer key / objection notice published on the official portal.',
      daysRemaining: daysRem,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 8. Document Verification (DV Schedule)
  if (stage === 'document_verification') {
    const startParsed = parseDateToKolkataMs(item.startDate, undefined, false);
    const endParsed = parseDateToKolkataMs(item.lastDate || item.eventDate, item.closingTime, true);
    const isPast = Boolean(endParsed && nowMs > endParsed.timestampMs);
    const isFuture = Boolean(startParsed && nowMs < startParsed.timestampMs);
    const dvVal =
      cleanStart && cleanEnd && cleanStart !== cleanEnd
        ? `${cleanStart} – ${cleanEnd}`
        : cleanEvent || cleanStart || cleanEnd || cleanPost || 'As per official notice';

    return {
      applicationStatus: 'closed',
      computedStatus: isPast ? 'closed' : 'exam',
      stage: 'document_verification',
      verificationStatus,
      badgeLabel: isPast ? 'DV Concluded' : isFuture ? 'DV Upcoming' : 'DV Schedule Active',
      badgeTone: isPast ? 'slate' : 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isPast,
      dateLabel: 'DV on',
      dateValue: dvVal,
      dateHint: isPast ? 'Concluded' : isFuture ? 'Scheduled' : 'Ongoing',
      closingTimeNote: isPast
        ? `Document verification concluded on ${cleanEnd || dvVal}.`
        : `Shortlisted candidates must attend Document Verification (${dvVal}) with original credentials.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 9. Correction / Edit / Re-evaluation Window (for already-registered candidates)
  if (stage === 'correction') {
    const startParsed = parseDateToKolkataMs(item.startDate, undefined, false);
    const endParsed = parseDateToKolkataMs(item.lastDate, item.closingTime, true);

    if (endParsed && nowMs > endParsed.timestampMs) {
      return {
        applicationStatus: 'closed',
        computedStatus: 'closed',
        stage: 'correction',
        verificationStatus,
        badgeLabel: 'Edit Window Closed',
        badgeTone: 'slate',
        canApplyOnline: false,
        isClosingSoon: false,
        isArchiveBucket: true,
        dateLabel: 'Closed on',
        dateValue: cleanEnd || cleanPost || 'As per notice',
        dateHint: 'Closed',
        closingTimeNote: `Correction / edit window closed on ${cleanEnd}.`,
        daysRemaining: null,
        officialNotificationUrl,
        officialApplicationUrl,
      };
    }

    if (startParsed && nowMs < startParsed.timestampMs) {
      return {
        applicationStatus: 'upcoming',
        computedStatus: 'upcoming',
        stage: 'correction',
        verificationStatus,
        badgeLabel: `Edit Opens ${cleanStart}`,
        badgeTone: 'blue',
        canApplyOnline: false,
        isClosingSoon: false,
        isArchiveBucket: false,
        dateLabel: 'Edit window',
        dateValue: cleanEnd ? `${cleanStart} – ${cleanEnd}` : cleanStart,
        dateHint: `Starts ${cleanStart}`,
        closingTimeNote: `Registered candidates may edit submitted forms from ${cleanStart} to ${cleanEnd || cleanStart}.`,
        daysRemaining: null,
        officialNotificationUrl,
        officialApplicationUrl,
      };
    }

    const daysRem = endParsed
      ? Math.max(0, Math.floor((endParsed.timestampMs - nowMs) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      applicationStatus: 'closed',
      computedStatus: 'closing_soon',
      stage: 'correction',
      verificationStatus,
      badgeLabel: daysRem !== null ? `Edit Window (${daysRem}d left)` : 'Correction Window',
      badgeTone: 'amber',
      canApplyOnline: false,
      isClosingSoon: true,
      isArchiveBucket: false,
      dateLabel: 'Edit till',
      dateValue: cleanEnd || 'As per notice',
      dateHint: daysRem !== null ? (daysRem === 0 ? 'Closes today' : `${daysRem}d left`) : undefined,
      closingTimeNote: 'Only registered candidates may modify or submit corrections during this window.',
      daysRemaining: daysRem,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // 10. Standard Application / Admission / Exam Form / Assignment / Re-Registration Window
  const startParsed = parseDateToKolkataMs(item.applyStart || item.startDate, undefined, false);
  const endParsed = parseDateToKolkataMs(item.applyEnd || item.lastDate, item.closingTime, true);

  if (!endParsed) {
    return {
      applicationStatus: 'unknown',
      computedStatus: 'closed',
      stage,
      verificationStatus,
      badgeLabel: 'Check Official Notice',
      badgeTone: 'slate',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: isOlderThanDays(item.postDate, nowMs, 35),
      dateLabel: 'Posted on',
      dateValue: cleanPost || 'As per official notice',
      closingTimeNote: 'Closing deadline was not explicitly published or could not be parsed from the notice.',
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // Future Start Date -> Upcoming
  if (startParsed && nowMs < startParsed.timestampMs) {
    const daysToStart = Math.max(
      1,
      Math.ceil((startParsed.timestampMs - nowMs) / (1000 * 60 * 60 * 24))
    );
    return {
      applicationStatus: 'upcoming',
      computedStatus: 'upcoming',
      stage,
      verificationStatus,
      badgeLabel: `Opens ${cleanStart}`,
      badgeTone: 'blue',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: false,
      dateLabel: 'Opens',
      dateValue: cleanStart,
      dateHint: `In ${daysToStart}d · Closes ${cleanEnd}`,
      closingTimeNote: `Applications scheduled to open on ${cleanStart} at 00:00 IST (closing ${cleanEnd}).`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // Expired -> Closed & Archive
  if (nowMs > endParsed.timestampMs) {
    return {
      applicationStatus: 'closed',
      computedStatus: 'closed',
      stage,
      verificationStatus,
      badgeLabel: 'Closed',
      badgeTone: 'slate',
      canApplyOnline: false,
      isClosingSoon: false,
      isArchiveBucket: true,
      dateLabel: 'Closed on',
      dateValue: cleanEnd,
      dateHint: 'Archived',
      closingTimeNote: `The submission deadline concluded on ${cleanEnd}${
        endParsed.isTimeExplicit ? ` at ${item.closingTime}` : ' (23:59 IST)'
      }.`,
      daysRemaining: null,
      officialNotificationUrl,
      officialApplicationUrl,
    };
  }

  // Currently Open
  const diffMs = endParsed.timestampMs - nowMs;
  const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const hoursRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  const isUrgentUnder7Days = daysRemaining < 7;
  const isClosingSoon = daysRemaining <= 7;
  const timeRemainingText =
    daysRemaining > 0
      ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} ${hoursRemaining}h remaining`
      : `${hoursRemaining} hour${hoursRemaining === 1 ? '' : 's'} remaining`;

  const closingTimeNote = endParsed.isTimeExplicit
    ? `Closing deadline: ${cleanEnd} at ${item.closingTime}.`
    : `Closing deadline: ${cleanEnd}. Treated as inclusive through 23:59 IST unless portal closes earlier.`;

  return {
    applicationStatus: 'open',
    computedStatus: isClosingSoon ? 'closing_soon' : 'open',
    stage,
    verificationStatus,
    badgeLabel: isUrgentUnder7Days
      ? daysRemaining === 0
        ? 'Closes Today'
        : `${daysRemaining}d left`
      : isClosingSoon
      ? 'Closing Soon (7d)'
      : 'Open',
    badgeTone: isUrgentUnder7Days ? 'rose' : isClosingSoon ? 'amber' : 'emerald',
    canApplyOnline: true,
    isClosingSoon,
    isArchiveBucket: false,
    dateLabel: 'Apply by',
    dateValue: cleanEnd,
    dateHint: daysRemaining === 0 ? 'Closes today' : `${daysRemaining}d left`,
    closingTimeNote,
    timeRemainingText,
    daysRemaining,
    officialNotificationUrl,
    officialApplicationUrl,
  };
}

export function computeSarkariStatus(item: SarkariItem, customNow?: Date): ComputedSarkariStatus {
  const base = rawComputeSarkariStatus(item, customNow);
  return {
    ...base,
    isUrgentUnder7Days:
      base.applicationStatus === 'open' &&
      base.daysRemaining !== null &&
      base.daysRemaining < 7,
    isClosed: base.applicationStatus === 'closed',
    isUpcoming: base.applicationStatus === 'upcoming',
    isCancelled: base.applicationStatus === 'cancelled',
    isOpen: base.applicationStatus === 'open',
  };
}

export function canApplyForSarkariItem(item?: SarkariItem | null, customNow?: Date): boolean {
  if (!item) return false;
  const computed = computeSarkariStatus(item, customNow);
  return computed.canApplyOnline;
}

export type JobDeadlineStatus = {
  code:
    | 'open'
    | 'closing_soon'
    | 'closed'
    | 'check_notice'
    | 'upcoming'
    | 'cancelled'
    | 'date_sheet'
    | 'result'
    | 'answer_key'
    | 'objection_window'
    | 'document_verification';
  label:
    | 'Open'
    | 'Closing Soon'
    | 'Closed'
    | 'Check Notice'
    | 'Upcoming'
    | 'Cancelled'
    | 'Date Sheet'
    | 'Result'
    | 'Answer Key'
    | 'Objection Window'
    | 'DV Schedule';
  daysRemaining: number | null;
  canApply: boolean;
};

export function computeJobDeadlineStatus(lastDateStr?: string, item?: SarkariItem): JobDeadlineStatus {
  if (item) {
    const computed = computeSarkariStatus(item);

    if (computed.stage === 'date_sheet') {
      return { code: 'date_sheet', label: 'Date Sheet', daysRemaining: null, canApply: false };
    }
    if (computed.stage === 'result') {
      return { code: 'result', label: 'Result', daysRemaining: null, canApply: false };
    }
    if (computed.stage === 'answer_key') {
      return { code: 'answer_key', label: 'Answer Key', daysRemaining: null, canApply: false };
    }
    if (computed.stage === 'document_verification') {
      return { code: 'document_verification', label: 'DV Schedule', daysRemaining: null, canApply: false };
    }
    if (computed.stage === 'objection_window') {
      return { code: 'objection_window', label: 'Objection Window', daysRemaining: null, canApply: false };
    }

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

const NON_DEADLINE_STAGES: ReadonlySet<NoticeStage> = new Set<NoticeStage>([
  'date_sheet',
  'examination',
  'admit_card',
  'document_verification',
  'result',
  'grade_card',
  'rc_update',
]);

export function isDeadlineWindowStage(stage: NoticeStage): boolean {
  return !NON_DEADLINE_STAGES.has(stage);
}

export interface ActiveClosingDeadlineItem {
  item: SarkariItem;
  status: ComputedSarkariStatus;
  section: 'jobs' | 'education';
  institution: string;
  closingDate: string;
  closingTime?: string;
  closingTimestampMs: number;
  daysRemaining: number;
  hoursRemaining: number;
  isUrgent: boolean;
}

function inferDeadlineSection(item: SarkariItem): 'jobs' | 'education' {
  if (item.section === 'education') return 'education';
  if (item.section === 'jobs') return 'jobs';
  if (
    item.category === 'ignou' ||
    item.institution === 'IGNOU' ||
    item.category === 'admissions' ||
    item.category === 'exam_forms' ||
    item.category === 'cluster_univ' ||
    item.category === 'nta'
  ) {
    return 'education';
  }
  return 'jobs';
}

function inferDeadlineInstitution(item: SarkariItem): string {
  if (item.org && item.org.trim()) return item.org.trim();
  if (item.category === 'ignou' || item.institution === 'IGNOU') return 'IGNOU';
  switch (item.category) {
    case 'jkssb':
      return 'JKSSB';
    case 'banking_jobs':
      return item.department || 'Banking / J&K Bank';
    case 'army_jobs':
      return 'Indian Army';
    case 'ssc_jobs':
      return 'SSC';
    case 'rrb_jobs':
      return 'RRB';
    case 'cluster_univ':
      return 'Cluster University Srinagar';
    case 'exam_forms':
    case 'admissions':
      return 'University of Kashmir';
    case 'nta':
      return 'NTA';
    default:
      return item.institution || item.department || 'Official Authority';
  }
}

/**
 * Returns strictly active closing deadlines across recruitment and education notices
 * computed in Asia/Kolkata time, sorted by soonest closing timestamp first.
 */
export function getActiveClosingDeadlines(
  items: SarkariItem[],
  options?: {
    customNow?: Date;
    maxDays?: number;
    section?: 'all' | 'jobs' | 'education';
    includeAllActive?: boolean;
  }
): ActiveClosingDeadlineItem[] {
  const { nowMs } = getNowInAsiaKolkata(options?.customNow);
  const maxDays = options?.maxDays ?? 14;
  const includeAllActive = Boolean(options?.includeAllActive);
  const sectionFilter = options?.section ?? 'all';

  const results: ActiveClosingDeadlineItem[] = [];

  for (const item of items) {
    if (item.publicationStatus && item.publicationStatus !== 'published') continue;
    if (item.isCancelled || item.duplicateOfId) continue;

    const status = computeSarkariStatus(item, options?.customNow);
    if (status.verificationStatus === 'needs_verification') continue;
    if (!isDeadlineWindowStage(status.stage)) continue;
    if (status.isClosed || status.isUpcoming || status.isCancelled) continue;

    if (status.stage === 'answer_key' || status.stage === 'objection_window') {
      if (!status.isClosingSoon || status.computedStatus !== 'closing_soon') continue;
    } else if (status.stage === 'correction') {
      if (!status.isClosingSoon || status.computedStatus !== 'closing_soon') continue;
    } else if (status.applicationStatus !== 'open') {
      continue;
    }

    const closingRaw = item.applyEnd || item.lastDate;
    const endParsed = parseDateToKolkataMs(closingRaw, item.closingTime, true);
    if (!endParsed) continue;
    if (nowMs > endParsed.timestampMs) continue;

    const startParsed = parseDateToKolkataMs(item.applyStart || item.startDate, undefined, false);
    if (startParsed && nowMs < startParsed.timestampMs) continue;

    const diffMs = endParsed.timestampMs - nowMs;
    if (diffMs < 0) continue;
    if (!includeAllActive && diffMs > maxDays * 24 * 60 * 60 * 1000) continue;

    const section = inferDeadlineSection(item);
    if (sectionFilter !== 'all' && section !== sectionFilter) continue;

    const daysRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hoursRemaining = Math.max(
      0,
      Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    );

    results.push({
      item,
      status,
      section,
      institution: inferDeadlineInstitution(item),
      closingDate: formatCleanDateStr(closingRaw) || status.dateValue,
      closingTime: endParsed.isTimeExplicit ? item.closingTime : undefined,
      closingTimestampMs: endParsed.timestampMs,
      daysRemaining,
      hoursRemaining,
      isUrgent: daysRemaining < 7,
    });
  }

  return results.sort((a, b) => a.closingTimestampMs - b.closingTimestampMs);
}
