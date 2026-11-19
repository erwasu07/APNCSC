/**
 * Shared Homepage Feed & Deadline Selection Module
 * Used identically by both Server-Side Rendering (src/serverContentRenderer.ts)
 * and Browser Client Rendering (src/components/PortalHomepage.tsx) so the
 * initial HTML and interactive browser Jobs/Updates/Closing Soon lists match 1:1.
 */

import {
  isEducationSarkariItem,
  isPublishedSarkariItem,
  isRecruitmentSarkariItem,
  type SarkariItem,
} from '../data/sarkariData';
import { getDeduplicatedSarkariPosts, resolvePostOrg } from '../data/sarkariMigration';
import {
  computeSarkariStatus,
  getActiveClosingDeadlines,
  type ActiveClosingDeadlineItem,
} from './sarkariStatus';
import { isOlderThan12Months } from './postLifecycle';

export type HomepageUpdatesTabId = 'jobs' | 'admit_card' | 'results' | 'answer_key' | 'admission';

export interface HomepageFeedBuckets {
  jobs: SarkariItem[];
  admit_card: SarkariItem[];
  results: SarkariItem[];
  answer_key: SarkariItem[];
  admission: SarkariItem[];
}

export interface HomepageFeedData {
  verifiedPosts: SarkariItem[];
  buckets: HomepageFeedBuckets;
  closingSoonDeadlines: ActiveClosingDeadlineItem[];
}

export function isJkPriorityItem(item: SarkariItem): boolean {
  if (item.jkDomicile) return true;
  if (
    item.category === 'jkssb' ||
    item.category === 'banking_jobs' ||
    item.category === 'cluster_univ' ||
    item.category === 'admissions' ||
    item.category === 'exam_forms'
  ) {
    return true;
  }
  const haystack = `${item.title} ${item.org || resolvePostOrg(item)} ${item.department || ''} ${item.institution || ''}`.toLowerCase();
  return /jkssb|j&k|jammu|kashmir|srinagar|cluster\s*univ|skuast|jkpsc|jk\s*bank|bopee|jkbose/.test(haystack);
}

export function parseHomepagePostTimestamp(dateStr?: string): number {
  if (!dateStr) return 0;
  const m = String(dateStr).match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (!m) return 0;
  return Date.UTC(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
}

export function sortByNewestPostDate(a: SarkariItem, b: SarkariItem): number {
  return (
    parseHomepagePostTimestamp(b.postDate || b.documentDate) -
    parseHomepagePostTimestamp(a.postDate || a.documentDate)
  );
}

export function formatShortChipTitle(item: SarkariItem): string {
  const clean = item.title
    .replace(/\b202[4-9]\b/g, '')
    .replace(/\b(Notification|Recruitment|Online Form|Application|Exam Form)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = clean.split(' ').filter(Boolean);
  if (words.length <= 3) return clean || item.org || resolvePostOrg(item);
  return words.slice(0, 3).join(' ');
}

export function buildHomepageFeedData(
  allPosts: SarkariItem[],
  customNow?: Date
): HomepageFeedData {
  const deduped = getDeduplicatedSarkariPosts(allPosts);

  const verifiedPosts = deduped.filter((item) => {
    if (!isPublishedSarkariItem(item) || item.isCancelled) return false;
    if (isOlderThan12Months(item)) return false;
    const st = computeSarkariStatus(item, customNow);
    return st.verificationStatus !== 'needs_verification';
  });

  const compareJkFirst = (a: SarkariItem, b: SarkariItem, prioritizeOpen: boolean) => {
    const jkA = isJkPriorityItem(a) ? 1 : 0;
    const jkB = isJkPriorityItem(b) ? 1 : 0;
    if (jkA !== jkB) return jkB - jkA;

    const stA = computeSarkariStatus(a, customNow);
    const stB = computeSarkariStatus(b, customNow);

    if (prioritizeOpen && stA.canApplyOnline !== stB.canApplyOnline) {
      return stA.canApplyOnline ? -1 : 1;
    }
    if (stA.isUrgentUnder7Days !== stB.isUrgentUnder7Days) {
      return stA.isUrgentUnder7Days ? -1 : 1;
    }
    return sortByNewestPostDate(a, b);
  };

  const jobs: SarkariItem[] = [];
  const admit_card: SarkariItem[] = [];
  const results: SarkariItem[] = [];
  const answer_key: SarkariItem[] = [];
  const admission: SarkariItem[] = [];

  for (const item of verifiedPosts) {
    const st = computeSarkariStatus(item, customNow);
    if (st.stage === 'answer_key' || st.stage === 'objection_window') {
      answer_key.push(item);
    } else if (st.stage === 'result' || st.stage === 'grade_card') {
      results.push(item);
    } else if (
      st.stage === 'admit_card' ||
      st.stage === 'examination' ||
      st.stage === 'document_verification' ||
      st.stage === 'date_sheet'
    ) {
      admit_card.push(item);
    } else if (isEducationSarkariItem(item)) {
      admission.push(item);
    } else if (isRecruitmentSarkariItem(item)) {
      jobs.push(item);
    }
  }

  const buckets: HomepageFeedBuckets = {
    jobs: jobs.sort((a, b) => compareJkFirst(a, b, true)),
    admit_card: admit_card.sort((a, b) => compareJkFirst(a, b, false)),
    results: results.sort((a, b) => compareJkFirst(a, b, false)),
    answer_key: answer_key.sort((a, b) => compareJkFirst(a, b, false)),
    admission: admission.sort((a, b) => compareJkFirst(a, b, true)),
  };

  const closingSoonDeadlines = getActiveClosingDeadlines(deduped, {
    customNow,
    maxDays: 7,
  }).slice(0, 4);

  return {
    verifiedPosts,
    buckets,
    closingSoonDeadlines,
  };
}
