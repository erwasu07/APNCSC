import type { ServiceItem } from '../servicesData';

export interface DerivedServiceFacts {
  issuingAuthority: string;
  authorityFromStoredData: boolean;
  officialFee: string;
  officialFeeFromStoredData: boolean;
  cscCharge: string;
  cscChargeFromStoredData: boolean;
  eligibility: string;
  eligibilityFromStoredData: boolean;
  requirements: string[];
  requirementsFromStoredData: boolean;
  feesText: string;
  feeLines: string[];
  feesFromStoredData: boolean;
  estimatedTime: string;
  timeFromStoredData: boolean;
  stepFlow: string[];
  stepFlowFromStoredData: boolean;
  staffChecks: string[];
  staffChecksFromStoredData: boolean;
  rejectionReasons: string[];
  rejectionReasonsFromStoredData: boolean;
  officialPortalUrl: string;
  officialPortalLabel: string;
  officialUrlFromStoredData: boolean;
  lastVerifiedDate: string;
  lastVerifiedFromStoredData: boolean;
  missingVerifyFields: string[];
  hasVerifyPlaceholders: boolean;
}

export interface ServiceClusterSuggestion {
  clusterId: string;
  title: string;
  hubPath: string;
  summary: string;
  issuingAuthority: string;
  memberIds: string[];
}

export interface ServiceClusterHubOverride {
  clusterId: string;
  whatDocumentIsFor?: string;
  howServicesDiffer?: string;
  commonMistakes?: string[];
  officialSources?: Array<{ label: string; url: string }>;
  perServiceDifferences?: Record<string, string>;
  lastVerifiedDate?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ClusterHubReadinessResult {
  isIndexable: boolean;
  missingData: string[];
  sectionStatus: {
    whatDocumentIsFor: boolean;
    howServicesDiffer: boolean;
    comparisonTableComplete: boolean;
    perServiceDifferences: boolean;
    commonMistakes: boolean;
    officialSources: boolean;
    minWordCount800: boolean;
  };
}

export const SERVICE_MERGE_CLUSTERS: ServiceClusterSuggestion[] = [
  {
    clusterId: 'jk-category-certificates',
    title: 'J&K Caste, Category & Reservation Certificates',
    hubPath: '/services/cluster/jk-category-certificates',
    summary:
      'Consolidated comparison of SC, ST, OBC/OSC, RBA, ALC/IB, Pahari, EWS, and state reservation certificates.',
    issuingAuthority: 'Competent Revenue Authority (Tehsildar) via J&K e-UNNAT',
    memberIds: [
      'jk-rba-cert',
      'jk-obc-cert',
      'jk-st-cert',
      'jk-sc-cert',
      'jk-alc-ib-cert',
      'jk-pahari-cert',
      'jk-ews-cert',
      'csc-certificates',
    ],
  },
  {
    clusterId: 'jk-civil-certificates',
    title: 'J&K Domicile, Civil & Identity Certificates',
    hubPath: '/services/cluster/jk-civil-certificates',
    summary:
      'Consolidated overview of Domicile, Birth, Death, Marriage, Character, Dependent, Unemployment, and Senior Citizen certificates.',
    issuingAuthority: 'Competent Tehsildar / Civil Registrar via J&K e-UNNAT',
    memberIds: [
      'jk-domicile-cert',
      'jk-birth-cert',
      'jk-death-cert',
      'jk-marriage-cert',
      'jk-character-cert',
      'jk-dependent-cert',
      'jk-unemployment-cert',
      'jk-senior-citizen',
    ],
  },
  {
    clusterId: 'jk-revenue-land-records',
    title: 'J&K Revenue & Land Records (rev-*)',
    hubPath: '/services/cluster/jk-revenue-land-records',
    summary:
      'Unified reference for J&K Revenue land extracts, mutations, Jamabandi, Girdawari, Fard, Legal Heir, and Income certificates.',
    issuingAuthority: 'Revenue Department, Govt. of Jammu & Kashmir',
    memberIds: [
      'rev-attestation-mutation',
      'rev-clu',
      'rev-copy-mutation',
      'rev-encumbrance-cert',
      'rev-aks-masavi',
      'rev-chulah-chowkidara',
      'rev-girdawari',
      'rev-jamabandi',
      'rev-fard',
      'rev-field-book',
      'rev-court-files',
      'rev-income-cert',
      'rev-income-dependency',
      'rev-land-passbook',
      'rev-legal-heir',
      'rev-demarcation',
      'rev-prc-files',
      'rev-property-cert',
      'rev-shajra-nasab',
    ],
  },
  {
    clusterId: 'instant-pvc-smart-cards',
    title: 'Instant PVC & Smart Card Printing (ca-*-pvc)',
    hubPath: '/services/cluster/instant-pvc-smart-cards',
    summary:
      'Comparison hub for Ayushman, Driving Licence, Vehicle RC, Aadhaar, Voter EPIC, and Ration PVC smart card print requests.',
    issuingAuthority: 'Respective Official Portals & CSC DOST Print Desk',
    memberIds: [
      'ca-ayushman-pvc',
      'ca-dl-pvc',
      'ca-vehicle-rc-pvc',
      'ca-aadhaar-pvc',
      'ca-voter-pvc',
      'ca-ration-rice-pvc',
    ],
  },
];

export function getServiceClusterById(clusterId: string): ServiceClusterSuggestion | undefined {
  return SERVICE_MERGE_CLUSTERS.find((c) => c.clusterId === clusterId);
}

export function getClusterForServiceId(serviceId: string): ServiceClusterSuggestion | undefined {
  return SERVICE_MERGE_CLUSTERS.find((c) => c.memberIds.includes(serviceId));
}

export function isValidHttpUrl(val?: string | null): boolean {
  const s = String(val || '').trim();
  if (!s || /\[VERIFY\]/i.test(s)) return false;
  try {
    const parsed = new URL(s);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function hasExplicitContent(val?: string | null): boolean {
  const s = String(val || '').trim();
  if (!s) return false;
  if (/\[VERIFY\]/i.test(s)) return false;
  if (/^ask us\b/i.test(s) || /\bask us\b/i.test(s)) return false;
  if (/^refer official/i.test(s) || /^as per official/i.test(s)) return false;
  return true;
}

export function isNonPlaceholderFeeNote(val?: string | null): boolean {
  const s = String(val || '').trim();
  if (!s) return false;
  if (/\[VERIFY\]/i.test(s)) return false;
  if (/\bask us\b/i.test(s)) return false;
  if (/depends on/i.test(s)) return false;
  return true;
}

export function hasExplicitList(arr?: string[] | null): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const clean = arr.map((item) => String(item || '').trim()).filter(Boolean);
  return clean.length > 0 && !clean.some((item) => /\[VERIFY\]/i.test(item) || /\bask us\b/i.test(item));
}

export function resolveServiceOfficialPortal(service: ServiceItem): { label: string; url: string } {
  if (isValidHttpUrl(service.officialUrl)) {
    try {
      const host = new URL(service.officialUrl!.trim()).hostname.replace(/^www\./i, '');
      return { label: `Official Portal (${host})`, url: service.officialUrl!.trim() };
    } catch {
      return { label: 'Official Portal', url: service.officialUrl!.trim() };
    }
  }
  return { label: '', url: '' };
}

export function deriveStoredServiceFacts(service: ServiceItem): DerivedServiceFacts {
  const authorityFromStoredData = hasExplicitContent(service.issuingAuthority);
  const issuingAuthority = authorityFromStoredData ? service.issuingAuthority!.trim() : '';

  const officialFeeFromStoredData = hasExplicitContent(service.officialFee);
  const officialFee = officialFeeFromStoredData ? service.officialFee!.trim() : '';

  const cscChargeFromStoredData = hasExplicitContent(service.cscCharge);
  const cscCharge = cscChargeFromStoredData ? service.cscCharge!.trim() : '';

  const portal = resolveServiceOfficialPortal(service);
  const officialUrlFromStoredData = isValidHttpUrl(service.officialUrl);

  const eligibilityFromStoredData = hasExplicitContent(service.eligibility);
  const eligibility = eligibilityFromStoredData ? service.eligibility!.trim() : '';

  const reqList = Array.isArray(service.requirements)
    ? service.requirements.map((r) => String(r || '').trim()).filter((r) => r && !/\[VERIFY\]/i.test(r) && !/\bask us\b/i.test(r))
    : [];
  const requirementsFromStoredData = hasExplicitList(service.requirements);

  const storedFeeLines = Array.isArray(service.feeLines)
    ? service.feeLines.map((l) => String(l || '').trim()).filter((l) => isNonPlaceholderFeeNote(l))
    : [];

  let computedFeeLines: string[] = [];
  if (officialFeeFromStoredData || cscChargeFromStoredData) {
    if (officialFeeFromStoredData) computedFeeLines.push(`Official Government Fee: ${officialFee}`);
    if (cscChargeFromStoredData) computedFeeLines.push(`CSC DOST Service Charge: ${cscCharge}`);
  } else if (storedFeeLines.length > 0) {
    computedFeeLines = storedFeeLines;
  }

  const rawPrice = String(service.price || '').trim();
  const hasDisplayFeeNote =
    computedFeeLines.length > 0 || isNonPlaceholderFeeNote(rawPrice);

  let feesText = '';
  if (officialFeeFromStoredData && cscChargeFromStoredData) {
    feesText = `${officialFee} (Official Fee) + ${cscCharge} (CSC DOST Charge)`;
  } else if (computedFeeLines.length > 0) {
    feesText = computedFeeLines.join(' · ');
  } else if (isNonPlaceholderFeeNote(rawPrice)) {
    feesText = rawPrice;
  }

  const rawTime = String(service.estimatedTime || '').trim();
  const timeFromStoredData = hasExplicitContent(rawTime);
  const estimatedTime = timeFromStoredData ? rawTime : '';

  const stepFlowFromStoredData = hasExplicitList(service.stepFlow);
  const stepFlow = stepFlowFromStoredData ? service.stepFlow!.map((s) => s.trim()).filter(Boolean) : [];

  const staffChecksFromStoredData = hasExplicitList(service.staffChecks);
  const staffChecks = staffChecksFromStoredData ? service.staffChecks!.map((s) => s.trim()).filter(Boolean) : [];

  const rejectionReasonsFromStoredData = hasExplicitList(service.rejectionReasons);
  const rejectionReasons = rejectionReasonsFromStoredData
    ? service.rejectionReasons!.map((s) => s.trim()).filter(Boolean)
    : [];

  const rawLastVerified = String(service.lastVerifiedDate || service.updatedAt || '').trim();
  const lastVerifiedFromStoredData = hasExplicitContent(rawLastVerified);
  const lastVerifiedDate = lastVerifiedFromStoredData ? rawLastVerified : '';

  const missingVerifyFields: string[] = [];
  if (!authorityFromStoredData) missingVerifyFields.push('issuingAuthority');
  if (!officialFeeFromStoredData) missingVerifyFields.push('officialFee');
  if (!cscChargeFromStoredData) missingVerifyFields.push('cscCharge');
  if (!timeFromStoredData) missingVerifyFields.push('estimatedTime');
  if (!eligibilityFromStoredData) missingVerifyFields.push('eligibility');
  if (!requirementsFromStoredData) missingVerifyFields.push('requirements');
  if (!stepFlowFromStoredData) missingVerifyFields.push('stepFlow');
  if (!rejectionReasonsFromStoredData) missingVerifyFields.push('rejectionReasons');
  if (!staffChecksFromStoredData) missingVerifyFields.push('staffChecks');
  if (!officialUrlFromStoredData) missingVerifyFields.push('officialUrl');
  if (!lastVerifiedFromStoredData) missingVerifyFields.push('lastVerifiedDate');

  return {
    issuingAuthority,
    authorityFromStoredData,
    officialFee,
    officialFeeFromStoredData,
    cscCharge,
    cscChargeFromStoredData,
    eligibility,
    eligibilityFromStoredData,
    requirements: reqList,
    requirementsFromStoredData,
    feesText,
    feeLines: computedFeeLines,
    feesFromStoredData: hasDisplayFeeNote,
    estimatedTime,
    timeFromStoredData,
    stepFlow,
    stepFlowFromStoredData,
    staffChecks,
    staffChecksFromStoredData,
    rejectionReasons,
    rejectionReasonsFromStoredData,
    officialPortalUrl: portal.url,
    officialPortalLabel: portal.label,
    officialUrlFromStoredData,
    lastVerifiedDate,
    lastVerifiedFromStoredData,
    missingVerifyFields,
    hasVerifyPlaceholders: missingVerifyFields.length > 0,
  };
}

export function validateServiceReadyToPublish(
  service: ServiceItem,
  renderedWordCount?: number
): {
  canPublish: boolean;
  missingFields: string[];
  errors: string[];
} {
  const facts = deriveStoredServiceFacts(service);
  const errors: string[] = [];

  if (!facts.authorityFromStoredData) {
    errors.push('Issuing Authority is missing or marked [VERIFY].');
  }
  if (!facts.officialFeeFromStoredData) {
    errors.push('Official Fee is missing or marked [VERIFY] / Ask us.');
  }
  if (!facts.cscChargeFromStoredData) {
    errors.push('CSC DOST Service Charge is missing or marked [VERIFY].');
  }
  if (!facts.timeFromStoredData) {
    errors.push('Real Processing Time is missing or marked [VERIFY].');
  }
  if (!facts.eligibilityFromStoredData) {
    errors.push('Eligibility is missing or marked [VERIFY].');
  }
  if (!facts.requirementsFromStoredData) {
    errors.push('Exact Documents List is incomplete or contains [VERIFY].');
  }
  if (!facts.stepFlowFromStoredData) {
    errors.push('Step Flow is missing or contains [VERIFY].');
  }
  if (!facts.rejectionReasonsFromStoredData) {
    errors.push('Common Rejection Reasons are missing or contain [VERIFY].');
  }
  if (!facts.staffChecksFromStoredData) {
    errors.push('Staff Pre-Submission Checks are missing or contain [VERIFY].');
  }
  if (!facts.officialUrlFromStoredData) {
    errors.push('Official Portal URL is missing or invalid (must start with https:// or http://).');
  }
  if (!facts.lastVerifiedFromStoredData) {
    errors.push('Last Verified Date is missing.');
  }
  if (typeof renderedWordCount === 'number' && renderedWordCount < 400) {
    errors.push(`Original main content is ${renderedWordCount} words (requires 400+ words before indexing).`);
  }

  return {
    canPublish: errors.length === 0,
    missingFields: facts.missingVerifyFields,
    errors,
  };
}

export function evaluateClusterHubReadiness(
  cluster: ServiceClusterSuggestion,
  members: ServiceItem[],
  override?: ServiceClusterHubOverride,
  renderedWordCount?: number
): ClusterHubReadinessResult {
  const missingData: string[] = [];

  const hasWhatFor = hasExplicitContent(override?.whatDocumentIsFor);
  if (!hasWhatFor) {
    missingData.push('Hub section: "What the document/service is for" is missing.');
  }

  const hasHowDiff = hasExplicitContent(override?.howServicesDiffer);
  if (!hasHowDiff) {
    missingData.push('Hub section: "How the services differ from each other" is missing.');
  }

  const hasCommonMistakes = hasExplicitList(override?.commonMistakes);
  if (!hasCommonMistakes) {
    missingData.push('Hub section: "Common mistakes" list is missing.');
  }

  const validSources = Array.isArray(override?.officialSources)
    ? override!.officialSources.filter((s) => hasExplicitContent(s?.label) && isValidHttpUrl(s?.url))
    : [];
  const hasOfficialSources = validSources.length > 0;
  if (!hasOfficialSources) {
    missingData.push('Hub section: "Official sources list" is missing or has no valid URL.');
  }

  let tableComplete = true;
  let perServiceDiffsComplete = true;
  for (const m of members) {
    const f = deriveStoredServiceFacts(m);
    if (!f.authorityFromStoredData) {
      tableComplete = false;
      missingData.push(`${m.name} (${m.id}): missing Issuing Authority`);
    }
    if (!f.eligibilityFromStoredData) {
      tableComplete = false;
      missingData.push(`${m.name} (${m.id}): missing Who It Is For (Eligibility)`);
    }
    if (!f.timeFromStoredData) {
      tableComplete = false;
      missingData.push(`${m.name} (${m.id}): missing Typical Processing Time`);
    }
    if (!f.feesFromStoredData) {
      tableComplete = false;
      missingData.push(`${m.name} (${m.id}): missing Official Fee / CSC Charge note`);
    }
    const diffNote = override?.perServiceDifferences?.[m.id];
    if (!hasExplicitContent(diffNote)) {
      perServiceDiffsComplete = false;
      missingData.push(`${m.name} (${m.id}): missing specific per-service difference note`);
    }
  }

  const minWordCount800 =
    typeof renderedWordCount === 'number' ? renderedWordCount >= 800 : false;
  if (typeof renderedWordCount === 'number' && renderedWordCount < 800) {
    missingData.push(
      `Word count threshold: currently ${renderedWordCount} words (requires 800+ original words).`
    );
  } else if (renderedWordCount === undefined) {
    missingData.push('Word count threshold: requires 800+ original words.');
  }

  return {
    isIndexable: missingData.length === 0,
    missingData,
    sectionStatus: {
      whatDocumentIsFor: hasWhatFor,
      howServicesDiffer: hasHowDiff,
      comparisonTableComplete: tableComplete,
      perServiceDifferences: perServiceDiffsComplete,
      commonMistakes: hasCommonMistakes,
      officialSources: hasOfficialSources,
      minWordCount800,
    },
  };
}
