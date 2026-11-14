import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guidesData';
import { useLanguage } from '../contexts/LanguageContext';
import { HelpApplyingCard } from './ui/HelpApplyingCard';
import {
  ContentBreadcrumbs,
  ContentArticleHeader,
  KeyInfoStrip,
  PrimaryActionBar,
  MobileSectionNav,
  ContentSection,
  ContentChecklist,
  StepByStepList,
  OfficialSourcesAndAssistance,
  ColourAccentCard,
  KeyInfoFact,
  SectionNavItem,
} from './shared/ContentDesignSystem';

export type { GuideArticle };
export { GUIDE_ARTICLES };

interface GuidesKnowledgeHubProps {
  onSelectService?: (serviceName: string) => void;
  initialArticleId?: string | null;
  onClearInitialArticle?: () => void;
  onOpenArticle?: (articleId: string) => void;
}

export default function GuidesKnowledgeHub({
  onSelectService,
  initialArticleId,
  onClearInitialArticle,
  onOpenArticle,
}: GuidesKnowledgeHubProps) {
  const { language } = useLanguage();
  const [selectedArticle, setSelectedArticle] = useState<GuideArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSectionId, setActiveSectionId] = useState<string>('guide-overview');

  // Support selecting an article externally via prop or custom window event
  useEffect(() => {
    if (initialArticleId) {
      const found = GUIDE_ARTICLES.find((a) => a.id === initialArticleId);
      if (found) {
        setSelectedArticle(found);
        setActiveSectionId('guide-overview');
      }
    } else {
      setSelectedArticle(null);
    }
  }, [initialArticleId]);

  useEffect(() => {
    const handleOpenGuideEvent = (e: Event) => {
      const custom = e as CustomEvent<{ guideId?: string; category?: string }>;
      if (custom.detail?.guideId) {
        const found = GUIDE_ARTICLES.find((a) => a.id === custom.detail.guideId);
        if (found) {
          setSelectedArticle(found);
          setActiveSectionId('guide-overview');
        }
      } else if (custom.detail?.category) {
        setSelectedArticle(null);
        setSelectedCategory(custom.detail.category);
      }
    };
    window.addEventListener('open-guide-article', handleOpenGuideEvent);
    return () => {
      window.removeEventListener('open-guide-article', handleOpenGuideEvent);
    };
  }, []);

  const categories = ['All', 'Central Scheme', 'Recruitment', 'Identity & Tax', 'State Services'];

  const filteredArticles = useMemo(() => {
    return GUIDE_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All' || article.category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.hindiTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const isSchemeArticle = selectedArticle?.category === 'Central Scheme';

  // Build Key Info Strip for Scheme vs Guide (no invented deadlines, no vacancy/fee fields on guides)
  const articleKeyFacts: KeyInfoFact[] = useMemo(() => {
    if (!selectedArticle) return [];
    if (isSchemeArticle) {
      return [
        {
          label: 'Responsible Department',
          value: selectedArticle.responsibleDepartment || 'Government of India',
          tone: 'default',
        },
        {
          label: 'Intended Beneficiaries',
          value: selectedArticle.intendedBeneficiaries || 'Eligible Citizens',
          tone: 'default',
        },
        {
          label: 'Benefit Summary',
          value: selectedArticle.benefitSummary,
          tone: 'emerald',
        },
        {
          label: 'Applicable Region',
          value: selectedArticle.applicableRegion || 'All India & J&K',
          tone: 'blue',
        },
      ];
    }

    // Knowledge Hub & Guides: Topic/Category, Reading Time, Official Portal, Last Updated
    return [
      {
        label: 'Topic / Category',
        value: selectedArticle.category,
        tone: 'blue',
      },
      {
        label: 'Official Authority Portal',
        value: selectedArticle.officialPortal,
        tone: 'default',
      },
      {
        label: 'Reading Time',
        value: selectedArticle.readTime,
        tone: 'default',
      },
      {
        label: 'Last Updated',
        value: selectedArticle.lastUpdated,
        tone: 'default',
      },
    ];
  }, [selectedArticle, isSchemeArticle]);

  const articleNavSections: SectionNavItem[] = useMemo(() => {
    if (!selectedArticle) return [];
    if (isSchemeArticle) {
      return [
        { id: 'guide-overview', title: 'Scheme Overview & Benefits' },
        { id: 'guide-eligibility', title: 'Eligibility Criteria' },
        { id: 'guide-documents', title: 'Required Documents' },
        { id: 'guide-steps', title: 'Application & Status-Check Process' },
        { id: 'guide-sources', title: 'Official Sources' },
        { id: 'guide-faqs', title: 'Relevant FAQs' },
      ];
    }
    return [
      { id: 'guide-overview', title: 'What This Guide Covers' },
      { id: 'guide-eligibility', title: 'Eligibility & Checklist' },
      { id: 'guide-documents', title: 'Required Documents' },
      { id: 'guide-steps', title: 'Step-by-Step Instructions' },
      { id: 'guide-sources', title: 'Official References' },
      { id: 'guide-faqs', title: 'FAQs' },
    ];
  }, [selectedArticle, isSchemeArticle]);

  const scrollToArticleSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    if (onClearInitialArticle) onClearInitialArticle();
  };

  const relatedGuides = useMemo(() => {
    if (!selectedArticle) return [];
    return GUIDE_ARTICLES.filter((g) => g.id !== selectedArticle.id).slice(0, 3);
  }, [selectedArticle]);

  return (
    <section
      id="knowledge-hub"
      className={
        selectedArticle
          ? 'w-full py-4 sm:py-8 bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-2xs overflow-hidden font-sans'
          : 'w-full max-w-7xl mx-auto py-5 md:py-2 bg-[#F6F8FC] font-sans'
      }
    >
      <div className={selectedArticle ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'px-3 sm:px-6'}>
        {selectedArticle ? (
          /* ================================================================ */
          /* SHARED DETAIL VIEW FOR GOVERNMENT SCHEMES & CITIZEN GUIDES      */
          /* ================================================================ */
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Top Bar: Breadcrumb + Back & Print Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseArticle}
                  className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Back to All Guides &amp; Schemes</span>
                </button>
                <ContentBreadcrumbs
                  items={[
                    { label: 'Home', onClick: handleCloseArticle },
                    {
                      label: isSchemeArticle ? 'Government Schemes' : 'Knowledge Hub',
                      onClick: handleCloseArticle,
                    },
                    { label: selectedArticle.category },
                  ]}
                />
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-[#F6F8FC] text-[#102A43] border border-[#E2E8F0] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Print Guide</span>
              </button>
            </div>

            {/* A–E: Category Label, Single H1, Subtitle, Short Intro, Metadata */}
            <ContentArticleHeader
              categoryLabel={
                isSchemeArticle ? 'Government Welfare Scheme' : `Citizen Guide · ${selectedArticle.category}`
              }
              secondaryBadge={selectedArticle.readTime}
              title={
                language === 'ur' && selectedArticle.urduTitle
                  ? selectedArticle.urduTitle
                  : language === 'hi' && selectedArticle.hindiTitle
                  ? selectedArticle.hindiTitle
                  : selectedArticle.title
              }
              subtitle={
                language === 'ur'
                  ? selectedArticle.title
                  : selectedArticle.hindiTitle
              }
              intro={selectedArticle.summary}
              metadata={[
                { label: 'Last Updated', value: selectedArticle.lastUpdated },
                { label: 'Prepared By', value: selectedArticle.author },
                { label: 'Official Source', value: selectedArticle.officialPortal, emphasize: true },
              ]}
            />

            {/* F: Key Information Strip */}
            <KeyInfoStrip facts={articleKeyFacts} />

            {/* G: Clear Primary Actions */}
            <PrimaryActionBar
              primaryAction={{
                label: isSchemeArticle ? 'Get Assistance' : 'Request Service Assistance',
                onClick: () => {
                  if (onSelectService) {
                    onSelectService(selectedArticle.title);
                  }
                },
              }}
              officialLinks={[
                {
                  label: isSchemeArticle ? 'Official Scheme Portal' : 'Official Portal',
                  href: selectedArticle.officialUrl,
                },
              ]}
              assistanceDisclaimer={
                isSchemeArticle
                  ? 'You can check beneficiary status or apply directly on the official scheme portal, or request operator assistance at CSC DOST.'
                  : 'This guide is prepared for citizen information. Always verify current forms and instructions on the official portal.'
              }
            />

            {/* H: Compact Section Navigation */}
            <MobileSectionNav
              sections={articleNavSections}
              activeSectionId={activeSectionId}
              onSelectSection={scrollToArticleSection}
            />

            {/* I: Main Content Sections */}
            <div id="guide-overview" className="scroll-mt-24 divide-y divide-[#DCE3EE]">
              {selectedArticle.sections.map((sec, idx) => (
                <div key={idx} className="py-4 sm:py-5 space-y-2.5 text-start">
                  <h2 className="text-lg sm:text-xl font-bold text-[#101A36] tracking-tight">
                    {sec.heading}
                  </h2>
                  <p className="text-base text-[#101A36] leading-relaxed">{sec.content}</p>
                  {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                    <ul className="space-y-2 pt-1">
                      {sec.bulletPoints.map((bp, bidx) => (
                        <li
                          key={bidx}
                          className="flex items-start gap-2.5 text-base text-[#101A36]"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#1F9D6B] shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.tips && (
                    <div className="p-3.5 bg-[#F6F8FC] border-s-2 border-[#F5A623] text-sm sm:text-base text-[#101A36] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-[#92400E] shrink-0 mt-1" />
                      <span>
                        <strong>Helpful Note:</strong> {sec.tips}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Eligibility Criteria */}
            <ContentSection
              id="guide-eligibility"
              title={isSchemeArticle ? 'Eligibility Criteria' : 'Who Should Use This Guide'}
              subtitle="Verify these eligibility rules and conditions before proceeding."
            >
              <ContentChecklist columns={1} items={selectedArticle.eligibility} />
            </ContentSection>

            {/* Required Documents */}
            <ContentSection
              id="guide-documents"
              title="Required Documents Checklist"
              subtitle="Keep these supporting documents ready for verification."
            >
              <ContentChecklist items={selectedArticle.documentsRequired} />
            </ContentSection>

            {/* Step-by-Step Instructions */}
            <ContentSection
              id="guide-steps"
              title={
                isSchemeArticle
                  ? 'Application & Status-Check Process'
                  : 'Step-by-Step Instructions'
              }
              subtitle="Follow these steps in order on the official portal or with a CSC operator."
            >
              <StepByStepList
                steps={selectedArticle.stepByStep.map((stepText, idx) => ({
                  title: `Step ${idx + 1}`,
                  description: stepText,
                }))}
              />
            </ContentSection>

            {/* Official Sources & Assistance */}
            <OfficialSourcesAndAssistance
              sectionId="guide-sources"
              organisationName={
                selectedArticle.responsibleDepartment || selectedArticle.officialPortal
              }
              officialLinks={[
                {
                  label: isSchemeArticle
                    ? `Official Scheme Portal (${selectedArticle.officialPortal})`
                    : `Visit Official Portal (${selectedArticle.officialPortal})`,
                  href: selectedArticle.officialUrl,
                },
              ]}
              assistanceTitle="CSC DOST Citizen Assistance Desk"
              assistanceDescription="Need help with biometric e-KYC, document scanning, or online submission? Request assistance from our CSC DOST operator desk."
              assistanceButtonLabel={
                isSchemeArticle ? 'Get Scheme Assistance' : 'Request Service Assistance'
              }
              onRequestAssistance={
                onSelectService ? () => onSelectService(selectedArticle.title) : undefined
              }
            />

            <div className="my-4">
              <HelpApplyingCard contextTitle={selectedArticle.title} />
            </div>

            {/* Frequently Asked Questions */}
            <ContentSection
              id="guide-faqs"
              title="Frequently Asked Questions"
              showBottomBorder={true}
            >
              <div className="divide-y divide-[#DCE3EE] border-t border-[#DCE3EE]">
                {selectedArticle.faqs.map((faq, i) => (
                  <div key={i} className="py-3.5 space-y-1.5">
                    <h3 className="text-base font-bold text-[#101A36]">
                      {faq.question}
                    </h3>
                    <p className="text-base text-[#526075] leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </ContentSection>

            {/* Related Guides & Schemes */}
            {relatedGuides.length > 0 && (
              <div className="pt-3 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#526075]">
                  Related Guides &amp; Schemes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {relatedGuides.map((rel) => {
                    const relIsScheme = rel.category === 'Central Scheme';
                    const relCatType = relIsScheme
                      ? 'scheme'
                      : rel.category === 'Education'
                      ? 'admission'
                      : rel.category === 'Recruitment'
                      ? 'job'
                      : 'guide';
                    return (
                      <ColourAccentCard
                        key={rel.id}
                        href={`/scheme/${rel.id}`}
                        categoryType={relCatType}
                        categoryLabel={relIsScheme ? 'Government Scheme' : rel.category}
                        organisation={rel.responsibleDepartment || rel.officialPortal}
                        title={rel.title}
                        footerMeta={`${rel.readTime} · ${rel.lastUpdated}`}
                        actionLabel={relIsScheme ? 'Explore Scheme →' : 'Read Guide →'}
                        onPrimaryClick={() => {
                          if (onOpenArticle) {
                            onOpenArticle(rel.id);
                          } else {
                            setSelectedArticle(rel);
                            setActiveSectionId('guide-overview');
                            try {
                              window.history.pushState(null, '', `/scheme/${rel.id}`);
                            } catch {}
                            const el = document.getElementById('knowledge-hub');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================================================================ */
          /* KNOWLEDGE HUB & GOVERNMENT SCHEMES LISTING                      */
          /* ================================================================ */
          <div className="space-y-3.5 md:space-y-4">
            {/* Section Header & Search */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-3 border-b border-[#E2E8F0] px-1 sm:px-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D97706] uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Knowledge Hub &amp; Scheme Guides</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-[#102A43] tracking-tight">
                  Government Schemes &amp; Citizen Guides
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-2xl">
                  Step-by-step citizen walkthroughs, scheme eligibility rules, document checklists,
                  and official portal references.
                </p>
              </div>

              {/* Search Field */}
              <div className="relative w-full md:w-72">
                <label htmlFor="knowledge-hub-search" className="sr-only">
                  Search schemes and citizen guides
                </label>
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="knowledge-hub-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search schemes, PAN, Aadhaar, JKSSB…"
                  className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-xl text-xs sm:text-sm text-[#102A43] placeholder:text-[#64748B] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Chips (Compact 6–8px gaps) */}
            <div
              role="tablist"
              aria-label="Filter guides by topic"
              className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-2 sm:overflow-x-auto text-xs font-medium px-1 sm:px-0"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 border ${
                    selectedCategory === cat
                      ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                      : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
                  }`}
                >
                  {cat === 'Central Scheme' ? 'Government Schemes' : cat}
                </button>
              ))}
            </div>

            {/* Articles Listing: Colour-Accent Cards Grid */}
            {filteredArticles.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-white border border-[#E2E8F0] rounded-xl">
                <p className="text-sm font-semibold text-[#102A43]">
                  No guides or schemes match your filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredArticles.map((article) => {
                  const isScheme = article.category === 'Central Scheme';
                  const catType = isScheme
                    ? 'scheme'
                    : article.category === 'Education'
                    ? 'admission'
                    : article.category === 'Recruitment'
                    ? 'job'
                    : 'guide';
                  const badgeLabel = isScheme
                    ? 'Government Scheme'
                    : article.category === 'Education'
                    ? 'Education Guide'
                    : article.category === 'Recruitment'
                    ? 'Recruitment Guide'
                    : `Guide · ${article.category}`;

                  return (
                      <ColourAccentCard
                        key={article.id}
                        id={`guide-card-${article.id}`}
                        href={`/scheme/${article.id}`}
                        categoryType={catType}
                        categoryLabel={badgeLabel}
                        organisation={article.responsibleDepartment || article.officialPortal}
                        title={article.title}
                        summary={article.summary}
                        infoFacts={
                          isScheme
                            ? [
                                ...(article.benefitSummary
                                  ? [
                                      {
                                        icon: 'benefit' as const,
                                        label: 'Benefit',
                                        value: article.benefitSummary,
                                      },
                                    ]
                                  : []),
                                ...(article.applicableRegion
                                  ? [
                                      {
                                        icon: 'region' as const,
                                        label: 'Region',
                                        value: article.applicableRegion,
                                      },
                                    ]
                                  : [
                                      {
                                        icon: 'clock' as const,
                                        label: 'Updated',
                                        value: article.lastUpdated,
                                      },
                                    ]),
                              ]
                            : [
                                {
                                  icon: 'topic' as const,
                                  label: 'Topic',
                                  value: article.category,
                                },
                                {
                                  icon: 'clock' as const,
                                  label: 'Updated',
                                  value: `${article.lastUpdated} · ${article.readTime}`,
                                },
                              ]
                        }
                        officialHref={article.officialUrl}
                        actionLabel={isScheme ? 'Explore Scheme →' : 'Read Guide →'}
                        onPrimaryClick={() => {
                          if (onOpenArticle) {
                            onOpenArticle(article.id);
                          } else {
                            setSelectedArticle(article);
                            setActiveSectionId('guide-overview');
                            try {
                              window.history.pushState(null, '', `/scheme/${article.id}`);
                            } catch {}
                          }
                        }}
                      />
                  );
                })}
              </div>
            )}

            {/* Editorial Source Note */}
            <div className="pt-2 px-1 sm:px-0 flex items-start gap-2.5 text-xs text-[#64748B]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                All guides and scheme summaries on CSC DOST link directly to the respective official
                government portals (such as{' '}
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  pmkisan.gov.in
                </a>
                ,{' '}
                <a
                  href="https://beneficiary.nha.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  beneficiary.nha.gov.in
                </a>
                ,{' '}
                <a
                  href="https://myaadhaar.uidai.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  myaadhaar.uidai.gov.in
                </a>
                , and{' '}
                <a
                  href="https://jkssb.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline font-medium"
                >
                  jkssb.nic.in
                </a>
                ).
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
