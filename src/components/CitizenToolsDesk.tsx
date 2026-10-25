import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Image as ImageIcon, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Calendar,
  Sparkles,
  ShieldAlert,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface CitizenToolsDeskProps {
  onApplyService?: (serviceName: string) => void;
}

export default function CitizenToolsDesk({ onApplyService }: CitizenToolsDeskProps) {
  const [activeTab, setActiveTab] = useState<'age' | 'photo' | 'fee'>('age');

  // -------------------------------------------------------------
  // Tool 1: Age Calculator for Exam Cutoff
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
      // Get days in previous month
      const prevMonth = new Date(cutoff.getFullYear(), cutoff.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Category relaxation calculation
    let allowedMax = maxAgeLimit;
    let relaxationText = 'Standard OM / General Cutoff';
    if (category === 'rba_obc') {
      allowedMax = maxAgeLimit + 3;
      relaxationText = '+3 Years Relaxation (RBA / OBC / EWS)';
    } else if (category === 'sc_st') {
      allowedMax = maxAgeLimit + 3;
      relaxationText = '+3 Years Relaxation (SC / ST)';
    } else if (category === 'pwd') {
      allowedMax = maxAgeLimit + 2;
      relaxationText = '+2 Years Relaxation (Physically Challenged)';
    } else if (category === 'esm') {
      allowedMax = maxAgeLimit + 8;
      relaxationText = '+8 Years Relaxation (Ex-Servicemen)';
    }

    const isEligible = years < allowedMax || (years === allowedMax && months === 0 && days === 0);

    return {
      years,
      months,
      days,
      allowedMax,
      relaxationText,
      isEligible,
      minAgeMet: years >= 18
    };
  }, [dob, cutoffDate, category, maxAgeLimit]);

  // -------------------------------------------------------------
  // Tool 2: Photo & Signature Dimension / KB Compliance Inspector
  // -------------------------------------------------------------
  const PORTAL_PRESETS = [
    {
      id: 'jkssb',
      name: 'JKSSB Portal',
      photoSize: '20 KB - 50 KB',
      photoDim: '100 x 120 px (Min) - 3.5cm x 4.5cm',
      sigSize: '10 KB - 20 KB',
      sigDim: '100 x 40 px (Min) - 3.5cm x 1.5cm',
      format: 'JPG / JPEG only',
      note: 'White or light-coloured background. No caps, dark glasses or heavy shadows.'
    },
    {
      id: 'ssc',
      name: 'SSC (Staff Selection)',
      photoSize: '20 KB - 50 KB',
      photoDim: '3.5 cm (W) x 4.5 cm (H)',
      sigSize: '10 KB - 20 KB',
      sigDim: '4.0 cm (W) x 2.0 cm (H)',
      format: 'JPEG format',
      note: 'Live webcam capture enabled on new ssc.gov.in portal. Spectacles strictly prohibited.'
    },
    {
      id: 'army',
      name: 'Indian Army (JIA)',
      photoSize: '5 KB - 20 KB',
      photoDim: '3.5 cm x 4.5 cm (Passport)',
      sigSize: '5 KB - 10 KB',
      sigDim: '3.5 cm x 1.5 cm',
      format: 'JPG / JPEG',
      note: 'Sikh candidates with turban allowed; clear ears visible for others. Crisp resolution.'
    },
    {
      id: 'rrb',
      name: 'Railway RRB (rrbapply)',
      photoSize: '30 KB - 70 KB',
      photoDim: '320 x 240 px (Clear view)',
      sigSize: '30 KB - 70 KB',
      sigDim: '160 x 560 px (Running hand)',
      format: 'JPG / JPEG',
      note: 'Plain white background only. Signature in BLOCK capital letters is rejected.'
    },
    {
      id: 'ku_cus',
      name: 'Kashmir Univ / CUS',
      photoSize: 'Under 100 KB',
      photoDim: 'Passport size (Standard)',
      sigSize: 'Under 50 KB',
      sigDim: 'Standard signature',
      format: 'JPG / PNG / PDF',
      note: 'Legible scanned marksheets under 200 KB in PDF format.'
    }
  ];

  const [selectedPortal, setSelectedPortal] = useState(PORTAL_PRESETS[0].id);
  const currentPreset = PORTAL_PRESETS.find(p => p.id === selectedPortal) || PORTAL_PRESETS[0];

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
        height: img.height
      });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      setTestFileSpecs({
        name: file.name,
        sizeKb
      });
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  // -------------------------------------------------------------
  // Tool 3: CSC Regulated Fee & Service Estimator
  // -------------------------------------------------------------
  const SERVICE_FEE_CATALOGUE = [
    {
      id: 'jkssb_apply',
      name: 'JKSSB Online Application Form Submission',
      govFee: '₹400 / ₹500 (Varies by post)',
      cscFee: '₹50 - ₹70',
      totalEstimated: '₹450 - ₹570',
      includes: ['Document scanning & resizing', 'Fee payment gateway handling', 'Final printout & PDF copy', 'Tracking receipt']
    },
    {
      id: 'pan_card',
      name: 'New PAN Card / PAN Correction (NSDL / UTI)',
      govFee: '₹107 (Statutory ITD Fee)',
      cscFee: '₹50 - ₹80',
      totalEstimated: '₹157 - ₹187',
      includes: ['Biometric / OTP Aadhaar e-Sign', 'Physical dispatch processing', 'e-PAN copy delivered via email', 'Plastic physical card by Speed Post']
    },
    {
      id: 'aadhaar_address',
      name: 'Aadhaar Demographic Update (Address / Mobile Seed)',
      govFee: '₹50 (UIDAI Statutory Fee)',
      cscFee: '₹30 - ₹50',
      totalEstimated: '₹80 - ₹100',
      includes: ['UIDAI portal document upload', 'Valid proof validation', 'Official URN acknowledgment slip']
    },
    {
      id: 'pm_kisan',
      name: 'PM-KISAN Biometric eKYC & Bank Seeding Check',
      govFee: '₹0 (Free Government Scheme)',
      cscFee: '₹15 - ₹30',
      totalEstimated: '₹15 - ₹30',
      includes: ['Biometric RdService scanner authentication', 'NPCI DBT bank active status verification', 'eKYC successful receipt']
    },
    {
      id: 'domicile',
      name: 'J&K Domicile Certificate Online Filing',
      govFee: '₹10 - ₹20',
      cscFee: '₹50 - ₹70',
      totalEstimated: '₹60 - ₹90',
      includes: ['JanSugam / JKServices portal filing', 'PRC & ration card attachment', 'Application tracking ID generation']
    },
    {
      id: 'passport_slot',
      name: 'Passport Seva Kendra Online Appointment Booking',
      govFee: '₹1,500 (MEA Normal Application Fee)',
      cscFee: '₹100 - ₹150',
      totalEstimated: '₹1,600 - ₹1,650',
      includes: ['Detailed Annexure & police station data entry', 'PSK Srinagar/Jammu calendar slot booking', 'Appointment confirmation sheet']
    }
  ];

  const [selectedFeeService, setSelectedFeeService] = useState(SERVICE_FEE_CATALOGUE[0].id);
  const activeFeeData = SERVICE_FEE_CATALOGUE.find(s => s.id === selectedFeeService) || SERVICE_FEE_CATALOGUE[0];

  return (
    <section id="citizen-tools" aria-labelledby="tools-heading" className="w-full bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 px-4 py-4 md:p-0 space-y-3.5 md:space-y-5 scroll-mt-20">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Citizen Utility Suite</span>
          </div>
          <h2 id="tools-heading" className="text-xl sm:text-2xl font-extrabold text-[#102A56] tracking-tight">
            Digital Tools &amp; Citizen Calculators
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
            Instant calculators to verify age eligibility, file upload compliance, and regulated CSC service fees.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap sm:inline-flex items-center gap-x-1.5 gap-y-2 p-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('age')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'age'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#102A56] hover:text-[#2563EB]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Age Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'photo'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#102A56] hover:text-[#2563EB]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photo / Sign Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fee')}
            className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fee'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#102A56] hover:text-[#2563EB]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>CSC Fee Breakdown</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AGE CALCULATOR */}
      {/* ============================================================== */}
      {activeTab === 'age' && (
        <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-2xl p-0 md:p-7 md:shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
            
            {/* Input Form Column */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-[#102A56] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#2563EB]" />
                  <span>Recruitment Age Eligibility Calculator</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-1.5">
                  Verify your exact age against official examination cutoff dates (e.g. JKSSB Advt 09/2026, Indian Army, SSC, RRB).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Your Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Official Cutoff Date
                  </label>
                  <input
                    type="date"
                    value={cutoffDate}
                    onChange={(e) => setCutoffDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  />
                  <span className="text-[10px] text-[#64748B] block mt-1">Usually 01/01 of the advertisement year</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Reservation Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  >
                    <option value="om">Open Merit (OM) / General (40 Yrs)</option>
                    <option value="rba_obc">RBA / OBC / EWS / ALC (+3 Yrs / 43 Yrs)</option>
                    <option value="sc_st">SC / ST (+3 Yrs / 43 Yrs)</option>
                    <option value="pwd">Physically Challenged - PwD (42 Yrs)</option>
                    <option value="esm">Ex-Servicemen - ESM (48 Yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                    Base Maximum Age Limit
                  </label>
                  <select
                    value={maxAgeLimit}
                    onChange={(e) => setMaxAgeLimit(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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

            {/* Result Column */}
            <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 sm:p-5 space-y-3.5">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Calculated Age on Cutoff Date
              </span>

              {ageCalculation && !('error' in ageCalculation) ? (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-2.5">
                      <span className="text-xl sm:text-2xl font-extrabold text-[#102A56] block">
                        {ageCalculation.years}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">Years</span>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-2.5">
                      <span className="text-xl sm:text-2xl font-extrabold text-[#102A56] block">
                        {ageCalculation.months}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">Months</span>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-lg p-2.5">
                      <span className="text-xl sm:text-2xl font-extrabold text-[#102A56] block">
                        {ageCalculation.days}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-[#64748B]">Days</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[#E2E8F0] text-xs">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Category Provision:</span>
                      <span className="font-semibold text-[#0F172A]">{ageCalculation.relaxationText}</span>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Maximum Permissible Age:</span>
                      <span className="font-semibold text-[#0F172A]">{ageCalculation.allowedMax} Years</span>
                    </div>
                  </div>

                  {ageCalculation.isEligible && ageCalculation.minAgeMet ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Eligible: Age falls within permissible recruitment limits.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs font-bold">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        {!ageCalculation.minAgeMet 
                          ? 'Under-age: Must be at least 18 years on cutoff date.' 
                          : 'Over-age: Exceeds the permissible upper age bracket for this selection.'}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-rose-600 p-3 bg-rose-50 rounded-lg">
                  Please enter valid dates to calculate age.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PHOTO / SIGNATURE COMPLIANCE INSPECTOR */}
      {/* ============================================================== */}
      {activeTab === 'photo' && (
        <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-2xl p-0 md:p-7 md:shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
            
            {/* Left Portal Spec Column */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <h3 className="text-base font-bold text-[#102A56] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#2563EB]" />
                  <span>Government Portal Upload Specifications</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-1.5">
                  Upload requirements for photographs and digital signatures across major recruitment portals to avoid application rejection.
                </p>
              </div>

              {/* Portal Selector Chips */}
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-xs">
                {PORTAL_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPortal(p.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
                      selectedPortal === p.id
                        ? 'bg-[#2563EB] text-white border-[#2563EB] font-bold'
                        : 'bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Spec Details Table */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden divide-y divide-[#E2E8F0] text-xs">
                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="font-semibold text-[#64748B]">Passport Photograph:</span>
                  <div className="col-span-2 space-y-0.5">
                    <p className="font-bold text-[#102A56]">Size: {currentPreset.photoSize}</p>
                    <p className="text-[#64748B]">Dimensions: {currentPreset.photoDim}</p>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="font-semibold text-[#64748B]">Candidate Signature:</span>
                  <div className="col-span-2 space-y-0.5">
                    <p className="font-bold text-[#102A56]">Size: {currentPreset.sigSize}</p>
                    <p className="text-[#64748B]">Dimensions: {currentPreset.sigDim}</p>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="font-semibold text-[#64748B]">Permitted File Type:</span>
                  <div className="col-span-2">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#2563EB] font-bold rounded">
                      {currentPreset.format}
                    </span>
                  </div>
                </div>

                <div className="p-3 grid grid-cols-3 gap-2">
                  <span className="font-semibold text-[#64748B]">Compliance Note:</span>
                  <p className="col-span-2 text-slate-700 leading-relaxed font-medium">
                    {currentPreset.note}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Live File Dimension/Size Inspector */}
            <div className="lg:col-span-5 bg-[#EFF6FF]/60 border border-[#BFDBFE] rounded-xl p-5 space-y-4">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block">
                Instant File Inspector
              </span>
              <p className="text-xs text-[#0F172A] leading-relaxed">
                Test your photo or signature file directly in your browser. No files are uploaded to any server.
              </p>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-[#3B82F6] hover:border-[#2563EB] bg-white rounded-xl p-4 text-center transition-colors">
                  <FileCheck2 className="w-8 h-8 text-[#2563EB] mx-auto mb-2" />
                  <span className="text-xs font-bold text-[#102A56] block">
                    Choose Photo / Signature to Inspect
                  </span>
                  <span className="text-[11px] text-[#64748B] block mt-0.5">
                    Click to test local JPG, PNG, or JPEG
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTestFileUpload}
                    className="hidden"
                  />
                </div>
              </label>

              {testFileSpecs && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                    <span className="font-bold text-[#102A56] truncate max-w-[180px]">
                      {testFileSpecs.name}
                    </span>
                    <span className="font-extrabold text-[#2563EB]">{testFileSpecs.sizeKb} KB</span>
                  </div>

                  <div className="space-y-1 text-[#64748B]">
                    {testFileSpecs.width && testFileSpecs.height && (
                      <p>Resolution: <span className="font-bold text-[#0F172A]">{testFileSpecs.width} x {testFileSpecs.height} px</span></p>
                    )}
                    <p>Status for {currentPreset.name}:</p>
                  </div>

                  {testFileSpecs.sizeKb >= 10 && testFileSpecs.sizeKb <= 100 ? (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 p-2 rounded">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Acceptable size bracket for standard portals</span>
                    </div>
                  ) : testFileSpecs.sizeKb < 10 ? (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs bg-amber-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>File may be too small or compressed (under 10 KB).</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs bg-rose-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Exceeds standard 50-70 KB portal ceiling. Needs resizing.</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-[#64748B] italic">
                Need professional scanning, photo resizing, or document PDF conversion? Visit our digital desk or apply online.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CSC REGULATED FEE ESTIMATOR */}
      {/* ============================================================== */}
      {activeTab === 'fee' && (
        <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-2xl p-0 md:p-7 md:shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Service Select Column */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-base font-bold text-[#102A56] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2563EB]" />
                <span>Regulated Government &amp; Digital Service Charges</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                CSC DOST adheres to transparent pricing. Know the exact breakdown between statutory official fees and digital assistance charges.
              </p>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-[#0F172A]">
                  Select Service to View Pricing Breakdown:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SERVICE_FEE_CATALOGUE.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedFeeService(item.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        selectedFeeService === item.id
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#102A56] font-bold'
                          : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold block">{item.name}</span>
                        <span className="text-[11px] text-[#64748B]">Estimated Total: {item.totalEstimated}</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 ${selectedFeeService === item.id ? 'text-[#2563EB]' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Breakdown Receipt Card */}
            <div className="lg:col-span-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <span className="text-xs font-bold text-[#102A56]">Transparent Fee Breakdown</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Fair Price Guarantee
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>Statutory Government / Dept Fee:</span>
                  <span className="font-bold text-[#102A56]">{activeFeeData.govFee}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>Prescribed CSC Facilitation Charge:</span>
                  <span className="font-bold text-[#2563EB]">{activeFeeData.cscFee}</span>
                </div>
                <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-baseline">
                  <span className="font-extrabold text-[#102A56]">Total Estimated Cost:</span>
                  <span className="text-base font-extrabold text-[#2563EB]">{activeFeeData.totalEstimated}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                <span className="text-[11px] font-bold text-[#0F172A] block">What Is Included:</span>
                <ul className="space-y-1 text-[11px] text-[#64748B]">
                  {activeFeeData.includes.map((inc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {onApplyService && (
                <button
                  type="button"
                  onClick={() => onApplyService(activeFeeData.name)}
                  className="w-full mt-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Apply for this Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
