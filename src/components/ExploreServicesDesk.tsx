import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  X,
  FileText,
  Clock,
  CheckCircle,
  Search,
  Check,
  Tag,
  FileCheck,
  Share2,
  Copy,
  MessageSquare,
  Send,
} from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';
import { ColourAccentCard } from './shared/ContentDesignSystem';

interface ExploreServicesDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
  onOpenDedicatedServicePage?: (service: ServiceItem) => void;
}

type DirectoryCategory =
  | 'all'
  | 'identity'
  | 'jk_revenue'
  | 'jobs_assistance'
  | 'education'
  | 'welfare'
  | 'business'
  | 'digital';

function matchesDirectoryCategory(service: ServiceItem, cat: DirectoryCategory): boolean {
  if (cat === 'all') return true;
  if (cat === 'identity') {
    return (
      service.category === 'cards_adda' ||
      ['csc-pan', 'csc-aadhaar', 'csc-voter', 'csc-passport', 'csc-dl', 'csc-ration'].includes(
        service.id
      )
    );
  }
  if (cat === 'jk_revenue') {
    return (
      service.category === 'revenue' ||
      service.category === 'jk_state' ||
      service.id === 'csc-certificates'
    );
  }
  if (cat === 'jobs_assistance') {
    return ['edu-exams', 'dig-form', 'dig-photo'].includes(service.id);
  }
  if (cat === 'education') {
    return service.category === 'education';
  }
  if (cat === 'welfare') {
    return (
      ['csc-ayushman', 'csc-pmkisan', 'csc-eshram'].includes(service.id) ||
      service.name.toLowerCase().includes('pension') ||
      service.name.toLowerCase().includes('welfare') ||
      service.name.toLowerCase().includes('marriage')
    );
  }
  if (cat === 'business') {
    return service.category === 'business';
  }
  if (cat === 'digital') {
    return service.category === 'digital' || service.id === 'csc-utility';
  }
  return true;
}

const DIRECTORY_TABS: { id: DirectoryCategory; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'identity', label: 'Identity & Documents' },
  { id: 'jk_revenue', label: 'J&K Certificates & Revenue' },
  { id: 'jobs_assistance', label: 'Jobs & Application Assistance' },
  { id: 'education', label: 'Education & Scholarships' },
  { id: 'welfare', label: 'Welfare & Health' },
  { id: 'business', label: 'Business & Tax' },
  { id: 'digital', label: 'Digital & Printing Services' },
];

export default function ExploreServicesDesk({
  onApplyService,
  onOpenDedicatedServicePage,
}: ExploreServicesDeskProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory>('all');
  const [selectedServiceItem, setSelectedServiceItem] = useState<ServiceItem | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);

  // Sharing & Notification States
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeShareData, setActiveShareData] = useState<{
    title: string;
    text: string;
    url: string;
    name: string;
  } | null>(null);

  const handleOpenService = (item: ServiceItem) => {
    if (onOpenDedicatedServicePage) {
      onOpenDedicatedServicePage(item);
    } else {
      setSelectedServiceItem(item);
    }
  };

  // Listen for category selection from homepage preview cards
  useEffect(() => {
    const handleSelectCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: DirectoryCategory }>;
      if (customEvent.detail?.category) {
        setSelectedCategory(customEvent.detail.category);
        setShowAllServices(true);
      }
    };
    window.addEventListener('select-service-directory-category', handleSelectCategory);
    return () => {
      window.removeEventListener('select-service-directory-category', handleSelectCategory);
    };
  }, []);

  // Auto-open service if ?service=... is present in URL without external routing
  useEffect(() => {
    if (typeof window !== 'undefined' && !onOpenDedicatedServicePage) {
      const params = new URLSearchParams(window.location.search);
      const serviceId = params.get('service');
      if (serviceId) {
        const match = SERVICES_LIST.find((s) => s.id === serviceId);
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
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.cscdost.com';
    const shareUrl = `${origin}/service/${item.id}`;
    const shareTitle = `${item.name} - CSC DOST Service`;
    const shareText = `${item.name}\nFee: ${item.price}\nEstimated Time: ${item.estimatedTime}\n\n${item.description}\n\nApply or view details on CSC DOST:\n${shareUrl}`;

    const dataPayload = { title: shareTitle, text: shareText, url: shareUrl, name: item.name };
    setActiveShareData(dataPayload);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to share options modal
      }
    }
    setShowShareModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${label} to clipboard`);
  };

  // Filter list based on active category tab and search query
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SERVICES_LIST.filter((service) => {
      const matchesCat = matchesDirectoryCategory(service, selectedCategory);
      const matchesSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.requirements.some((r) => r.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const displayedServices =
    showAllServices || searchQuery.trim().length > 0
      ? filteredServices
      : filteredServices.slice(0, 9);

  const handleApply = (service: ServiceItem) => {
    setSelectedServiceItem(null);
    onApplyService(service.name);
  };

  return (
    <section
      id="services"
      aria-labelledby="services-board-heading"
      className="w-full max-w-7xl mx-auto bg-[#F6F8FC] px-3 sm:px-6 py-5 md:py-2 space-y-3.5 md:space-y-4 scroll-mt-20"
    >
      {/* Section Header + Search Input */}
      <div
        id="services-board"
        className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3 scroll-mt-20 px-1 sm:px-0"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1">
            <FileCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Complete Service Directory</span>
          </div>
          <h2
            id="services-board-heading"
            className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
          >
            CSC E-SERVICES
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
            Search and browse all {SERVICES_LIST.length} citizen services, required documents, and fee details.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <label htmlFor="service-directory-search" className="sr-only">
            Search services in directory
          </label>
          <Search
            className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="service-directory-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter services by name or document…"
            className="w-full min-h-[44px] pl-9 pr-8 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl text-xs sm:text-sm text-[#102A43] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear service filter"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#102A43] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Service categories"
        className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-2 sm:overflow-x-auto text-xs font-medium px-1 sm:px-0"
      >
        {DIRECTORY_TABS.map((tab) => (
          <button
            key={tab.id}
            id={`services-cat-btn-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selectedCategory === tab.id}
            onClick={() => {
              setSelectedCategory(tab.id);
              setShowAllServices(false);
            }}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === tab.id
                ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Colour-Accent Cards Grid */}
      {displayedServices.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl py-6 px-4 text-center space-y-2">
          <p className="text-sm font-bold text-[#102A43]">No matching services found</p>
          <p className="text-xs text-[#64748B]">
            Try clearing your search filter or switching to &ldquo;All Services&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="min-h-[40px] mt-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {displayedServices.map((item) => (
            <ColourAccentCard
              key={item.id}
              id={`eservice-item-${item.id}`}
              categoryType="service"
              categoryLabel="CSC E-Service"
              organisation={CATEGORY_LABELS[item.category]}
              title={item.name}
              summary={item.description}
              metadataLine={
                item.requirements && item.requirements.length > 0 ? (
                  <span>
                    <strong className="font-semibold text-[#102A43]">Key Requirements:</strong>{' '}
                    {item.requirements.slice(0, 2).join(', ')}
                    {item.requirements.length > 2 ? ` (+${item.requirements.length - 2} more)` : ''}
                  </span>
                ) : undefined
              }
              footerMeta={
                item.price ? (
                  <span>
                    Fee: <strong className="font-semibold text-[#102A43]">{item.price}</strong>
                    {item.estimatedTime ? ` · Est: ${item.estimatedTime}` : ''}
                  </span>
                ) : item.estimatedTime ? (
                  <span>Est: {item.estimatedTime}</span>
                ) : undefined
              }
              secondaryActionLabel="Request Assistance"
              onSecondaryClick={() => handleApply(item)}
              actionLabel="View Service →"
              onPrimaryClick={() => handleOpenService(item)}
            />
          ))}
        </div>
      )}

      {/* Show All / Show Fewer Toggle */}
      {filteredServices.length > 9 && !searchQuery.trim() && (
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllServices((prev) => !prev)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white text-[#102A43] border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <span>
              {showAllServices
                ? 'Show Featured Services (9)'
                : `View All ${filteredServices.length} Services in This Category`}
            </span>
            <ArrowRight
              className={`w-4 h-4 transition-transform ${showAllServices ? '-rotate-90' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* SERVICE DETAILS MODAL (Full-width mobile sheet on <= 767px) */}
      {selectedServiceItem && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div
            className="bg-white rounded-none md:rounded-2xl w-full max-w-2xl h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-hidden flex flex-col shadow-xl border-0 md:border border-[#E2E8F0]"
            id={`explore-modal-${selectedServiceItem.id}`}
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E2E8F0] bg-[#102A43] text-white flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-semibold text-blue-200">
                  {CATEGORY_LABELS[selectedServiceItem.category]}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {selectedServiceItem.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShareService(selectedServiceItem)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  id="eservice-modal-top-share-btn"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedServiceItem(null)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Close service details"
                  id="eservice-modal-top-close-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-0 md:p-6 overflow-y-auto flex-1 divide-y divide-[#E2E8F0] md:divide-y-0 md:space-y-5 text-sm bg-white md:bg-[#F6F8FC]">
              <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-xl px-4 py-4 md:p-4 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Service Overview
                </h4>
                <p className="text-[#102A43] text-sm leading-relaxed">
                  {selectedServiceItem.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x md:divide-x-0 divide-[#E2E8F0] md:gap-3">
                <div className="px-4 py-3.5 md:p-4 bg-white md:border md:border-[#E2E8F0] md:rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                    <Tag className="w-4 h-4 text-[#2563EB]" />
                    <span>Fee Details</span>
                  </div>
                  <span className="font-bold text-[#102A43] text-xs">
                    {selectedServiceItem.price}
                  </span>
                </div>

                <div className="px-4 py-3.5 md:p-4 bg-white md:border md:border-[#E2E8F0] md:rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    <span>Estimated Time</span>
                  </div>
                  <span className="font-bold text-[#102A43] text-xs">
                    {selectedServiceItem.estimatedTime}
                  </span>
                </div>
              </div>

              <div className="bg-white md:border md:border-[#E2E8F0] md:rounded-xl px-4 py-4 md:p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Required Documents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedServiceItem.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 bg-[#F6F8FC] rounded-lg border border-[#E2E8F0]"
                    >
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      <span className="font-medium text-[#102A43]">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:px-6 border-t border-[#E2E8F0] flex items-center justify-between gap-3 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setSelectedServiceItem(null)}
                className="px-4 py-2 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] text-xs font-semibold rounded-xl border border-[#E2E8F0] cursor-pointer"
                id="eservice-modal-close-btn"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleApply(selectedServiceItem)}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer"
                id="eservice-modal-apply-btn"
              >
                <span>Request Service Assistance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE OPTIONS POPUP MODAL */}
      {showShareModal && activeShareData && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-[#102A43]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#2563EB]" />
                <h3 className="font-bold text-base">Share Service</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-[#F6F8FC] rounded-lg text-[#64748B] hover:text-[#102A43] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              Share <strong className="text-[#102A43]">{activeShareData.name}</strong> with family or applicants:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(activeShareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(activeShareData.url)}&text=${encodeURIComponent(activeShareData.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Share on Telegram</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => copyToClipboard(activeShareData.url, 'service link')}
                className="flex items-center justify-between p-3 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] rounded-xl font-semibold text-xs border border-[#E2E8F0] cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Copy className="w-4 h-4 text-[#2563EB]" />
                  <span>Copy Service Link</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {shareToast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-[#102A43] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-semibold text-xs">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}
    </section>
  );
}
