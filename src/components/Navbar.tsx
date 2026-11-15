import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  cafeName: string;
  currentPath?: string;
  onOpenPrivacyPolicy?: (tab?: LegalTab) => void;
  onOpenAdmin?: () => void;
  onHomeClick?: () => void;
  onOpenNotificationCenter?: () => void;
  unreadNotificationCount?: number;
}

export default function Navbar({
  cafeName,
  onHomeClick,
  onOpenNotificationCenter,
  unreadNotificationCount = 0,
}: NavbarProps) {
  const { t } = useLanguage();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const quickSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && quickSearchOpen) {
        setQuickSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [quickSearchOpen]);

  useEffect(() => {
    if (quickSearchOpen) {
      setTimeout(() => quickSearchInputRef.current?.focus(), 40);
    }
  }, [quickSearchOpen]);

  const navigateToPath = (urlPath: string) => {
    setQuickSearchOpen(false);
    try {
      if (window.location.pathname !== urlPath || window.location.hash) {
        window.history.pushState(null, '', urlPath);
      }
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = urlPath;
    }
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleLogoClick = () => {
    setQuickSearchOpen(false);
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigateToPath('/');
    }
  };

  const handleSearchButtonClick = () => {
    const isHome = typeof window !== 'undefined' && window.location.pathname === '/';
    const inlineInput = document.getElementById('portal-inline-search-input');
    if (isHome && inlineInput) {
      inlineInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inlineInput.focus(), 80);
      return;
    }
    setQuickSearchOpen((prev) => !prev);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = headerSearch.trim();
    setQuickSearchOpen(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      navigateToPath('/');
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('csc-header-search', {
            detail: { query: trimmed, submit: true },
          })
        );
      }, 140);
    } else {
      window.dispatchEvent(
        new CustomEvent('csc-header-search', {
          detail: { query: trimmed, submit: true },
        })
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#111A2E] text-[#101A36] dark:text-white border-b border-[#E3E8F2] dark:border-[#283757] pt-[env(safe-area-inset-top)]">
      <div className="px-3 h-[54px] flex items-center justify-between gap-2">
        {/* Left: 30px rounded-9px blue-to-purple CD square + bold 17px CSC DOST */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          aria-label={`${cafeName || t.brandName} Home`}
          className="min-h-[40px] inline-flex items-center gap-2 no-underline rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
        >
          <span
            aria-hidden="true"
            className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-[#2455E6] to-[#7C3AED] text-white font-extrabold text-[12px] tracking-tight flex items-center justify-center shrink-0 shadow-xs"
          >
            CD
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-[#101A36] dark:text-white whitespace-nowrap">
            CSC DOST
          </span>
        </a>

        {/* Right: Two 34px rounded-10px soft-blue icon buttons (tap area >=40px) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleSearchButtonClick}
            aria-label={quickSearchOpen ? 'Close search' : 'Search portal'}
            aria-expanded={quickSearchOpen}
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-[10px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            <span className="w-[34px] h-[34px] rounded-[10px] bg-[#EEF2FF] dark:bg-[#1E2C4A] hover:bg-[#DFE7FF] dark:hover:bg-[#293B61] text-[#101A36] dark:text-white inline-flex items-center justify-center text-[15px] leading-none transition-colors">
              {quickSearchOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">🔍</span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenNotificationCenter) onOpenNotificationCenter();
            }}
            aria-label={
              unreadNotificationCount > 0
                ? `Notifications (${unreadNotificationCount} unread)`
                : 'Notifications'
            }
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-[10px] cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            <span className="w-[34px] h-[34px] rounded-[10px] bg-[#EEF2FF] dark:bg-[#1E2C4A] hover:bg-[#DFE7FF] dark:hover:bg-[#293B61] text-[#101A36] dark:text-white inline-flex items-center justify-center text-[15px] leading-none transition-colors relative">
              <span aria-hidden="true">🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -end-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#E5484D] text-white text-[9px] font-extrabold leading-none flex items-center justify-center tabular-nums">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Compact Quick Search Bar (for sub-pages) */}
      {quickSearchOpen && (
        <div className="border-t border-[#E3E8F2] dark:border-[#283757] bg-[#F4F6FB] dark:bg-[#0B1120] px-3 py-2">
          <form onSubmit={handleSearchSubmit} role="search" className="flex items-center gap-2">
            <label htmlFor="header-quick-search-input" className="sr-only">
              Search JKSSB, SSC, Aadhaar
            </label>
            <input
              ref={quickSearchInputRef}
              id="header-quick-search-input"
              type="search"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search JKSSB, SSC, Aadhaar…"
              className="flex-1 min-h-[40px] px-3 bg-white dark:bg-[#16213A] border border-[#E3E8F2] dark:border-[#283757] rounded-[10px] text-[13px] text-[#101A36] dark:text-white placeholder:text-[#5B6478] dark:placeholder:text-[#94A3B8] outline-none focus:border-[#2455E6]"
            />
            <button
              type="submit"
              className="min-h-[40px] px-4 rounded-[9px] bg-[#2455E6] hover:bg-[#1D4ED8] text-white text-[13px] font-bold shrink-0 cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
