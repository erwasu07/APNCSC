import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Language = 'en' | 'hi' | 'ur';

interface TranslationDict {
  brandName: string;
  brandSubtitle: string;
  searchPlaceholder: string;
  heroSearchPlaceholder: string;
  independentChip: string;
  heroTitle: string;
  heroSubtitle: string;
  searchButton: string;
  trackButton: string;
  staffLogin: string;
  categoriesHeading: string;
  categoriesSubheading: string;
  catJobs: string;
  catJobsDesc: string;
  catAdmissions: string;
  catAdmissionsDesc: string;
  catSchemes: string;
  catSchemesDesc: string;
  catServices: string;
  catServicesDesc: string;
  catTools: string;
  catToolsDesc: string;
  latestJobsHeading: string;
  latestJobsSubheading: string;
  viewAllJobs: string;
  departmentLabel: string;
  vacanciesLabel: string;
  lastDateLabel: string;
  urgentDaysLeft: (days: number) => string;
  closingToday: string;
  openStatus: string;
  admissionsHeading: string;
  admissionsSubheading: string;
  ignouShortcut: string;
  viewAllAdmissions: string;
  schemesHeading: string;
  schemesSubheading: string;
  viewAllSchemes: string;
  exploreScheme: string;
  toolsHeading: string;
  toolsSubheading: string;
  viewAllTools: string;
  calculatorsShortcut: string;
  helpTitle: string;
  helpSubtitle: string;
  helpOperatorLabel: string;
  helpVleLabel: string;
  helpLocationLabel: string;
  callNow: string;
  whatsappNow: string;
  adLabel: string;
  footerAbout: string;
  footerContact: string;
  footerPrivacy: string;
  footerDisclaimer: string;
  footerTerms: string;
  footerRefund: string;
  footerAddress: string;
  footerDisclaimerNote: string;
  navHome: string;
  navJobs: string;
  navEducation: string;
  navSchemes: string;
  navServices: string;
  navTools: string;
  navCalculators: string;
  navTrack: string;
  noSearchResults: string;
  searchResultsTitle: string;
  clearSearch: string;
  officialNotice: string;
  shareOnWhatsApp: string;
  alertsTitle: string;
  alertsSubtitle: string;
  joinWhatsAppGroup: string;
  joinTelegramChannel: string;
  jobsPageTitle: string;
  jobsPageSubtitle: string;
  educationPageTitle: string;
  educationPageSubtitle: string;
  ignouPageTitle: string;
  ignouPageSubtitle: string;
  jobsSearchPlaceholder: string;
  eduSearchPlaceholder: string;
  filterOrgLabel: string;
  filterInstLabel: string;
  filterQualificationLabel: string;
  filterAll: string;
  filterOther: string;
  filterJkDomicileOnly: string;
  qualAll: string;
  qual10th: string;
  qual12th: string;
  qualDiploma: string;
  qualGraduate: string;
  qualPostgraduate: string;
  tabOpenNow: string;
  tabExamsAdmitCards: string;
  tabResultsKeys: string;
  tabUpcoming: string;
  tabArchive: string;
  sortLabel: string;
  sortNearestDeadline: string;
  sortNewestPosted: string;
  closingSoonRailTitle: string;
  jkDomicileBadge: string;
  qualificationLabel: string;
  viewDetails: string;
  emptyListTitle: string;
  emptyListSubtitle: string;
  resetFilters: string;
  paginationPrev: string;
  paginationNext: string;
  officialPortalsTitle: string;
  officialPortalsSubtitle: string;
  browseIgnouLink: string;
  backToAllEducation: string;
  noOpenNowHint: string;
  checkNoticeTag: string;
  objectionsTillPrefix: string;
  backToNotices: string;
  officialPortalBtn: string;
  officialPdfBtn: string;
  getApplicationHelp: string;
  getAdmissionHelp: string;
  postOverview: string;
  postImportantDates: string;
  postScheduleTitle: string;
  postFeeDetails: string;
  postAgeLimit: string;
  postVacancyBreakdown: string;
  postHowToApply: string;
  postNextSteps: string;
  postTimeline: string;
  postRelated: string;
  asPerOfficialNotice: string;
  venueLabel: string;
  reportingTimeLabel: string;
  examWindowLabel: string;
  dvDateLabel: string;
  resultOutLabel: string;
  keyOutLabel: string;
  windowOpensLabel: string;
  closingDateLabel: string;
  closedOnLabel: string;
  duplicateNoticeBannerTitle: string;
  viewCanonicalNotice: string;
  schemesHubEyebrow: string;
  schemesHubTitle: string;
  schemesHubSubtitle: string;
  schemesSearchPlaceholder: string;
  schemesSummaryBoxTitle: string;
  schemesDeptLabel: string;
  schemesBeneficiariesLabel: string;
  schemesBenefitLabel: string;
  schemesRegionLabel: string;
  schemesDeadlineLabel: string;
  schemesFeeLabel: string;
  schemesAsPerGuidelines: string;
  schemesEligibilityTitle: string;
  schemesDocumentsTitle: string;
  schemesApplyGuideTitle: string;
  schemesNeedHelpCta: string;
  schemesNoGuaranteeNote: string;
  schemesBackToAll: string;
  schemesOfficialPortalBtn: string;
  schemesRelatedTitle: string;
  schemesNoMatchTitle: string;
  servicesHubTitle: string;
  servicesHubSubtitle: string;
  servicesSearchPlaceholder: string;
  servicesFeeNote: string;
  servicesAskUs: string;
  servicesDocsNeeded: string;
  servicesTypicalTime: string;
  servicesFeeLabel: string;
  servicesEnquireWhatsapp: string;
  servicesCallBtn: string;
  servicesViewDetails: string;
  servicesApplyOnline: string;
  servicesBackToAll: string;
  servicesProcessStepsTitle: string;
  servicesDocsChecklistTitle: string;
  servicesFaqTitle: string;
  servicesRelatedTitle: string;
  toolsHubTitle: string;
  toolsHubSubtitle: string;
  toolsSearchPlaceholder: string;
  toolsPrivacyTitle: string;
  toolsPrivacyDesc: string;
  toolsPrivacyNotePdfWorker: string;
  toolsLaunchBtn: string;
  toolsBackToAll: string;
  toolsExplanationTitle: string;
  toolsCapabilitiesLabel: string;
  toolsCommonUsesLabel: string;
  toolsPrivacyBadge: string;
  toolsRelatedTitle: string;
  calculatorsPageTitle: string;
  calculatorsPageSubtitle: string;
  calculatorsTabAge: string;
  calculatorsTabPhoto: string;
  calculatorsTabFee: string;
  calculatorsHowCalculatedTitle: string;
  calculatorsFaqTitle: string;
  calculatorsRateNoticeAge: string;
  calculatorsRateNoticePhoto: string;
  calculatorsRateNoticeFee: string;
  closingThisWeekTitle: string;
  closingThisWeekSubtitle: string;
  trustStripTitle: string;
  comingSoon: string;
}

const EN_DICT: TranslationDict = {
  brandName: 'CSC DOST',
  brandSubtitle: 'J&K Citizen Portal',
  searchPlaceholder: 'Search jobs, schemes, services…',
  heroSearchPlaceholder: 'Search JKSSB, IGNOU, PM-KISAN, PAN, PDF tools…',
  independentChip: 'Independent portal, not a government website',
  heroTitle: 'Jobs, Admissions & Citizen Services for Jammu & Kashmir',
  heroSubtitle:
    'Verified recruitment notices, university forms, central welfare schemes, CSC e-services, and free document tools in one fast portal.',
  searchButton: 'Search',
  trackButton: 'Track Application',
  staffLogin: 'Staff Login',
  categoriesHeading: 'Browse Services & Updates',
  categoriesSubheading: 'Choose a category to open verified portals, guides, or tools.',
  catJobs: 'Jobs',
  catJobsDesc: 'JKSSB, Army, SSC & RRB',
  catAdmissions: 'Admissions',
  catAdmissionsDesc: 'KU, Cluster Univ & IGNOU',
  catSchemes: 'Schemes',
  catSchemesDesc: 'PM-KISAN, Ayushman & Welfare',
  catServices: 'CSC Services',
  catServicesDesc: 'PAN, Domicile, Income & Certificates',
  catTools: 'Tools & Calculators',
  catToolsDesc: 'PDF, Photo Resize & Age/Fee Calc',
  latestJobsHeading: 'Latest Jobs & Recruitment',
  latestJobsSubheading: 'Updated daily from official notifications with closing-soon alerts.',
  viewAllJobs: 'View all jobs',
  departmentLabel: 'Department',
  vacanciesLabel: 'Vacancies',
  lastDateLabel: 'Last Date',
  urgentDaysLeft: (days: number) => (days === 0 ? 'Closes today' : `${days}d left`),
  closingToday: 'Closes today',
  openStatus: 'Open',
  admissionsHeading: 'University Admissions & Exams',
  admissionsSubheading: 'Kashmir University, Cluster University Srinagar, and IGNOU updates.',
  ignouShortcut: 'IGNOU Notifications',
  viewAllAdmissions: 'View all admissions',
  schemesHeading: 'Popular Government Schemes',
  schemesSubheading: 'Step-by-step eligibility, eKYC, and beneficiary guides with official links.',
  viewAllSchemes: 'View all schemes',
  exploreScheme: 'View scheme guide',
  toolsHeading: 'Document Tools & Calculators',
  toolsSubheading: 'Fast client-side utilities that work on mobile and slow connections.',
  viewAllTools: 'All tools',
  calculatorsShortcut: 'Citizen Calculators',
  helpTitle: 'Need help applying?',
  helpSubtitle:
    'Get guided assistance for online forms, document scanning, biometric e-KYC, and fee payments.',
  helpOperatorLabel: 'Operator',
  helpVleLabel: 'VLE ID',
  helpLocationLabel: 'Centre',
  callNow: 'Call +91 70068 33767',
  whatsappNow: 'WhatsApp Help',
  adLabel: 'Advertisement',
  footerAbout: 'About',
  footerContact: 'Contact',
  footerPrivacy: 'Privacy Policy',
  footerDisclaimer: 'Disclaimer',
  footerTerms: 'Terms of Use',
  footerRefund: 'Refund Policy',
  footerAddress: 'Sangran Qazigund, Anantnag, Jammu & Kashmir 192221',
  footerDisclaimerNote:
    'CSC DOST is an independent portal, not an official government website. Always confirm details on the official notification.',
  navHome: 'Home',
  navJobs: 'Jobs',
  navEducation: 'Education',
  navSchemes: 'Schemes',
  navServices: 'E-Services',
  navTools: 'Tools',
  navCalculators: 'Calculators',
  navTrack: 'Track',
  noSearchResults: 'No matching jobs, schemes, services, or tools found.',
  searchResultsTitle: 'Quick Search Results',
  clearSearch: 'Clear search',
  officialNotice: 'Official notice',
  shareOnWhatsApp: 'Share on WhatsApp',
  alertsTitle: 'Get Free Job & Admission Alerts',
  alertsSubtitle: 'Receive verified J&K and national updates directly on your phone.',
  joinWhatsAppGroup: 'Join WhatsApp Group',
  joinTelegramChannel: 'Telegram Channel',
  jobsPageTitle: 'Jobs & Recruitment',
  jobsPageSubtitle:
    'Verified JKSSB, SSC, RRB, Indian Army, and banking notifications with live IST deadlines and exam schedules.',
  educationPageTitle: 'Education & Admissions',
  educationPageSubtitle:
    'IGNOU, University of Kashmir, Cluster University Srinagar, NTA, and scholarship notices with official portals.',
  ignouPageTitle: 'IGNOU Latest Notifications',
  ignouPageSubtitle:
    'Find IGNOU admission, re-registration, assignment, exam form, datesheet, hall ticket, and result updates.',
  jobsSearchPlaceholder: 'Search JKSSB, SSC, RRB, post title, or qualification…',
  eduSearchPlaceholder: 'Search IGNOU, Kashmir Univ, CUS, exam form, or course…',
  filterOrgLabel: 'Organisation',
  filterInstLabel: 'Institution',
  filterQualificationLabel: 'Qualification',
  filterAll: 'All',
  filterOther: 'Other',
  filterJkDomicileOnly: 'J&K domicile only',
  qualAll: 'All qualifications',
  qual10th: '10th / Matric',
  qual12th: '12th / 10+2',
  qualDiploma: 'Diploma / ITI',
  qualGraduate: 'Graduate',
  qualPostgraduate: 'Postgraduate',
  tabOpenNow: 'Open now',
  tabExamsAdmitCards: 'Exams & admit cards',
  tabResultsKeys: 'Results & keys',
  tabUpcoming: 'Upcoming',
  tabArchive: 'Archive',
  sortLabel: 'Sort',
  sortNearestDeadline: 'Nearest deadline',
  sortNewestPosted: 'Newest posted',
  closingSoonRailTitle: 'Closing within 7 days',
  jkDomicileBadge: 'J&K Domicile',
  qualificationLabel: 'Qualification',
  viewDetails: 'View details',
  emptyListTitle: 'No matching notices found',
  emptyListSubtitle:
    'Try clearing a filter, switching status tabs, or searching by board or qualification.',
  resetFilters: 'Reset filters',
  paginationPrev: 'Previous',
  paginationNext: 'Next',
  officialPortalsTitle: 'Official Portals',
  officialPortalsSubtitle:
    'Always confirm notices and submit applications through official board websites:',
  browseIgnouLink: 'Open dedicated IGNOU notifications page',
  backToAllEducation: 'View all Education & Admissions',
  noOpenNowHint: 'No active applications in this filter right now. Check Exams, Results, Upcoming, or Archive tabs.',
  checkNoticeTag: 'Check notice',
  objectionsTillPrefix: 'Objections till',
  backToNotices: 'Back to notices',
  officialPortalBtn: 'Official Portal',
  officialPdfBtn: 'Official PDF',
  getApplicationHelp: 'Get Application Help',
  getAdmissionHelp: 'Get Admission Help',
  postOverview: 'Overview',
  postImportantDates: 'Important Dates',
  postScheduleTitle: 'Schedule & Details',
  postFeeDetails: 'Application Fee',
  postAgeLimit: 'Age Limit',
  postVacancyBreakdown: 'Vacancy & Post Breakdown',
  postHowToApply: 'How to Apply Online',
  postNextSteps: 'What Happens Next',
  postTimeline: 'Notice Timeline',
  postRelated: 'Related Notices',
  asPerOfficialNotice: 'As per official notice',
  venueLabel: 'Venue',
  reportingTimeLabel: 'Reporting Time',
  examWindowLabel: 'Exam Window',
  dvDateLabel: 'DV Date',
  resultOutLabel: 'Result Published',
  keyOutLabel: 'Answer Key Released',
  windowOpensLabel: 'Window Opens',
  closingDateLabel: 'Closing Date',
  closedOnLabel: 'Closed On',
  duplicateNoticeBannerTitle: 'Related / Duplicate Entry',
  viewCanonicalNotice: 'Open main notification',
  schemesHubEyebrow: 'Central & Citizen Guides',
  schemesHubTitle: 'Government Schemes & Citizen Guides',
  schemesHubSubtitle:
    'Verified scheme summaries, interactive eligibility and document checklists, step-by-step application guides, and direct official links.',
  schemesSearchPlaceholder: 'Search PM-KISAN, Ayushman, PAN, Aadhaar, or guide…',
  schemesSummaryBoxTitle: 'Scheme Summary',
  schemesDeptLabel: 'Responsible Department',
  schemesBeneficiariesLabel: 'Intended Beneficiaries',
  schemesBenefitLabel: 'Benefit Amount / Scope',
  schemesRegionLabel: 'Applicable Region',
  schemesDeadlineLabel: 'Application Window / Deadline',
  schemesFeeLabel: 'Official Fee',
  schemesAsPerGuidelines: 'As per official scheme guidelines',
  schemesEligibilityTitle: 'Eligibility Checklist',
  schemesDocumentsTitle: 'Documents Required Checklist',
  schemesApplyGuideTitle: 'Step-by-Step Apply Guide',
  schemesNeedHelpCta: 'Need help applying? Contact us',
  schemesNoGuaranteeNote:
    'CSC DOST is an independent citizen portal and does not guarantee scheme approval, eligibility, or benefit disbursement. Final verification rests solely with the concerned government authority.',
  schemesBackToAll: 'Back to all schemes',
  schemesOfficialPortalBtn: 'Official Scheme Portal',
  schemesRelatedTitle: 'More Schemes & Guides',
  schemesNoMatchTitle: 'No matching schemes or guides found.',
  servicesHubTitle: 'CSC E-Services',
  servicesHubSubtitle:
    'Search and browse verified citizen facilitation services, required documents, timelines, and direct phone or WhatsApp help.',
  servicesSearchPlaceholder: 'Search by service name, certificate, or document…',
  servicesFeeNote:
    'Final charges depend on the service and any government fee. Please confirm before applying.',
  servicesAskUs: 'Ask us',
  servicesDocsNeeded: 'Documents needed',
  servicesTypicalTime: 'Typical time',
  servicesFeeLabel: 'Fee',
  servicesEnquireWhatsapp: 'Enquire on WhatsApp',
  servicesCallBtn: 'Call',
  servicesViewDetails: 'View checklist & details',
  servicesApplyOnline: 'Apply online',
  servicesBackToAll: 'Back to all services',
  servicesProcessStepsTitle: 'Process Steps',
  servicesDocsChecklistTitle: 'Documents Checklist',
  servicesFaqTitle: 'Frequently Asked Questions',
  servicesRelatedTitle: 'Related Services',
  toolsHubTitle: 'Document Tools',
  toolsHubSubtitle:
    'Compress images, merge or split PDFs, resize passport photos and signatures, and sanitize files directly in your browser.',
  toolsSearchPlaceholder: 'Search tools (e.g. 20kb photo, merge pdf, passport photo, signature)…',
  toolsPrivacyTitle: 'Files are processed in your browser and not uploaded',
  toolsPrivacyDesc:
    'Your photographs, signatures, and PDF documents stay inside local browser memory on your device and are never uploaded to any remote server.',
  toolsPrivacyNotePdfWorker:
    'Technical note: PDF Compressor and PDF to Image download the open-source pdf.js worker script from cdnjs.cloudflare.com so your PDF can be rendered locally; your PDF file itself stays in your browser and is never sent to any server.',
  toolsLaunchBtn: 'Open tool',
  toolsBackToAll: 'Back to all tools',
  toolsExplanationTitle: 'How this tool works',
  toolsCapabilitiesLabel: 'Supported capabilities',
  toolsCommonUsesLabel: 'Common uses',
  toolsPrivacyBadge: 'Processed locally in browser · No server upload',
  toolsRelatedTitle: 'More Document Tools',
  calculatorsPageTitle: 'Citizen Calculators',
  calculatorsPageSubtitle:
    'Check recruitment age against cutoff dates, verify photo and signature dimensions locally, and review indicative CSC service fees.',
  calculatorsTabAge: 'Age Calculator',
  calculatorsTabPhoto: 'Photo / Sign Specs',
  calculatorsTabFee: 'CSC Fee Breakdown',
  calculatorsHowCalculatedTitle: 'How it is calculated',
  calculatorsFaqTitle: 'Frequently Asked Questions',
  calculatorsRateNoticeAge:
    'Rates & benchmarks as of 2026-01-01 in portal data — confirm exact upper-age limits and DOB cutoffs with the official source notification.',
  calculatorsRateNoticePhoto:
    'Portal specification guidelines have no revision date recorded in portal data — confirm current photo/signature dimensions on the official source portal before uploading.',
  calculatorsRateNoticeFee:
    'Statutory & CSC fee estimates have no verification date recorded in portal data — confirm current rates with the official source and operator before applying.',
  closingThisWeekTitle: 'Closing this week',
  closingThisWeekSubtitle: 'Verified applications and objection windows closing within 7 days.',
  trustStripTitle: 'Authorized CSC Citizen Facilitation Desk',
  comingSoon: 'Coming soon',
};

const HI_DICT: TranslationDict = {
  brandName: 'CSC DOST',
  brandSubtitle: 'जम्मू-कश्मीर नागरिक पोर्टल',
  searchPlaceholder: 'नौकरी, योजना, सेवा खोजें…',
  heroSearchPlaceholder: 'JKSSB, IGNOU, PM-KISAN, पैन कार्ड या PDF टूल खोजें…',
  independentChip: 'स्वतंत्र पोर्टल, सरकारी वेबसाइट नहीं',
  heroTitle: 'जम्मू-कश्मीर के लिए नौकरियां, दाखिले और नागरिक सेवाएं',
  heroSubtitle:
    'आधिकारिक भर्ती सूचनाएं, विश्वविद्यालय फॉर्म, सरकारी योजनाएं, सीएससी ई-सेवाएं और मुफ्त डॉक्यूमेंट टूल्स एक ही जगह।',
  searchButton: 'खोजें',
  trackButton: 'आवेदन ट्रैक करें',
  staffLogin: 'स्टाफ लॉगिन',
  categoriesHeading: 'श्रेणियां चुनें',
  categoriesSubheading: 'सत्यापित सूचनाएं, गाइड या ऑनलाइन टूल खोलने के लिए चुनें।',
  catJobs: 'नौकरियां',
  catJobsDesc: 'JKSSB, आर्मी, SSC और RRB',
  catAdmissions: 'दाखिले',
  catAdmissionsDesc: 'कश्मीर विवि, क्लस्टर विवि और IGNOU',
  catSchemes: 'योजनाएं',
  catSchemesDesc: 'पीएम-किसान, आयुष्मान और कल्याण योजनाएं',
  catServices: 'CSC सेवाएं',
  catServicesDesc: 'पैन, डोमिसाइल, आय व अन्य प्रमाणपत्र',
  catTools: 'टूल्स व कैलकुलेटर',
  catToolsDesc: 'PDF, फोटो साइज व आयु/शुल्क कैलकुलेटर',
  latestJobsHeading: 'ताज़ा नौकरियां और भर्तियां',
  latestJobsSubheading: 'आधिकारिक पोर्टल से सत्यापित नवीनतम आवेदन तिथियों सहित।',
  viewAllJobs: 'सभी नौकरियां देखें',
  departmentLabel: 'विभाग',
  vacanciesLabel: 'पद',
  lastDateLabel: 'अंतिम तिथि',
  urgentDaysLeft: (days: number) => (days === 0 ? 'आज अंतिम दिन' : `${days} दिन शेष`),
  closingToday: 'आज अंतिम दिन',
  openStatus: 'सक्रिय',
  admissionsHeading: 'विश्वविद्यालय दाखिले और परीक्षाएं',
  admissionsSubheading: 'कश्मीर विश्वविद्यालय, क्लस्टर यूनिवर्सिटी श्रीनगर और IGNOU सूचनाएं।',
  ignouShortcut: 'IGNOU सूचनाएं',
  viewAllAdmissions: 'सभी दाखिले देखें',
  schemesHeading: 'लोकप्रिय सरकारी योजनाएं',
  schemesSubheading: 'पात्रता, ई-केवाईसी और लाभार्थी स्थिति की पूरी जानकारी आधिकारिक लिंक के साथ।',
  viewAllSchemes: 'सभी योजनाएं देखें',
  exploreScheme: 'योजना गाइड देखें',
  toolsHeading: 'डॉक्यूमेंट टूल्स और कैलकुलेटर',
  toolsSubheading: 'मोबाइल और कम इंटरनेट स्पीड पर भी तेज़ी से काम करने वाले टूल।',
  viewAllTools: 'सभी टूल्स',
  calculatorsShortcut: 'नागरिक कैलकुलेटर',
  helpTitle: 'आवेदन करने में मदद चाहिए?',
  helpSubtitle:
    'ऑनलाइन फॉर्म भरने, डॉक्यूमेंट स्कैन, बायोमेट्रिक ई-केवाईसी और फीस भुगतान के लिए सहायता पाएं।',
  helpOperatorLabel: 'संचालक',
  helpVleLabel: 'VLE आईडी',
  helpLocationLabel: 'केंद्र',
  callNow: 'कॉल करें +91 70068 33767',
  whatsappNow: 'व्हाट्सएप सहायता',
  adLabel: 'विज्ञापन',
  footerAbout: 'हमारे बारे में',
  footerContact: 'संपर्क',
  footerPrivacy: 'गोपनीयता नीति',
  footerDisclaimer: 'अस्वीकरण',
  footerTerms: 'नियम एवं शर्तें',
  footerRefund: 'रिफंड नीति',
  footerAddress: 'संगरान काजीगुंड, अनंतनाग, जम्मू और कश्मीर 192221',
  footerDisclaimerNote:
    'CSC DOST एक स्वतंत्र पोर्टल है, कोई आधिकारिक सरकारी वेबसाइट नहीं। कृपया हमेशा आधिकारिक सूचना से विवरण की पुष्टि करें।',
  navHome: 'होम',
  navJobs: 'नौकरियां',
  navEducation: 'शिक्षा',
  navSchemes: 'योजनाएं',
  navServices: 'ई-सेवाएं',
  navTools: 'टूल्स',
  navCalculators: 'कैलकुलेटर',
  navTrack: 'ट्रैक',
  noSearchResults: 'कोई संबंधित नौकरी, योजना, सेवा या टूल नहीं मिला।',
  searchResultsTitle: 'खोज परिणाम',
  clearSearch: 'खोज हटाएं',
  officialNotice: 'आधिकारिक सूचना',
  shareOnWhatsApp: 'व्हाट्सएप पर शेयर करें',
  alertsTitle: 'मुफ्त नौकरी और दाखिला अलर्ट पाएं',
  alertsSubtitle: 'जम्मू-कश्मीर और राष्ट्रीय अपडेट सीधे अपने फोन पर पाएं।',
  joinWhatsAppGroup: 'व्हाट्सएप ग्रुप से जुड़ें',
  joinTelegramChannel: 'टेलीग्राम चैनल',
  jobsPageTitle: 'नौकरियां और भर्तियां',
  jobsPageSubtitle:
    'JKSSB, SSC, RRB, भारतीय सेना और बैंकिंग की सत्यापित भर्ती सूचनाएं और वास्तविक समय की अंतिम तिथियां।',
  educationPageTitle: 'शिक्षा और दाखिले',
  educationPageSubtitle:
    'IGNOU, कश्मीर विश्वविद्यालय, क्लस्टर यूनिवर्सिटी श्रीनगर, NTA और छात्रवृत्ति सूचनाएं।',
  ignouPageTitle: 'IGNOU नवीनतम सूचनाएं',
  ignouPageSubtitle:
    'IGNOU दाखिला, री-रजिस्ट्रेशन, असाइनमेंट, परीक्षा फॉर्म, डेटशीट, हॉल टिकट और परिणाम अपडेट।',
  jobsSearchPlaceholder: 'JKSSB, SSC, RRB, पद या योग्यता खोजें…',
  eduSearchPlaceholder: 'IGNOU, कश्मीर विवि, CUS या परीक्षा फॉर्म खोजें…',
  filterOrgLabel: 'संगठन',
  filterInstLabel: 'संस्थान',
  filterQualificationLabel: 'योग्यता',
  filterAll: 'सभी',
  filterOther: 'अन्य',
  filterJkDomicileOnly: 'केवल जम्मू-कश्मीर डोमिसाइल',
  qualAll: 'सभी योग्यताएं',
  qual10th: '10वीं / मैट्रिक',
  qual12th: '12वीं / 10+2',
  qualDiploma: 'डिप्लोमा / ITI',
  qualGraduate: 'स्नातक',
  qualPostgraduate: 'स्नातकोत्तर',
  tabOpenNow: 'अभी खुला',
  tabExamsAdmitCards: 'परीक्षा व प्रवेश पत्र',
  tabResultsKeys: 'परिणाम व उत्तर कुंजी',
  tabUpcoming: 'आगामी',
  tabArchive: 'पुरालेख (Archive)',
  sortLabel: 'क्रम',
  sortNearestDeadline: 'निकटतम अंतिम तिथि',
  sortNewestPosted: 'नवीनतम पोस्ट',
  closingSoonRailTitle: '7 दिनों में समाप्त हो रहे हैं',
  jkDomicileBadge: 'जम्मू-कश्मीर डोमिसाइल',
  qualificationLabel: 'योग्यता',
  viewDetails: 'विवरण देखें',
  emptyListTitle: 'कोई मेल खाने वाली सूचना नहीं मिली',
  emptyListSubtitle:
    'फ़िल्टर हटाकर, दूसरा टैब चुनकर या बोर्ड के नाम से खोजकर पुनः प्रयास करें।',
  resetFilters: 'फ़िल्टर रीसेट करें',
  paginationPrev: 'पिछला',
  paginationNext: 'अगला',
  officialPortalsTitle: 'आधिकारिक पोर्टल',
  officialPortalsSubtitle:
    'हमेशा संबंधित बोर्ड की आधिकारिक वेबसाइट से विवरण की पुष्टि करें:',
  browseIgnouLink: 'IGNOU सूचनाएं पृष्ठ खोलें',
  backToAllEducation: 'सभी शिक्षा व दाखिले देखें',
  noOpenNowHint: 'इस फ़िल्टर में अभी कोई सक्रिय आवेदन नहीं है। परीक्षा, परिणाम, आगामी या पुरालेख टैब देखें।',
  checkNoticeTag: 'नोटिस देखें',
  objectionsTillPrefix: 'आपत्ति तक',
  backToNotices: 'सूचनाओं पर वापस',
  officialPortalBtn: 'आधिकारिक पोर्टल',
  officialPdfBtn: 'आधिकारिक PDF',
  getApplicationHelp: 'आवेदन सहायता लें',
  getAdmissionHelp: 'दाखिला सहायता लें',
  postOverview: 'विवरण',
  postImportantDates: 'महत्वपूर्ण तिथियाँ',
  postScheduleTitle: 'कार्यक्रम और विवरण',
  postFeeDetails: 'आवेदन शुल्क',
  postAgeLimit: 'आयु सीमा',
  postVacancyBreakdown: 'पदों का विवरण',
  postHowToApply: 'ऑनलाइन आवेदन कैसे करें',
  postNextSteps: 'आगे की प्रक्रिया',
  postTimeline: 'प्रक्रिया चरण',
  postRelated: 'संबंधित सूचनाएं',
  asPerOfficialNotice: 'आधिकारिक सूचना के अनुसार',
  venueLabel: 'स्थान',
  reportingTimeLabel: 'रिपोर्टिंग समय',
  examWindowLabel: 'परीक्षा अवधि',
  dvDateLabel: 'सत्यापन तिथि',
  resultOutLabel: 'परिणाम तिथि',
  keyOutLabel: 'उत्तर कुंजी तिथि',
  windowOpensLabel: 'आवेदन प्रारंभ',
  closingDateLabel: 'अंतिम तिथि',
  closedOnLabel: 'बंद तिथि',
  duplicateNoticeBannerTitle: 'संबंधित / डुप्लिकेट प्रविष्टि',
  viewCanonicalNotice: 'मुख्य सूचना खोलें',
  schemesHubEyebrow: 'सरकारी योजनाएं व नागरिक गाइड',
  schemesHubTitle: 'सरकारी योजनाएं और नागरिक मार्गदर्शिका',
  schemesHubSubtitle:
    'आधिकारिक योजना सारांश, पात्रता व दस्तावेज़ चेकलिस्ट, चरण-दर-चरण आवेदन प्रक्रिया और आधिकारिक पोर्टल लिंक।',
  schemesSearchPlaceholder: 'PM-KISAN, आयुष्मान, पैन, आधार या गाइड खोजें…',
  schemesSummaryBoxTitle: 'योजना सारांश',
  schemesDeptLabel: 'संबंधित विभाग',
  schemesBeneficiariesLabel: 'पात्र लाभार्थी',
  schemesBenefitLabel: 'लाभ राशि / विवरण',
  schemesRegionLabel: 'लागू क्षेत्र',
  schemesDeadlineLabel: 'आवेदन अवधि / अंतिम तिथि',
  schemesFeeLabel: 'आधिकारिक शुल्क',
  schemesAsPerGuidelines: 'आधिकारिक योजना दिशानिर्देशों के अनुसार',
  schemesEligibilityTitle: 'पात्रता जांच सूची',
  schemesDocumentsTitle: 'आवश्यक दस्तावेज़ सूची',
  schemesApplyGuideTitle: 'चरण-दर-चरण आवेदन प्रक्रिया',
  schemesNeedHelpCta: 'आवेदन में मदद चाहिए? संपर्क करें',
  schemesNoGuaranteeNote:
    'CSC DOST एक स्वतंत्र नागरिक पोर्टल है और किसी योजना की स्वीकृति, पात्रता या लाभ वितरण की गारंटी नहीं देता है। अंतिम निर्णय संबंधित सरकारी विभाग का होता है।',
  schemesBackToAll: 'सभी योजनाओं पर वापस',
  schemesOfficialPortalBtn: 'आधिकारिक योजना पोर्टल',
  schemesRelatedTitle: 'अन्य योजनाएं और गाइड',
  schemesNoMatchTitle: 'कोई संबंधित योजना या गाइड नहीं मिली।',
  servicesHubTitle: 'CSC ई-सेवाएं',
  servicesHubSubtitle:
    'नागरिक सेवाओं, आवश्यक दस्तावेज़ों, समय सीमा और सीधे कॉल या व्हाट्सएप सहायता की पूरी सूची।',
  servicesSearchPlaceholder: 'सेवा, प्रमाणपत्र या दस्तावेज़ से खोजें…',
  servicesFeeNote:
    'अंतिम शुल्क सेवा और सरकारी फीस पर निर्भर करता है। आवेदन करने से पहले पुष्टि अवश्य करें।',
  servicesAskUs: 'हमसे पूछें',
  servicesDocsNeeded: 'आवश्यक दस्तावेज़',
  servicesTypicalTime: 'अनुमानित समय',
  servicesFeeLabel: 'शुल्क',
  servicesEnquireWhatsapp: 'व्हाट्सएप पर पूछें',
  servicesCallBtn: 'कॉल करें',
  servicesViewDetails: 'विवरण व दस्तावेज़ देखें',
  servicesApplyOnline: 'ऑनलाइन आवेदन',
  servicesBackToAll: 'सभी सेवाओं पर वापस',
  servicesProcessStepsTitle: 'आवेदन प्रक्रिया के चरण',
  servicesDocsChecklistTitle: 'दस्तावेज़ जांच सूची',
  servicesFaqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
  servicesRelatedTitle: 'संबंधित सेवाएं',
  toolsHubTitle: 'डॉक्यूमेंट टूल्स',
  toolsHubSubtitle:
    'फ़ोटो कंप्रेस करें, PDF मर्ज या स्प्लिट करें, पासपोर्ट फ़ोटो व हस्ताक्षर रीसाइज़ करें और दस्तावेज़ सीधे अपने ब्राउज़र में तैयार करें।',
  toolsSearchPlaceholder: 'टूल खोजें (जैसे 20kb फ़ोटो, मर्ज PDF, पासपोर्ट फ़ोटो, हस्ताक्षर)…',
  toolsPrivacyTitle: 'फ़ाइलें आपके ब्राउज़र में प्रोसेस होती हैं, सर्वर पर अपलोड नहीं होतीं',
  toolsPrivacyDesc:
    'आपकी फ़ोटो, हस्ताक्षर और PDF दस्तावेज़ केवल आपके डिवाइस के ब्राउज़र मेमोरी में प्रोसेस होते हैं और किसी भी रिमोट सर्वर पर अपलोड नहीं किए जाते।',
  toolsPrivacyNotePdfWorker:
    'तकनीकी जानकारी: PDF कंप्रेसर और PDF से इमेज टूल स्थानीय रेंडरिंग के लिए cdnjs.cloudflare.com से केवल pdf.js वर्कर स्क्रिप्ट लोड करते हैं; आपकी PDF फ़ाइल आपके ब्राउज़र से बाहर नहीं जाती।',
  toolsLaunchBtn: 'टूल खोलें',
  toolsBackToAll: 'सभी टूल्स पर वापस',
  toolsExplanationTitle: 'यह टूल कैसे काम करता है',
  toolsCapabilitiesLabel: 'समर्थित सुविधाएं',
  toolsCommonUsesLabel: 'सामान्य उपयोग',
  toolsPrivacyBadge: 'ब्राउज़र में स्थानीय प्रोसेसिंग · कोई सर्वर अपलोड नहीं',
  toolsRelatedTitle: 'अन्य डॉक्यूमेंट टूल्स',
  calculatorsPageTitle: 'नागरिक कैलकुलेटर',
  calculatorsPageSubtitle:
    'कटऑफ तिथि पर भर्ती आयु की गणना करें, फ़ोटो व हस्ताक्षर के माप जांचें और सांकेतिक सीएससी सेवा शुल्क देखें।',
  calculatorsTabAge: 'आयु कैलकुलेटर',
  calculatorsTabPhoto: 'फ़ोटो / हस्ताक्षर नियम',
  calculatorsTabFee: 'CSC शुल्क विवरण',
  calculatorsHowCalculatedTitle: 'इसकी गणना कैसे की जाती है',
  calculatorsFaqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
  calculatorsRateNoticeAge:
    'पोर्टल डेटा में दिनांक 2026-01-01 के अनुसार आयु मानक — आवेदन से पहले आधिकारिक अधिसूचना से सटीक आयु सीमा व कटऑफ की पुष्टि अवश्य करें।',
  calculatorsRateNoticePhoto:
    'पोर्टल डेटा में अपलोड मानकों की संशोधन तिथि दर्ज नहीं है — अपलोड करने से पहले संबंधित आधिकारिक वेबसाइट से जांच लें।',
  calculatorsRateNoticeFee:
    'सरकारी व CSC शुल्क अनुमानों की सत्यापन तिथि पोर्टल डेटा में दर्ज नहीं है — आवेदन से पहले आधिकारिक स्रोत से वर्तमान दरों की पुष्टि करें।',
  closingThisWeekTitle: 'इस सप्ताह बंद होने वाले आवेदन',
  closingThisWeekSubtitle: 'अगले 7 दिनों के भीतर समाप्त होने वाले सत्यापित आवेदन और आपत्ति विंडो।',
  trustStripTitle: 'अधिकृत CSC नागरिक सहायता केंद्र',
  comingSoon: 'जल्द आ रहा है',
};

const UR_DICT: TranslationDict = {
  brandName: 'CSC DOST',
  brandSubtitle: 'جموں و کشمیر شہری پورٹل',
  searchPlaceholder: 'نوکریاں، اسکیمیں، خدمات تلاش کریں…',
  heroSearchPlaceholder: 'JKSSB، IGNOU، PM-KISAN، پین کارڈ یا ٹولز تلاش کریں…',
  independentChip: 'آزاد پورٹل، سرکاری ویب سائٹ نہیں',
  heroTitle: 'جموں و کشمیر کے لیے نوکریاں، داخلے اور شہری خدمات',
  heroSubtitle:
    'مصدقہ بھرتی نوٹس، یونیورسٹی فارم، سرکاری اسکیمیں، سی ایس سی ای-سروسز اور مفت دستاویزی ٹولز ایک ہی جگہ۔',
  searchButton: 'تلاش کریں',
  trackButton: 'درخواست ٹریک کریں',
  staffLogin: 'اسٹاف لاگ ان',
  categoriesHeading: 'خدمات اور زمرے دیکھیں',
  categoriesSubheading: 'مصدقہ پورٹل، رہنمائی یا ٹولز کھولنے کے لیے زمرہ منتخب کریں۔',
  catJobs: 'نوکریاں',
  catJobsDesc: 'JKSSB، آرمی، SSC اور RRB',
  catAdmissions: 'داخلے',
  catAdmissionsDesc: 'کشمیر یونیورسٹی، کلسٹر یونیورسٹی اور IGNOU',
  catSchemes: 'اسکیمیں',
  catSchemesDesc: 'پی ایم کسان، آیوشمان اور فلاحی اسکیمیں',
  catServices: 'CSC خدمات',
  catServicesDesc: 'پین کارڈ، ڈومیسائل اور سرٹیفکیٹس',
  catTools: 'ٹولز اور کیلکولیٹر',
  catToolsDesc: 'PDF، فوٹو ری سائز اور عمر/فیس کیلکولیٹر',
  latestJobsHeading: 'تازہ ترین نوکریاں اور بھرتیاں',
  latestJobsSubheading: 'سرکاری نوٹیفکیشن سے تصدیق شدہ آخری تاریخوں کے ساتھ۔',
  viewAllJobs: 'تمام نوکریاں دیکھیں',
  departmentLabel: 'محکمہ',
  vacanciesLabel: 'آسامیاں',
  lastDateLabel: 'آخری تاریخ',
  urgentDaysLeft: (days: number) => (days === 0 ? 'آج آخری دن' : `${days} دن باقی`),
  closingToday: 'آج آخری دن',
  openStatus: 'کھلا ہے',
  admissionsHeading: 'یونیورسٹی داخلے اور امتحانات',
  admissionsSubheading: 'کشمیر یونیورسٹی، کلسٹر یونیورسٹی سری نگر اور IGNOU اپ ڈیٹس۔',
  ignouShortcut: 'IGNOU نوٹیفکیشنز',
  viewAllAdmissions: 'تمام داخلے دیکھیں',
  schemesHeading: 'مشہور سرکاری اسکیمیں',
  schemesSubheading: 'اہلیت، ای کے وائی سی اور مستفیدین کی صورتحال سرکاری لنکس کے ساتھ۔',
  viewAllSchemes: 'تمام اسکیمیں دیکھیں',
  exploreScheme: 'اسکیم گائیڈ دیکھیں',
  toolsHeading: 'دستاویزی ٹولز اور کیلکولیٹر',
  toolsSubheading: 'موبائل اور سست انٹرنیٹ پر بھی تیزی سے کام کرنے والے ٹولز۔',
  viewAllTools: 'تمام ٹولز',
  calculatorsShortcut: 'شہری کیلکولیٹر',
  helpTitle: 'درخواست دینے میں مدد چاہیے؟',
  helpSubtitle:
    'آن لائن فارم، دستاویزات کی اسکیننگ، بائیومیٹرک ای کے وائی سی اور فیس ادائیگی کے لیے رہنمائی حاصل کریں۔',
  helpOperatorLabel: 'آپریٹر',
  helpVleLabel: 'VLE آئی ڈی',
  helpLocationLabel: 'سینٹر',
  callNow: 'کال کریں +91 70068 33767',
  whatsappNow: 'واٹس ایپ مدد',
  adLabel: 'اشتہار',
  footerAbout: 'ہمارے بارے میں',
  footerContact: 'رابطہ',
  footerPrivacy: 'پرائیویسی پالیسی',
  footerDisclaimer: 'دستبرداری',
  footerTerms: 'شرائط و ضوابط',
  footerRefund: 'ریفنڈ پالیسی',
  footerAddress: 'سنگران قاضی گنڈ، اننت ناگ، جموں و کشمیر 192221',
  footerDisclaimerNote:
    'CSC DOST ایک آزاد پورٹل ہے، کوئی سرکاری ویب سائٹ نہیں۔ براہ کرم ہمیشہ سرکاری نوٹیفکیشن سے تفصیلات کی تصدیق کریں۔',
  navHome: 'ہوم',
  navJobs: 'نوکریاں',
  navEducation: 'تعلیم',
  navSchemes: 'اسکیمیں',
  navServices: 'ای-سروسز',
  navTools: 'ٹولز',
  navCalculators: 'کیلکولیٹر',
  navTrack: 'ٹریک',
  noSearchResults: 'کوئی متعلقہ نوکری، اسکیم، خدمت یا ٹول نہیں ملا۔',
  searchResultsTitle: 'تلاش کے نتائج',
  clearSearch: 'تلاش صاف کریں',
  officialNotice: 'سرکاری نوٹیفکیشن',
  shareOnWhatsApp: 'واٹس ایپ پر شیئر کریں',
  alertsTitle: 'مفت نوکری اور داخلہ الرٹس حاصل کریں',
  alertsSubtitle: 'جموں و کشمیر اور قومی اپ ڈیٹس براہ راست اپنے فون پر حاصل کریں۔',
  joinWhatsAppGroup: 'واٹس ایپ گروپ جوائن کریں',
  joinTelegramChannel: 'ٹیلی گرام چینل',
  jobsPageTitle: 'نوکریاں اور بھرتیاں',
  jobsPageSubtitle:
    'JKSSB، SSC، RRB، انڈین آرمی اور بینکنگ کے تصدیق شدہ نوٹیفکیشن اور درست آخری تاریخیں۔',
  educationPageTitle: 'تعلیم اور داخلے',
  educationPageSubtitle:
    'IGNOU، کشمیر یونیورسٹی، کلسٹر یونیورسٹی سری نگر، NTA اور اسکالرشپ کی تازہ اطلاعات۔',
  ignouPageTitle: 'IGNOU تازہ ترین نوٹیفکیشنز',
  ignouPageSubtitle:
    'IGNOU داخلہ، ری رجسٹریشن، اسائنمنٹ، امتحانی فارم، ڈیٹ شیٹ، ہال ٹکٹ اور نتائج کی تفصیل۔',
  jobsSearchPlaceholder: 'JKSSB، SSC، RRB، آسامی یا اہلیت تلاش کریں…',
  eduSearchPlaceholder: 'IGNOU، کشمیر یونیورسٹی، CUS یا فارم تلاش کریں…',
  filterOrgLabel: 'ادارہ',
  filterInstLabel: 'تعلیمی ادارہ',
  filterQualificationLabel: 'تعلیمی قابلیت',
  filterAll: 'تمام',
  filterOther: 'دیگر',
  filterJkDomicileOnly: 'صرف جموں و کشمیر ڈومیسائل',
  qualAll: 'تمام قابلیتیں',
  qual10th: 'دسویں / میٹرک',
  qual12th: 'بارہویں / 10+2',
  qualDiploma: 'ڈپلومہ / ITI',
  qualGraduate: 'گریجویٹ',
  qualPostgraduate: 'پوسٹ گریجویٹ',
  tabOpenNow: 'ابھی کھلا ہے',
  tabExamsAdmitCards: 'امتحانات و ایڈمٹ کارڈ',
  tabResultsKeys: 'نتائج و انسر کی',
  tabUpcoming: 'آنے والے',
  tabArchive: 'آرکائیو',
  sortLabel: 'ترتیب',
  sortNearestDeadline: 'قریب ترین آخری تاریخ',
  sortNewestPosted: 'تازہ ترین پوسٹ',
  closingSoonRailTitle: '7 دنوں میں بند ہونے والے فارم',
  jkDomicileBadge: 'جے اینڈ کے ڈومیسائل',
  qualificationLabel: 'قابلیت',
  viewDetails: 'تفصیل دیکھیں',
  emptyListTitle: 'کوئی متعلقہ نوٹس نہیں ملا',
  emptyListSubtitle:
    'فلٹر صاف کریں، دوسرا ٹیب منتخب کریں یا ادارے کے نام سے تلاش کریں۔',
  resetFilters: 'فلٹر ری سیٹ کریں',
  paginationPrev: 'پچھلا',
  paginationNext: 'اگلا',
  officialPortalsTitle: 'سرکاری پورٹلز',
  officialPortalsSubtitle:
    'براہ کرم ہمیشہ متعلقہ بورڈ کی سرکاری ویب سائٹ سے تفصیلات کی تصدیق کریں:',
  browseIgnouLink: 'IGNOU نوٹیفکیشنز صفحہ کھولیں',
  backToAllEducation: 'تمام تعلیم اور داخلے دیکھیں',
  noOpenNowHint: 'اس فلٹر میں فی الحال کوئی فعال درخواست نہیں ہے۔ امتحانات، نتائج، آنے والے یا آرکائیو ٹیب دیکھیں۔',
  checkNoticeTag: 'نوٹس دیکھیں',
  objectionsTillPrefix: 'اعتراض تک',
  backToNotices: 'نوٹیفکیشنز پر واپس',
  officialPortalBtn: 'سرکاری پورٹل',
  officialPdfBtn: 'سرکاری PDF',
  getApplicationHelp: 'درخواست میں مدد لیں',
  getAdmissionHelp: 'داخلے میں مدد لیں',
  postOverview: 'جائزہ',
  postImportantDates: 'اہم تاریخیں',
  postScheduleTitle: 'شیڈول اور تفصیلات',
  postFeeDetails: 'درخواست فیس',
  postAgeLimit: 'عمر کی حد',
  postVacancyBreakdown: 'آسامیوں کی تفصیل',
  postHowToApply: 'آن لائن درخواست کیسے دیں',
  postNextSteps: 'اگلے مراحل',
  postTimeline: 'مراحل کا شیڈول',
  postRelated: 'متعلقہ نوٹیفکیشنز',
  asPerOfficialNotice: 'سرکاری نوٹیفکیشن کے مطابق',
  venueLabel: 'مقام',
  reportingTimeLabel: 'رپورٹنگ کا وقت',
  examWindowLabel: 'امتحان کا وقت',
  dvDateLabel: 'دستاویزات کی تصدیق',
  resultOutLabel: 'نتیجہ جاری',
  keyOutLabel: 'انسر کی جاری',
  windowOpensLabel: 'آغاز کی تاریخ',
  closingDateLabel: 'آخری تاریخ',
  closedOnLabel: 'بند ہونے کی تاریخ',
  duplicateNoticeBannerTitle: 'متعلقہ / ڈپلیکیٹ اندراج',
  viewCanonicalNotice: 'مرکزی نوٹیفکیشن کھولیں',
  schemesHubEyebrow: 'سرکاری اسکیمیں اور شہری گائیڈز',
  schemesHubTitle: 'سرکاری اسکیمیں اور شہری رہنمائی',
  schemesHubSubtitle:
    'مصدقہ اسکیم خلاصہ، اہلیت اور دستاویزات کی چیک لسٹ، مرحلہ وار درخواست کا طریقہ اور سرکاری پورٹل لنکس۔',
  schemesSearchPlaceholder: 'PM-KISAN، آیوشمان، پین، آدھار یا گائیڈ تلاش کریں…',
  schemesSummaryBoxTitle: 'اسکیم کا خلاصہ',
  schemesDeptLabel: 'ذمہ دار محکمہ',
  schemesBeneficiariesLabel: 'مستحق افراد',
  schemesBenefitLabel: 'مالی فائدہ / دائرہ کار',
  schemesRegionLabel: 'لاگو علاقہ',
  schemesDeadlineLabel: 'درخواست کی مدت / آخری تاریخ',
  schemesFeeLabel: 'سرکاری فیس',
  schemesAsPerGuidelines: 'سرکاری اسکیم کے رہنما اصولوں کے مطابق',
  schemesEligibilityTitle: 'اہلیت کی چیک لسٹ',
  schemesDocumentsTitle: 'مطلوبہ دستاویزات کی فہرست',
  schemesApplyGuideTitle: 'مرحلہ وار درخواست گائیڈ',
  schemesNeedHelpCta: 'درخواست میں مدد چاہیے؟ ہم سے رابطہ کریں',
  schemesNoGuaranteeNote:
    'CSC DOST ایک آزاد شہری پورٹل ہے اور کسی اسکیم کی منظوری، اہلیت یا رقم ملنے کی ضمانت نہیں دیتا۔ حتمی فیصلہ متعلقہ سرکاری ادارے کا ہوتا ہے۔',
  schemesBackToAll: 'تمام اسکیموں پر واپس جائیں',
  schemesOfficialPortalBtn: 'سرکاری اسکیم پورٹل',
  schemesRelatedTitle: 'مزید اسکیمیں اور گائیڈز',
  schemesNoMatchTitle: 'کوئی متعلقہ اسکیم یا گائیڈ نہیں ملی۔',
  servicesHubTitle: 'CSC ای-سروسز',
  servicesHubSubtitle:
    'مصدقہ شہری خدمات، مطلوبہ دستاویزات، متوقع وقت اور براہ راست فون یا واٹس ایپ مدد دیکھیں۔',
  servicesSearchPlaceholder: 'سروس کا نام، سرٹیفکیٹ یا دستاویز تلاش کریں…',
  servicesFeeNote:
    'حتمی فیس سروس اور کسی بھی سرکاری فیس پر منحصر ہے۔ درخواست دینے سے پہلے تصدیق ضرور کر لیں۔',
  servicesAskUs: 'ہم سے پوچھیں',
  servicesDocsNeeded: 'مطلوبہ دستاویزات',
  servicesTypicalTime: 'متوقع وقت',
  servicesFeeLabel: 'فیس',
  servicesEnquireWhatsapp: 'واٹس ایپ پر معلومات لیں',
  servicesCallBtn: 'کال کریں',
  servicesViewDetails: 'چیک لسٹ اور تفصیلات دیکھیں',
  servicesApplyOnline: 'آن لائن درخواست',
  servicesBackToAll: 'تمام سروسز پر واپس جائیں',
  servicesProcessStepsTitle: 'درخواست کے مراحل',
  servicesDocsChecklistTitle: 'دستاویزات کی چیک لسٹ',
  servicesFaqTitle: 'اکثر پوچھے جانے والے سوالات',
  servicesRelatedTitle: 'متعلقہ خدمات',
  toolsHubTitle: 'دستاویزی ٹولز',
  toolsHubSubtitle:
    'تصاویر کمپریس کریں، PDF جوڑیں یا الگ کریں، پاسپورٹ فوٹو اور دستخط کا سائز بدلیں اور فائلیں براہ راست اپنے براؤزر میں تیار کریں۔',
  toolsSearchPlaceholder: 'ٹول تلاش کریں (مثلاً 20kb فوٹو، PDF ضم، پاسپورٹ فوٹو، دستخط)…',
  toolsPrivacyTitle: 'فائلیں آپ کے براؤزر میں پراسیس ہوتی ہیں، سرور پر اپ لوڈ نہیں ہوتیں',
  toolsPrivacyDesc:
    'آپ کی تصاویر، دستخط اور PDF دستاویزات آپ کے اپنے آلے کی مقامی میموری میں رہتی ہیں اور کسی بھی بیرونی سرور پر نہیں بھیجی جاتیں۔',
  toolsPrivacyNotePdfWorker:
    'تکنیکی وضاحت: PDF کمپریسر اور PDF ٹو امیج ٹول مقامی پراسیسنگ کے لیے cdnjs.cloudflare.com سے صرف pdf.js اسکرپٹ لوڈ کرتے ہیں؛ آپ کی PDF فائل کبھی بھی سرور پر اپ لوڈ نہیں ہوتی۔',
  toolsLaunchBtn: 'ٹول کھولیں',
  toolsBackToAll: 'تمام ٹولز پر واپس جائیں',
  toolsExplanationTitle: 'یہ ٹول کیسے کام کرتا ہے',
  toolsCapabilitiesLabel: 'اہم خصوصیات',
  toolsCommonUsesLabel: 'عام استعمالات',
  toolsPrivacyBadge: 'براؤزر میں مقامی پراسیسنگ · کوئی سرور اپ لوڈ نہیں',
  toolsRelatedTitle: 'مزید دستاویزی ٹولز',
  calculatorsPageTitle: 'شہری کیلکولیٹر',
  calculatorsPageSubtitle:
    'کٹ آف تاریخ پر عمر کی اہلیت چیک کریں، فوٹو اور دستخط کے پیمانے جانچیں اور CSC خدمات کی متوقع فیس دیکھیں۔',
  calculatorsTabAge: 'عمر کیلکولیٹر',
  calculatorsTabPhoto: 'فوٹو / دستخط کے اصول',
  calculatorsTabFee: 'CSC فیس کی تفصیل',
  calculatorsHowCalculatedTitle: 'حساب کیسے لگایا جاتا ہے',
  calculatorsFaqTitle: 'اکثر پوچھے جانے والے سوالات',
  calculatorsRateNoticeAge:
    'پورٹل ڈیٹا میں 2026-01-01 کے مطابق عمر کے معیارات — درخواست دینے سے پہلے سرکاری نوٹیفکیشن سے عمر کی حد اور کٹ آف تاریخ کی تصدیق کریں۔',
  calculatorsRateNoticePhoto:
    'پورٹل ڈیٹا میں ان اصولوں کی نظرثانی تاریخ درج نہیں ہے — اپ لوڈ کرنے سے پہلے متعلقہ سرکاری پورٹل سے تصدیق ضرور کریں۔',
  calculatorsRateNoticeFee:
    'سرکاری اور CSC فیس کے تخمینوں میں تصدیق کی تاریخ درج نہیں ہے — درخواست دینے سے پہلے سرکاری ذریعے سے موجودہ فیس کی تصدیق کریں۔',
  closingThisWeekTitle: 'اس ہفتے بند ہونے والے فارم',
  closingThisWeekSubtitle: 'اگلے 7 دنوں کے اندر بند ہونے والی تصدیق شدہ درخواستیں اور اعتراض کی تاریخیں۔',
  trustStripTitle: 'مجاز CSC شہری سہولت مرکز',
  comingSoon: 'جلد آ رہا ہے',
};

const DICTIONARIES: Record<Language, TranslationDict> = {
  en: EN_DICT,
  hi: HI_DICT,
  ur: UR_DICT,
};

interface LanguageContextValue {
  language: Language;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  isRtl: false,
  setLanguage: () => {},
  t: EN_DICT,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = window.localStorage.getItem('csc_lang');
      if (saved === 'en' || saved === 'hi' || saved === 'ur') {
        return saved;
      }
    } catch {
      // Ignore storage access failures
    }
    return 'en';
  });

  const isRtl = language === 'ur';

  const applyDocumentDirection = useCallback((lang: Language) => {
    try {
      const htmlEl = document.documentElement;
      htmlEl.lang = lang;
      htmlEl.dir = lang === 'ur' ? 'rtl' : 'ltr';
    } catch {
      // Ignore SSR or restricted DOM environments
    }
  }, []);

  useEffect(() => {
    applyDocumentDirection(language);
  }, [language, applyDocumentDirection]);

  const setLanguage = useCallback(
    (nextLang: Language) => {
      setLanguageState(nextLang);
      applyDocumentDirection(nextLang);
      try {
        window.localStorage.setItem('csc_lang', nextLang);
      } catch {
        // Ignore storage errors
      }
    },
    [applyDocumentDirection]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        isRtl,
        setLanguage,
        t: DICTIONARIES[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
