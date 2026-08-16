import React from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Printer, 
  CheckCircle, 
  Clock, 
  FileText, 
  IndianRupee, 
  ShieldCheck, 
  Bell, 
  ArrowRight, 
  ExternalLink,
  Layers,
  Sparkles,
  CreditCard,
  Building2,
  Landmark,
  Laptop,
  GraduationCap,
  Briefcase,
  Fingerprint,
  FileCheck
} from 'lucide-react';
import { ServiceItem, CATEGORY_LABELS } from '../servicesData';

interface ServiceDedicatedPageViewProps {
  service: ServiceItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (service: ServiceItem) => void;
}

export default function ServiceDedicatedPageView({
  service,
  onBack,
  onApplyService,
  onShare
}: ServiceDedicatedPageViewProps) {
  
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cards_adda':
        return CreditCard;
      case 'jk_state':
        return Landmark;
      case 'revenue':
        return Building2;
      case 'digital':
        return Laptop;
      case 'education':
        return GraduationCap;
      case 'business':
        return Briefcase;
      default:
        return ShieldCheck;
    }
  };

  const CategoryIcon = getCategoryIcon(service.category);

  // Parse fee details nicely
  const getFeeBreakdown = () => {
    if (service.id === 'csc-pan') {
      return { govtFee: '₹107', cscFee: '₹70 (Operator & Filing Charge)', total: '₹177', mode: 'Digital PAN + Physical Card by Speed Post' };
    }
    if (service.id === 'csc-aadhaar') {
      return { govtFee: '₹50', cscFee: '₹70 (Operator Verification)', total: '₹120', mode: 'UIDAI Direct Update Receipt' };
    }
    if (service.id === 'csc-ayushman') {
      return { govtFee: '₹0 (Free Scheme)', cscFee: '₹70 (Filing & PVC Lamination)', total: '₹70', mode: 'Instant Ayushman Golden Card' };
    }
    if (service.id === 'csc-voter') {
      return { govtFee: '₹0 (Free Govt Form)', cscFee: '₹70 (ECI Form Processing)', total: '₹70', mode: 'EPIC Number & Portal Acknowledgment' };
    }
    if (service.id === 'csc-pmkisan') {
      return { govtFee: '₹15', cscFee: '₹70 (Kisan Portal Processing)', total: '₹85', mode: 'Official e-KYC DBT Receipt' };
    }

    const priceLower = service.price.toLowerCase();
    if (priceLower.includes('free') && priceLower.includes('+')) {
      return { govtFee: '₹0 (Free Scheme)', cscFee: '₹70 (CSC Operator Charge)', total: '₹70', mode: 'Online Application Slip' };
    }
    if (service.price.includes('+')) {
      const parts = service.price.split('+');
      return {
        govtFee: parts[0]?.trim() || 'As Applicable',
        cscFee: parts[1]?.trim() || '₹70 (CSC Charge)',
        total: service.price,
        mode: 'Official Govt Portal Slip + Service Receipt'
      };
    }
    return {
      govtFee: service.price,
      cscFee: '₹70 (CSC Operator Charge)',
      total: service.price,
      mode: 'Official Application Tracking Slip'
    };
  };

  const feeData = getFeeBreakdown();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-3 sm:pt-6 font-sans">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Navigation & Action Top Bar */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer"
            id="back-to-services-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to E-Services Catalogue</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
              title="Print Service Details"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(service)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
              id="service-page-share-btn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Service</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyService(service.name)}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
              id="service-page-apply-btn"
            >
              <span>Apply via CSC Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Unified Document Canvas - No Segmented Boxes */}
        <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Header Section */}
          <header className="p-5 sm:p-8 border-b border-slate-200">
            <div className="space-y-3">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <button type="button" onClick={onBack} className="hover:underline text-blue-700 font-medium cursor-pointer">
                  E-Services Catalogue
                </button>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {CATEGORY_LABELS[service.category] || service.category}
                </span>
                {service.popular && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                    POPULAR SERVICE
                  </span>
                )}
              </nav>

              <div className="pt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-900">
                  <CategoryIcon className="w-4 h-4 text-blue-700" />
                  <span>{CATEGORY_LABELS[service.category] || 'Government Citizen Service'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1 leading-snug">
                  {service.name}
                </h1>
              </div>

              {/* Publication and Key Timeline Banner */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500">Official Category: </span>
                  <strong className="text-slate-900 font-semibold">{CATEGORY_LABELS[service.category]}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Processing Time: </span>
                  <strong className="text-emerald-700 font-semibold">{service.estimatedTime}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Fee / Rate: </span>
                  <strong className="text-blue-900 font-bold">{service.price}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Verification: </span>
                  <strong className="text-indigo-900 font-semibold">Authorized CSC VLE</strong>
                </div>
              </div>
            </div>
          </header>

          {/* Document Content Flow */}
          <div className="p-5 sm:p-8 space-y-8 text-slate-800">
            
            {/* Service Advisory - Clean Left Border Callout */}
            <aside aria-label="Advisory" className="border-l-4 border-amber-500 bg-amber-50/60 p-4 rounded-r-lg space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-700" />
                <h2 className="text-xs sm:text-sm font-bold text-amber-950">
                  Service Application &amp; Verification Advisory
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Please provide clear scans or original copies of your supporting documents. All applications submitted through CSC DOST undergo official VLE verification and are directly submitted to the designated government portal (e-UNNAT, UIDAI, NSDL, ECI, or JK Revenue).
              </p>
              <p className="text-xs font-semibold text-slate-700 pt-0.5">
                Estimated Service Turnaround: <span className="font-bold text-emerald-800">{service.estimatedTime}</span>
              </p>
            </aside>

            {/* Description & Overview */}
            <section className="space-y-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Service Overview &amp; Details</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {service.description}
              </p>
            </section>

            {/* Pricing & Timeline Side-by-Side Document Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Fee Structure */}
              <section className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>Fee Structure &amp; Charges</span>
                </h2>
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Government / Department Fee</span>
                    <span className="font-semibold text-slate-900">{feeData.govtFee}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">CSC Operator &amp; Form Charge</span>
                    <span className="font-semibold text-emerald-700">{feeData.cscFee}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Total Applicable Amount</span>
                    <span className="font-bold text-blue-900">{feeData.total}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Payment Modes</span>
                    <span className="font-medium text-slate-800">Cash / UPI / NetBanking / Debit Card</span>
                  </div>
                </div>
              </section>

              {/* Processing Timeline & Delivery */}
              <section className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Timeline &amp; Delivery Format</span>
                </h2>
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Estimated Turnaround</span>
                    <span className="font-bold text-emerald-700">{service.estimatedTime}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Output / Deliverable</span>
                    <span className="font-medium text-slate-900">{feeData.mode}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Application Tracking</span>
                    <span className="font-semibold text-indigo-900">SMS / WhatsApp / Portal Slip</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Service Counter</span>
                    <span className="font-semibold text-slate-900">CSC DOST Sangran Qazigund</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Required Documents / Information Checklist */}
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Required Documents &amp; Information</span>
              </h2>
              {service.requirements && service.requirements.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                  {service.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600">
                  Standard Aadhaar Card / Identity proof and relevant certificate details.
                </p>
              )}
            </section>

            {/* Standard Processing Steps at CSC Desk */}
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>How This Service is Processed at CSC Desk</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-700 pt-1">
                <div className="space-y-1">
                  <div className="font-bold text-blue-900">1. Verification</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Applicant identity and eligibility proofs verified by authorized VLE.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-blue-900">2. Portal Submission</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Online form data and verified attachments uploaded to official government gateway.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-blue-900">3. Acknowledgment</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Official tracking number, application ID, and timestamped receipt generated.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-blue-900">4. Delivery</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Final approved certificate or smart card printed and delivered to applicant.
                  </p>
                </div>
              </div>
            </section>

            {/* Official Source Links & Action Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to E-Services Catalogue</span>
              </button>

              <button
                type="button"
                onClick={() => onApplyService(service.name)}
                className="px-6 sm:px-8 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                <span>Apply via CSC Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </article>

      </div>
    </main>
  );
}
