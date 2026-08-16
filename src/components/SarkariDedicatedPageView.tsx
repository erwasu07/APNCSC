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
    const titleUpper = sItem.title.toUpperCase();
    if (titleUpper.includes('SSC')) return 'STAFF SELECTION COMMISSION (SSC)';
    if (titleUpper.includes('RRB') || titleUpper.includes('RAILWAY') || titleUpper.includes('RPF')) return 'RAILWAY RECRUITMENT BOARDS (RRB)';
    if (titleUpper.includes('IBPS')) return 'INSTITUTE OF BANKING PERSONNEL SELECTION';
    if (titleUpper.includes('JKSSB') || titleUpper.includes('J&K')) return 'J&K SERVICES SELECTION BOARD';
    if (titleUpper.includes('UP POLICE') || titleUpper.includes('UPPRPB')) return 'UP POLICE RECRUITMENT BOARD';
    if (titleUpper.includes('UPSC')) return 'UNION PUBLIC SERVICE COMMISSION (UPSC)';
    if (titleUpper.includes('NEET') || titleUpper.includes('NTA') || titleUpper.includes('JEE') || titleUpper.includes('CUET')) return 'NATIONAL TESTING AGENCY (NTA)';
    if (titleUpper.includes('CBSE') || titleUpper.includes('CTET')) return 'CENTRAL BOARD OF SECONDARY EDUCATION';
    if (titleUpper.includes('DELHI UNIVERSITY') || titleUpper.includes('CSAS')) return 'DELHI UNIVERSITY ADMISSION BOARD';
    if (titleUpper.includes('IGNOU')) return 'INDIRA GANDHI NATIONAL OPEN UNIVERSITY';
    return 'GOVERNMENT RECRUITMENT BOARD / UNIVERSITY';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-16 pt-4 sm:pt-6 font-sans">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        
        {/* Navigation & Action Top Bar */}
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl shadow-xs border border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
            id="back-to-notifications-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Notifications</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer border border-slate-300"
              title="Print Notification"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Print Page</span>
            </button>

            <button
              type="button"
              onClick={() => onShare(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
              id="page-share-btn"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
              <button
                type="button"
                onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                id="page-apply-btn"
              >
                <span>Apply at CSC Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Page Card */}
        <article className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          
          {/* Header Banner */}
          <header className="px-5 sm:px-8 py-6 sm:py-8 bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#1e1b4b] text-white relative">
            <div className="space-y-3 max-w-3xl">
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-200">
                <button type="button" onClick={onBack} className="hover:underline text-amber-300 font-bold cursor-pointer">
                  Sarkari Desk
                </button>
                <span>/</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${SARKARI_CATEGORIES[item.category]?.color || 'bg-blue-100 text-blue-900'}`}>
                  {SARKARI_CATEGORIES[item.category]?.label || item.category}
                </span>
              </nav>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-black uppercase tracking-wider text-blue-100 font-mono bg-blue-900/80 px-2.5 py-0.5 rounded border border-blue-400/30">
                  {getOrgName(item)}
                </span>
                {item.isNew && (
                  <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider rounded animate-pulse">
                    ⚡ LATEST UPDATE
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug font-sans text-white drop-shadow-xs">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300 pt-1">
                <span>🗓️ Published: <strong className="text-white">{item.postDate}</strong></span>
                {item.lastDate && (
                  <span>⏰ Last Date: <strong className="text-amber-300 font-bold">{item.lastDate}</strong></span>
                )}
              </div>
            </div>
          </header>

          {/* Page Body Content */}
          <div className="p-5 sm:p-8 space-y-6 bg-slate-50">
            
            {/* Candidate Verification Advisory */}
            <aside aria-label="Advisory" className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 shadow-2xs">
              <Bell className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-900 font-mono">
                  Candidate Verification Advisory
                </h2>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  Ensure all certificates (Aadhaar, Educational Marksheets, Category / Caste Certificates) match your full name and date of birth exactly before submitting. Applications processed through our CSC Desk undergo mandatory VLE verification.
                </p>
                {item.lastDate && (
                  <p className="text-xs font-bold text-red-700 font-mono pt-1">
                    ⏰ Application Closing Deadline: <span className="underline">{item.lastDate}</span>
                  </p>
                )}
              </div>
            </aside>

            {/* Notification Summary */}
            <section className="bg-white border border-blue-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-blue-900 font-mono flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-blue-700" />
                  <span>Notification Summary &amp; Description</span>
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-mono font-bold rounded-full border border-blue-200">
                  Verified Notice
                </span>
              </div>

              <div className="text-slate-800 text-xs sm:text-sm leading-relaxed space-y-2.5">
                <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="font-extrabold text-blue-900">{getOrgName(item)}</strong> has officially announced <strong className="font-black text-slate-950">{item.title}</strong>. {item.shortInfo || 'Interested candidates should carefully review the eligibility criteria, category requirements, exam pattern, and deadline details below before applying.'}
                </p>
                
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-100 rounded-lg flex flex-col border border-slate-200/60">
                    <span className="text-slate-600 text-[9px] uppercase font-bold">Release Date</span>
                    <span className="font-extrabold text-slate-900">{item.postDate}</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg flex flex-col border border-slate-200/60">
                    <span className="text-slate-600 text-[9px] uppercase font-bold">Category</span>
                    <span className="font-extrabold text-blue-700 uppercase">{item.category.replace('_', ' ')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg flex flex-col col-span-2 sm:col-span-1 border border-slate-200/60">
                    <span className="text-slate-600 text-[9px] uppercase font-bold">Application Status</span>
                    <span className="font-extrabold text-emerald-700">Active / Form Open</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Schedule & Fees 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Important Dates Box */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-700 font-mono pb-2 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>Important Dates Schedule</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Notification Release:</span>
                    <span className="font-bold text-slate-900">{item.postDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Date of Start (Online Form):</span>
                    <span className="font-bold text-emerald-700">{item.startDate || item.postDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Last Date to Apply:</span>
                    <span className="font-extrabold text-red-600">{item.lastDate || 'As per official notice'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Last Date to Pay Fee:</span>
                    <span className="font-bold text-slate-900">{item.lastDate || 'Same as last date'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-600 font-medium">Exam Date / Admit Card:</span>
                    <span className="font-bold text-indigo-700">
                      {item.category === 'army_jobs' ? 'Check joinindianarmy.nic.in' : item.category === 'rrb_jobs' ? 'Check rrbapply.gov.in' : item.category === 'ssc_jobs' ? 'Check ssc.gov.in' : item.category === 'cluster_univ' ? 'Check cusrinagar.edu.in' : 'To be notified on official portal'}
                    </span>
                  </div>
                </div>
              </section>

              {/* Fee Structure Box */}
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 font-mono pb-2 border-b border-slate-100">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  <span>Fee Structure &amp; Charges</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {item.feePerSubject && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-1">
                      <span className="text-amber-800 text-[10px] uppercase font-bold block">Fee Per Subject / Paper:</span>
                      <span className="font-black text-amber-950 text-xs">{item.feePerSubject}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">General / OBC Candidates:</span>
                    <span className="font-extrabold text-slate-900">{item.fees?.genObc || 'As per notification'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">SC / ST / Reserved:</span>
                    <span className="font-extrabold text-emerald-700">{item.fees?.scSt || 'As per norms'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-600 font-medium">Payment Mode:</span>
                    <span className="font-bold text-amber-700">Online NetBanking / UPI / Card</span>
                  </div>
                </div>
              </section>

            </div>

            {/* Total Posts / Seats Banner */}
            {item.totalPosts && (
              <section className="bg-gradient-to-r from-slate-900 via-[#1e3a8a] to-slate-900 text-white border border-blue-700 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-400 text-slate-950 rounded-xl font-black shrink-0">
                    {item.category === 'admissions' || item.category === 'nta' ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : item.category === 'exam_forms' ? (
                      <FileCheck className="w-5 h-5" />
                    ) : item.category === 'cluster_univ' ? (
                      <Building2 className="w-5 h-5" />
                    ) : item.category === 'rrb_jobs' ? (
                      <Train className="w-5 h-5" />
                    ) : item.category === 'army_jobs' ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <Briefcase className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest block">
                      {item.category === 'admissions' || item.category === 'cluster_univ' || item.category === 'nta'
                        ? 'TOTAL SEATS / INTAKE CAPACITY'
                        : item.category === 'exam_forms'
                        ? 'TOTAL ENROLMENT CAPACITY'
                        : 'TOTAL NUMBER OF VACANCIES / POSTS'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
                      {item.totalPosts}
                    </h3>
                  </div>
                </div>
                {item.officialLink && (
                  <a
                    href={item.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </section>
            )}

            {/* Department Breakdown Table */}
            {item.departmentBreakdown && item.departmentBreakdown.length > 0 && (
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider font-mono flex items-center gap-2 text-slate-900">
                    <Briefcase className="w-4.5 h-4.5 text-blue-700" />
                    <span>Department &amp; Cadre Breakdown</span>
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full border bg-blue-100 text-blue-900 border-blue-200">
                    Official Distribution
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-900 font-extrabold uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Department / Wing</th>
                        <th className="py-2.5 px-3">Post Title</th>
                        <th className="py-2.5 px-3 text-center">Vacancies / Seats</th>
                        <th className="py-2.5 px-3">Qualification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {item.departmentBreakdown.map((dept, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{dept.department}</td>
                          <td className="py-3 px-3 font-semibold text-blue-900">{dept.postName}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 font-mono font-black rounded-md bg-blue-100 text-blue-900">
                              {dept.posts}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-[11px] leading-snug">{dept.qualification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Eligibility & Requirements */}
            <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Eligibility &amp; Qualification Criteria</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {item.ageLimit && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-800 font-mono block">Age Limit Criteria</span>
                    <p className="font-bold text-slate-900">{item.ageLimit}</p>
                  </div>
                )}

                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-800 font-mono block">Educational Qualification</span>
                  <p className="font-semibold text-slate-900">
                    {item.eligibility || 'Graduate Degree / 10th / 12th Pass from recognized board in India.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Documents Checklist for CSC Desk Application */}
            {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
              <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Required Documents for Online Application</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">Aadhaar Card / Government Photo ID</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">Educational Qualification Certificate / Marksheets</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">Passport Size Photograph &amp; Signature Scan</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">Category / Domicile Certificate (if applicable)</span>
                  </div>
                </div>
              </section>
            )}

            {/* Bottom Action Footer on Page */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Notice Board</span>
              </button>

              {!['answer_keys', 'syllabus', 'results'].includes(item.category) && (
                <button
                  type="button"
                  onClick={() => onApplyService(`Filing Application: ${item.title}`)}
                  className="px-6 sm:px-8 py-3 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
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
