import React, { useState, useEffect } from 'react';
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
  Bell,
  Building2,
  MapPin,
  Share2,
  Copy,
  MessageSquare,
  Send
} from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';

interface ExploreServicesDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
  onOpenDedicatedServicePage?: (service: ServiceItem) => void;
}

export default function ExploreServicesDesk({ onApplyService, selectedService, onOpenDedicatedServicePage }: ExploreServicesDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cards_adda' | 'revenue' | 'jk_state' | 'csc' | 'digital' | 'education' | 'business'>('all');
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);

  // Sharing & Notification States
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeShareData, setActiveShareData] = useState<{ title: string; text: string; url: string; name: string } | null>(null);

  const handleOpenService = (item: ServiceItem) => {
    if (onOpenDedicatedServicePage) {
      onOpenDedicatedServicePage(item);
    } else {
      setSelectedServiceItem(item);
    }
  };

  // Auto-open service if ?service=... is present in URL without external routing
  useEffect(() => {
    if (typeof window !== 'undefined' && !onOpenDedicatedServicePage) {
      const params = new URLSearchParams(window.location.search);
      const serviceId = params.get('service');
      if (serviceId) {
        const match = SERVICES_LIST.find(s => s.id === serviceId);
        if (match) {
          setSelectedServiceItem(match);
        }
      }
    }
  }, [onOpenDedicatedServicePage]);

  const triggerToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  const handleShareService = async (item: ServiceItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.cscdost.com';
    const shareUrl = `${origin}/service/${item.id}`;
    const shareTitle = `📌 ${item.name} - CSC DOST Service`;
    const shareText = `📌 *${item.name}*\n💰 Price: ${item.price}\n⏱️ Time: ${item.estimatedTime}\n\n${item.description}\n\n👉 Apply online via CSC DOST Portal:\n${shareUrl}`;

    const dataPayload = { title: shareTitle, text: shareText, url: shareUrl, name: item.name };
    setActiveShareData(dataPayload);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to share options popup if user cancelled or error
      }
    }
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard!`);
  };

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
      return { govtFee: '₹107', cscFee: '₹70 (CSC Charge)', time: '2-3 Working Days' };
    }
    if (service.id === 'csc-aadhaar') {
      return { govtFee: '₹50', cscFee: '₹70 (CSC Charge)', time: '24 Hours Slot' };
    }
    if (service.id === 'csc-ayushman') {
      return { govtFee: '₹0 (Free)', cscFee: '₹70 (CSC Charge)', time: 'Same Day' };
    }
    if (service.id === 'csc-voter') {
      return { govtFee: '₹0 (Free)', cscFee: '₹70 (CSC Charge)', time: '3-5 Working Days' };
    }
    if (service.id === 'csc-pmkisan') {
      return { govtFee: '₹15', cscFee: '₹70 (CSC Charge)', time: 'Same Day' };
    }

    // Default parser
    const priceParts = service.price.split('+');
    let govtFee = 'Govt Fee As Applicable';
    let cscFee = '₹70 (CSC Charge)';

    if (priceParts.length > 1) {
      govtFee = priceParts[0].trim();
      cscFee = '₹70 (CSC Charge)';
    } else if (service.price.toLowerCase().includes('free')) {
      govtFee = '₹0 (Free)';
      cscFee = '₹70 (CSC Charge)';
    } else {
      govtFee = service.price;
      cscFee = '₹70 (CSC Charge)';
    }

    return {
      govtFee,
      cscFee,
      time: service.estimatedTime || '1-3 Working Days'
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/60 py-6 sm:py-10 transition-colors duration-300 scroll-mt-24 w-full" id="services">
      <div className="w-full max-w-7xl mx-auto px-1.5 sm:px-4 md:px-6">
        
        {/* Section Header */}
        <div id="services-board" className="max-w-7xl mx-auto mb-2 sm:mb-3 scroll-mt-24">
          <div className="flex items-center justify-center border-b border-slate-200 dark:border-slate-800 pb-1.5 sm:pb-2">
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-wider font-display uppercase text-center">
              CSC E-SERVICES
            </h2>
          </div>
        </div>

        {/* MODERN CSC E-SERVICES QUICK ACCESS GRID - 4 IN A ROW ON MOBILE */}
        <div className="max-w-7xl mx-auto mb-3 sm:mb-4">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            {[
              {
                id: 'all',
                label: 'All',
                fullLabel: 'All Services',
                gradient: 'from-blue-600 to-indigo-800',
                border: 'border-blue-500/40',
                icon: Layers,
              },
              {
                id: 'cards_adda',
                label: 'Cards',
                fullLabel: 'Instant Cards',
                gradient: 'from-amber-500 to-orange-600',
                border: 'border-amber-500/40',
                icon: CreditCard,
              },
              {
                id: 'revenue',
                label: 'Revenue',
                fullLabel: 'JK Revenue',
                gradient: 'from-emerald-600 to-teal-700',
                border: 'border-emerald-500/40',
                icon: Landmark,
              },
              {
                id: 'jk_state',
                label: 'JK State',
                fullLabel: 'JK State e-Services',
                gradient: 'from-indigo-600 to-blue-700',
                border: 'border-indigo-500/40',
                icon: ShieldCheck,
              },
              {
                id: 'csc',
                label: 'Govt CSC',
                fullLabel: 'CSC Govt Portals',
                gradient: 'from-purple-600 to-indigo-700',
                border: 'border-purple-500/40',
                icon: Building2,
              },
              {
                id: 'digital',
                label: 'Digital',
                fullLabel: 'Cyber & Digital',
                gradient: 'from-cyan-600 to-blue-700',
                border: 'border-cyan-500/40',
                icon: Laptop,
              },
              {
                id: 'education',
                label: 'Edu Desk',
                fullLabel: 'Education Desk',
                gradient: 'from-teal-600 to-emerald-700',
                border: 'border-teal-500/40',
                icon: GraduationCap,
              },
              {
                id: 'business',
                label: 'Business',
                fullLabel: 'Business & Tax',
                gradient: 'from-rose-600 to-red-700',
                border: 'border-rose-500/40',
                icon: Briefcase,
              },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  id={`services-cat-btn-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`group relative h-10 sm:h-11 px-1.5 sm:px-3 rounded-lg sm:rounded-xl text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm border ${cat.border} bg-gradient-to-r ${cat.gradient} hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none text-center ${
                    isActive
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-md shadow-black/20 font-black brightness-105 scale-[1.02]'
                      : 'opacity-95 hover:opacity-100'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-white/90'}`} />
                  <span className="text-[11px] sm:text-xs md:text-[13px] font-bold tracking-tight leading-tight truncate">
                    <span className="sm:hidden">{cat.label}</span>
                    <span className="hidden sm:inline">{cat.fullLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* COMPACT E-SERVICES BOXES GRID (2 columns on mobile when all is selected, full edge-to-edge when filtered) */}
        {(() => {
          const displayedBoxes = [
            {
              id: 'cards_adda_box',
              categoryKey: 'cards_adda',
              title: 'Instant & Smart Cards',
              subtitle: 'Instant e-PAN, DL, Vehicle RC, Ayushman, Voter & PVC Smart Card Services',
              icon: CreditCard,
              badge: 'INSTANT & SMART CARDS',
              itemIds: [
                'ca-ayushman-pvc',
                'ca-dl-pvc',
                'ca-epan-download',
                'ca-lost-pan-find',
                'ca-vehicle-rc-pvc',
                'ca-aadhaar-pvc',
                'ca-voter-pvc',
                'ca-voter-mobile-link',
                'ca-dsc-class3',
                'ca-nsdl-instant-pan',
                'ca-agri-stack',
                'ca-ration-rice-pvc',
                'ca-gst-registration',
                'ca-tn-birth-cert'
              ]
            },
            {
              id: 'jk_state_box',
              categoryKey: 'jk_state',
              title: 'J&K State e-Services',
              subtitle: 'Official J&K Government Certificates & Welfare Applications',
              icon: Landmark,
              badge: 'J&K STATE PORTAL',
              itemIds: [
                'jk-domicile-cert',
                'jk-rba-cert',
                'jk-obc-cert',
                'jk-st-cert',
                'jk-sc-cert',
                'jk-alc-ib-cert',
                'jk-pahari-cert',
                'jk-ews-cert',
                'jk-birth-cert',
                'jk-death-cert',
                'jk-marriage-cert',
                'jk-character-cert',
                'jk-dependent-cert',
                'jk-unemployment-cert',
                'jk-pension-isss',
                'jk-ladli-beti',
                'jk-mgnrega-jobcard',
                'jk-trade-license',
                'jk-building-licenses',
                'jk-drone-permission',
                'jk-assistive-aids',
                'jk-senior-citizen',
                'jk-horticulture-passbook'
              ]
            },
            {
              id: 'jk_revenue',
              categoryKey: 'revenue',
              title: 'JK Revenue Services',
              subtitle: 'Revenue Department Land Records & Certificates',
              icon: Building2,
              badge: 'OFFICIAL REVENUE PORTAL',
              itemIds: [
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
                'rev-shajra-nasab'
              ]
            },
            {
              id: 'csc_identity',
              categoryKey: 'csc',
              title: 'Govt & Identity Cards',
              icon: Landmark,
              itemIds: ['csc-pan', 'csc-aadhaar', 'csc-voter', 'csc-passport', 'csc-dl']
            },
            {
              id: 'welfare_health',
              categoryKey: 'csc',
              title: 'Welfare & Health Cards',
              icon: ShieldCheck,
              itemIds: ['csc-ayushman', 'csc-pmkisan', 'csc-eshram', 'csc-ration']
            },
            {
              id: 'certificates_state',
              categoryKey: 'csc',
              title: 'State Certificates',
              icon: FileText,
              itemIds: ['csc-certificates']
            },
            {
              id: 'digital_cyber',
              categoryKey: 'digital',
              title: 'Digital & Cyber Desk',
              icon: Laptop,
              itemIds: ['csc-utility', 'dig-print', 'dig-photo', 'dig-form']
            },
            {
              id: 'education_exams',
              categoryKey: 'education',
              title: 'Education & Admissions',
              icon: GraduationCap,
              itemIds: ['edu-admissions', 'edu-scholarship', 'edu-exams']
            },
            {
              id: 'business_tax',
              categoryKey: 'business',
              title: 'Business & Registrations',
              icon: Briefcase,
              itemIds: ['biz-gst', 'biz-udyam', 'biz-dsc']
            }
          ]
          .filter(box => selectedCategory === 'all' || box.categoryKey === selectedCategory);

          const isSingle = displayedBoxes.length === 1;

          return (
            <div className={`grid gap-2 sm:gap-4 md:gap-5 max-w-7xl mx-auto w-full ${isSingle ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {displayedBoxes.map(box => {
                const BoxIcon = box.icon;
                const allBoxItems = SERVICES_LIST.filter(s => {
                  const isBoxMatch = box.itemIds.includes(s.id);
                  const searchLower = searchQuery.toLowerCase();
                  const isSearchMatch = !searchQuery || 
                    s.name.toLowerCase().includes(searchLower) ||
                    s.description.toLowerCase().includes(searchLower) ||
                    s.requirements.some(req => req.toLowerCase().includes(searchLower));
                  return isBoxMatch && isSearchMatch;
                });

                // Show top 7 items in overview mode, all items when filtered to that tab
                const boxItems = isSingle ? allBoxItems : allBoxItems.slice(0, 7);

                return (
                  <div
                    key={box.id}
                    className={`bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border sm:border-2 overflow-hidden shadow-xs sm:shadow-md flex flex-col transition-all duration-300 ${
                      box.id === 'cards_adda_box'
                        ? 'border-purple-600 dark:border-purple-500'
                        : box.id === 'jk_state_box'
                        ? 'border-emerald-600 dark:border-emerald-500'
                        : box.id === 'jk_revenue'
                        ? 'border-amber-500 dark:border-amber-600'
                        : 'border-blue-600 dark:border-blue-700'
                    }`}
                    id={`eservices-box-${box.id}`}
                  >
                    {/* Box Header Bar */}
                    <div className={`${
                      box.id === 'cards_adda_box'
                        ? 'bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-900'
                        : box.id === 'jk_state_box'
                        ? 'bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900'
                        : box.id === 'jk_revenue'
                        ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800'
                        : 'bg-[#1d4ed8]'
                    } text-white px-2.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between font-black uppercase text-xs sm:text-base tracking-wider font-display shrink-0 shadow-xs`}>
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <BoxIcon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-300 shrink-0" />
                        <span className="truncate">{box.title}</span>
                      </div>
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1 bg-black/30 text-white">
                        {allBoxItems.length}
                      </span>
                    </div>

                    {/* Compact Minimized Items List Inside Box */}
                    <div className={`divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto scrollbar-thin ${isSingle ? 'max-h-[540px] sm:max-h-[660px]' : 'max-h-[340px] sm:max-h-[380px]'}`}>
                      {boxItems.length > 0 ? (
                        boxItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleOpenService(item)}
                            className="py-1.5 px-2 sm:py-2 sm:px-3 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between gap-1.5 group"
                            id={`eservice-item-${item.id}`}
                          >
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                              <span className={`${
                                item.category === 'revenue' 
                                  ? 'text-amber-500 dark:text-amber-400' 
                                  : item.category === 'jk_state'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : item.category === 'cards_adda'
                                  ? 'text-purple-600 dark:text-purple-400'
                                  : 'text-blue-600 dark:text-blue-400'
                              } font-extrabold text-xs sm:text-sm shrink-0 leading-none`}>•</span>
                              <p className="text-[11px] sm:text-[12.5px] font-bold text-blue-900 dark:text-blue-300 group-hover:text-indigo-700 dark:group-hover:text-amber-400 group-hover:underline leading-snug transition-colors font-sans line-clamp-2 sm:line-clamp-1">
                                {item.name}
                              </p>
                              {item.popular && (
                                <span className="px-1 py-0.2 bg-amber-500 text-slate-950 font-black text-[8px] sm:text-[9px] rounded shrink-0">
                                  HOT
                                </span>
                              )}
                            </div>
                            {isSingle && (
                              <div className="hidden sm:flex items-center shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApply(item);
                                  }}
                                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs transition-transform group-hover:scale-105 cursor-pointer"
                                >
                                  <span>Apply</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 italic">
                          No matching services
                        </div>
                      )}
                    </div>

                    {/* Footer: View All Services Option */}
                    {!isSingle ? (
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(box.categoryKey)}
                          className="text-[11px] sm:text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center justify-center gap-1.5 w-full py-0.5 hover:underline transition-colors group cursor-pointer"
                          id={`eservice-view-all-${box.id}`}
                        >
                          <span>View all {allBoxItems.length} {box.title}</span>
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono px-3 shrink-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Showing all {allBoxItems.length} services</span>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory('all')}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          id="eservice-back-to-all-boxes"
                        >
                          <span>← Back to All Services</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

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
                    <span className="px-2 py-0.5 bg-amber-600 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded animate-pulse font-mono">
                      ⚡ POPULAR SERVICE
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug font-display text-white">
                  {selectedServiceItem.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 absolute right-4 top-4 sm:top-5">
                <button
                  type="button"
                  onClick={() => handleShareService(selectedServiceItem)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105"
                  title="Share this service"
                  id="eservice-modal-top-share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Service</span>
                </button>
                <button
                  onClick={() => setSelectedServiceItem(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-full transition-all cursor-pointer"
                  title="Close Service View"
                  id="eservice-modal-top-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedServiceItem(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  id="eservice-modal-close-btn"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareService(selectedServiceItem)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02]"
                  id="eservice-modal-share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Service</span>
                </button>
              </div>

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

      {/* SHARE OPTIONS POPUP MODAL */}
      {showShareModal && activeShareData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base font-display">Share Service</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Share <strong className="text-slate-900 dark:text-white">{activeShareData.name}</strong> directly with applicants, friends or on social channels:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeShareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                  <span>Share on WhatsApp</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Telegram Share */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(activeShareData.url)}&text=${encodeURIComponent(activeShareData.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-white" />
                  <span>Share on Telegram</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Copy Direct Link */}
              <button
                type="button"
                onClick={() => copyToClipboard(activeShareData.url, 'Service Direct Link')}
                className="flex items-center justify-between p-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold text-xs transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Copy className="w-5 h-5 text-amber-500" />
                  <span>Copy Direct Post Link</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">URL Only</span>
              </button>

              {/* Copy Full Service Info */}
              <button
                type="button"
                onClick={() => copyToClipboard(activeShareData.text, 'Full Service Details')}
                className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-950 dark:text-indigo-200 rounded-2xl font-bold text-xs transition-all border border-indigo-200 dark:border-indigo-800/80 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Copy Full Post Text & Link</span>
                </div>
                <span className="text-[10px] font-mono text-indigo-500">Text + Link</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              {activeShareData.url}
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK NOTIFICATION */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce font-bold text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

    </div>
  );
}


