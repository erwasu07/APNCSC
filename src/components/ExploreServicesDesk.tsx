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
        
        {/* Desk Header & Intro (Image 1 Layout) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-[11px] font-black uppercase rounded tracking-wider font-mono">
                CSC E-SERVICES DIRECTORY
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                100% Verified Govt Rates
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              Comprehensive E-Services Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-2xl">
              Transparent Pricing, Fast Turnaround Time &amp; Direct Online Application Booking
            </p>
          </div>

          {/* Search Input (Top Right - Image 1) */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services (e.g. PAN, Aadhaar, Domicile)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-600 font-medium shadow-xs"
              id="services-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills (Image 1 Layout) */}
        <div className="flex flex-wrap items-center gap-2.5 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#1e1b4b] dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
            id="service-cat-all"
          >
            All Categories
          </button>

          <button
            onClick={() => setSelectedCategory('csc')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'csc'
                ? 'bg-[#1e1b4b] dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
            id="service-cat-csc"
          >
            CSC Government Services
          </button>

          <button
            onClick={() => setSelectedCategory('digital')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'digital'
                ? 'bg-[#1e1b4b] dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
            id="service-cat-digital"
          >
            Digital &amp; Cyber Services
          </button>

          <button
            onClick={() => setSelectedCategory('education')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'education'
                ? 'bg-[#1e1b4b] dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
            id="service-cat-education"
          >
            Education &amp; Admissions
          </button>

          <button
            onClick={() => setSelectedCategory('business')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              selectedCategory === 'business'
                ? 'bg-[#1e1b4b] dark:bg-white text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
            }`}
            id="service-cat-business"
          >
            Business Registrations
          </button>
        </div>

        {/* 3-Column Cards Grid (Image 1 Layout) */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
            {filteredServices.map(service => {
              const ServiceIcon = getServiceIcon(service.id, service.category);
              const fees = getFeeDetails(service);
              const isSelected = selectedService === service.name;

              return (
                <div
                  key={service.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1 ${
                    isSelected 
                      ? 'ring-2 ring-blue-600 border-blue-600 dark:border-blue-500' 
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                  id={`service-card-${service.id}`}
                >
                  <div className="space-y-3">
                    {/* Top Bar: Icon + Popular Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <ServiceIcon className="w-4 h-4" />
                      </div>
                      {service.popular && (
                        <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-200 dark:border-amber-800 font-mono tracking-wider">
                          POPULAR
                        </span>
                      )}
                    </div>

                    {/* Category Label */}
                    <div className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-mono">
                      {CATEGORY_LABELS[service.category]}
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setSelectedServiceItem(service)}
                      className="text-base font-extrabold text-slate-900 dark:text-white leading-snug font-display cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {service.description}
                    </p>

                    {/* Fee Details Box (Image 1 Layout) */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-slate-850 rounded-xl p-3.5 space-y-2 text-xs font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Government Fee:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{fees.govtFee}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">CSC Service Charge:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white font-mono">{fees.cscFee}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Turnaround Time:</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{fees.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: View & Apply via CSC Desk */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedServiceItem(service)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleApply(service)}
                      className="py-2.5 px-3 bg-[#1e1b4b] hover:bg-[#121033] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply via CSC Desk</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No services found for "{searchQuery}"</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for keywords like "PAN", "Aadhaar", "Voter", or "GST"</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedServiceItem && (
        <div className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`explore-modal-${selectedServiceItem.id}`}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-950/60 flex items-start justify-between">
              <div className="space-y-1.5 pr-8">
                {(() => {
                  const ModalCategoryIcon = getCategoryIcon(selectedServiceItem.category);
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ModalCategoryIcon className="w-3 h-3" />
                      <span>{CATEGORY_LABELS[selectedServiceItem.category]}</span>
                    </span>
                  );
                })()}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {selectedServiceItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedServiceItem(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all absolute right-4 top-4 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs scrollbar-thin">
              
              {/* Important Notifications Section */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase font-mono tracking-wider">
                  <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" />
                  <span>Important Notifications</span>
                </div>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  Please ensure all supporting identity proofs and application details are uploaded clearly. Authorized CSC processing ensures official validation.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Service Description
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedServiceItem.description}
                </p>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Official Service Fee / Govt Price</span>
                </div>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  {selectedServiceItem.price}
                </span>
              </div>

              {/* Requirements documents checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Required Documents / Information
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-2">
                  {selectedServiceItem.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                        {req}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated turnaround time block */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">Estimated Processing Time</span>
                </div>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                  {selectedServiceItem.estimatedTime}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedServiceItem(null)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleApply(selectedServiceItem)}
                className="px-6 py-2.5 bg-[#1e1b4b] hover:bg-[#121033] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
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


