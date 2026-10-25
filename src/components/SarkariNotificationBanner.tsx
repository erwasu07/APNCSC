import React from 'react';
import { 
  Calendar, 
  Users, 
  GraduationCap, 
  ArrowRight,
  Shield,
  Building2,
  FileText
} from 'lucide-react';
import { SarkariItem } from '../data/sarkariData';

interface SarkariNotificationBannerProps {
  item: SarkariItem;
  className?: string;
  onApply?: () => void;
  onViewDetails?: () => void;
}

export default function SarkariNotificationBanner({
  item,
  className = '',
  onApply,
  onViewDetails
}: SarkariNotificationBannerProps) {
  // Category metadata & subtle badge mapping
  const getCategoryMeta = (category: string) => {
    switch (category) {
      case 'army_jobs':
        return {
          badge: 'DEFENCE RECRUITMENT',
          orgPrefix: 'INDIAN ARMY',
          icon: Shield
        };
      case 'rrb_jobs':
        return {
          badge: 'INDIAN RAILWAYS',
          orgPrefix: 'RRB',
          icon: Building2
        };
      case 'ssc_jobs':
        return {
          badge: 'CENTRAL GOVT (SSC)',
          orgPrefix: 'SSC',
          icon: Building2
        };
      case 'jkssb':
        return {
          badge: 'UT J&K CADRE',
          orgPrefix: 'JKSSB',
          icon: FileText
        };
      case 'exam_forms':
        return {
          badge: 'EXAM NOTICES',
          orgPrefix: 'KU EXAM',
          icon: FileText
        };
      case 'admissions':
        return {
          badge: 'ADMISSIONS',
          orgPrefix: 'ACADEMIC',
          icon: GraduationCap
        };
      case 'cluster_univ':
        return {
          badge: 'CLUSTER UNIVERSITY',
          orgPrefix: 'CUS',
          icon: GraduationCap
        };
      default:
        return {
          badge: 'RECRUITMENT',
          orgPrefix: 'CSC DOST',
          icon: FileText
        };
    }
  };

  const meta = getCategoryMeta(item.category);

  // Clean eyebrow label (e.g. "JKSSB • ADVT 09 OF 2026")
  const getEyebrow = () => {
    if (!item.advertisementNo) return null;
    const cleanAdvt = item.advertisementNo.trim();
    if (cleanAdvt.toUpperCase().includes(meta.orgPrefix.toUpperCase())) {
      return cleanAdvt;
    }
    return `${meta.orgPrefix} • ${cleanAdvt}`;
  };

  const eyebrow = getEyebrow();

  // CTA interaction handler
  const handleCtaClick = (e: React.MouseEvent) => {
    if (onApply) {
      e.stopPropagation();
      onApply();
      return;
    }
    if (onViewDetails) {
      e.stopPropagation();
      onViewDetails();
      return;
    }
    const summaryTable = document.getElementById('summary-table');
    if (summaryTable) {
      summaryTable.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (item.officialLink) {
      window.open(item.officialLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={className}>
      {/* Modern Information-Portal Card (Deep Navy #101A36) */}
      <div 
        id={`sarkari-thumbnail-card-${item.id}`}
        data-card-id={item.id}
        className="relative overflow-hidden rounded-2xl border border-[#243356] bg-[#101A36] text-white p-4 sm:p-6 md:p-7 shadow-lg transition-all duration-200 font-sans"
      >
        {/* Subtle decorative background texture (micro dot grid for depth) */}
        <div 
          aria-hidden="true" 
          className="absolute inset-0 bg-[radial-gradient(#1E2C52_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40" 
        />

        {/* Subtle top edge accent highlight */}
        <div 
          aria-hidden="true" 
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#155EEF]/50 to-transparent" 
        />

        {/* ================================================================ */}
        {/* COMPACT HEADER: CSC DOST Logo & Brand + Subtle Category Badge   */}
        {/* ================================================================ */}
        <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-[#1E2C52]">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* CSC DOST Mark */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#155EEF] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 tracking-tight">
              CSC
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                  CSC DOST
                </span>
                <span className="text-[11px] font-mono text-[#F4B400] font-semibold hidden xs:inline">
                  • cscdost.com
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#B8C2D6] font-medium leading-none mt-0.5 truncate">
                Official Digital Citizen Notice Desk
              </p>
            </div>
          </div>

          {/* Subtle Category Badge */}
          <div className="shrink-0">
            <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-[#182649] text-[#93B4FF] border border-[#2B3E6E] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#155EEF]" />
              <span>{meta.badge}</span>
            </span>
          </div>
        </div>

        {/* ================================================================ */}
        {/* MAIN BODY: Eyebrow + Strong Post Title + 2-Line Description      */}
        {/* ================================================================ */}
        <div className="relative z-10 pt-4 sm:pt-5 pb-1">
          {/* Eyebrow Label (e.g. JKSSB • ADVT 09 OF 2026) */}
          {eyebrow && (
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#F4B400] mb-2.5">
              <span className="px-2 py-0.5 rounded bg-[#182649] border border-[#2B3E6E] text-[10px] sm:text-[11px] tracking-wide uppercase">
                {eyebrow}
              </span>
              {item.isNew && (
                <span className="px-1.5 py-0.5 rounded bg-[#155EEF]/20 text-[#93B4FF] border border-[#155EEF]/40 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                  NEW
                </span>
              )}
            </div>
          )}

          {/* Dominant Post Title */}
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-[26px] font-extrabold text-white leading-snug tracking-tight">
            {item.title}
          </h2>

          {/* Supporting Short Description (Truncated cleanly to ~2 lines) */}
          {item.shortInfo && (
            <p className="text-xs sm:text-sm text-[#B8C2D6] mt-2.5 leading-relaxed line-clamp-2 max-w-3xl font-normal">
              {item.shortInfo}
            </p>
          )}
        </div>

        {/* ================================================================ */}
        {/* THREE COMPACT INFORMATION TILES: Last Date, Vacancies, Criteria  */}
        {/* ================================================================ */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-[#1E2C52]">
          {/* Tile 1: Last Date (Primary blue tint) */}
          <div className="bg-[#142145] border border-[#243356] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#155EEF]/15 text-[#93B4FF] border border-[#155EEF]/30 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#B8C2D6] uppercase tracking-wider block">
                Last Date
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
                {item.lastDate || 'Refer Notice'}
              </span>
            </div>
          </div>

          {/* Tile 2: Vacancies (Subtle green tint for positive availability) */}
          <div className="bg-[#142145] border border-[#243356] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#B8C2D6] uppercase tracking-wider block">
                Vacancies
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block mt-0.5">
                {item.totalPosts || 'Open for Eligible'}
              </span>
            </div>
          </div>

          {/* Tile 3: Eligibility (Subtle cyan/light blue tint) */}
          <div className="bg-[#142145] border border-[#243356] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#B8C2D6] uppercase tracking-wider block">
                Eligibility
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block mt-0.5" title={item.eligibility}>
                {item.eligibility || 'Check Qualification'}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* COMPACT FOOTER / ACTION: CSC DOST • cscdost.com + CTA           */}
        {/* ================================================================ */}
        <div className="relative z-10 mt-4 pt-3.5 border-t border-[#1E2C52] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Domain & Identity */}
          <div className="flex items-center gap-2 text-xs text-[#B8C2D6]">
            <span className="font-semibold text-white">CSC DOST</span>
            <span className="text-[#2B3E6E]">•</span>
            <span className="text-[#F4B400] font-mono font-medium">cscdost.com</span>
          </div>

          {/* Right: Clear, Proportional CTA */}
          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#155EEF] hover:bg-[#1048b8] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF]"
          >
            <span>Apply Online / View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
