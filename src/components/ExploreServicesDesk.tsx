import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  X, 
  FileText, 
  Clock, 
  CheckCircle,
  Cpu,
  Bookmark,
  Shield,
  Smartphone,
  CreditCard,
  Briefcase,
  Layers,
  Search,
  Check,
  Download,
  FileSpreadsheet,
  Tag,
  Landmark,
  Laptop,
  GraduationCap
} from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';

interface ExploreServicesDeskProps {
  onApplyService: (serviceName: string) => void;
}

export default function ExploreServicesDesk({ onApplyService }: ExploreServicesDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'csc' | 'digital' | 'education' | 'business'>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter list based on both active tab and search query
  const filteredServices = SERVICES_LIST.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Export to Excel / CSV function
  const handleExportToExcel = () => {
    const headers = ['Category', 'Service Name', 'Price / Fee', 'Estimated Time', 'Required Documents', 'Description'];
    const rows = SERVICES_LIST.map(service => [
      `"${CATEGORY_LABELS[service.category]}"`,
      `"${service.name.replace(/"/g, '""')}"`,
      `"${service.price.replace(/"/g, '""')}"`,
      `"${service.estimatedTime}"`,
      `"${service.requirements.join('; ').replace(/"/g, '""')}"`,
      `"${service.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'E_Services_Directory_With_Prices.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group services by category for clean, box-based rendering
  const getServicesByCategory = (category: 'csc' | 'digital' | 'education' | 'business') => {
    return filteredServices.filter(s => s.category === category);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'csc':
        return {
          bg: 'from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10',
          border: 'border-blue-100 dark:border-blue-900/40',
          badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
          text: 'text-blue-600 dark:text-blue-400',
          gradient: 'from-blue-600 to-indigo-600 font-display'
        };
      case 'digital':
        return {
          bg: 'from-purple-50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/10',
          border: 'border-purple-100 dark:border-purple-900/40',
          badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
          text: 'text-purple-600 dark:text-purple-400',
          gradient: 'from-purple-600 to-pink-600 font-display'
        };
      case 'education':
        return {
          bg: 'from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10',
          border: 'border-emerald-100 dark:border-emerald-900/40',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
          text: 'text-emerald-600 dark:text-emerald-400',
          gradient: 'from-emerald-600 to-teal-600 font-display'
        };
      case 'business':
        return {
          bg: 'from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10',
          border: 'border-amber-100 dark:border-amber-900/40',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
          text: 'text-amber-600 dark:text-amber-400',
          gradient: 'from-amber-600 to-orange-600 font-display'
        };
      default:
        return {
          bg: 'from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-850',
          border: 'border-slate-200 dark:border-slate-800',
          badge: 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-300',
          text: 'text-slate-600 dark:text-slate-400',
          gradient: 'from-slate-700 to-slate-900 font-display'
        };
    }
  };

  const handleApply = (service: ServiceItem) => {
    setSelectedService(null);
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

  const categoriesKeys: ('csc' | 'digital' | 'education' | 'business')[] = ['csc', 'digital', 'education', 'business'];

  return (
    <div className="bg-white dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/60 py-10 transition-colors duration-300 scroll-mt-24" id="services">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Desk Header & Intro */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">
                E-Services Portal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display uppercase">
              Comprehensive Digital Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-medium">
              We provide offline &amp; online expert support for all essential Indian citizen services, business registrations, and quick digital filing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Download Excel Sheet Button */}
            <button
              onClick={handleExportToExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              title="Download Excel List with Prices"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel List (.CSV)</span>
            </button>

            {/* Quick Search inside Services Directory */}
            <div className="relative w-full sm:w-64 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-xl blur-sm opacity-20 group-hover:opacity-60 group-focus-within:opacity-80 transition-all duration-300 -z-10"></div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300 z-10" />
                <input
                  type="text"
                  placeholder="Search all services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-12 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none hover:border-transparent dark:hover:border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 transition-all duration-300 shadow-md"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors z-10"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Tab Selectors */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Categories</span>
            <span className="text-[10px] opacity-60">({SERVICES_LIST.length})</span>
          </button>
          {categoriesKeys.map(key => {
            const count = SERVICES_LIST.filter(s => s.category === key).length;
            const theme = getCategoryTheme(key);
            const CategoryIcon = getCategoryIcon(key);
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  selectedCategory === key
                    ? `bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm`
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <CategoryIcon className={`w-4 h-4 ${selectedCategory === key ? '' : theme.text}`} />
                <span>{CATEGORY_LABELS[key]}</span>
                <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* 4 Box Portals Grid - Modernized layouts representing sarkariresult.com with interactive list boxes */}
        <div className="flex flex-row overflow-x-auto snap-x snap-mandatory gap-4 pb-6 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-8 lg:overflow-x-visible w-full scrollbar-thin">
          {categoriesKeys.map(cat => {
            const list = getServicesByCategory(cat);
            const isVisible = selectedCategory === 'all' || selectedCategory === cat;
            const theme = getCategoryTheme(cat);
            const CategoryIcon = getCategoryIcon(cat);

            if (!isVisible) return null;

            return (
              <div 
                key={cat}
                className="w-[85vw] sm:w-[320px] lg:w-auto flex-shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-sm md:shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                id={`explore-box-${cat}`}
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${theme.gradient} text-white px-3 py-2.5 sm:px-4 sm:py-3.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl text-white shadow-inner flex-shrink-0">
                      <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="font-extrabold tracking-tight text-[11px] sm:text-xs md:text-sm uppercase font-display truncate">
                      {CATEGORY_LABELS[cat]}
                    </h3>
                  </div>
                  <span className="hidden sm:inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-mono flex-shrink-0 ml-2">
                    {list.length} Items
                  </span>
                </div>

                {/* Services List Inside the Box */}
                <div className="p-1 sm:p-3.5 divide-y divide-slate-150/40 dark:divide-slate-800/40 flex-grow max-h-[380px] sm:max-h-[460px] overflow-y-auto scrollbar-thin">
                  {list.length > 0 ? (
                    list.map(service => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        onMouseEnter={() => setHoveredId(service.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`p-1.5 sm:p-3.5 rounded-lg sm:rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-1 sm:gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/60 ${
                          hoveredId === service.id ? 'translate-x-1 bg-slate-50/50 dark:bg-slate-850/40' : ''
                        }`}
                        id={`explore-item-${service.id}`}
                      >
                        <div className="space-y-1 min-w-0 flex-grow">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] sm:text-xs md:text-sm font-extrabold text-slate-850 dark:text-slate-100 leading-tight block truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                              {service.name}
                            </span>
                            {service.popular && (
                              <span className="px-1 py-0.2 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 text-[7.5px] sm:text-[8px] font-black uppercase rounded tracking-wider flex-shrink-0">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <span className="text-[8.5px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">
                            {service.description}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/10">
                              <Tag className="w-2.5 h-2.5" />
                              {service.price}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400 font-medium">
                      No matching services found
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* SERVICE DETAILS MODAL */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`explore-modal-${selectedService.id}`}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-950/60 flex items-start justify-between">
              <div className="space-y-1.5 pr-8">
                {(() => {
                  const ModalCategoryIcon = getCategoryIcon(selectedService.category);
                  return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <ModalCategoryIcon className="w-3 h-3" />
                      <span>{CATEGORY_LABELS[selectedService.category]}</span>
                    </span>
                  );
                })()}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {selectedService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all absolute right-4 top-4"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs scrollbar-thin">
              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Service Description
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedService.description}
                </p>
              </div>

              {/* Price Block */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">Official Service Fee / Govt Price</span>
                </div>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  {selectedService.price}
                </span>
              </div>

              {/* Requirements documents checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Required Documents / Information
                </h4>
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-2">
                  {selectedService.requirements.map((req, idx) => (
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
                  {selectedService.estimatedTime}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Close Window
              </button>
              <button
                onClick={() => handleApply(selectedService)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-blue-100 dark:shadow-none"
              >
                Apply Online
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

