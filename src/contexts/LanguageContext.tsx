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
  navServices: string;
  navTools: string;
  navTrack: string;
  noSearchResults: string;
  searchResultsTitle: string;
  clearSearch: string;
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
  catTools: 'Tools',
  catToolsDesc: 'PDF, Photo Resize & Calculators',
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
    'CSC DOST is an independent citizen-services assistance portal and is not affiliated with any government department.',
  navHome: 'Home',
  navJobs: 'Jobs',
  navServices: 'Services',
  navTools: 'Tools',
  navTrack: 'Track',
  noSearchResults: 'No matching jobs, schemes, services, or tools found.',
  searchResultsTitle: 'Quick Search Results',
  clearSearch: 'Clear search',
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
  catTools: 'टूल्स',
  catToolsDesc: 'PDF, फोटो साइज व कैलकुलेटर',
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
    'CSC DOST एक स्वतंत्र नागरिक सेवा सहायता पोर्टल है और किसी भी सरकारी विभाग से संबद्ध नहीं है।',
  navHome: 'होम',
  navJobs: 'नौकरियां',
  navServices: 'सेवाएं',
  navTools: 'टूल्स',
  navTrack: 'ट्रैक',
  noSearchResults: 'कोई संबंधित नौकरी, योजना, सेवा या टूल नहीं मिला।',
  searchResultsTitle: 'खोज परिणाम',
  clearSearch: 'खोज हटाएं',
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
  catTools: 'ٹولز',
  catToolsDesc: 'PDF، فوٹو ری سائز اور کیلکولیٹر',
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
    'CSC DOST ایک آزاد شہری خدمات کا پورٹل ہے اور کسی سرکاری محکمے سے وابستہ نہیں ہے۔',
  navHome: 'ہوم',
  navJobs: 'نوکریاں',
  navServices: 'خدمات',
  navTools: 'ٹولز',
  navTrack: 'ٹریک',
  noSearchResults: 'کوئی متعلقہ نوکری، اسکیم، خدمت یا ٹول نہیں ملا۔',
  searchResultsTitle: 'تلاش کے نتائج',
  clearSearch: 'تلاش صاف کریں',
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
