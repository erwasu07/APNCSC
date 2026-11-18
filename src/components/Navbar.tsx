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
  currentPath = '/',
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
      const currentFull = `${window.location.pathname}${window.location.search}`;
      if (currentFull !== urlPath || window.location.hash) {
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

  const currentSearch =
    typeof window !== 'undefined' ? window.location.search.toLowerCase() : '';

  const desktopNavItems: { label: string; href: string; isActive: boolean }[] = [
    {
      label: 'Home',
      href: '/',
      isActive: currentPath === '/',
    },
    {
      label: 'Jobs',
      href: '/jobs',
      isActive:
        currentPath === '/jobs' &&
        !currentSearch.includes('tab=exams') &&
        !currentSearch.includes('tab=results'),
    },
    {
      label: 'Admit Card',
      href: '/jobs?tab=exams',
      isActive: currentPath === '/jobs' && currentSearch.includes('tab=exams'),
    },
    {
      label: 'Results',
      href: '/jobs?tab=results',
      isActive: currentPath === '/jobs' && currentSearch.includes('tab=results'),
    },
    {
      label: 'Admissions',
      href: '/education',
      isActive: currentPath.startsWith('/education'),
    },
    {
      label: 'Services',
      href: '/services',
      isActive: currentPath === '/services' || currentPath.startsWith('/service/'),
    },
    {
      label: 'Tools',
      href: '/tools',
      isActive: currentPath.startsWith('/tools') || currentPath === '/calculators',
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#111A2E] text-[#101A36] dark:text-white border-b border-[#E3E8F2] dark:border-[#283757] pt-[env(safe-area-inset-top)]">
      <div className="max-w-[1180px] mx-auto px-3 sm:px-4 lg:px-6 h-[54px] lg:h-[64px] flex items-center justify-between gap-2 lg:gap-6">
        {/* Left: 30px rounded-9px blue-to-purple CD square + bold 17px CSC DOST */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          aria-label={`${cafeName || t.brandName} Home`}
          className="min-h-[40px] inline-flex items-center gap-2 no-underline rounded-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
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

        {/* Middle (Desktop >=1024px): Horizontal Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center justify-center gap-5 xl:gap-6 min-w-0"
        >
          {desktopNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigateToPath(item.href);
              }}
              aria-current={item.isActive ? 'page' : undefined}
              className={`min-h-[40px] inline-flex items-center text-[13.5px] font-semibold whitespace-nowrap shrink-0 no-underline border-b-2 transition-colors ${
                item.isActive
                  ? 'text-[#2455E6] dark:text-[#60A5FA] border-[#2455E6] dark:border-[#60A5FA]'
                  : 'text-[#101A36] dark:text-slate-200 border-transparent hover:text-[#2455E6] dark:hover:text-[#60A5FA]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right: Search + Mobile Bell OR Desktop Join Alerts */}
        <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSearchButtonClick}
            aria-label={quickSearchOpen ? 'Close search' : 'Search portal'}
            aria-expanded={quickSearchOpen}
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-[10px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            <span className="w-[34px] h-[34px] lg:w-[38px] lg:h-[38px] rounded-[10px] bg-[#EEF2FF] dark:bg-[#1E2C4A] hover:bg-[#DFE7FF] dark:hover:bg-[#293B61] text-[#101A36] dark:text-white inline-flex items-center justify-center text-[15px] leading-none transition-colors">
              {quickSearchOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <span aria-hidden="true">🔍</span>
              )}
            </span>
          </button>

          {/* Mobile/Tablet Notification Bell */}
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
            className="lg:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-[10px] cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
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

          {/* Desktop Join Alerts CTA */}
          <button
            type="button"
            onClick={() => {
              if (onOpenNotificationCenter) onOpenNotificationCenter();
            }}
            className="hidden lg:inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 rounded-[10px] bg-[#2455E6] hover:bg-[#1D4ED8] text-white text-[13px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6]"
          >
            <span aria-hidden="true">🔔</span>
            <span>Join Alerts</span>
            {unreadNotificationCount > 0 && (
              <span className="ms-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-[#101A36] text-[10px] font-extrabold inline-flex items-center justify-center leading-none tabular-nums">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Compact Quick Search Bar */}
      {quickSearchOpen && (
        <div className="border-t border-[#E3E8F2] dark:border-[#283757] bg-[#F4F6FB] dark:bg-[#0B1120] px-3 sm:px-4 lg:px-6 py-2">
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="max-w-[1180px] mx-auto flex items-center gap-2"
          >
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
      {/* Persistent Non-Government Disclosure Strip on Every Page */}
      <div className="min-h-[28px] flex items-center border-t border-[#E3E8F2] dark:border-[#283757] bg-[#F8FAFC] dark:bg-[#0D1426] px-3 sm:px-4 lg:px-6 py-1">
        <div className="w-full max-w-[1180px] mx-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[11px] text-[#475569] dark:text-slate-300 leading-tight">
          <span>
            Independent citizen portal &mdash; <strong className="text-[#101A36] dark:text-white">not</strong> an official government website.
          </span>
          <a
            href="/disclaimer"
            onClick={(e) => {
              e.preventDefault();
              navigateToPath('/disclaimer');
            }}
            className="font-semibold text-[#2455E6] dark:text-[#60A5FA] hover:underline whitespace-nowrap"
          >
            Read Disclaimer &rarr;
          </a>
        </div>
      </div>
    </header>
  );
}
