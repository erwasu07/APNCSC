import type { ServiceItem } from '../servicesData';

export interface DerivedServiceFacts {
  issuingAuthority: string;
  authorityFromStoredData: boolean;
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

export const SERVICE_MERGE_CLUSTERS: ServiceClusterSuggestion[] = [
  {
    clusterId: 'jk-category-certificates',
    title: 'J&K Caste, Category & Reservation Certificates',
    hubPath: '/services/cluster/jk-category-certificates',
    summary:
      'Consolidated hub comparing SC, ST, OBC/OSC, RBA, ALC/IB, Pahari, EWS, and state reservation certificate services issued via J&K ServiceOnline / Tehsildar.',
    issuingAuthority: 'Competent Tehsildar / Revenue Authority via J&K e-UNNAT (ServiceOnline)',
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
      'Consolidated hub for Domicile, Birth, Death, Marriage, Character, Dependent, Unemployment, and Senior Citizen certificates in Jammu & Kashmir.',
    issuingAuthority: 'Competent Tehsildar / Registrar via J&K e-UNNAT Portal',
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
      'Unified comparison of J&K Revenue Department land extracts, mutations (Inteqal), Jamabandi, Girdawari, Fard, Legal Heir, and Income certificates.',
    issuingAuthority: 'Revenue Department, Govt. of Jammu & Kashmir (Tehsildar / Patwari Circle)',
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
      'Combined desk overview for Ayushman, Driving Licence, Vehicle RC, Aadhaar, Voter EPIC, and Ration PVC smart card print requests.',
    issuingAuthority: 'Respective Central/State Portals + Local CSC DOST Print Desk',
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

export function resolveServiceOfficialPortal(service: ServiceItem): { label: string; url: string } {
  if (service.officialUrl && service.officialUrl.trim().length > 0) {
    return { label: 'Official Portal', url: service.officialUrl.trim() };
  }
  if (service.category === 'cards_adda') {
    const sId = service.id.toLowerCase();
    if (sId.includes('ayushman')) return { label: 'NHA PM-JAY Portal', url: 'https://beneficiary.nha.gov.in' };
    if (sId.includes('dl') || sId.includes('rc')) return { label: 'Parivahan Sewa', url: 'https://parivahan.gov.in' };
    if (sId.includes('aadhaar')) return { label: 'UIDAI myAadhaar', url: 'https://myaadhaar.uidai.gov.in' };
    if (sId.includes('voter')) return { label: 'ECI Voters Portal', url: 'https://voters.eci.gov.in' };
    if (sId.includes('pan')) return { label: 'NSDL Protean', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' };
    if (sId.includes('gst')) return { label: 'GST Portal (GSTN)', url: 'https://www.gst.gov.in' };
    return { label: '', url: '' };
  }
  const sId = service.id.toLowerCase();
  const sName = service.name.toLowerCase();
  if (sId.includes('pan') || sName.includes('pan')) {
    return { label: 'NSDL Protean / Income Tax Portal', url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html' };
  }
  if (sId.includes('aadhaar') || sName.includes('aadhaar')) {
    return { label: 'UIDAI myAadhaar Portal', url: 'https://myaadhaar.uidai.gov.in' };
  }
  if (sId.includes('ayushman') || sName.includes('ayushman') || sName.includes('golden')) {
    return { label: 'NHA PM-JAY Beneficiary Portal', url: 'https://beneficiary.nha.gov.in' };
  }
  if (sId.includes('voter') || sName.includes('voter')) {
    return { label: 'ECI Voters Portal', url: 'https://voters.eci.gov.in' };
  }
  if (sId.includes('pmkisan') || sName.includes('kisan')) {
    return { label: 'PM-KISAN Official Portal', url: 'https://pmkisan.gov.in' };
  }
  if (sId.includes('passport') || sName.includes('passport')) {
    return { label: 'Passport Seva (MEA)', url: 'https://www.passportindia.gov.in' };
  }
  if (sId.includes('dl') || sName.includes('driving')) {
    return { label: 'Parivahan Sewa (MoRTH)', url: 'https://parivahan.gov.in' };
  }
  if (sId.includes('eshram') || sName.includes('shram')) {
    return { label: 'e-Shram Official Portal', url: 'https://eshram.gov.in' };
  }
  if (sId.includes('udyam')) {
    return { label: 'Udyam Registration (MSME)', url: 'https://udyamregistration.gov.in' };
  }
  if (sId.includes('gst')) {
    return { label: 'GST Portal (GSTN)', url: 'https://www.gst.gov.in' };
  }
  if (service.category === 'jk_state' || service.category === 'revenue') {
    return { label: 'J&K e-UNNAT / ServiceOnline Portal', url: 'https://eunnat.jk.gov.in' };
  }
  return { label: '', url: '' };
}

function resolveStoredAuthority(service: ServiceItem): { value: string; stored: boolean } {
  if (service.issuingAuthority && service.issuingAuthority.trim() && !/\[VERIFY\]/i.test(service.issuingAuthority)) {
    return { value: service.issuingAuthority.trim(), stored: true };
  }
  const sId = service.id.toLowerCase();
  if (service.category === 'revenue') {
    return {
      value: 'J&K Revenue Dept. (Tehsildar / Patwari)',
      stored: true,
    };
  }
  if (service.category === 'jk_state') {
    if (sId === 'jk-marriage-cert') return { value: 'Registrar of Marriages (J&K)', stored: true };
    if (sId === 'jk-building-licenses') return { value: 'SMC / JMC Municipal Authority', stored: true };
    if (sId === 'jk-drone-permission') return { value: 'District Magistrate (J&K)', stored: true };
    if (sId === 'jk-mgnrega-jobcard') return { value: 'Rural Development Dept., J&K', stored: true };
    if (sId === 'jk-horticulture-passbook') return { value: 'Dept. of Horticulture, J&K', stored: true };
    return {
      value: 'Tehsildar / J&K e-UNNAT',
      stored: true,
    };
  }
  if (sId === 'csc-pan' || sId === 'ca-epan-download' || sId === 'ca-lost-pan-find' || sId === 'ca-nsdl-instant-pan') {
    return { value: 'Income Tax Dept. (NSDL / UTIITSL)', stored: true };
  }
  if (sId === 'csc-aadhaar' || sId === 'ca-aadhaar-pvc') {
    return { value: 'UIDAI (Aadhaar Authority)', stored: true };
  }
  if (sId === 'csc-voter' || sId === 'ca-voter-pvc' || sId === 'ca-voter-mobile-link') {
    return { value: 'Election Commission (ECI)', stored: true };
  }
  if (sId === 'csc-ayushman' || sId === 'ca-ayushman-pvc') {
    return { value: 'National Health Authority (PM-JAY)', stored: true };
  }
  if (sId === 'csc-pmkisan') {
    return { value: 'Ministry of Agriculture (PM-KISAN)', stored: true };
  }
  if (sId === 'csc-eshram') {
    return { value: 'Ministry of Labour (e-Shram)', stored: true };
  }
  if (sId === 'csc-passport') {
    return { value: 'Passport Seva (MEA)', stored: true };
  }
  if (sId === 'csc-dl' || sId === 'ca-dl-pvc' || sId === 'ca-vehicle-rc-pvc') {
    return { value: 'MoRTH / RTO (Parivahan)', stored: true };
  }
  if (sId === 'biz-gst' || sId === 'ca-gst-registration') {
    return { value: 'GST Network (GSTN)', stored: true };
  }
  if (sId === 'biz-udyam') {
    return { value: 'Ministry of MSME', stored: true };
  }
  if (service.category === 'digital') {
    return { value: 'CSC DOST Desk, Qazigund', stored: true };
  }
  return { value: '[VERIFY]', stored: false };
}

function hasExplicitContent(val?: string | null): boolean {
  const s = String(val || '').trim();
  return Boolean(s && !/\[VERIFY\]/i.test(s) && !/^ask us$/i.test(s));
}

function hasExplicitList(arr?: string[] | null): boolean {
  return (
    Array.isArray(arr) &&
    arr.filter((item) => Boolean(item && item.trim() && !/\[VERIFY\]/i.test(item))).length > 0
  );
}

export function deriveStoredServiceFacts(service: ServiceItem): DerivedServiceFacts {
  const auth = resolveStoredAuthority(service);
  const portal = resolveServiceOfficialPortal(service);

  const eligibilityStored = hasExplicitContent(service.eligibility);
  const eligibility = eligibilityStored ? service.eligibility!.trim() : '[VERIFY]';

  const reqList = Array.isArray(service.requirements)
    ? service.requirements.map((r) => r.trim()).filter(Boolean)
    : [];
  const requirementsStored = reqList.length > 0 && !reqList.some((r) => /\[VERIFY\]/i.test(r));

  const feeLines = Array.isArray(service.feeLines) ? service.feeLines.filter(Boolean) : [];
  const rawPrice = String(service.price || '').trim();
  const feesStored =
    (feeLines.length > 0 || (Boolean(rawPrice) && !/^ask us$/i.test(rawPrice))) &&
    !/\[VERIFY\]/i.test(rawPrice);
  const feesText = rawPrice ? (feesStored ? rawPrice : `${rawPrice} [VERIFY]`) : '[VERIFY]';

  const rawTime = String(service.estimatedTime || '').trim();
  const timeStored = hasExplicitContent(rawTime);
  const estimatedTime = timeStored ? rawTime : '[VERIFY]';

  const stepFlowStored = hasExplicitList(service.stepFlow);
  const stepFlow = stepFlowStored ? service.stepFlow!.filter(Boolean) : [];

  const staffChecksStored = hasExplicitList(service.staffChecks);
  const staffChecks = staffChecksStored ? service.staffChecks!.filter(Boolean) : [];

  const rejectionReasonsStored = hasExplicitList(service.rejectionReasons);
  const rejectionReasons = rejectionReasonsStored ? service.rejectionReasons!.filter(Boolean) : [];

  const missingVerifyFields: string[] = [];
  if (!auth.stored) missingVerifyFields.push('issuingAuthority');
  if (!eligibilityStored) missingVerifyFields.push('eligibility');
  if (!requirementsStored) missingVerifyFields.push('requirements');
  if (!feesStored) missingVerifyFields.push('fees');
  if (!timeStored) missingVerifyFields.push('estimatedTime');
  if (!stepFlowStored) missingVerifyFields.push('stepFlow');
  if (!staffChecksStored) missingVerifyFields.push('staffChecks');
  if (!rejectionReasonsStored) missingVerifyFields.push('rejectionReasons');

  return {
    issuingAuthority: auth.value,
    authorityFromStoredData: auth.stored,
    eligibility,
    eligibilityFromStoredData: eligibilityStored,
    requirements: reqList,
    requirementsFromStoredData: requirementsStored,
    feesText,
    feeLines,
    feesFromStoredData: feesStored,
    estimatedTime,
    timeFromStoredData: timeStored,
    stepFlow,
    stepFlowFromStoredData: stepFlowStored,
    staffChecks,
    staffChecksFromStoredData: staffChecksStored,
    rejectionReasons,
    rejectionReasonsFromStoredData: rejectionReasonsStored,
    officialPortalUrl: portal.url,
    officialPortalLabel: portal.label,
    missingVerifyFields,
    hasVerifyPlaceholders: missingVerifyFields.length > 0,
  };
}

export function validateServiceReadyToPublish(service: ServiceItem): {
  canPublish: boolean;
  missingFields: string[];
  errors: string[];
} {
  const facts = deriveStoredServiceFacts(service);
  const errors: string[] = [];

  if (!facts.authorityFromStoredData) {
    errors.push('Issuing Authority still contains [VERIFY] or is missing.');
  }
  if (!facts.eligibilityFromStoredData) {
    errors.push('Who Is Eligible still contains [VERIFY] or is empty.');
  }
  if (!facts.requirementsFromStoredData) {
    errors.push('Exact Documents Checklist is incomplete or contains [VERIFY].');
  }
  if (!facts.feesFromStoredData) {
    errors.push('Fees field is missing or marked Ask us / [VERIFY].');
  }
  if (!facts.timeFromStoredData) {
    errors.push('Processing Time is missing or contains [VERIFY].');
  }
  if (!facts.stepFlowFromStoredData) {
    errors.push('Step-by-Step Flow still contains [VERIFY] or has no steps.');
  }
  if (!facts.staffChecksFromStoredData) {
    errors.push('CSC DOST Staff Pre-Submission Checks still contain [VERIFY] or are empty.');
  }
  if (!facts.rejectionReasonsFromStoredData) {
    errors.push('Common Rejection Reasons still contain [VERIFY] or are empty.');
  }

  return {
    canPublish: errors.length === 0,
    missingFields: facts.missingVerifyFields,
    errors,
  };
}
