export interface QualityValidationInput {
  id?: string;
  title?: string;
  shortInfo?: string;
  summary?: string;
  originalAnalysis?: string;
  eligibility?: string;
  lastDate?: string;
  postDate?: string;
  updatedAt?: string;
  officialNotificationUrl?: string;
  officialLink?: string;
  howToApply?: string | string[];
  selectionProcess?: string | string[];
  documentsRequired?: string[];
  notes?: string;
  sourceExcerpt?: string;
}

export interface QualityValidationOptions {
  minWordCount?: number;
  maxConsecutiveCopiedSentences?: number;
  requireUpdatedDate?: boolean;
  enforceWordCount?: boolean;
}

export interface QualityValidationResult {
  valid: boolean;
  wordCount: number;
  minWordCount: number;
  missingFields: string[];
  errors: string[];
  warnings: string[];
  copiedCheck: {
    hasExcessiveCopy: boolean;
    runLength: number;
    matchedSnippet?: string;
  };
}

export function countWords(text: string): number {
  const cleaned = String(text || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

function normalizeSentenceForCompare(sentence: string): string {
  return String(sentence || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitIntoSentences(text: string): string[] {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return [];
  return clean
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) >= 4);
}

/**
 * Checks whether `candidateText` copies more than `maxConsecutive` consecutive
 * sentences verbatim (or near-verbatim) from `sourceText`.
 */
export function checkConsecutiveCopiedSentences(
  candidateText: string,
  sourceText?: string,
  maxConsecutive = 2
): { hasExcessiveCopy: boolean; runLength: number; matchedSnippet?: string } {
  const sourceNormalized = splitIntoSentences(sourceText || '').map(normalizeSentenceForCompare);
  const candidateSentences = splitIntoSentences(candidateText);
  if (sourceNormalized.length === 0 || candidateSentences.length === 0) {
    return { hasExcessiveCopy: false, runLength: 0 };
  }

  const candidateNormalized = candidateSentences.map(normalizeSentenceForCompare);
  let longestRun = 0;
  let matchedSnippet: string | undefined;

  for (let i = 0; i < candidateNormalized.length; i++) {
    for (let j = 0; j < sourceNormalized.length; j++) {
      let run = 0;
      while (
        i + run < candidateNormalized.length &&
        j + run < sourceNormalized.length &&
        candidateNormalized[i + run].length >= 24 &&
        candidateNormalized[i + run] === sourceNormalized[j + run]
      ) {
        run++;
      }
      if (run > longestRun) {
        longestRun = run;
        if (run > maxConsecutive) {
          matchedSnippet = candidateSentences.slice(i, i + run).join(' ').slice(0, 180);
        }
      }
    }
  }

  return {
    hasExcessiveCopy: longestRun > maxConsecutive,
    runLength: longestRun,
    matchedSnippet,
  };
}

export function isValidHttpUrl(rawUrl?: string): boolean {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function collectCombinedOriginalText(input: QualityValidationInput): string {
  const parts: string[] = [];
  if (input.title) parts.push(input.title);
  if (input.shortInfo) parts.push(input.shortInfo);
  if (input.summary) parts.push(input.summary);
  if (input.originalAnalysis) parts.push(input.originalAnalysis);
  if (input.eligibility) parts.push(input.eligibility);
  if (input.notes) parts.push(input.notes);
  if (Array.isArray(input.howToApply)) parts.push(input.howToApply.join(' '));
  else if (input.howToApply) parts.push(input.howToApply);
  if (Array.isArray(input.selectionProcess)) parts.push(input.selectionProcess.join(' '));
  else if (input.selectionProcess) parts.push(input.selectionProcess);
  if (Array.isArray(input.documentsRequired)) parts.push(input.documentsRequired.join(' '));
  return parts.join(' ').trim();
}

export function validatePostPublishQuality(
  input: QualityValidationInput,
  options: QualityValidationOptions = {}
): QualityValidationResult {
  const minWordCount = options.minWordCount ?? 400;
  const maxConsecutive = options.maxConsecutiveCopiedSentences ?? 2;
  const requireUpdatedDate = options.requireUpdatedDate ?? true;
  const enforceWordCount = options.enforceWordCount ?? true;

  const missingFields: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const title = String(input.title || '').trim();
  if (!title || countWords(title) < 3) {
    missingFields.push('title');
    errors.push('A descriptive Notification Title (at least 3 words) is required.');
  }

  const officialUrl = String(input.officialNotificationUrl || input.officialLink || '').trim();
  if (!isValidHttpUrl(officialUrl)) {
    missingFields.push('officialSourceUrl');
    errors.push('A valid Official Source / Notification URL (https:// or http://) is mandatory.');
  }

  const hasDate = Boolean(
    String(input.updatedAt || input.postDate || '').trim()
  );
  if (requireUpdatedDate && !hasDate) {
    missingFields.push('lastUpdated');
    errors.push('Last updated or official notice date must be specified.');
  }

  const hasSummary = countWords(String(input.summary || input.shortInfo || input.originalAnalysis || '')) >= 15;
  if (!hasSummary) {
    missingFields.push('summary');
    errors.push('Original summary / explanation section must contain at least 15 meaningful words.');
  }

  const hasEligibility = Boolean(String(input.eligibility || '').trim()) &&
    !/^(refer|see|check)\s+official/i.test(String(input.eligibility || '').trim());
  if (!String(input.eligibility || '').trim()) {
    missingFields.push('eligibility');
    errors.push('Eligibility / target group details must be filled.');
  } else if (!hasEligibility) {
    warnings.push('Replace generic eligibility placeholder with exact qualification or learner group criteria.');
  }

  if (!String(input.lastDate || '').trim()) {
    missingFields.push('lastDate');
    errors.push('Closing / examination / reference date field must be populated (or marked "As per official notice").');
  }

  const combinedText = collectCombinedOriginalText(input);
  const wordCount = countWords(combinedText);

  if (enforceWordCount && wordCount < minWordCount) {
    errors.push(
      `Original explanation and guidance content is too thin (${wordCount} words). Minimum ${minWordCount} original words are required before publishing live.`
    );
  } else if (wordCount < minWordCount) {
    warnings.push(
      `Content currently has ${wordCount} words (recommended minimum: ${minWordCount} words before publishing live).`
    );
  }

  const copiedCheck = checkConsecutiveCopiedSentences(
    combinedText,
    input.sourceExcerpt,
    maxConsecutive
  );
  if (copiedCheck.hasExcessiveCopy) {
    errors.push(
      `Anti-copy check failed: ${copiedCheck.runLength} consecutive sentences match the raw official source excerpt (maximum ${maxConsecutive} allowed). Rewrite the explanation in original plain language.`
    );
  }

  return {
    valid: errors.length === 0,
    wordCount,
    minWordCount,
    missingFields,
    errors,
    warnings,
    copiedCheck,
  };
}
