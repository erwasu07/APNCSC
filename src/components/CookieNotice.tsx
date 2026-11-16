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
      className="fixed bottom-[68px] lg:bottom-4 inset-x-3 lg:inset-x-auto lg:end-4 lg:max-w-md z-[60] bg-white dark:bg-[#111827] text-[#101A36] dark:text-slate-100 border border-[#CBD5E1] dark:border-slate-700 rounded-xl shadow-lg p-3.5 text-xs leading-relaxed"
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
            className="text-[#1F9D6B] dark:text-emerald-400 font-semibold underline"
          >
            Cookie &amp; Privacy Policy
          </a>
        </p>
        <button
          type="button"
          onClick={() => handleDismiss('dismissed')}
          aria-label="Close cookie notice"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2.5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleDismiss('accepted')}
          className="px-3.5 py-1.5 rounded-lg bg-[#101A36] hover:bg-[#1E2B4F] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
