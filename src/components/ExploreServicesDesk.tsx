import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight,
  ChevronRight, 
  X, 
  FileText, 
  Clock, 
  CheckCircle,
  Shield,
  CreditCard,
  Briefcase,
  Layers,
  Search,
  Check,
  Tag,
  Landmark,
  Laptop,
  GraduationCap,
  Edit,
  Fingerprint,
  ShieldCheck,
  FileCheck,
  Eye,
  Bell
} from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';

interface ExploreServicesDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
}

export default function ExploreServicesDesk({ onApplyService, selectedService }: ExploreServicesDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'csc' | 'digital' | 'education' | 'business'>('all');
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);

  // Filter list based on both active tab and search query
  const filteredServices = SERVICES_LIST.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (service: ServiceItem) => {
    setSelectedServiceItem(null);
    onApplyService(service.name);
    
    // Smooth scroll to Digital Application & Appointment Desk and focus Applicant Name
    setTimeout(() => {
      const portalForm = document.getElementById('booking-portal-form');
      if (portalForm) {
        portalForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      const nameInput = document.getElementById('applicant-name-input') as HTMLInputElement | null;
      if (nameInput) {
        try {
          nameInput.focus({ preventScroll: true });
        } catch {
          nameInput.focus();
        }
      }
    }, 350);
  };

  const getServiceIcon = (id: string, category: string) => {
    if (id.includes('pan')) return CreditCard;
    if (id.includes('aadhaar')) return Fingerprint;
    if (id.includes('voter')) return CheckCircle;
    if (id.includes('ayushman')) return ShieldCheck;
    if (id.includes('pmkisan')) return FileCheck;
    if (id.includes('eshram')) return Edit;
    if (id.includes('certif')) return FileText;
    if (id.includes('passport')) return Shield;
    if (category === 'csc') return Landmark;
    if (category === 'digital') return Laptop;
    if (category === 'education') return GraduationCap;
    return Briefcase;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'csc':
        return Landmark;
      case 'digital':
        return Laptop;
      case 'education':
        return GraduationCap;
      case 'business':
        return Briefcase;
      default:
        return Layers;
    }
  };

  const getFeeDetails = (service: ServiceItem) => {
    if (service.id === 'csc-pan') {
      return { govtFee: '₹107', cscFee: '₹50', time: '2-3 Working Days' };
    }
    if (service.id === 'csc-aadhaar') {
      return { govtFee: '₹50', cscFee: '₹30', time: '24 Hours Slot' };
    }
    if (service.id === 'csc-ayushman') {
      return { govtFee: '₹0 (Free)', cscFee: '₹0 (Free)', time: 'Same Day' };
    }
    if (service.id === 'csc-voter') {
      return { govtFee: '₹0 (Free)', cscFee: '₹30 (PVC Print)', time: '3-5 Working Days' };
    }
    if (service.id === 'csc-pmkisan') {
      return { govtFee: '₹15', cscFee: '₹15', time: 'Same Day' };
    }

    // Default parser
    const priceParts = service.price.split('+');
    let govtFee = '₹50 - ₹107';
    let cscFee = '₹30 - ₹50';

    if (priceParts.length > 1) {
      govtFee = priceParts[0].trim();
      cscFee = priceParts[1].trim();
    } else if (service.price.toLowerCase().includes('free')) {
      govtFee = '₹0 (Free)';
      cscFee = '₹0 - ₹20';
    } else {
      govtFee = service.price;
      cscFee = '₹30';
    }

    return {
      govtFee,
      cscFee,
      time: service.estimatedTime || '1-3 Working Days'
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/60 py-8 sm:py-12 transition-colors duration-300 scroll-mt-24 w-full" id="services">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header & Search Input */}
        <div id="services-board" className="max-w-7xl mx-auto mb-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            {/* Title & Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded text-[10px] font-black uppercase tracking-wider font-mono">
                ⚡ CSC E-SERVICES DIRECTORY
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight font-display">
                Comprehensive E-Services Catalogue
              </h2>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services (e.g. PAN, Aadhaar, Domicile)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-600 font-medium shadow-xs"
                id="services-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COMPACT E-SERVICES BOXES GRID (BLUE THEME) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto w-full">
          {[
            {
              id: 'csc_identity',
              title: 'CSC Government & Identity Cards',
              icon: Landmark,
              itemIds: ['csc-pan', 'csc-aadhaar', 'csc-voter', 'csc-passport', 'csc-dl']
            },
            {
              id: 'welfare_health',
              title: 'Welfare Schemes & Health Cards',
              icon: ShieldCheck,
              itemIds: ['csc-ayushman', 'csc-pmkisan', 'csc-eshram', 'csc-ration']
            },
            {
              id: 'certificates_state',
              title: 'State Revenue & Certificates',
              icon: FileText,
              itemIds: ['csc-certificates']
            },
            {
              id: 'digital_cyber',
              title: 'Digital & Cyber Services',
              icon: Laptop,
              itemIds: ['csc-utility', 'dig-print', 'dig-photo', 'dig-form']
            },
            {
              id: 'education_exams',
              title: 'Education & Admissions',
              icon: GraduationCap,
              itemIds: ['edu-admissions', 'edu-scholarship', 'edu-exams']
            },
            {
              id: 'business_tax',
              title: 'Business & Registrations',
              icon: Briefcase,
              itemIds: ['biz-gst', 'biz-udyam', 'biz-dsc']
            }
          ].map(box => {
            const BoxIcon = box.icon;
            const boxItems = SERVICES_LIST.filter(s => {
              const isBoxMatch = box.itemIds.includes(s.id);
              const searchLower = searchQuery.toLowerCase();
              const isSearchMatch = !searchQuery || 
                s.name.toLowerCase().includes(searchLower) ||
                s.description.toLowerCase().includes(searchLower) ||
                s.requirements.some(req => req.toLowerCase().includes(searchLower));
              return isBoxMatch && isSearchMatch;
            });

            return (
              <div
                key={box.id}
                className="bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between"
                id={`eservices-box-${box.id}`}
              >
                {/* Box Blue Header Bar */}
                <div className="bg-[#1d4ed8] text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wide font-display">
                    <BoxIcon className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>{box.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/25 text-white font-mono text-[10px] font-black">
                    {boxItems.length}
                  </span>
                </div>

                {/* Items List Inside Box */}
                <div className="p-3 divide-y divide-slate-100 dark:divide-slate-800/60 flex-grow">
                  {boxItems.length > 0 ? (
                    boxItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedServiceItem(item)}
                        className="py-2 px-2 flex items-center justify-between gap-2 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 rounded-lg transition-colors group cursor-pointer"
                        id={`eservice-item-${item.id}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                            {item.name}
                          </span>
                          {item.popular && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] font-black uppercase rounded shrink-0 font-mono">
                              HOT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {item.price.split('+')[0].split('(')[0].trim()}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApply(item);
                            }}
                            className="p-1 hover:bg-blue-600 hover:text-white text-slate-400 rounded transition-colors cursor-pointer"
                            title="Apply via CSC Desk"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      No matching services
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedServiceItem && (
        <div className="fixed inset-0 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-hidden">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`explore-modal-${selectedServiceItem.id}`}
          >
            {/* Top Breadcrumb & Header Banner */}
            <div className="px-5 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 relative bg-gradient-to-r from-slate-900 via-[#1e1b4b] to-slate-900 text-white shrink-0">
              <div className="space-y-2 pr-10">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-300">
                  <span>E-Services Catalogue</span>
                  <span>/</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-900/60 text-blue-200 border border-blue-700/50">
                    {CATEGORY_LABELS[selectedServiceItem.category]}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-300 font-mono bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-700/50">
                    CSC VERIFIED SERVICE
                  </span>
                  {selectedServiceItem.popular && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider rounded animate-pulse font-mono">
                      ⚡ POPULAR SERVICE
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug font-display text-white">
                  {selectedServiceItem.name}
                </h3>
              </div>

              <button
                onClick={() => setSelectedServiceItem(null)}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-full transition-all absolute right-4 top-5 cursor-pointer"
                title="Close Service View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-5 text-xs sm:text-sm scrollbar-thin bg-slate-50/50 dark:bg-slate-950/50">
              
              {/* Service Processing Advisory Strip */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 font-mono">
                    Service Processing Advisory
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Please ensure all supporting identity proofs and application details are uploaded clearly. Authorized CSC processing ensures official validation and error-free submission.
                  </p>
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                  Service Description
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                  {selectedServiceItem.description}
                </p>
              </div>

              {/* Price & Turnaround Time Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Official Fee / Price</span>
                  </div>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                    {selectedServiceItem.price}
                  </span>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">Estimated Time</span>
                  </div>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-xs">
                    {selectedServiceItem.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Required Documents / Information */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span>Required Documents / Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedServiceItem.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedServiceItem(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                id="eservice-modal-close-btn"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>

              <button
                type="button"
                onClick={() => handleApply(selectedServiceItem)}
                className="px-6 py-2.5 bg-[#1e1b4b] hover:bg-[#121033] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/30 cursor-pointer hover:scale-[1.02]"
                id="eservice-modal-apply-btn"
              >
                <span>Apply via CSC Desk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


