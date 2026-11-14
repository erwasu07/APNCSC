import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldAlert,
  Tag,
  X,
} from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';
import { useLanguage } from '../contexts/LanguageContext';
import {
  AdSlot,
  AlertsBox,
  Breadcrumbs,
  Card,
  Chip,
  FilterChip,
  HelpApplyingCard,
} from './ui';

interface ExploreServicesDeskProps {
  onApplyService: (serviceName: string) => void;
  selectedService?: string;
  onOpenDedicatedServicePage?: (service: ServiceItem) => void;
  onNavigateRoute?: (path: string) => void;
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
  { id: 'identity', label: 'Identity & Cards' },
  { id: 'jk_revenue', label: 'J&K Certificates & Revenue' },
  { id: 'jobs_assistance', label: 'Jobs & Form Assistance' },
  { id: 'education', label: 'Education & Scholarships' },
  { id: 'welfare', label: 'Welfare & Health' },
  { id: 'business', label: 'Business & Tax' },
  { id: 'digital', label: 'Digital & Printing' },
];

export default function ExploreServicesDesk({
  onApplyService,
  onOpenDedicatedServicePage,
  onNavigateRoute,
}: ExploreServicesDeskProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DirectoryCategory>('all');
  const [showAllServices, setShowAllServices] = useState(false);

  const handleOpenService = (item: ServiceItem) => {
    if (onOpenDedicatedServicePage) {
      onOpenDedicatedServicePage(item);
    } else if (onNavigateRoute) {
      onNavigateRoute(`/service/${item.id}`);
    } else {
      try {
        window.history.pushState(null, '', `/service/${item.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
    }
  };

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

  const searchMatchingServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SERVICES_LIST;
    return SERVICES_LIST.filter(
      (service) =>
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[service.category] || '').toLowerCase().includes(q) ||
        service.requirements.some((r) => r.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredServices = useMemo(() => {
    return searchMatchingServices.filter((service) =>
      matchesDirectoryCategory(service, selectedCategory)
    );
  }, [searchMatchingServices, selectedCategory]);

  const displayedServices =
    showAllServices || searchQuery.trim().length > 0 || selectedCategory !== 'all'
      ? filteredServices
      : filteredServices.slice(0, 12);

  const navigateRoute = (href: string) => {
    if (onNavigateRoute) {
      onNavigateRoute(href);
    } else {
      try {
        window.history.pushState(null, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {}
    }
  };

  return (
    <section
      id="services"
      aria-labelledby="services-board-heading"
      className="w-full bg-[var(--bg-page)] text-[var(--text-primary)] pb-12 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-5">
        <Breadcrumbs
          items={[
            { label: t.navHome, href: '/' },
            { label: t.navServices },
          ]}
          onNavigate={navigateRoute}
        />

        {/* Header */}
        <header className="space-y-2 text-start">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1F9D6B]">
              <FileCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{SERVICES_LIST.length} Citizen E-Services</span>
            </span>
            <Chip>{t.independentChip}</Chip>
          </div>
          <h1
            id="services-board-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight m-0"
          >
            {t.servicesHubTitle}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed m-0">
            {t.servicesHubSubtitle}
          </p>
        </header>

        {/* Required Fee Confirmation Note */}
        <div
          role="note"
          className="rounded-2xl border border-[var(--status-closing-border)] bg-[var(--status-closing-bg)] p-3.5 sm:p-4 flex items-start gap-3 text-start"
        >
          <ShieldAlert
            className="w-5 h-5 text-[var(--status-closing-text)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed m-0">
            {t.servicesFeeNote}
          </p>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="relative w-full">
            <label htmlFor="service-directory-search" className="sr-only">
              {t.servicesSearchPlaceholder}
            </label>
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="service-directory-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.servicesSearchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-10 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] focus:border-[#1F9D6B] rounded-xl text-base sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={t.clearSearch}
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] absolute end-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter CSC e-services by category"
            className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
          >
            {DIRECTORY_TABS.map((tab) => {
              const count = searchMatchingServices.filter((s) =>
                matchesDirectoryCategory(s, tab.id)
              ).length;
              return (
                <FilterChip
                  key={tab.id}
                  label={tab.id === 'all' ? t.filterAll : tab.label}
                  active={selectedCategory === tab.id}
                  count={count}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setShowAllServices(false);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Service Cards Grid */}
        {displayedServices.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-base font-bold text-[var(--text-primary)] m-0">
              No matching services found
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#101A36] text-white font-bold text-sm inline-flex items-center justify-center cursor-pointer hover:bg-[#1B2A52]"
            >
              {t.resetFilters}
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedServices.map((item) => {
              const hasPrice = Boolean(item.price && item.price.trim().length > 0);
              const feeText = hasPrice ? item.price.trim() : t.servicesAskUs;
              const hasTime = Boolean(item.estimatedTime && item.estimatedTime.trim().length > 0);
              const docsList = Array.isArray(item.requirements)
                ? item.requirements.filter((r) => Boolean(r && r.trim()))
                : [];
              const whatsappEnquiryUrl = `https://wa.me/917006833767?text=${encodeURIComponent(
                `Hello Wasim Ahmad Khanday (CSC DOST), I would like to enquire about: ${item.name} (https://www.cscdost.com/service/${item.id})`
              )}`;

              return (
                <Card
                  key={item.id}
                  interactive
                  className="p-4 sm:p-5 flex flex-col justify-between gap-4 text-start"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Chip variant="default">
                        {CATEGORY_LABELS[item.category] || 'CSC E-Service'}
                      </Chip>
                      {hasTime && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{item.estimatedTime.trim()}</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={`/service/${item.id}`}
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                          e.preventDefault();
                          handleOpenService(item);
                        }
                      }}
                      className="block group no-underline space-y-1.5"
                    >
                      <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] group-hover:text-[#1F9D6B] transition-colors leading-snug m-0">
                        {item.name}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 m-0">
                        {item.description}
                      </p>
                    </a>

                    {/* Documents Needed (Strictly from existing data) */}
                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-default)]">
                      <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                        {t.servicesDocsNeeded}
                      </div>
                      {docsList.length > 0 ? (
                        <ul className="space-y-1 list-none m-0 p-0">
                          {docsList.slice(0, 3).map((doc, idx) => (
                            <li
                              key={`${item.id}-doc-${idx}`}
                              className="flex items-start gap-1.5 text-xs sm:text-sm text-[var(--text-primary)]"
                            >
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-[#1F9D6B] shrink-0 mt-0.5"
                                aria-hidden="true"
                              />
                              <span className="line-clamp-1">{doc}</span>
                            </li>
                          ))}
                          {docsList.length > 3 && (
                            <li className="text-xs font-semibold text-[var(--text-muted)] ps-5">
                              +{docsList.length - 3} more
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-xs font-semibold text-[var(--text-secondary)] m-0">
                          {t.servicesAskUs}
                        </p>
                      )}
                    </div>

                    {/* Fee & Typical Time Summary Row */}
                    <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-[#1F9D6B] shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <span className="font-semibold text-[var(--text-muted)] me-1">
                            {t.servicesFeeLabel}:
                          </span>
                          {Array.isArray(item.feeLines) && item.feeLines.length > 0 ? (
                            <div className="space-y-0.5 mt-0.5">
                              {item.feeLines.map((line, lineIdx) => (
                                <div
                                  key={`${item.id}-fee-${lineIdx}`}
                                  className="font-bold text-[var(--text-primary)] leading-snug break-words"
                                >
                                  {line}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="font-bold text-[var(--text-primary)] break-words">
                              {feeText}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasTime && (
                        <div className="text-xs font-semibold text-[var(--text-secondary)] pt-1 border-t border-[var(--border-default)]">
                          {t.servicesTypicalTime}: <strong className="text-[var(--text-primary)]">{item.estimatedTime.trim()}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Direct WhatsApp + Call + Details/Apply Actions */}
                  <div className="space-y-2.5 pt-2 border-t border-[var(--border-default)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={whatsappEnquiryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#1F9D6B] hover:bg-[#178257] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 no-underline transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>{t.servicesEnquireWhatsapp}</span>
                      </a>

                      <a
                        href="tel:+917006833767"
                        aria-label={`Call +91 70068 33767 about ${item.name}`}
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-[#101A36] hover:bg-[#1B2A52] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 no-underline transition-colors border border-white/10"
                      >
                        <PhoneCall className="w-4 h-4 text-[#F5A623] shrink-0" aria-hidden="true" />
                        <span dir="ltr" className="tabular-nums">
                          {t.servicesCallBtn} · +91 70068 33767
                        </span>
                      </a>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <a
                        href={`/service/${item.id}`}
                        onClick={(e) => {
                          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
                            e.preventDefault();
                            handleOpenService(item);
                          }
                        }}
                        className="min-h-[38px] inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1F9D6B] hover:underline no-underline"
                      >
                        <span>{t.servicesViewDetails}</span>
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onApplyService(item.name)}
                        className="min-h-[38px] px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors"
                      >
                        {t.servicesApplyOnline}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Show All Toggle */}
        {filteredServices.length > 12 && !searchQuery.trim() && selectedCategory === 'all' && (
          <div className="pt-1 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllServices((prev) => !prev)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <span>
                {showAllServices
                  ? 'Show Featured Services (12)'
                  : `View All ${filteredServices.length} Services`}
              </span>
              <ArrowRight
                className={`w-4 h-4 transition-transform ${showAllServices ? '-rotate-90' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        <AdSlot />
        <HelpApplyingCard contextTitle={t.servicesHubTitle} />
        <AlertsBox />
      </div>
    </section>
  );
}
