import React from 'react';
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
  Printer
} from 'lucide-react';
import { SarkariItem, SARKARI_CATEGORIES } from '../data/sarkariData';
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
    return 'Government Recruitment Board / University';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-3 sm:pt-6 font-sans">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Navigation & Action Top Bar */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer"
            id="back-to-notifications-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Notifications</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-300"
              title="Print Notification"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print Page</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
              id="page-share-btn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
              <button
                type="button"
                onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                id="page-apply-btn"
              >
                <span>Apply at CSC Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Clean Unified Document Canvas - No Segmented Boxes */}
        <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          {/* Header Section */}
          <header className="p-5 sm:p-8 border-b border-slate-200">
            <div className="space-y-3">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <button type="button" onClick={onBack} className="hover:underline text-blue-700 font-medium cursor-pointer">
                  Sarkari Desk
                </button>
                <span>/</span>
                <span className="font-semibold text-slate-700">
                  {SARKARI_CATEGORIES[item.category]?.label || item.category}
                </span>
                {item.isNew && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold text-[10px] rounded-full">
                    NEW UPDATE
                  </span>
                )}
              </nav>

              <div className="pt-1">
                <p className="text-xs sm:text-sm font-bold text-blue-900 tracking-wide">
                  {getOrgName(item)}
                </p>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mt-1 leading-snug">
                  {item.title}
                </h1>
              </div>

              {/* Publication and Key Timeline Banner */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-500">Post Date: </span>
                  <strong className="text-slate-900 font-semibold">{item.postDate}</strong>
                </div>
                {item.startDate && (
                  <div>
                    <span className="text-slate-500">Start Date: </span>
                    <strong className="text-emerald-700 font-semibold">{item.startDate}</strong>
                  </div>
                )}
                {item.lastDate && (
                  <div>
                    <span className="text-slate-500">Last Date: </span>
                    <strong className="text-red-600 font-bold">{item.lastDate}</strong>
                  </div>
                )}
                {item.totalPosts && (
                  <div>
                    <span className="text-slate-500">Vacancies / Seats: </span>
                    <strong className="text-blue-900 font-bold">{item.totalPosts}</strong>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Document Content Flow */}
          <div className="p-5 sm:p-8 space-y-8 text-slate-800">
            
            {/* Official Visual Notification Thumbnail Poster */}
            <section aria-label="Official Notification Poster">
              <SarkariNotificationBanner item={item} />
            </section>

            {/* Candidate Advisory - Clean Left Border Callout */}
            <aside aria-label="Advisory" className="border-l-4 border-amber-500 bg-amber-50/60 p-4 rounded-r-lg space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-700" />
                <h2 className="text-xs sm:text-sm font-bold text-amber-950">
                  Candidate Advisory &amp; Verification Note
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Ensure all documents (Aadhaar, Educational Marksheets, Category / Domicile Certificates) match your full name and date of birth exactly before submitting. All online forms filed through CSC Desk undergo mandatory operator verification.
              </p>
              {item.lastDate && (
                <p className="text-xs font-semibold text-red-700 pt-0.5">
                  Application Closing Deadline: <span className="underline font-bold">{item.lastDate}</span>
                </p>
              )}
            </aside>

            {/* Description & Overview */}
            <section className="space-y-2.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Overview &amp; Short Summary</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">{getOrgName(item)}</strong> has published notification details for <strong className="text-slate-900 font-semibold">{item.title}</strong>. {item.shortInfo || 'Eligible candidates may review the detailed eligibility criteria, schedule, application fee, and subject requirements before submitting their application.'}
              </p>
            </section>

            {/* Schedule & Application Fees in Clean Side-by-Side Document Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Important Dates */}
              <section className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>Important Dates Schedule</span>
                </h2>
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Notification Released</span>
                    <span className="font-semibold text-slate-900">{item.postDate}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Application Start Date</span>
                    <span className="font-semibold text-emerald-700">{item.startDate || item.postDate}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Last Date to Apply</span>
                    <span className="font-bold text-red-600">{item.lastDate || 'As per notification'}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Fee Payment Last Date</span>
                    <span className="font-semibold text-slate-900">{item.lastDate || 'Same as last date'}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Exam Date / Hall Ticket</span>
                    <span className="font-medium text-indigo-900">
                      {item.category === 'army_jobs' ? 'Check joinindianarmy.nic.in' : item.category === 'rrb_jobs' ? 'Check rrbapply.gov.in' : item.category === 'ssc_jobs' ? 'Check ssc.gov.in' : item.category === 'cluster_univ' ? 'Check cusrinagar.edu.in' : 'To be notified on official portal'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Application Fee */}
              <section className="space-y-2.5">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>Fee Structure &amp; Charges</span>
                </h2>
                <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {item.feePerSubject && (
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Fee Per Subject / Paper</span>
                      <span className="font-bold text-amber-900">{item.feePerSubject}</span>
                    </div>
                  )}
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">General / OBC Candidates</span>
                    <span className="font-semibold text-slate-900">{item.fees?.genObc || 'As per notification'}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">SC / ST / Reserved Categories</span>
                    <span className="font-semibold text-emerald-700">{item.fees?.scSt || 'As per norms'}</span>
                  </div>
                  <div className="py-2 flex justify-between gap-4">
                    <span className="text-slate-600">Payment Method</span>
                    <span className="font-medium text-slate-800">Online UPI / NetBanking / Debit Card</span>
                  </div>
                  {item.totalPosts && (
                    <div className="py-2 flex justify-between gap-4">
                      <span className="text-slate-600">Total Posts / Seats</span>
                      <span className="font-bold text-blue-900">{item.totalPosts}</span>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* Department Breakdown Clean Table */}
            {item.departmentBreakdown && item.departmentBreakdown.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Briefcase className="w-4 h-4 text-blue-700" />
                  <span>Department &amp; Cadre Breakdown</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 text-xs font-semibold">
                        <th className="py-2.5 pr-4">Department / Wing</th>
                        <th className="py-2.5 pr-4">Post Title</th>
                        <th className="py-2.5 px-3 text-center">Seats / Posts</th>
                        <th className="py-2.5 pl-4">Qualification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {item.departmentBreakdown.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 pr-4 font-semibold text-slate-900">{dept.department}</td>
                          <td className="py-2.5 pr-4 text-blue-900 font-medium">{dept.postName}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-900">{dept.posts}</td>
                          <td className="py-2.5 pl-4 text-slate-600 text-xs">{dept.qualification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Eligibility & Qualifications */}
            <section className="space-y-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Eligibility &amp; Qualification Criteria</span>
              </h2>
              <div className="space-y-2 text-xs sm:text-sm text-slate-700">
                {item.ageLimit && (
                  <p>
                    <strong className="text-slate-900 font-semibold">Age Limit: </strong>
                    <span>{item.ageLimit}</span>
                  </p>
                )}
                <p>
                  <strong className="text-slate-900 font-semibold">Educational Qualification: </strong>
                  <span>{item.eligibility || 'Graduate Degree / 10th / 12th Pass from recognized board/university in India as specified in the official notification.'}</span>
                </p>
              </div>
            </section>

            {/* Required Documents */}
            {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
              <section className="space-y-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Required Documents for Online Application</span>
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aadhaar Card / Government Photo Identity Proof</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Educational Marksheets &amp; Passing Certificates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Recent Passport Size Photograph &amp; Signature Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Category / Domicile Certificate (if applicable)</span>
                  </li>
                </ul>
              </section>
            )}

            {/* Official Source Links & Action Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Notice Board</span>
                </button>

                {item.officialLink && (
                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    <span>Visit Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
                <button
                  type="button"
                  onClick={() => onApplyService(item.title)}
                  className="px-6 sm:px-8 py-2.5 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <span>Apply via CSC Desk</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </article>
      </div>
    </main>
  );
}
