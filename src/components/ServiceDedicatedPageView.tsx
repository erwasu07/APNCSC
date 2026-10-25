import React, { useEffect } from 'react';
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
  CreditCard,
  Building2,
  Landmark,
  Laptop,
  GraduationCap,
  Briefcase,
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
  
  // Set document title dynamically
  useEffect(() => {
    const orig = document.title;
    document.title = `${service.name} – Process, Documents & Fees | CSC DOST`;
    return () => {
      document.title = orig;
    };
  }, [service]);

  const handlePrint = () => {
    window.print();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cards_adda': return CreditCard;
      case 'jk_state': return Landmark;
      case 'revenue': return Building2;
      case 'digital': return Laptop;
      case 'education': return GraduationCap;
      case 'business': return Briefcase;
      default: return ShieldCheck;
    }
  };

  const CategoryIcon = getCategoryIcon(service.category);

  // Official portal link mapping based on service ID / name
  const getOfficialPortal = () => {
    const sId = service.id.toLowerCase();
    const sName = service.name.toLowerCase();

    if (sId.includes('pan') || sName.includes('pan')) {
      return {
        name: 'NSDL Protean / Income Tax Portal',
        url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html'
      };
    }
    if (sId.includes('aadhaar') || sName.includes('aadhaar')) {
      return {
        name: 'Unique Identification Authority of India (UIDAI)',
        url: 'https://myaadhaar.uidai.gov.in'
      };
    }
    if (sId.includes('ayushman') || sName.includes('ayushman') || sName.includes('golden')) {
      return {
        name: 'National Health Authority (NHA Beneficiary Portal)',
        url: 'https://beneficiary.nha.gov.in'
      };
    }
    if (sId.includes('voter') || sName.includes('voter')) {
      return {
        name: 'Election Commission of India (ECI Voters Portal)',
        url: 'https://voters.eci.gov.in'
      };
    }
    if (sId.includes('pmkisan') || sName.includes('kisan')) {
      return {
        name: 'PM-KISAN Official Portal (Ministry of Agriculture)',
        url: 'https://pmkisan.gov.in'
      };
    }
    if (sId.includes('passport') || sName.includes('passport')) {
      return {
        name: 'Passport Seva Online (Ministry of External Affairs)',
        url: 'https://www.passportindia.gov.in'
      };
    }
    if (sId.includes('parivahan') || sId.includes('driving') || sName.includes('license') || sName.includes('rc')) {
      return {
        name: 'Parivahan Sewa (Ministry of Road Transport & Highways)',
        url: 'https://parivahan.gov.in'
      };
    }
    if (sId.includes('shram') || sName.includes('shram')) {
      return {
        name: 'Ministry of Labour & Employment (e-Shram Portal)',
        url: 'https://eshram.gov.in'
      };
    }
    if (sId.includes('domicile') || sId.includes('unnat') || sName.includes('domicile') || sName.includes('revenue')) {
      return {
        name: 'e-UNNAT J&K Citizen Services Portal',
        url: 'https://eunnat.jk.gov.in'
      };
    }
    return {
      name: 'National Government Services Portal (India.gov.in)',
      url: 'https://services.india.gov.in'
    };
  };

  const officialPortal = getOfficialPortal();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#14213D] pb-16 pt-3 sm:pt-6 font-sans">
      
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            'name': service.name,
            'description': service.description,
            'provider': {
              '@type': 'Organization',
              'name': 'CSC DOST',
              'url': 'https://www.cscdost.com'
            },
            'serviceType': CATEGORY_LABELS[service.category] || 'Citizen E-Governance Assistance',
            'offers': {
              '@type': 'Offer',
              'price': service.price,
              'priceCurrency': 'INR'
            }
          })
        }}
      />

      <div className="w-full max-w-4xl mx-auto px-0 md:px-6 space-y-0 md:space-y-6 pb-24 sm:pb-8">
        
        {/* Navigation & Action Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-white px-4 py-3 sm:p-4 rounded-none md:rounded-xl border-b md:border border-[#E2E8F0] shadow-none md:shadow-2xs w-full">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#0B1F49] hover:bg-[#122e6b] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Services</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white hover:bg-slate-50 text-[#14213D] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(service)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#14213D] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
            >
              <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyService(service.name)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Apply via CSC Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Document Article */}
        <article className="bg-white rounded-none md:rounded-2xl border-b md:border border-[#E2E8F0] px-4 py-5 sm:p-8 space-y-6 sm:space-y-8 shadow-none md:shadow-xs w-full max-w-full overflow-hidden">
          
          {/* Header Section */}
          <header className="space-y-4 border-b border-[#E2E8F0] pb-6">
            
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
              <button type="button" onClick={onBack} className="hover:text-[#0759E8] font-medium cursor-pointer">
                Home
              </button>
              <span aria-hidden="true">/</span>
              <button type="button" onClick={onBack} className="hover:text-[#0759E8] font-medium cursor-pointer">
                Digital Services
              </button>
              <span aria-hidden="true">/</span>
              <span className="text-[#14213D] font-semibold">
                {CATEGORY_LABELS[service.category] || service.category}
              </span>
            </nav>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0759E8]">
                {CATEGORY_LABELS[service.category] || 'Government Citizen Service'}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#14213D] tracking-tight leading-snug break-words">
                {service.name}
              </h1>
            </div>

            <p className="text-sm text-[#64748B] leading-relaxed break-words">
              {service.description}
            </p>

            {/* Quick Metadata Bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
              <div>
                <span>Processing Time: </span>
                <strong className="text-[#16A34A] font-semibold">{service.estimatedTime}</strong>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Service Fee: </span>
                <strong className="text-[#0759E8] font-bold">{service.price}</strong>
              </div>
              <span aria-hidden="true">·</span>
              <div>
                <span>Service Channel: </span>
                <strong className="text-[#14213D] font-semibold">Online &amp; VLE Desk</strong>
              </div>
            </div>

          </header>

          {/* Citizen Advisory Box */}
          <aside aria-label="Advisory" className="border-l-4 border-amber-500 bg-amber-50/70 p-4 rounded-r-lg space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-800" />
              <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                Service Application Advisory
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Please have your supporting documents (Aadhaar Card, active mobile number for OTP, and relevant certificates) ready. Applications submitted through CSC DOST undergo certified VLE pre-verification before being dispatched to the official authority gateway.
            </p>
          </aside>

          {/* Step-by-Step Numbered Guide (Section 14 Requirement) */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <Clock className="w-4 h-4 text-[#0759E8]" />
              <span>Step-by-Step Procedure</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-[#14213D]">
              <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Open the Relevant Official Portal</strong>
                  <p className="text-[#64748B] text-xs mt-0.5">Access {officialPortal.name} or initiate your request through the CSC DOST online desk.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Select the Relevant Service &amp; Form</strong>
                  <p className="text-[#64748B] text-xs mt-0.5">Choose the appropriate category (e.g. New Allotment vs Correction / Update in existing record).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <strong>Enter Required Particulars &amp; Upload Proofs</strong>
                  <p className="text-[#64748B] text-xs mt-0.5">Fill applicant name, address, father's name, and contact details matching your official ID proof exactly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                <div>
                  <strong>Verification &amp; Acknowledgment Generation</strong>
                  <p className="text-[#64748B] text-xs mt-0.5">Complete OTP verification, submit the statutory fee, and download your unique tracking reference receipt.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Required Documents Checklist */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <FileCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Required Documents &amp; Information</span>
            </h2>

            {service.requirements && service.requirements.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#14213D]">
                {service.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-[#64748B]">
                Standard Aadhaar Card / Government photo ID and active mobile number for OTP.
              </p>
            )}
          </section>

          {/* Official Source Links vs CSC Desk Assistance (Section 15 Requirement) */}
          <section className="space-y-4 pt-4 border-t border-[#E2E8F0]">
            <h2 className="text-base sm:text-lg font-bold text-[#14213D] flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#0759E8]" />
              <span>Official Government Source &amp; Submission</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Official Source Button */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                  Official Government Portal
                </span>
                <h3 className="text-sm font-bold text-[#14213D]">
                  {officialPortal.name}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Apply directly on the government portal independently:
                </p>
                <a
                  href={officialPortal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-[#0759E8] border border-[#0759E8] text-xs font-bold rounded-lg transition-colors cursor-pointer mt-1"
                >
                  <span>Visit Official Website →</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* CSC DOST Assistance Desk */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#0759E8] uppercase tracking-wider block">
                  Assisted Form Filling
                </span>
                <h3 className="text-sm font-bold text-[#14213D]">
                  CSC DOST Online Desk
                </h3>
                <p className="text-xs text-[#64748B]">
                  Have certified CSC operators review documents, format photos, and file on your behalf:
                </p>
                <button
                  type="button"
                  onClick={() => onApplyService(service.name)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs mt-1"
                >
                  <span>Apply via CSC Desk →</span>
                </button>
              </div>

            </div>
          </section>

          {/* Footer Back & Action Buttons */}
          <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#14213D] text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Services</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyService(service.name)}
              className="px-6 py-2.5 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              <span>Apply via CSC Desk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </article>

      </div>

    </div>
  );
}
