import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  ExternalLink, 
  Calendar, 
  IndianRupee, 
  Briefcase, 
  Shield, 
  GraduationCap, 
  FileCheck, 
  Building2, 
  Train, 
  CheckCircle, 
  Bell, 
  FileText, 
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SarkariItem, SARKARI_CATEGORIES, SARKARI_DATA } from '../data/sarkariData';
import SarkariNotificationBanner from './SarkariNotificationBanner';

interface SarkariDedicatedPageViewProps {
  item: SarkariItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (item: SarkariItem) => void;
}

export default function SarkariDedicatedPageView({
  item,
  onBack,
  onApplyService,
  onShare
}: SarkariDedicatedPageViewProps) {
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState('summary');

  // Set document title dynamically for SEO
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${item.title} – Official Notification Summary | CSC DOST`;
    return () => {
      document.title = originalTitle;
    };
  }, [item]);

  const getOrgName = (sItem: SarkariItem) => {
    if (sItem.category === 'army_jobs') return 'Indian Army (joinindianarmy.nic.in)';
    if (sItem.category === 'rrb_jobs') return 'Railway Recruitment Boards (RRB)';
    if (sItem.category === 'ssc_jobs') return 'Staff Selection Commission (SSC)';
    if (sItem.category === 'cluster_univ') return 'Cluster University Srinagar (CUS)';
    if (sItem.category === 'jkssb') return 'J&K Services Selection Board (JKSSB)';
    if (sItem.category === 'exam_forms') return 'University of Kashmir (Examinations)';
    if (sItem.category === 'admissions') return 'University of Kashmir (Admissions)';

    const titleUpper = sItem.title.toUpperCase();
    if (titleUpper.includes('ARMY') || titleUpper.includes('AGNIVEER')) return 'Indian Army';
    if (titleUpper.includes('SSC')) return 'Staff Selection Commission (SSC)';
    if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || titleUpper.includes('RPF')) return 'Railway Recruitment Boards (RRB)';
    if (titleUpper.includes('IBPS')) return 'Institute of Banking Personnel Selection';
    if (titleUpper.includes('JKSSB') || titleUpper.includes('J&K')) return 'J&K Services Selection Board';
    if (titleUpper.includes('UP POLICE') || titleUpper.includes('UPPRPB')) return 'UP Police Recruitment Board';
    if (titleUpper.includes('UPSC')) return 'Union Public Service Commission (UPSC)';
    if (titleUpper.includes('NEET') || titleUpper.includes('NTA') || titleUpper.includes('JEE') || titleUpper.includes('CUET')) return 'National Testing Agency (NTA)';
    if (titleUpper.includes('CBSE') || titleUpper.includes('CTET')) return 'Central Board of Secondary Education';
    if (titleUpper.includes('DELHI UNIVERSITY') || titleUpper.includes('CSAS')) return 'Delhi University Admission Board';
    if (titleUpper.includes('IGNOU')) return 'Indira Gandhi National Open University';
    return 'Government Recruitment Board / Examination Agency';
  };

  const orgDomain = () => {
    if (item.category === 'army_jobs') return 'https://joinindianarmy.nic.in';
    if (item.category === 'rrb_jobs') return 'https://www.rrbapply.gov.in';
    if (item.category === 'ssc_jobs') return 'https://ssc.gov.in';
    if (item.category === 'cluster_univ') return 'https://cusrinagar.edu.in';
    if (item.category === 'jkssb') return 'https://jkssb.nic.in';
    if (item.category === 'exam_forms' || item.category === 'admissions') return 'https://kashmiruniversity.net';
    return item.officialLink || 'https://www.india.gov.in';
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setMobileTocOpen(false);
    setActiveHeading(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Related notifications from the same category or overall data
  const relatedItems = SARKARI_DATA.filter(i => i.id !== item.id && (i.category === item.category || i.category === 'jkssb')).slice(0, 3);

  // Table of Contents sections
  const tocSections = [
    { id: 'summary-table', title: 'Recruitment Summary' },
    { id: 'overview-section', title: 'Overview & Information' },
    { id: 'important-dates', title: 'Important Dates' },
    { id: 'fee-structure', title: 'Application Fees' },
    { id: 'eligibility-section', title: 'Eligibility & Age Limit' },
    ...(item.departmentBreakdown && item.departmentBreakdown.length > 0 ? [{ id: 'vacancy-details', title: 'Vacancy Breakdown' }] : []),
    { id: 'documents-required', title: 'Documents Required' },
    { id: 'how-to-apply', title: 'How to Apply' },
    { id: 'official-links', title: 'Official Source & Portal' },
    { id: 'faqs-section', title: 'Frequently Asked Questions' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#14213D] pb-16 pt-3 sm:pt-6 font-sans">
      
      {/* Schema.org Article Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            'headline': item.title,
            'description': item.shortInfo || item.title,
            'articleSection': SARKARI_CATEGORIES[item.category]?.label || 'Recruitment',
            'datePublished': item.postDate || '2026-08-01',
            'dateModified': item.startDate || item.postDate || '2026-08-01',
            'author': {
              '@type': 'Organization',
              'name': 'CSC DOST',
              'url': 'https://www.cscdost.com'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'CSC DOST',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://www.cscdost.com/favicon.png'
              }
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': `https://www.cscdost.com/#post/${item.id}`
            }
          })
        }}
      />

      <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 space-y-3 sm:space-y-6 pb-24 sm:pb-8">
        
        {/* Navigation & Action Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 bg-white p-3 sm:p-4 rounded-none sm:rounded-xl border-y sm:border border-[#E2E8F0] shadow-2xs w-full">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#0B1F49] hover:bg-[#122e6b] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Notifications</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-white hover:bg-slate-50 text-[#14213D] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
              title="Print Notification"
            >
              <Printer className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(item)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#14213D] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
            >
              <Share2 className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Share</span>
            </button>

            {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
              <button
                type="button"
                onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <span>Apply via CSC Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Article Container Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start w-full">
          
          {/* Main Content Column */}
          <article className="lg:col-span-8 bg-white rounded-none sm:rounded-2xl border-y sm:border border-[#E2E8F0] p-3.5 sm:p-8 space-y-6 sm:space-y-8 shadow-none sm:shadow-xs w-full max-w-full overflow-hidden">
            
            {/* Header / Meta Block */}
            <header className="space-y-4 border-b border-[#E2E8F0] pb-6">
              
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                <button type="button" onClick={onBack} className="hover:text-[#0759E8] font-medium cursor-pointer">
                  Home
                </button>
                <span aria-hidden="true">/</span>
                <button type="button" onClick={onBack} className="hover:text-[#0759E8] font-medium cursor-pointer">
                  Recruitments
                </button>
                <span aria-hidden="true">/</span>
                <span className="text-[#14213D] font-semibold">
                  {SARKARI_CATEGORIES[item.category]?.label || item.category}
                </span>
              </nav>

              {/* Organization & Category Tag */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0759E8]">
                  {getOrgName(item)}
                </span>
                
                {/* H1 Title */}
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#14213D] tracking-tight leading-snug break-words">
                  {item.title}
                </h1>
              </div>

              {/* Short Introduction */}
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed break-words">
                {item.shortInfo || `${getOrgName(item)} has released the official recruitment notification for ${item.title}. Eligible candidates are advised to verify eligibility criteria, key deadlines, fee structure, and syllabus prior to submitting their online application.`}
              </p>

              {/* Published & Updated Dates */}
              <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-[11px] sm:text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                <div>
                  <span>Published: </span>
                  <strong className="text-[#14213D] font-semibold">{item.postDate}</strong>
                </div>
                {item.startDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <div>
                      <span>Applications Start: </span>
                      <strong className="text-[#16A34A] font-semibold">{item.startDate}</strong>
                    </div>
                  </>
                )}
                {item.lastDate && (
                  <>
                    <span aria-hidden="true">·</span>
                    <div>
                      <span>Last Date: </span>
                      <strong className="text-rose-700 font-bold">{item.lastDate}</strong>
                    </div>
                  </>
                )}
                {item.totalPosts && (
                  <>
                    <span aria-hidden="true">·</span>
                    <div>
                      <span>Vacancies: </span>
                      <strong className="text-[#0759E8] font-bold">{item.totalPosts}</strong>
                    </div>
                  </>
                )}
              </div>

            </header>

            {/* Mobile Table of Contents (Collapsible "On this page") */}
            <div className="lg:hidden bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg sm:rounded-xl p-3 sm:p-3.5">
              <button
                type="button"
                onClick={() => setMobileTocOpen(!mobileTocOpen)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#14213D] cursor-pointer"
                aria-expanded={mobileTocOpen}
              >
                <span>On this page (Table of Contents)</span>
                {mobileTocOpen ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
              </button>
              {mobileTocOpen && (
                <ul className="mt-3 pt-2 border-t border-[#E2E8F0] space-y-2 text-xs font-medium text-[#64748B]">
                  {tocSections.map((sec) => (
                    <li key={sec.id}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(sec.id)}
                        className="text-left hover:text-[#0759E8] transition-colors"
                      >
                        • {sec.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Visual Notice Preview Card */}
            <section aria-label="Official Notification Banner">
              <SarkariNotificationBanner 
                item={item} 
                onApply={() => onApplyService(item.title)}
              />
            </section>

            {/* ================================================================ */}
            {/* 1. RECRUITMENT INFORMATION SUMMARY TABLE */}
            {/* ================================================================ */}
            <section id="summary-table" className="space-y-3 scroll-mt-24">
              <h2 className="text-base sm:text-lg font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <FileText className="w-4 h-4 text-[#0759E8]" />
                <span>Recruitment Information Summary</span>
              </h2>

              <div className="w-full overflow-x-auto border border-[#E2E8F0] rounded-lg sm:rounded-xl">
                <table className="w-full text-left text-xs sm:text-sm table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[34%] sm:w-[30%]" />
                    <col className="w-[66%] sm:w-[70%]" />
                  </colgroup>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="bg-[#F8FAFC]">
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Organization
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-[#14213D] align-top break-words">
                        {getOrgName(item)}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Post Title / Examination
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-[#0759E8] align-top break-words">
                        {item.title}
                      </td>
                    </tr>
                    {item.advertisementNo && (
                      <tr className="bg-[#F8FAFC]">
                        <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                          Advertisement No.
                        </th>
                        <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-mono font-medium text-[#14213D] align-top break-words">
                          {item.advertisementNo}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Total Vacancies / Seats
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-[#14213D] align-top break-words">
                        {item.totalPosts || 'Refer to official notice'}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Application Start Date
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#16A34A] align-top break-words">
                        {item.startDate || item.postDate}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Application Last Date
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 font-bold text-rose-700 align-top break-words">
                        {item.lastDate || 'As specified in notification'}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Age Limit
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-[#14213D] align-top break-words leading-relaxed">
                        {item.ageLimit || 'As per board regulations with category relaxation.'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Eligibility / Qualification
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-[#14213D] align-top break-words leading-relaxed">
                        {item.eligibility || 'Class 10th / 12th / Graduate from a recognized Indian university.'}
                      </td>
                    </tr>
                    <tr className="bg-[#F8FAFC]">
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Selection Process
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 text-[#14213D] align-top break-words leading-relaxed">
                        {item.category === 'army_jobs' ? 'Physical Fitness Test (PFT), Written Exam (CEE) & Medical Review' : 'Written Test (CBT / OMR) followed by Document Verification'}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-2 sm:py-2.5 px-3 sm:px-4 font-semibold text-[#64748B] align-top text-[11px] sm:text-xs break-words">
                        Official Portal
                      </th>
                      <td className="py-2 sm:py-2.5 px-3 sm:px-4 align-top break-words">
                        <a
                          href={item.officialLink || orgDomain()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0759E8] hover:underline break-all"
                        >
                          <span>Visit Official Website</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Candidate Advisory Box */}
            <aside aria-label="Important Note" className="border-l-4 border-amber-500 bg-amber-50/70 p-3 sm:p-4 rounded-r-lg space-y-1 break-words">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-800 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                  Candidate Advisory &amp; Verification Note
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Ensure all documents (Aadhaar, Matriculation Marksheet for Date of Birth, and Domicile/Category certificates) match your full name exactly. Applications filed with mismatched credentials risk immediate rejection during Document Verification.
              </p>
              {item.lastDate && (
                <p className="text-xs font-semibold text-rose-800 pt-1">
                  Application Closing Deadline: <span className="underline font-bold">{item.lastDate}</span>
                </p>
              )}
            </aside>

            {/* ================================================================ */}
            {/* 2. IMPORTANT DATES & FEE STRUCTURE */}
            {/* ================================================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
              
              {/* Important Dates Schedule */}
              <section id="important-dates" className="space-y-3 scroll-mt-24">
                <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <Calendar className="w-4 h-4 text-[#0759E8]" />
                  <span>Important Dates Schedule</span>
                </h2>
                <div className="divide-y divide-[#E2E8F0] text-xs sm:text-sm">
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Notification Released</span>
                    <span className="font-semibold text-[#14213D] text-right break-words">{item.postDate}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Application Start Date</span>
                    <span className="font-semibold text-[#16A34A] text-right break-words">{item.startDate || item.postDate}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Last Date to Apply</span>
                    <span className="font-bold text-rose-700 text-right break-words">{item.lastDate || 'As per notification'}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Fee Payment Last Date</span>
                    <span className="font-semibold text-[#14213D] text-right break-words">{item.lastDate || 'Same as last date'}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Exam / Hall Ticket</span>
                    <span className="font-medium text-[#0B1F49] text-right break-words">
                      {item.category === 'army_jobs' ? 'joinindianarmy.nic.in' : item.category === 'rrb_jobs' ? 'rrbapply.gov.in' : item.category === 'ssc_jobs' ? 'ssc.gov.in' : 'To be notified on official portal'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Fee Structure */}
              <section id="fee-structure" className="space-y-3 scroll-mt-24">
                <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <IndianRupee className="w-4 h-4 text-[#16A34A]" />
                  <span>Application Fee Structure</span>
                </h2>
                <div className="divide-y divide-[#E2E8F0] text-xs sm:text-sm">
                  {item.feePerSubject && (
                    <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                      <span className="text-[#64748B] shrink-0">Fee Per Subject / Paper</span>
                      <span className="font-bold text-[#14213D] text-right break-words">{item.feePerSubject}</span>
                    </div>
                  )}
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">General / OBC Candidates</span>
                    <span className="font-semibold text-[#14213D] text-right break-words">{item.fees?.genObc || 'As specified in notification'}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">SC / ST / Reserved / Female</span>
                    <span className="font-semibold text-[#16A34A] text-right break-words">{item.fees?.scSt || 'As per statutory norms'}</span>
                  </div>
                  <div className="py-2 flex items-start justify-between gap-2.5 sm:gap-4 break-words">
                    <span className="text-[#64748B] shrink-0">Payment Mode</span>
                    <span className="font-medium text-[#14213D] text-right break-words">Online (UPI / NetBanking / Debit Card)</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Department Breakdown Table (if available) */}
            {item.departmentBreakdown && item.departmentBreakdown.length > 0 && (
              <section id="vacancy-details" className="space-y-3 scroll-mt-24">
                <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                  <Briefcase className="w-4 h-4 text-[#0759E8]" />
                  <span>Department &amp; Cadre Vacancy Breakdown</span>
                </h2>
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Post Title</th>
                        <th className="py-2.5 px-3 text-center">Vacancies</th>
                        <th className="py-2.5 px-3">Qualification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {item.departmentBreakdown.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-[#14213D]">{dept.department}</td>
                          <td className="py-2.5 px-3 text-[#0759E8] font-medium">{dept.postName}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-[#14213D]">{dept.posts}</td>
                          <td className="py-2.5 px-3 text-[#64748B] text-xs">{dept.qualification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ================================================================ */}
            {/* 3. DOCUMENTS REQUIRED */}
            {/* ================================================================ */}
            <section id="documents-required" className="space-y-3 scroll-mt-24">
              <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <FileCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Documents Required for Application</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-[#14213D]">
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Aadhaar Card / Government Photo ID</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>10th Marksheet (for Date of Birth proof)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Educational Qualification Certificates</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Recent Color Passport Photo &amp; Signature</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Domicile Certificate (if applicable)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                  <span>Category Certificate (SC/ST/OBC/EWS/RBA)</span>
                </div>
              </div>
            </section>

            {/* ================================================================ */}
            {/* 4. HOW TO APPLY (STEP-BY-STEP) */}
            {/* ================================================================ */}
            <section id="how-to-apply" className="space-y-3 scroll-mt-24">
              <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <Clock className="w-4 h-4 text-[#0759E8]" />
                <span>How to Apply Online (Step-by-Step)</span>
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-[#14213D]">
                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>Visit Official Authority Portal</strong>
                    <p className="text-[#64748B] text-xs mt-0.5">Go to {orgDomain()} and navigate to candidate registration / active notifications.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>One-Time Registration (OTR)</strong>
                    <p className="text-[#64748B] text-xs mt-0.5">Verify your mobile number and email ID using OTP. Enter personal and demographic particulars.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>Select Active Advertisement &amp; Post</strong>
                    <p className="text-[#64748B] text-xs mt-0.5">Select "{item.title}" and verify your qualifying subjects and age criteria.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <strong>Upload Documents &amp; Pay Fee</strong>
                    <p className="text-[#64748B] text-xs mt-0.5">Upload photo, signature, and certificates conforming to pixel dimensions, then complete online payment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <span className="w-6 h-6 rounded-full bg-[#0759E8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">5</span>
                  <div>
                    <strong>Download &amp; Print Confirmation Receipt</strong>
                    <p className="text-[#64748B] text-xs mt-0.5">Preserve 2 physical copies of the submitted application form with your Application Reference Number.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================================================================ */}
            {/* 5. OFFICIAL SOURCE LINKS & CSC DESK CALLOUT */}
            {/* ================================================================ */}
            <section id="official-links" className="space-y-4 scroll-mt-24 pt-4 border-t border-[#E2E8F0]">
              <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#0759E8]" />
                <span>Official Source Links &amp; Application Options</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Official Website Source Card */}
                <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                    Official Government Authority
                  </span>
                  <h3 className="text-sm font-bold text-[#14213D]">
                    {getOrgName(item)}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Access the official notice, syllabus, and online application portal directly:
                  </p>
                  <a
                    href={item.officialLink || orgDomain()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-[#0759E8] border border-[#0759E8] text-xs font-bold rounded-lg transition-colors cursor-pointer mt-1"
                  >
                    <span>Visit Official Website →</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* CSC DOST Assistance Desk Card */}
                <div className="p-4 bg-[#EAF4FF]/50 border border-[#BFDBFE] rounded-xl space-y-2">
                  <span className="text-xs font-bold text-[#0759E8] uppercase tracking-wider block">
                    Assisted Online Filing
                  </span>
                  <h3 className="text-sm font-bold text-[#14213D]">
                    CSC DOST Digital Service Desk
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Upload your documents to have our certified operators review, format, and submit your form:
                  </p>
                  <button
                    type="button"
                    onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs mt-1"
                  >
                    <span>Apply via CSC Desk →</span>
                  </button>
                </div>

              </div>
            </section>

            {/* ================================================================ */}
            {/* 6. FAQS */}
            {/* ================================================================ */}
            <section id="faqs-section" className="space-y-3 scroll-mt-24 pt-4 border-t border-[#E2E8F0]">
              <h2 className="text-sm sm:text-base font-bold text-[#14213D] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#0759E8]" />
                <span>Frequently Asked Questions for this Notification</span>
              </h2>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                  <h3 className="font-bold text-[#14213D]">Where can I verify the original notification PDF?</h3>
                  <p className="text-[#64748B]">
                    You can download and inspect the official PDF notification directly on the official portal at {orgDomain()}.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                  <h3 className="font-bold text-[#14213D]">What if my application fee is deducted but the portal shows pending?</h3>
                  <p className="text-[#64748B]">
                    Do not pay twice immediately. Wait 24 to 48 hours for bank reconciliation, or log in to use the "Re-verify Payment" option on the examination portal.
                  </p>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                  <h3 className="font-bold text-[#14213D]">Can I make corrections after submitting my application form?</h3>
                  <p className="text-[#64748B]">
                    Most recruitment boards (including SSC and JKSSB) open a 2–3 day dedicated correction window after registration closes. However, candidate name and mobile number usually cannot be changed.
                  </p>
                </div>
              </div>
            </section>

          </article>

          {/* Sidebar Column: Sticky Desktop Table of Contents & Related Articles */}
          <aside aria-label="Article Sidebar" className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20">
            
            {/* Desktop Table of Contents */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                Table of Contents
              </span>
              <nav aria-label="Table of Contents" className="space-y-1.5 text-xs">
                {tocSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      activeHeading === sec.id
                        ? 'bg-[#EAF4FF] text-[#0759E8] font-bold'
                        : 'text-[#64748B] hover:text-[#14213D] hover:bg-slate-50'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Action Widget */}
            <div className="bg-[#0B1F49] text-white rounded-2xl p-5 space-y-3 shadow-xs">
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                Need Application Assistance?
              </span>
              <h3 className="text-sm font-bold leading-snug">
                CSC DOST Assisted Submission Desk
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit your documents through our desk and receive verified submission slips, token tracking, and photo formatting.
              </p>
              <button
                type="button"
                onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                className="w-full py-2.5 bg-[#0759E8] hover:bg-[#0646b8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Start Online Application
              </button>
            </div>

            {/* Related Recruitment Notices */}
            {relatedItems.length > 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
                  Related Notifications
                </span>
                <div className="divide-y divide-[#E2E8F0]">
                  {relatedItems.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => {
                        window.location.hash = `#post/${rel.id}`;
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="py-2.5 hover:bg-slate-50 rounded-md px-1 cursor-pointer transition-colors"
                    >
                      <span className="text-[11px] text-[#0759E8] font-semibold block mb-0.5">
                        {SARKARI_CATEGORIES[rel.category]?.label || rel.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#14213D] leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                      {rel.lastDate && (
                        <span className="text-[10px] text-[#64748B] block mt-1">
                          Last Date: {rel.lastDate}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>

      </div>

    </div>
  );
}
