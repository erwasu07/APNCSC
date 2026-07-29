import React, { useState } from 'react';
import { 
  Briefcase, 
  FileText, 
  Award, 
  Key, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  Info,
  TrendingUp
} from 'lucide-react';
import { SARKARI_DATA, SARKARI_CATEGORIES, SarkariItem } from '../data/sarkariData';

interface SarkariTopTickerProps {
  onApplyService: (serviceName: string) => void;
}

export default function SarkariTopTicker({ onApplyService }: SarkariTopTickerProps) {
  const [selectedItem, setSelectedItem] = useState<SarkariItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Get only the most important/new items to display at the top
  const liveUpdates = SARKARI_DATA.filter(item => item.isNew).slice(0, 8);

  // Fallback to first 8 items if not enough new ones
  const itemsToDisplay = liveUpdates.length >= 4 ? liveUpdates : SARKARI_DATA.slice(0, 8);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'jobs': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/40';
      case 'admit_cards': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/40';
      case 'results': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/40';
      case 'answer_keys': return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/40';
      case 'syllabus': return 'text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900/40';
      case 'admissions': return 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-900/40';
      default: return 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'jobs': return <Briefcase className="w-4 h-4" />;
      case 'admit_cards': return <FileText className="w-4 h-4" />;
      case 'results': return <Award className="w-4 h-4" />;
      case 'answer_keys': return <Key className="w-4 h-4" />;
      case 'syllabus': return <BookOpen className="w-4 h-4" />;
      case 'admissions': return <GraduationCap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleApplyNow = (item: SarkariItem) => {
    setSelectedItem(null);
    onApplyService(item.title);
    
    // Smooth scroll to Digital Application & Appointment Desk
    setTimeout(() => {
      const formEl = document.getElementById('booking-portal-form');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="bg-slate-100/50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-900 py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Ticker Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                Live sarkariresult.com updates
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">| Real-time Notice Board</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono bg-slate-200/50 dark:bg-slate-900 px-3 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Latest Vacancies &amp; Admit Cards</span>
          </div>
        </div>

        {/* 4-Column Box Grid with modern card styles & hover effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" id="sarkari-live-grid">
          {itemsToDisplay.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:-translate-y-2 hover:border-red-500/50 dark:hover:border-red-400/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              id={`sarkari-top-card-${item.id}`}
            >
              {/* Box Background Highlight on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 to-orange-50/10 dark:from-red-950/5 dark:to-orange-950/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                    <span>{SARKARI_CATEGORIES[item.category].label}</span>
                  </span>
                  
                  {item.isNew && (
                    <span className="px-2 py-0.5 bg-red-650 text-white dark:bg-red-950/80 dark:text-red-400 text-[9px] font-black uppercase rounded-md tracking-widest animate-pulse font-mono">
                      New
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-2 tracking-tight leading-snug group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors font-display">
                  {item.title}
                </h3>
              </div>

              {/* Bottom footer bar */}
              <div className="relative z-10 flex items-center justify-between border-t border-slate-100 dark:border-slate-850/80 mt-5 pt-4">
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {item.lastDate ? `Last Date: ${item.lastDate}` : `Posted: ${item.postDate}`}
                </span>
                
                <span className="flex items-center gap-1 text-xs text-red-605 dark:text-red-400 font-bold group-hover:translate-x-1.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* DETAILED SARKARI DRAWER/MODAL POPUP */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-100 transition-all duration-300"
            id={`sarkari-top-modal-${selectedItem.id}`}
          >
            {/* Header banner */}
            <div className={`px-6 py-5 border-b border-slate-100 dark:border-slate-800 relative flex items-start justify-between bg-slate-50 dark:bg-slate-950/60`}>
              <div className="space-y-1.5 pr-8">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${SARKARI_CATEGORIES[selectedItem.category].color}`}>
                  {SARKARI_CATEGORIES[selectedItem.category].label}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-display">
                  {selectedItem.title}
                </h3>
                {selectedItem.advertisementNo && (
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">
                    Advt No: {selectedItem.advertisementNo}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all absolute right-4 top-4"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm scrollbar-thin">
              
              {/* Short details paragraph */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  Brief Overview
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedItem.shortInfo}
                </p>
              </div>

              {/* Multi-grid specs details */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Important Dates Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>Important Dates</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Post Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.postDate}</span>
                    </div>
                    {selectedItem.lastDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Last Date:</span>
                        <span className="font-bold text-rose-500 dark:text-rose-400 font-mono">{selectedItem.lastDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Fees Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Application Fee</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {selectedItem.fees ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Gen / OBC:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.fees.genObc}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">SC / ST / Div:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{selectedItem.fees.scSt}</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-500 italic block">Check official notification (Variable)</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Age Limits if any */}
              {selectedItem.ageLimit && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Age Specifications
                  </h4>
                  <p className="text-slate-700 dark:text-slate-200 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-2.5 rounded-xl inline-block">
                    {selectedItem.ageLimit}
                  </p>
                </div>
              )}

              {/* Eligibility qualifications info */}
              {selectedItem.eligibility && (
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Eligibility &amp; Qualification Required
                  </h4>
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed">
                      {selectedItem.eligibility}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-950/30">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4.5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Close View
              </button>
              <button
                onClick={() => handleApplyNow(selectedItem)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-red-100 dark:shadow-none"
              >
                Apply Online via Café
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
