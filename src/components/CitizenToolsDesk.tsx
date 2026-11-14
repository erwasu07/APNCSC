import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Image as ImageIcon,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  FileCheck2,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  Chip,
  FaqAccordion,
  HelpApplyingCard,
  type FaqItem,
} from './ui';

interface CitizenToolsDeskProps {
  onApplyService?: (serviceName: string) => void;
  isStandalonePage?: boolean;
  onNavigateRoute?: (path: string) => void;
}

const PORTAL_PRESETS = [
  {
    id: 'jkssb',
    name: 'JKSSB Portal',
    photoSize: '20 KB - 50 KB',
    photoDim: '100 x 120 px (Min) - 3.5cm x 4.5cm',
    sigSize: '10 KB - 20 KB',
    sigDim: '100 x 40 px (Min) - 3.5cm x 1.5cm',
    format: 'JPG / JPEG only',
    note: 'White or light-coloured background. No caps, dark glasses or heavy shadows.',
  },
  {
    id: 'ssc',
    name: 'SSC (Staff Selection)',
    photoSize: '20 KB - 50 KB',
    photoDim: '3.5 cm (W) x 4.5 cm (H)',
    sigSize: '10 KB - 20 KB',
    sigDim: '4.0 cm (W) x 2.0 cm (H)',
    format: 'JPEG format',
    note: 'Live webcam capture enabled on new ssc.gov.in portal. Spectacles strictly prohibited.',
  },
  {
    id: 'army',
    name: 'Indian Army (JIA)',
    photoSize: '5 KB - 20 KB',
    photoDim: '3.5 cm x 4.5 cm (Passport)',
    sigSize: '5 KB - 10 KB',
    sigDim: '3.5 cm x 1.5 cm',
    format: 'JPG / JPEG',
    note: 'Sikh candidates with turban allowed; clear ears visible for others. Crisp resolution.',
  },
  {
    id: 'rrb',
    name: 'Railway RRB (rrbapply)',
    photoSize: '30 KB - 70 KB',
    photoDim: '320 x 240 px (Clear view)',
    sigSize: '30 KB - 70 KB',
    sigDim: '160 x 560 px (Running hand)',
    format: 'JPG / JPEG',
    note: 'Plain white background only. Signature in BLOCK capital letters is rejected.',
  },
  {
    id: 'ku_cus',
    name: 'Kashmir Univ / CUS',
    photoSize: 'Under 100 KB',
    photoDim: 'Passport size (Standard)',
    sigSize: 'Under 50 KB',
    sigDim: 'Standard signature',
    format: 'JPG / PNG / PDF',
    note: 'Legible scanned marksheets under 200 KB in PDF format.',
  },
];

const SERVICE_FEE_CATALOGUE = [
  {
    id: 'jkssb_apply',
    name: 'JKSSB Online Application Form Submission',
    govFee: '₹400 / ₹500 (Varies by post)',
    cscFee: '₹50 - ₹70',
    totalEstimated: '₹450 - ₹570',
    includes: [
      'Document scanning & resizing',
      'Fee payment gateway handling',
      'Final printout & PDF copy',
      'Tracking receipt',
    ],
  },
  {
    id: 'pan_card',
    name: 'New PAN Card / PAN Correction (NSDL / UTI)',
    govFee: '₹107 (Statutory ITD Fee)',
    cscFee: '₹50 - ₹80',
    totalEstimated: '₹157 - ₹187',
    includes: [
      'Biometric / OTP Aadhaar e-Sign',
      'Physical dispatch processing',
      'e-PAN copy delivered via email',
      'Plastic physical card by Speed Post',
    ],
  },
  {
    id: 'aadhaar_address',
    name: 'Aadhaar Demographic Update (Address / Mobile Seed)',
    govFee: '₹50 (UIDAI Statutory Fee)',
    cscFee: '₹30 - ₹50',
    totalEstimated: '₹80 - ₹100',
    includes: [
      'UIDAI portal document upload',
      'Valid proof validation',
      'Official URN acknowledgment slip',
    ],
  },
  {
    id: 'pm_kisan',
    name: 'PM-KISAN Biometric eKYC & Bank Seeding Check',
    govFee: '₹0 (Free Government Scheme)',
    cscFee: '₹15 - ₹30',
    totalEstimated: '₹15 - ₹30',
    includes: [
      'Biometric RdService scanner authentication',
      'NPCI DBT bank active status verification',
      'eKYC successful receipt',
    ],
  },
  {
    id: 'domicile',
    name: 'J&K Domicile Certificate Online Filing',
    govFee: '₹10 - ₹20',
    cscFee: '₹50 - ₹70',
    totalEstimated: '₹60 - ₹90',
    includes: [
      'JanSugam / JKServices portal filing',
      'PRC & ration card attachment',
      'Application tracking ID generation',
    ],
  },
  {
    id: 'passport_slot',
    name: 'Passport Seva Kendra Online Appointment Booking',
    govFee: '₹1,500 (MEA Normal Application Fee)',
    cscFee: '₹100 - ₹150',
    totalEstimated: '₹1,600 - ₹1,650',
    includes: [
      'Detailed Annexure & police station data entry',
      'PSK Srinagar/Jammu calendar slot booking',
      'Appointment confirmation sheet',
    ],
  },
];

export default function CitizenToolsDesk({
  onApplyService,
  isStandalonePage = false,
  onNavigateRoute,
}: CitizenToolsDeskProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'age' | 'photo' | 'fee'>('age');

  const navigateRoute = (href: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(href);
      return;
    }
    try {
      window.history.pushState(null, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.location.href = href;
    }
  };

  // -------------------------------------------------------------
  // Tool 1: Age Calculator for Exam Cutoff (Formulas & relaxations preserved verbatim)
  // -------------------------------------------------------------
  const [dob, setDob] = useState<string>('2002-05-15');
  const [cutoffDate, setCutoffDate] = useState<string>('2026-01-01');
  const [category, setCategory] = useState<string>('om');
  const [maxAgeLimit, setMaxAgeLimit] = useState<number>(40);

  const ageCalculation = useMemo(() => {
    if (!dob || !cutoffDate) return null;
    const birth = new Date(dob);
    const cutoff = new Date(cutoffDate);

    if (isNaN(birth.getTime()) || isNaN(cutoff.getTime())) return null;
    if (cutoff < birth) return { error: 'Cutoff date must be after Date of Birth' };

    let years = cutoff.getFullYear() - birth.getFullYear();
    let months = cutoff.getMonth() - birth.getMonth();
    let days = cutoff.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(cutoff.getFullYear(), cutoff.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let allowedMax = maxAgeLimit;
    let relaxationText = 'Standard OM / General Cutoff';
    if (category === 'rba_obc') {
      allowedMax = maxAgeLimit + 3;
      relaxationText = '+3 Years Reference (RBA / OBC / EWS)';
    } else if (category === 'sc_st') {
      allowedMax = maxAgeLimit + 3;
      relaxationText = '+3 Years Reference (SC / ST)';
    } else if (category === 'pwd') {
      allowedMax = maxAgeLimit + 2;
      relaxationText = '+2 Years Reference (Physically Challenged)';
    } else if (category === 'esm') {
      allowedMax = maxAgeLimit + 8;
      relaxationText = '+8 Years Reference (Ex-Servicemen)';
    }

    const withinAgeBracket =
      years < allowedMax || (years === allowedMax && months === 0 && days === 0);

    return {
      years,
      months,
      days,
      allowedMax,
      relaxationText,
      withinAgeBracket,
      minAgeMet: years >= 18,
    };
  }, [dob, cutoffDate, category, maxAgeLimit]);

  // -------------------------------------------------------------
  // Tool 2: Photo & Signature Dimension / KB Compliance Inspector
  // -------------------------------------------------------------
  const [selectedPortal, setSelectedPortal] = useState(PORTAL_PRESETS[0].id);
  const currentPreset =
    PORTAL_PRESETS.find((p) => p.id === selectedPortal) || PORTAL_PRESETS[0];

  const [testFileSpecs, setTestFileSpecs] = useState<{
    name: string;
    sizeKb: number;
    width?: number;
    height?: number;
  } | null>(null);

  const handleTestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKb = Math.round(file.size / 1024);
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      setTestFileSpecs({
        name: file.name,
        sizeKb,
        width: img.width,
        height: img.height,
      });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      setTestFileSpecs({
        name: file.name,
        sizeKb,
      });
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  // -------------------------------------------------------------
  // Tool 3: CSC Regulated Fee Estimator
  // -------------------------------------------------------------
  const [selectedFeeService, setSelectedFeeService] = useState(
    SERVICE_FEE_CATALOGUE[0].id
  );
  const activeFeeData =
    SERVICE_FEE_CATALOGUE.find((s) => s.id === selectedFeeService) ||
    SERVICE_FEE_CATALOGUE[0];

  const calculatorFaqs: FaqItem[] = useMemo(
    () => [
      {
        question: 'How is recruitment age calculated against an official cutoff date?',
        answer:
          'Exact chronological age is calculated by subtracting Date of Birth from the selected cutoff date (borrowing calendar days from the preceding month when needed). Any selected reservation relaxation benchmark is then added to the base maximum age limit. Always confirm post-specific birth date windows in the official notification.',
      },
      {
        question: 'Are photos or signatures uploaded anywhere when checked with the Photo Inspector?',
        answer:
          'No. The Photo / Sign Spec Inspector reads file byte size and natural image pixel dimensions locally in your browser using an in-memory object URL that is immediately revoked. Zero files leave your device.',
      },
      {
        question: 'Are the statutory fees and CSC service charges shown here fixed?',
        answer:
          'The fee estimator reflects catalogued reference rates stored in portal data without a verification date. Government fees and applicable service charges can change by notification or service type, so always confirm current fees with the official source and CSC operator before applying.',
      },
      {
        question: 'Can I resize or compress my photo or signature to match these portal rules?',
        answer:
          'Yes. Open CSC DOST Document Tools (/tools) to compress photos to 20–50 KB, crop signatures to 10–20 KB, or build A4 printable passport sheets locally in your browser.',
      },
    ],
    []
  );

  const howItIsCalculatedText = useMemo(() => {
    if (activeTab === 'age') {
      return {
        title: 'Calendar Difference + Reference Age Relaxation',
        steps: [
          '1. Compute exact years, months, and days between Date of Birth and the chosen Cutoff Date (if the cutoff day is earlier than birth day, actual days from the previous month are borrowed).',
          '2. Apply the selected reference addition to the Base Maximum Age Limit: OM/General (+0 yrs), RBA/OBC/EWS/ALC (+3 yrs), SC/ST (+3 yrs), PwD (+2 yrs), or Ex-Servicemen (+8 yrs).',
          '3. Check whether calculated age is at least 18 years and within the upper limit (or exactly equal to the limit with 0 months and 0 days).',
        ],
      };
    }
    if (activeTab === 'photo') {
      return {
        title: 'Local Byte Size & Pixel Dimension Readout',
        steps: [
          '1. File Size (KB) is calculated in your browser as Math.round(file.size / 1024).',
          '2. Pixel dimensions (width × height) are read locally via an HTML5 Image object without uploading the file.',
          '3. The inspector checks whether the file falls within the general 10–100 KB standard range or exceeds common 50–70 KB ceilings alongside the selected portal preset.',
        ],
      };
    }
    return {
      title: 'Statutory Departmental Fee + Prescribed CSC Charge',
      steps: [
        '1. Displays the statutory departmental/government fee component and indicative CSC facilitation charge stored for the selected service.',
        '2. Total Estimated Cost represents the sum of those two recorded ranges.',
        '3. Because statutory schedules vary by application category and may update over time, confirm the exact payable fee before proceeding.',
      ],
    };
  }, [activeTab]);

  const activeRateAdvisory =
    activeTab === 'age'
      ? t.calculatorsRateNoticeAge
      : activeTab === 'photo'
      ? t.calculatorsRateNoticePhoto
      : t.calculatorsRateNoticeFee;

  return (
    <div
      className={
        isStandalonePage
          ? 'w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12'
          : 'w-full'
      }
    >
      <div
        className={
          isStandalonePage
            ? 'max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5 sm:space-y-6'
            : 'space-y-4'
        }
      >
        {isStandalonePage && (
          <Breadcrumbs
            items={[
              { label: t.navHome, href: '/' },
              { label: t.calculatorsPageTitle },
            ]}
            onNavigate={navigateRoute}
            rightSlot={
              <a
                href="/tools"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                    e.preventDefault();
                    navigateRoute('/tools');
                  }
                }}
                className="min-h-[40px] inline-flex items-center gap-1.5 text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
              >
                <Wrench className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.navTools}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
              </a>
            }
          />
        )}

        <section
          id="citizen-tools"
          aria-labelledby="tools-heading"
          className="space-y-4 sm:space-y-5 scroll-mt-20"
        >
          {/* Header & Tab Switcher */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 text-start shadow-2xs">
            <div className="space-y-1.5 min-w-0">
              <Chip variant="verified">Citizen Utility Calculators</Chip>
              {isStandalonePage ? (
                <h1
                  id="tools-heading"
                  className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight m-0"
                >
                  {t.calculatorsPageTitle}
                </h1>
              ) : (
                <h2
                  id="tools-heading"
                  className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight m-0"
                >
                  {t.calculatorsPageTitle}
                </h2>
              )}
              <p className="text-sm sm:text-base text-[var(--text-secondary)] m-0 max-w-2xl leading-relaxed">
                {t.calculatorsPageSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('age')}
                className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'age'
                    ? 'bg-[#101A36] text-white shadow-2xs'
                    : 'text-[var(--text-primary)] hover:text-[#1F9D6B]'
                }`}
              >
                <Calculator className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.calculatorsTabAge}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-[#101A36] text-white shadow-2xs'
                    : 'text-[var(--text-primary)] hover:text-[#1F9D6B]'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.calculatorsTabPhoto}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fee')}
                className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === 'fee'
                    ? 'bg-[#101A36] text-white shadow-2xs'
                    : 'text-[var(--text-primary)] hover:text-[#1F9D6B]'
                }`}
              >
                <Receipt className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t.calculatorsTabFee}</span>
              </button>
            </div>
          </div>

          {/* Outdated Rate / Official Verification Advisory */}
          <div
            role="note"
            className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-3.5 sm:p-4 flex items-start gap-3 text-start"
          >
            <ShieldAlert
              className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed m-0">
              {activeRateAdvisory}
            </p>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: AGE CALCULATOR (Form + Large Result Card)              */}
          {/* ============================================================== */}
          {activeTab === 'age' && (
            <Card className="p-4 sm:p-6 text-start">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 1. Form */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                      <Calculator className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                      <span>Recruitment Age Eligibility Calculator</span>
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 m-0">
                      Verify your exact age against official examination cutoff dates (e.g. JKSSB Advt 09/2026, Indian Army, SSC, RRB).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="calc-dob"
                        className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5"
                      >
                        Your Date of Birth (DOB)
                      </label>
                      <input
                        id="calc-dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1F9D6B]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="calc-cutoff"
                        className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5"
                      >
                        Official Cutoff Date
                      </label>
                      <input
                        id="calc-cutoff"
                        type="date"
                        value={cutoffDate}
                        onChange={(e) => setCutoffDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1F9D6B]"
                      />
                      <span className="text-xs text-[var(--text-muted)] block mt-1">
                        Usually 01/01 of the advertisement year
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="calc-category"
                        className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5"
                      >
                        Reservation Category
                      </label>
                      <select
                        id="calc-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1F9D6B]"
                      >
                        <option value="om">Open Merit (OM) / General (40 Yrs)</option>
                        <option value="rba_obc">RBA / OBC / EWS / ALC (+3 Yrs / 43 Yrs)</option>
                        <option value="sc_st">SC / ST (+3 Yrs / 43 Yrs)</option>
                        <option value="pwd">Physically Challenged - PwD (42 Yrs)</option>
                        <option value="esm">Ex-Servicemen - ESM (48 Yrs)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="calc-max-age"
                        className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1.5"
                      >
                        Base Maximum Age Limit
                      </label>
                      <select
                        id="calc-max-age"
                        value={maxAgeLimit}
                        onChange={(e) => setMaxAgeLimit(Number(e.target.value))}
                        className="w-full min-h-[44px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1F9D6B]"
                      >
                        <option value={40}>40 Years (JKSSB Standard)</option>
                        <option value={30}>30 Years (SSC CGL / Railway)</option>
                        <option value={28}>28 Years (Banking / IBPS PO)</option>
                        <option value={27}>27 Years (SSC CHSL / MTS)</option>
                        <option value={21}>21 Years (Army Agniveer GD)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Large Result Card */}
                <div className="lg:col-span-5 rounded-2xl bg-[#101A36] text-white p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Calculated Age on Cutoff Date
                    </span>
                    <span className="text-xs font-semibold text-[#F5A623] tabular-nums">
                      {cutoffDate}
                    </span>
                  </div>

                  {ageCalculation && !('error' in ageCalculation) ? (
                    <>
                      <div className="grid grid-cols-3 gap-2.5 text-center">
                        <div className="bg-white/10 border border-white/15 rounded-xl p-3">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white block tabular-nums">
                            {ageCalculation.years}
                          </span>
                          <span className="text-xs uppercase font-semibold text-slate-300">
                            Years
                          </span>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-xl p-3">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white block tabular-nums">
                            {ageCalculation.months}
                          </span>
                          <span className="text-xs uppercase font-semibold text-slate-300">
                            Months
                          </span>
                        </div>
                        <div className="bg-white/10 border border-white/15 rounded-xl p-3">
                          <span className="text-3xl sm:text-4xl font-extrabold text-white block tabular-nums">
                            {ageCalculation.days}
                          </span>
                          <span className="text-xs uppercase font-semibold text-slate-300">
                            Days
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/15 text-xs sm:text-sm">
                        <div className="flex justify-between gap-2 text-slate-300">
                          <span>Category Provision:</span>
                          <strong className="text-white text-end">
                            {ageCalculation.relaxationText}
                          </strong>
                        </div>
                        <div className="flex justify-between gap-2 text-slate-300">
                          <span>Maximum Permissible Age:</span>
                          <strong className="text-[#F5A623] tabular-nums">
                            {ageCalculation.allowedMax} Years
                          </strong>
                        </div>
                      </div>

                      {ageCalculation.withinAgeBracket && ageCalculation.minAgeMet ? (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1F9D6B]/20 border border-[#1F9D6B]/50 text-xs sm:text-sm">
                          <CheckCircle2
                            className="w-5 h-5 text-[#6EE7B7] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div>
                            <strong className="block text-white">Age Benchmark Met</strong>
                            <span className="text-xs text-slate-200">
                              Chronological age ({ageCalculation.years}y {ageCalculation.months}m) is within the selected reference ceiling ({ageCalculation.allowedMax}y).
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-xs sm:text-sm">
                          <AlertCircle
                            className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div>
                            <strong className="block text-white">
                              Outside Selected Reference Ceiling
                            </strong>
                            <span className="text-xs text-slate-200">
                              {!ageCalculation.minAgeMet
                                ? 'Calculated age is under 18 years on the specified cutoff date.'
                                : `Calculated age exceeds the selected ${ageCalculation.allowedMax}-year reference benchmark.`}
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed m-0">
                        Exact age calculation is mathematical. Overall recruitment eligibility depends on official notification date-of-birth windows and educational cutoffs.
                      </p>
                    </>
                  ) : (
                    <div className="text-sm font-semibold text-rose-200 p-3.5 bg-rose-500/20 border border-rose-400/40 rounded-xl">
                      {ageCalculation && 'error' in ageCalculation
                        ? ageCalculation.error
                        : 'Please enter valid dates to calculate age.'}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PHOTO / SIGNATURE SPECS INSPECTOR                      */}
          {/* ============================================================== */}
          {activeTab === 'photo' && (
            <Card className="p-4 sm:p-6 text-start">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 1. Portal Spec Selection (Form) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                      <ImageIcon className="w-5 h-5 text-[#2563EB] shrink-0" aria-hidden="true" />
                      <span>Government Portal Upload Specifications</span>
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 m-0">
                      Select a portal preset to review reference photo and signature rules and inspect your file locally.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {PORTAL_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPortal(p.id)}
                        className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer border ${
                          selectedPortal === p.id
                            ? 'bg-[#101A36] text-white border-[#101A36]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] divide-y divide-[var(--border-default)] text-sm overflow-hidden">
                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <span className="font-semibold text-[var(--text-muted)]">
                        Passport Photograph
                      </span>
                      <div className="sm:col-span-2 space-y-0.5">
                        <div className="font-bold text-[var(--text-primary)]">
                          Size: {currentPreset.photoSize}
                        </div>
                        <div className="text-[var(--text-secondary)]">
                          Dimensions: {currentPreset.photoDim}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <span className="font-semibold text-[var(--text-muted)]">
                        Candidate Signature
                      </span>
                      <div className="sm:col-span-2 space-y-0.5">
                        <div className="font-bold text-[var(--text-primary)]">
                          Size: {currentPreset.sigSize}
                        </div>
                        <div className="text-[var(--text-secondary)]">
                          Dimensions: {currentPreset.sigDim}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <span className="font-semibold text-[var(--text-muted)]">
                        Permitted File Type
                      </span>
                      <div className="sm:col-span-2 font-bold text-[var(--text-primary)]">
                        {currentPreset.format}
                      </div>
                    </div>

                    <div className="p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      <span className="font-semibold text-[var(--text-muted)]">
                        Compliance Note
                      </span>
                      <p className="sm:col-span-2 text-[var(--text-secondary)] m-0 leading-relaxed">
                        {currentPreset.note}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Large Result Card & Local Inspector */}
                <div className="lg:col-span-5 rounded-2xl bg-[#101A36] text-white p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Instant Local File Inspector
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 m-0 leading-relaxed">
                      Files are inspected in your browser and not uploaded to any server.
                    </p>
                  </div>

                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-white/30 hover:border-[#F5A623] bg-white/10 rounded-xl p-4 text-center transition-colors">
                      <FileCheck2
                        className="w-8 h-8 text-[#6EE7B7] mx-auto mb-2"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold text-white block">
                        Choose Photo / Signature to Inspect
                      </span>
                      <span className="text-xs text-slate-300 block mt-0.5">
                        JPG, PNG, or JPEG from phone or computer
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTestFileUpload}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {testFileSpecs ? (
                    <div className="rounded-xl bg-white/10 border border-white/15 p-4 space-y-3">
                      <div className="flex items-baseline justify-between gap-2 border-b border-white/15 pb-2.5">
                        <span className="text-sm font-bold text-white truncate">
                          {testFileSpecs.name}
                        </span>
                        <span className="text-2xl font-extrabold text-[#F5A623] tabular-nums shrink-0">
                          {testFileSpecs.sizeKb} KB
                        </span>
                      </div>

                      {testFileSpecs.width && testFileSpecs.height && (
                        <div className="text-sm text-slate-200">
                          Resolution:{' '}
                          <strong className="text-white tabular-nums">
                            {testFileSpecs.width} × {testFileSpecs.height} px
                          </strong>
                        </div>
                      )}

                      {testFileSpecs.sizeKb >= 10 && testFileSpecs.sizeKb <= 100 ? (
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#6EE7B7] bg-[#1F9D6B]/20 border border-[#1F9D6B]/50 p-3 rounded-xl">
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Acceptable size bracket for standard portals (10–100 KB)</span>
                        </div>
                      ) : testFileSpecs.sizeKb < 10 ? (
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F5A623] bg-amber-500/20 border border-amber-400/50 p-3 rounded-xl">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>File may be too small or compressed (under 10 KB).</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-200 bg-rose-500/20 border border-rose-400/50 p-3 rounded-xl">
                          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Exceeds standard 50–70 KB portal ceiling. Needs resizing.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                      <span className="text-xs font-semibold text-slate-300 block">
                        Selected Preset Target
                      </span>
                      <span className="text-xl font-extrabold text-white block mt-1">
                        {currentPreset.photoSize}
                      </span>
                      <span className="text-xs text-slate-300 block mt-0.5">
                        Signature: {currentPreset.sigSize}
                      </span>
                    </div>
                  )}

                  <a
                    href="/tools/image-compressor"
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                        e.preventDefault();
                        navigateRoute('/tools/image-compressor');
                      }
                    }}
                    className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-sm inline-flex items-center justify-center gap-2 no-underline transition-colors"
                  >
                    <span>Open Image Compressor Tool</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </Card>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CSC REGULATED FEE ESTIMATOR                            */}
          {/* ============================================================== */}
          {activeTab === 'fee' && (
            <Card className="p-4 sm:p-6 text-start">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* 1. Service Select Column (Form) */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2 m-0">
                      <Receipt className="w-5 h-5 text-[#1F9D6B] shrink-0" aria-hidden="true" />
                      <span>Regulated Government &amp; Digital Service Charges</span>
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 m-0">
                      Select a service below to inspect the recorded statutory fee and indicative CSC charge breakdown.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {SERVICE_FEE_CATALOGUE.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedFeeService(item.id)}
                        className={`w-full min-h-[52px] text-start p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                          selectedFeeService === item.id
                            ? 'border-[#101A36] bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold'
                            : 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-sm font-bold block">{item.name}</span>
                          <span className="text-xs text-[var(--text-muted)] block tabular-nums">
                            Recorded Estimate: {item.totalEstimated}
                          </span>
                        </div>
                        <ArrowRight
                          className={`w-4 h-4 rtl:rotate-180 shrink-0 ${
                            selectedFeeService === item.id
                              ? 'text-[#1F9D6B]'
                              : 'text-[var(--text-muted)]'
                          }`}
                          aria-hidden="true"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Large Result Card */}
                <div className="lg:col-span-5 rounded-2xl bg-[#101A36] text-white p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="space-y-1 border-b border-white/15 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Total Recorded Estimate
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-[#6EE7B7] tabular-nums">
                      {activeFeeData.totalEstimated}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white m-0">
                      {activeFeeData.name}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-2 text-slate-300">
                      <span>Statutory Government / Dept Fee:</span>
                      <strong className="text-white text-end tabular-nums">
                        {activeFeeData.govFee}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-2 text-slate-300">
                      <span>Prescribed CSC Facilitation Charge:</span>
                      <strong className="text-white text-end tabular-nums">
                        {activeFeeData.cscFee}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/15">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      What Is Included
                    </span>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200 list-none m-0 p-0">
                      {activeFeeData.includes.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2
                            className="w-4 h-4 text-[#6EE7B7] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {onApplyService && (
                    <button
                      type="button"
                      onClick={() => onApplyService(activeFeeData.name)}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#1F9D6B] hover:bg-[#178257] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Enquire / Apply for this Service</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* 3. How It Is Calculated Section */}
          <Card className="p-4 sm:p-6 space-y-3 text-start">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[#2563EB] shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                {t.calculatorsHowCalculatedTitle}: {howItIsCalculatedText.title}
              </h2>
            </div>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-none m-0 p-0 leading-relaxed">
              {howItIsCalculatedText.steps.map((step) => (
                <li
                  key={step}
                  className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
                >
                  {step}
                </li>
              ))}
            </ul>
          </Card>

          {/* 4. FAQ + Support Sections (Standalone /calculators route) */}
          {isStandalonePage && (
            <>
              <AdSlot />
              <FaqAccordion items={calculatorFaqs} title={t.calculatorsFaqTitle} injectSchema />
              <HelpApplyingCard contextTitle={t.calculatorsPageTitle} />
              <AlertsBox />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
