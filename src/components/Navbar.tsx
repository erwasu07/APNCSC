import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Lock,
  Search,
  Home,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  FileText,
  Wrench,
  Calculator,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';
import { useLanguage, Language } from '../contexts/LanguageContext';

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
  currentPath,
  onOpenAdmin,
  onHomeClick,
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [pathname, setPathname] = useState<string>(() => {
    if (currentPath) return currentPath;
    if (typeof window !== 'undefined') return window.location.pathname || '/';
    return '/';
  });
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentPath) {
      setPathname(currentPath);
    }
  }, [currentPath]);

  useEffect(() => {
    const syncPath = () => {
      try {
        setPathname(window.location.pathname || '/');
      } catch {}
    };
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        } else if (mobileSearchOpen) {
          setMobileSearchOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, mobileSearchOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 40);
    }
  }, [mobileSearchOpen]);

  const navigateToPath = (urlPath: string) => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setPathname(urlPath);
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
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setPathname('/');
    try {
      if (window.location.pathname !== '/' || window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } catch {}
    if (onHomeClick) {
      onHomeClick();
    } else {
      navigateToPath('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = headerSearch.trim();
    setMobileSearchOpen(false);
    if (window.location.pathname !== '/') {
      navigateToPath('/');
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('csc-header-search', { detail: { query: trimmed, submit: true } })
        );
      }, 120);
    } else {
      window.dispatchEvent(
        new CustomEvent('csc-header-search', { detail: { query: trimmed, submit: true } })
      );
      const heroInput = document.getElementById('portal-inline-search-input');
      if (heroInput) {
        heroInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const isNavItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/jobs') return pathname === '/jobs' || pathname.startsWith('/post/');
    if (href === '/education') return pathname.startsWith('/education');
    if (href === '/schemes') return pathname === '/schemes' || pathname.startsWith('/scheme/');
    if (href === '/services') return pathname === '/services' || pathname.startsWith('/service/');
    if (href === '/tools') return pathname === '/tools' || pathname.startsWith('/tools/');
    if (href === '/calculators') return pathname.startsWith('/calculators');
    return pathname === href;
  };

  // Strict 7-item primary navigation
  const navItems = [
    { id: 'home', href: '/', label: t.navHome, Icon: Home },
    { id: 'jobs', href: '/jobs', label: t.navJobs, Icon: BriefcaseBusiness },
    { id: 'education', href: '/education', label: t.navEducation, Icon: GraduationCap },
    { id: 'schemes', href: '/schemes', label: t.navSchemes, Icon: ShieldCheck },
    { id: 'services', href: '/services', label: t.navServices, Icon: FileText },
    { id: 'tools', href: '/tools', label: t.navTools, Icon: Wrench },
    { id: 'calculators', href: '/calculators', label: t.navCalculators, Icon: Calculator },
  ];

  const langOptions: { code: Language; label: string; aria: string }[] = [
    { code: 'en', label: 'EN', aria: 'Switch language to English' },
    { code: 'hi', label: 'हिं', aria: 'Switch language to Hindi' },
    { code: 'ur', label: 'اردو', aria: 'Switch language to Urdu' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-header)] text-white border-b border-white/15 shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          aria-label={`${cafeName || t.brandName} Home`}
          className="min-h-[44px] flex items-center gap-2 shrink-0 no-underline rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
        >
          <img
            src="/csc-dost-header-logo.png"
            alt=""
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white p-0.5 object-contain shrink-0"
          />
          <div className="leading-none text-start">
            <span className="text-base md:text-lg font-extrabold tracking-tight text-white block whitespace-nowrap">
              CSC <span className="text-[#F5A623]">DOST</span>
            </span>
            <span className="hidden sm:block text-[11px] text-slate-300 font-medium mt-0.5 whitespace-nowrap">
              {t.brandSubtitle}
            </span>
          </div>
        </a>

        {/* Desktop 7-Item Primary Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0"
        >
          {navItems.map((item) => {
            const active = isNavItemActive(item.href);
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.href === '/') {
                    handleLogoClick();
                  } else {
                    navigateToPath(item.href);
                  }
                }}
                className={`min-h-[40px] inline-flex items-center px-2 xl:px-2.5 py-2 rounded-lg text-[13px] xl:text-sm font-semibold transition-colors whitespace-nowrap no-underline ${
                  active
                    ? 'bg-white/15 text-[#F5A623] shadow-2xs'
                    : 'text-slate-100 hover:bg-white/10 hover:text-[#F5A623]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Compact Header Search (md+) */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden md:flex items-center flex-1 max-w-[210px] xl:max-w-[240px] bg-white/10 border border-white/20 focus-within:border-[#F5A623] focus-within:bg-white/15 rounded-lg px-2.5 h-10 transition-colors"
        >
          <Search className="w-4 h-4 text-slate-300 shrink-0 me-2" aria-hidden="true" />
          <label htmlFor="header-search-input" className="sr-only">
            {t.searchPlaceholder}
          </label>
          <input
            id="header-search-input"
            type="search"
            value={headerSearch}
            onChange={(e) => {
              const val = e.target.value;
              setHeaderSearch(val);
              if (window.location.pathname === '/') {
                window.dispatchEvent(
                  new CustomEvent('csc-header-search', { detail: { query: val } })
                );
              }
            }}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-300 outline-none border-none"
          />
        </form>

        {/* Right Controls: Mobile Search + EN / हिं / اردو + Staff Login + Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Search portal'}
            aria-expanded={mobileSearchOpen}
            className="md:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
          >
            {mobileSearchOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Search className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center bg-[#0B1226] border border-white/15 rounded-lg p-0.5"
          >
            {langOptions.map((opt) => {
              const active = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  aria-label={opt.aria}
                  aria-pressed={active}
                  className={`min-h-[36px] min-w-[34px] px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#F5A623] text-[#101A36]'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              title={t.staffLogin}
              aria-label={t.staffLogin}
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[40px] px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-[#F5A623]" aria-hidden="true" />
              <span className="hidden 2xl:inline">{t.staffLogin}</span>
            </button>
          )}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Expandable Compact Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-white/15 bg-[#0B1226] px-3 py-2">
          <form onSubmit={handleSearchSubmit} role="search" className="flex items-center gap-2">
            <label htmlFor="mobile-header-search-input" className="sr-only">
              {t.searchPlaceholder}
            </label>
            <div className="flex items-center flex-1 bg-white/10 border border-white/20 focus-within:border-[#F5A623] rounded-lg px-3 min-h-[44px]">
              <Search className="w-4 h-4 text-slate-300 shrink-0 me-2" aria-hidden="true" />
              <input
                ref={mobileSearchInputRef}
                id="mobile-header-search-input"
                type="search"
                value={headerSearch}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeaderSearch(val);
                  if (window.location.pathname === '/') {
                    window.dispatchEvent(
                      new CustomEvent('csc-header-search', { detail: { query: val } })
                    );
                  }
                }}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-base text-white placeholder:text-slate-300 outline-none border-none"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-lg bg-[#F5A623] text-[#101A36] text-sm font-bold shrink-0 cursor-pointer"
            >
              {t.searchButton}
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-[#101A36]/70 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <nav
            aria-label="Mobile Menu"
            className="relative z-10 w-[85%] max-w-[330px] h-full bg-[var(--bg-header)] text-white flex flex-col justify-between shadow-2xl border-s border-white/15 overflow-y-auto"
          >
            <div>
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/15">
                <span className="text-base font-extrabold tracking-tight">
                  CSC <span className="text-[#F5A623]">DOST</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    mobileMenuButtonRef.current?.focus();
                  }}
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-3 space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.Icon;
                  const active = isNavItemActive(item.href);
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.href === '/') {
                          handleLogoClick();
                        } else {
                          navigateToPath(item.href);
                        }
                      }}
                      className={`min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold no-underline transition-colors ${
                        active
                          ? 'bg-white/15 text-[#F5A623]'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-[#F5A623]" aria-hidden="true" />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                    </a>
                  );
                })}

                <a
                  href="/education/ignou"
                  aria-current={pathname === '/education/ignou' ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPath('/education/ignou');
                  }}
                  className={`min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold no-underline transition-colors ${
                    pathname === '/education/ignou'
                      ? 'bg-white/15 text-[#F5A623]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#F5A623]" aria-hidden="true" />
                    <span>{t.ignouShortcut}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-white/15 space-y-2.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <a
                href="/track"
                onClick={(e) => {
                  e.preventDefault();
                  navigateToPath('/track');
                }}
                className="min-h-[44px] w-full px-4 py-2.5 bg-[#1F9D6B] hover:bg-[#178257] text-white rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 no-underline"
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{t.trackButton}</span>
              </a>

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="min-h-[44px] w-full px-4 py-2.5 bg-white text-[#101A36] rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" aria-hidden="true" />
                  <span>{t.staffLogin}</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
