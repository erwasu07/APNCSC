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
      className="fixed bottom-[calc(78px+env(safe-area-inset-bottom))] lg:bottom-4 inset-x-3 lg:inset-x-auto lg:end-4 lg:max-w-md z-[60] bg-white dark:bg-[#111827] text-[#101A36] dark:text-slate-100 border border-[#CBD5E1] dark:border-slate-700 rounded-xl shadow-lg p-3 text-xs leading-relaxed"
    >
      <div className="flex items-start gap-2.5">
        <p className="m-0 flex-1 text-[#334155] dark:text-slate-300">
          CSC DOST uses essential cookies and Google AdSense cookies to improve navigation and keep
          our guides free.{' '}
          <a
            href="/privacy-policy"
            onClick={(e) => {
              if (onOpenPrivacy && !e.metaKey && !e.ctrlKey && e.button === 0) {
                e.preventDefault();
                onOpenPrivacy();
              }
            }}
            className="text-[#1F9D6B] dark:text-emerald-400 font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6] rounded"
          >
            Cookie &amp; Privacy Policy
          </a>
        </p>
        <button
          type="button"
          onClick={() => handleDismiss('dismissed')}
          aria-label="Close cookie notice"
          className="min-w-[32px] min-h-[32px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleDismiss('accepted')}
          className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#101A36] hover:bg-[#1E2B4F] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
