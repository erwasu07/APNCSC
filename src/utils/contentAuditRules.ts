import { checkConsecutiveCopiedSentences, countWords } from './contentQualityValidator';

export type ContentAuditClass = 'A' | 'B' | 'C' | 'D';

export interface ContentAuditThresholds {
  minClassAWords: number;
  thinWordThreshold: number;
  maxConsecutiveCopiedAllowed: number;
  nearDuplicateJaccardThreshold: number;
}

export const DEFAULT_AUDIT_THRESHOLDS: ContentAuditThresholds = {
  minClassAWords: 400,
  thinWordThreshold: 300,
  maxConsecutiveCopiedAllowed: 2,
  nearDuplicateJaccardThreshold: 0.65,
};

export function normalizeTextForAudit(text: string): string {
  return String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildWordShingles(text: string, shingleSize = 5): Set<string> {
  const words = normalizeTextForAudit(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  const shingles = new Set<string>();
  if (words.length < shingleSize) {
    if (words.length > 0) shingles.add(words.join(' '));
    return shingles;
  }
  for (let i = 0; i <= words.length - shingleSize; i++) {
    shingles.add(words.slice(i, i + shingleSize).join(' '));
  }
  return shingles;
}

export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  smaller.forEach((item) => {
    if (larger.has(item)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function detectOutboundOfficialLinks(htmlOrText: string): string[] {
  const matches = new Set<string>();
  const urlRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(htmlOrText)) !== null) {
    const href = m[1];
    try {
      const parsed = new URL(href);
      const host = parsed.hostname.toLowerCase();
      if (host.includes('cscdost.com')) continue;
      if (
        host.endsWith('.gov.in') ||
        host.endsWith('.nic.in') ||
        host.endsWith('.ac.in') ||
        host.endsWith('.edu.in') ||
        host.includes('kashmiruniversity') ||
        host.includes('cusrinagar') ||
        host.includes('ignou') ||
        host.includes('ibps') ||
        host.includes('jkbank') ||
        host.includes('samarth') ||
        host.includes('digilocker')
      ) {
        matches.add(href);
      }
    } catch {}
  }
  return Array.from(matches);
}

export interface ClassifyAuditInput {
  url: string;
  httpStatus: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  wordCount: number;
  hasOfficialLink: boolean;
  hasLastUpdated: boolean;
  hasFaqOrHowTo: boolean;
  copiedRunLength: number;
  highestJaccardScore: number;
  nearDuplicateOf?: string;
  canonicalMismatch: boolean;
  robotsMeta?: string;
  sourceText?: string;
}

export function classifyAuditPage(input: ClassifyAuditInput): {
  auditClass: ContentAuditClass;
  reasons: string[];
} {
  const reasons: string[] = [];
  const cleanPath = (() => {
    try {
      return new URL(input.url).pathname;
    } catch {
      return input.url;
    }
  })();

  if (input.httpStatus !== 200) {
    reasons.push(`HTTP ${input.httpStatus} (expected 200)`);
  }
  if (input.canonicalMismatch) {
    reasons.push('Canonical URL does not match requested path');
  }
  if (!input.title || input.title.trim().length < 10) {
    reasons.push('Missing or very short <title>');
  }
  if (!input.metaDescription || input.metaDescription.trim().length < 30) {
    reasons.push('Missing or weak <meta name="description">');
  }
  if (input.h1Count !== 1) {
    reasons.push(`Expected 1 <h1>, found ${input.h1Count}`);
  }

  const isPostRoute = /^\/(post|job|notice)\//i.test(cleanPath);
  const isToolOrUtilityRoute =
    /^\/tools(\/|$)/i.test(cleanPath) ||
    cleanPath === '/calculators' ||
    cleanPath === '/archive';

  // Class D: broken status, duplicate/near-duplicate collision, or excessive copied sentences
  if (input.httpStatus >= 400 || input.httpStatus === 0) {
    return { auditClass: 'D', reasons };
  }
  if (input.copiedRunLength > DEFAULT_AUDIT_THRESHOLDS.maxConsecutiveCopiedAllowed) {
    reasons.push(
      `${input.copiedRunLength} consecutive sentences match raw official excerpt (>2)`
    );
    return { auditClass: 'D', reasons };
  }
  if (
    input.highestJaccardScore >= DEFAULT_AUDIT_THRESHOLDS.nearDuplicateJaccardThreshold &&
    input.nearDuplicateOf
  ) {
    reasons.push(
      `Near-duplicate similarity ${(input.highestJaccardScore * 100).toFixed(0)}% with ${input.nearDuplicateOf}`
    );
    return { auditClass: 'D', reasons };
  }

  // Missing key quality signals
  if (input.wordCount < DEFAULT_AUDIT_THRESHOLDS.thinWordThreshold) {
    reasons.push(`Thin main content (${input.wordCount} words < 300)`);
  } else if (input.wordCount < DEFAULT_AUDIT_THRESHOLDS.minClassAWords) {
    reasons.push(`Below 400-word target (${input.wordCount} words)`);
  }

  if (isPostRoute && !input.hasOfficialLink) {
    reasons.push('Missing outbound official .gov.in/.nic.in/university link');
  }
  if (isPostRoute && !input.hasLastUpdated) {
    reasons.push('Missing visible Last updated / Last Verified timestamp');
  }

  // Class C: thin (<300 words) or serious structural problem on non-utility pages
  if (input.wordCount < DEFAULT_AUDIT_THRESHOLDS.thinWordThreshold) {
    return { auditClass: 'C', reasons };
  }
  if (input.canonicalMismatch && isPostRoute) {
    return { auditClass: 'C', reasons };
  }

  // Class A check
  if (
    input.wordCount >= DEFAULT_AUDIT_THRESHOLDS.minClassAWords &&
    input.h1Count === 1 &&
    Boolean(input.title) &&
    Boolean(input.metaDescription) &&
    (!isPostRoute || (input.hasOfficialLink && input.hasLastUpdated))
  ) {
    return { auditClass: 'A', reasons: reasons.length > 0 ? reasons : ['Meets all Class A quality thresholds'] };
  }

  // Utility routes with strong tool guidance (>320 words) still qualify as Class B if below 400
  if (isToolOrUtilityRoute && input.wordCount >= 320 && input.h1Count === 1) {
    return { auditClass: 'B', reasons };
  }

  return { auditClass: 'B', reasons };
}

export function evaluatePostCopyAndWords(candidateText: string, sourceText?: string) {
  return {
    wordCount: countWords(candidateText),
    copiedCheck: checkConsecutiveCopiedSentences(
      candidateText,
      sourceText,
      DEFAULT_AUDIT_THRESHOLDS.maxConsecutiveCopiedAllowed
    ),
  };
}
