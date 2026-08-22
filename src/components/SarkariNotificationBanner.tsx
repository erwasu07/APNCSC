import React from 'react';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  ShieldCheck 
} from 'lucide-react';
import { SarkariItem } from '../data/sarkariData';

interface SarkariNotificationBannerProps {
  item: SarkariItem;
  className?: string;
}

export default function SarkariNotificationBanner({
  item,
  className = ''
}: SarkariNotificationBannerProps) {
  const getThemeConfig = (category: string) => {
    switch (category) {
      case 'army_jobs':
        return {
          portalName: 'JOIN INDIAN ARMY',
          deptBadge: 'DEFENCE RECRUITMENT',
          gradientBg: 'from-amber-950 via-slate-900 to-red-950',
          borderColor: 'border-amber-400',
          pillColor: 'bg-red-700 text-white',
          accentColor: 'text-amber-300',
          orgIcon: '🎖️'
        };
      case 'rrb_jobs':
        return {
          portalName: 'RAILWAY RECRUITMENT (RRB)',
          deptBadge: 'INDIAN RAILWAYS',
          gradientBg: 'from-sky-950 via-slate-900 to-blue-950',
          borderColor: 'border-sky-400',
          pillColor: 'bg-blue-700 text-white',
          accentColor: 'text-sky-300',
          orgIcon: '🚆'
        };
      case 'ssc_jobs':
        return {
          portalName: 'STAFF SELECTION COMMISSION',
          deptBadge: 'CENTRAL GOVT (SSC)',
          gradientBg: 'from-slate-950 via-indigo-950 to-slate-900',
          borderColor: 'border-cyan-400',
          pillColor: 'bg-cyan-700 text-white',
          accentColor: 'text-cyan-300',
          orgIcon: '🏛️'
        };
      case 'jkssb':
        return {
          portalName: 'J&K SERVICES SELECTION BOARD',
          deptBadge: 'UT J&K CADRE',
          gradientBg: 'from-blue-950 via-slate-900 to-indigo-950',
          borderColor: 'border-amber-400',
          pillColor: 'bg-indigo-700 text-white',
          accentColor: 'text-amber-300',
          orgIcon: '🏔️'
        };
      case 'exam_forms':
        return {
          portalName: 'UNIVERSITY OF KASHMIR',
          deptBadge: 'EXAM NOTICES & DATESHEET',
          gradientBg: 'from-purple-950 via-slate-900 to-indigo-950',
          borderColor: 'border-purple-400',
          pillColor: 'bg-purple-700 text-white',
          accentColor: 'text-purple-300',
          orgIcon: '📝'
        };
      case 'admissions':
        return {
          portalName: 'UNIVERSITY ADMISSIONS DESK',
          deptBadge: 'ACADEMIC SESSION 2026',
          gradientBg: 'from-emerald-950 via-slate-900 to-teal-950',
          borderColor: 'border-emerald-400',
          pillColor: 'bg-emerald-700 text-white',
          accentColor: 'text-emerald-300',
          orgIcon: '🎓'
        };
      case 'cluster_univ':
        return {
          portalName: 'CLUSTER UNIVERSITY SRINAGAR',
          deptBadge: 'CUS ACADEMICS',
          gradientBg: 'from-violet-950 via-slate-900 to-indigo-950',
          borderColor: 'border-yellow-400',
          pillColor: 'bg-violet-700 text-white',
          accentColor: 'text-yellow-300',
          orgIcon: '🏛️'
        };
      default:
        return {
          portalName: 'SARKARI RESULT PORTAL',
          deptBadge: 'OFFICIAL NOTICE',
          gradientBg: 'from-red-950 via-slate-900 to-slate-950',
          borderColor: 'border-amber-400',
          pillColor: 'bg-red-700 text-white',
          accentColor: 'text-amber-300',
          orgIcon: '📢'
        };
    }
  };

  const theme = getThemeConfig(item.category);
  return (
    <div className={className}>
      {/* Visual Thumbnail Card (Sarkari Result Graphic Styling) */}
      <div 
        className={`relative overflow-hidden rounded-2xl border-4 ${theme.borderColor} shadow-xl bg-gradient-to-br ${theme.gradientBg} text-white p-4 sm:p-6 transition-transform hover:shadow-2xl`}
        id={`sarkari-thumbnail-card-${item.id}`}
      >
        {/* Subtle decorative background watermark and grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />
        
        {/* Golden outer aura border */}
        <div className="absolute inset-0 rounded-xl border border-amber-300/30 pointer-events-none" />

        {/* TOP BRANDING BAR */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-white/15">
          {/* CSC DOST Seal */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-slate-900 border-2 border-amber-400 flex flex-col items-center justify-center text-center shadow-md shrink-0">
              <span className="text-[9px] font-black text-amber-300 tracking-tighter leading-none">CSC</span>
              <span className="text-[11px] font-black text-white leading-none">DOST</span>
              <span className="text-[6px] font-bold text-slate-300 tracking-widest leading-none">VLE</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 bg-red-600 border border-amber-300 text-white font-black text-[10px] sm:text-xs rounded shadow-xs tracking-wide uppercase">
                  SARKARI RESULT
                </span>
                <span className="hidden sm:inline text-xs font-mono text-amber-300 font-bold">
                  • cscdost.com
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 font-medium">
                Official Digital Citizen Notice Desk
              </p>
            </div>
          </div>

          {/* Department / Category Pill */}
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-1 ${theme.pillColor} font-black text-[10px] sm:text-xs rounded-lg shadow-sm border border-white/20 flex items-center gap-1`}>
              <span>{theme.orgIcon}</span>
              <span>{theme.deptBadge}</span>
            </span>
          </div>
        </div>

        {/* NOTIFICATION MAIN TITLE */}
        <div className="relative z-10 py-4 sm:py-5">
          {item.advertisementNo && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mb-2 bg-slate-900/80 border border-amber-400/60 rounded-md text-[11px] font-mono font-bold text-amber-300 shadow-xs">
              <span>📌</span>
              <span>{item.advertisementNo}</span>
            </div>
          )}
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            {item.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium line-clamp-2">
            {item.shortInfo}
          </p>
        </div>

        {/* 3 HIGHLIGHT METRICS TILES */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* Last Date Tile */}
          <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0 text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-red-200 uppercase tracking-wider">
                Last Date To Apply
              </p>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                {item.lastDate || 'Check Notification'}
              </p>
            </div>
          </div>

          {/* Total Posts Tile */}
          <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 text-white">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Vacancies / Posts
              </p>
              <p className="text-xs sm:text-sm font-black text-white truncate">
                {item.totalPosts || 'Open for All Eligible'}
              </p>
            </div>
          </div>

          {/* Eligibility Criteria Tile */}
          <div className="bg-blue-950/80 border border-blue-500/60 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Eligibility
              </p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {item.eligibility || 'Check Full Qualification Details'}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BRANDING FOOTER */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between text-[10px] sm:text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>cscdost.com (Authorized CSC Digital Seva Desk)</span>
          </div>
          <span className="text-white/80 font-sans font-semibold">
            👉 Apply Online & Track at cscdost.com
          </span>
        </div>
      </div>
    </div>
  );
}
