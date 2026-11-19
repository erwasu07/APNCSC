import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'csc_cookie_consent';

interface CookieNoticeProps {
  onOpenPrivacy?: () => void;
}

export default function CookieNotice({ onOpenPrivacy }: CookieNoticeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // Ignore storage failures in restricted environments
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleDismiss('dismissed');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const handleDismiss = (choice: 'accepted' | 'dismissed') => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, `${choice}:${new Date().toISOString().slice(0, 10)}`);
    } catch {
      // Ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie notice"
      className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] text-[#101A36] dark:text-slate-100 border-b border-[#CBD5E1] dark:border-slate-700"
    >
      <div className="max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs leading-snug">
        <p className="m-0 min-w-0 flex-1 text-[#334155] dark:text-slate-300">
          CSC DOST uses essential browser storage and third-party Google AdSense cookies. Manage
          cookie preferences in your browser settings or read our{' '}
          <a
            href="/privacy-policy"
            onClick={(e) => {
              if (onOpenPrivacy && !e.metaKey && !e.ctrlKey && e.button === 0) {
                e.preventDefault();
                onOpenPrivacy();
              }
            }}
            className="text-[#1F9D6B] dark:text-emerald-400 font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6] rounded"
          >
            Privacy &amp; Cookie Policy
          </a>
          .
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleDismiss('accepted')}
            className="min-h-[34px] px-3 py-1 rounded-md bg-[#101A36] hover:bg-[#1E2B4F] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={() => handleDismiss('dismissed')}
            aria-label="Dismiss cookie notice"
            className="min-w-[34px] min-h-[34px] inline-flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
