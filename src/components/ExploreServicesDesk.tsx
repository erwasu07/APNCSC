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

  const [showAllServices, setShowAllServices] = useState(false);

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

  const displayedServices = showAllServices ? filteredServices : filteredServices.slice(0, 9);

  const handleApply = (service: ServiceItem) => {
    setSelectedServiceItem(null);
    onApplyService(service.name);
  };

  return (
    <section id="services" aria-labelledby="services-board-heading" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 scroll-mt-20">
      <div id="services-board" className="scroll-mt-20" />

      {/* Section Header matching Latest Recruitment & Exam Notices */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div>
          <span className="text-xs font-bold uppercase text-[#0759E8] tracking-wider block mb-1">
            CSC E-Services
          </span>
          <h2 id="services-board-heading" className="text-xl sm:text-2xl font-black text-[#0B1F49] tracking-tight">
            CSC E-Services &amp; Digital Assistance
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Verified government certificates, instant smart cards, J&amp;K revenue records, and citizen e-services.
          </p>
        </div>

        {filteredServices.length > 9 && (
          <button
            type="button"
            onClick={() => setShowAllServices(prev => !prev)}
            className="text-xs font-bold text-[#0759E8] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{showAllServices ? 'Show Featured (9)' : `View All ${filteredServices.length} Services`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Bar matching Latest Recruitment & Exam Notices */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'cards_adda', label: 'Instant Cards' },
          { id: 'jk_state', label: 'JK State e-Services' },
          { id: 'revenue', label: 'JK Revenue' },
          { id: 'csc', label: 'CSC Govt Portals' },
          { id: 'digital', label: 'Cyber & Digital' },
          { id: 'education', label: 'Education Desk' },
          { id: 'business', label: 'Business & Tax' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`services-cat-btn-${tab.id}`}
            type="button"
            onClick={() => {
              setSelectedCategory(tab.id as any);
              setShowAllServices(false);
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === tab.id
                ? 'bg-[#0759E8] text-white border-[#0759E8] font-bold shadow-2xs'
                : 'bg-white text-[#14213D] border-[#E2E8F0] hover:bg-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Cards Grid matching Latest Recruitment & Exam Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedServices.map((item) => (
          <article
            key={item.id}
            id={`eservice-item-${item.id}`}
            className="bg-white border border-[#E2E8F0] hover:border-[#0759E8] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <span className="font-bold text-[#0759E8]">{CATEGORY_LABELS[item.category]}</span>
                {item.estimatedTime && (
                  <span className="text-[#14213D] font-semibold">Time: {item.estimatedTime}</span>
                )}
              </div>

              <h3
                onClick={() => handleOpenService(item)}
                className="text-sm sm:text-base font-bold text-[#14213D] hover:text-[#0759E8] cursor-pointer transition-colors leading-snug line-clamp-2"
              >
                {item.name}
              </h3>

              {item.price && (
                <p className="text-xs text-[#14213D]">
                  Fee / Charges: <span className="font-bold text-[#0759E8]">{item.price}</span>
                </p>
              )}

              <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleOpenService(item)}
                className="text-xs font-bold text-[#0759E8] hover:underline cursor-pointer"
              >
                View Details →
              </button>

              <button
                type="button"
                onClick={() => handleApply(item)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B] hover:text-[#14213D] cursor-pointer transition-colors"
                title="Apply online for this service"
              >
                <span>Apply Online</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Show All / Show Less Toggle */}
      {filteredServices.length > 9 && (
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllServices(prev => !prev)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-[#14213D] border border-[#E2E8F0] hover:border-[#0759E8] hover:text-[#0759E8] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>
              {showAllServices
                ? 'Show Fewer Services'
                : `View All ${filteredServices.length} Services in ${selectedCategory === 'all' ? 'Catalogue' : CATEGORY_LABELS[selectedCategory]}`}
            </span>
            <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllServices ? '-rotate-90' : ''}`} />
          </button>
        </div>
      )}

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

    </section>
  );
}


