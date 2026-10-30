import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Bell, Users, CheckCircle2 } from 'lucide-react';

export const OFFICIAL_WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g';

interface WhatsAppChannelPopupProps {
  postTitle?: string;
  autoOpenDelayMs?: number;
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 3.67C14.24 3.67 16.31 4.53 17.87 6.09C19.42 7.64 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16C10.67 20.16 9.32 19.8 8.14 19.1L7.86 18.93L4.74 19.75L5.57 16.71L5.38 16.41C4.62 15.01 4.22 13.48 4.22 11.91C4.22 7.37 7.92 3.67 12.04 3.67ZM8.97 7.37C8.76 7.37 8.42 7.45 8.13 7.76C7.84 8.08 7.02 8.85 7.02 10.41C7.02 11.97 8.16 13.47 8.32 13.68C8.48 13.89 10.53 17.06 13.69 18.42C14.44 18.74 15.03 18.93 15.48 19.07C16.24 19.31 16.92 19.28 17.47 19.2C18.08 19.11 19.34 18.44 19.6 17.71C19.86 16.98 19.86 16.36 19.78 16.23C19.7 16.1 19.5 16.02 19.19 15.86C18.88 15.71 17.37 14.96 17.09 14.86C16.8 14.76 16.6 14.71 16.39 15.02C16.19 15.33 15.6 16.02 15.42 16.23C15.24 16.44 15.06 16.46 14.75 16.31C14.44 16.15 13.45 15.83 12.28 14.78C11.37 13.97 10.75 12.96 10.58 12.65C10.4 12.34 10.56 12.18 10.72 12.02C10.86 11.88 11.03 11.66 11.19 11.48C11.35 11.29 11.4 11.16 11.51 10.95C11.61 10.74 11.56 10.56 11.48 10.41C11.4 10.25 10.8 8.78 10.54 8.19C10.29 7.6 10.04 7.68 9.85 7.67C9.67 7.66 9.47 7.66 9.26 7.66C9.05 7.66 8.71 7.74 8.42 8.05C8.13 8.36 7.31 9.13 7.31 10.69C7.31 12.25 8.45 13.75 8.61 13.96L8.97 7.37Z" />
    </svg>
  );
}

export default function WhatsAppChannelPopup({
  postTitle,
  autoOpenDelayMs = 1200,
}: WhatsAppChannelPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show after slight delay to allow page content to render smoothly
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('csc_wa_channel_popup_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, autoOpenDelayMs);

    return () => clearTimeout(timer);
  }, [autoOpenDelayMs]);

  const handleClose = () => {
    setIsVisible(false);
    setHasInteracted(true);
    sessionStorage.setItem('csc_wa_channel_popup_dismissed', 'true');
  };

  const handleJoin = () => {
    setIsVisible(false);
    setHasInteracted(true);
    sessionStorage.setItem('csc_wa_channel_popup_dismissed', 'true');
    window.open(OFFICIAL_WHATSAPP_CHANNEL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 1. Modal Overlay & Popup Card */}
      {isVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wa-channel-popup-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-[#25D366] via-emerald-500 to-[#128C7E]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close WhatsApp Channel invitation"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Header with WhatsApp badge */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#25D366] border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                  <WhatsAppIcon className="w-7 h-7 fill-[#25D366]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Official Channel
                    </span>
                  </div>
                  <h3
                    id="wa-channel-popup-title"
                    className="text-lg font-bold text-slate-900 leading-snug mt-0.5 truncate"
                  >
                    Join WhatsApp Channel Now
                  </h3>
                </div>
              </div>

              {/* Context Pill if reading a specific post */}
              {postTitle && (
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium line-clamp-2">
                  <span className="font-semibold text-slate-900">Current Update:</span> {postTitle}
                </div>
              )}

              {/* Benefit statement */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Get instant official updates for <strong>Government Jobs</strong>, <strong>JKSSB</strong>, <strong>Indian Army</strong>, <strong>SSC</strong>, <strong>Kashmir University</strong>, and <strong>Cluster University</strong> notifications directly on your phone!
              </p>

              {/* Feature Points */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Real-Time Job Alerts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Date Sheets &amp; Results</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Admit Card Links</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>100% Free &amp; Verified</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleJoin}
                  className="w-full sm:flex-1 min-h-[46px] px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] active:bg-[#1DA851] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Join WhatsApp Channel Now</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>

              {/* Member count subtext */}
              <div className="text-center pt-1 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Join thousands of active students and job seekers</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Persistent Quick-Access Button (Bottom Right) */}
      {!isVisible && (
        <aside
          aria-label="Join WhatsApp Channel"
          className="fixed bottom-5 right-5 z-40 animate-fade-in"
        >
          <a
            href={OFFICIAL_WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all border border-emerald-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold pr-1 hidden sm:inline">
              Join WhatsApp Channel
            </span>
            <span className="text-xs font-bold pr-1 sm:hidden">
              Join Channel
            </span>
          </a>
        </aside>
      )}
    </>
  );
}

/**
 * In-Article WhatsApp Channel Call-to-Action Card for post bodies.
 */
export function WhatsAppChannelInPostCard({ postTitle }: { postTitle?: string }) {
  return (
    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <WhatsAppIcon className="w-6 h-6 fill-white" />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <Bell className="w-3 h-3 text-emerald-700" />
              Instant Alerts
            </span>
            <span className="text-xs text-emerald-700 font-semibold">100% Free</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            Get Daily Recruitment &amp; Exam Updates on WhatsApp
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Join the official CSC DOST WhatsApp Channel for direct links to Admit Cards, Application Deadlines, and Results.
          </p>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center w-full sm:w-auto">
        <a
          href={OFFICIAL_WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-center"
        >
          <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
          <span>Join WhatsApp Channel Now</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      </div>
    </div>
  );
}
