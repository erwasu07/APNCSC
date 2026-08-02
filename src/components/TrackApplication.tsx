import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import TrackApplicationModal from './TrackApplicationModal';

interface TrackApplicationProps {
  initialTokenId?: string;
}

export default function TrackApplication({ initialTokenId = '' }: TrackApplicationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeToken, setActiveToken] = useState(initialTokenId || 'APEX-2026');

  useEffect(() => {
    if (initialTokenId) {
      setActiveToken(initialTokenId);
    }
  }, [initialTokenId]);

  return (
    <div id="track-application-section" className="w-full sm:w-auto shrink-0 self-start md:self-auto">
      {/* Space-Saving Compact Track Order Pill / Badge (Image 2 Style) */}
      <div className="bg-[#10172a] text-white rounded-2xl p-2.5 px-3.5 shadow-md border border-slate-800 hover:border-amber-500/50 transition-all group">
        <div className="flex items-center justify-between gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 text-left flex items-center gap-2.5 cursor-pointer group-hover:opacity-95"
            title="Click to open application live tracking popup modal"
          >
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shrink-0 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-white font-display">
                  TRACK ORDER
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live</span>
                </span>
              </div>
              <p className="text-[10px] text-amber-300 font-mono font-bold truncate">
                Form Ref: <span className="underline decoration-amber-400/50">{activeToken || 'CSC-2026-v4'}</span>
              </p>
            </div>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Track</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* RESPONSIVE TRACKING DETAILS POPUP MODAL */}
      <TrackApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTokenId={activeToken}
      />
    </div>
  );
}
