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
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface NavbarProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: LegalTab) => void;
  onOpenAdmin?: () => void;
  onHomeClick?: () => void;
  onOpenNotificationCenter?: () => void;
  unreadNotificationCount?: number;
}

export default function Navbar({
  cafeName,
  onOpenAdmin,
  onHomeClick,
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const navigateToPath = (urlPath: string) => {
    setMobileMenuOpen(false);
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

  const navItems = [
    { id: 'jobs', href: '/jobs', label: t.catJobs, Icon: BriefcaseBusiness },
    { id: 'admissions', href: '/education', label: t.catAdmissions, Icon: GraduationCap },
    { id: 'schemes', href: '/schemes', label: t.catSchemes, Icon: ShieldCheck },
    { id: 'services', href: '/services', label: t.catServices, Icon: FileText },
    { id: 'tools', href: '/tools', label: t.catTools, Icon: Wrench },
  ];

  const langOptions: { code: Language; label: string; aria: string }[] = [
    { code: 'en', label: 'EN', aria: 'Switch language to English' },
    { code: 'hi', label: 'हिं', aria: 'Switch language to Hindi' },
    { code: 'ur', label: 'اردو', aria: 'Switch language to Urdu' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#101A36] text-white border-b border-white/15 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          aria-label={`${cafeName || t.brandName} Home`}
          className="flex items-center gap-2.5 shrink-0 no-underline rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
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

        {/* Desktop Primary Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                navigateToPath(item.href);
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-100 hover:bg-white/10 hover:text-[#F5A623] transition-colors whitespace-nowrap no-underline"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Compact Header Search (md+) */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="hidden md:flex items-center flex-1 max-w-xs bg-white/10 border border-white/20 focus-within:border-[#F5A623] focus-within:bg-white/15 rounded-lg px-2.5 h-9 transition-colors"
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

        {/* Right Controls: EN / हिं / اردو + Staff Login + Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
                  className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
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
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-[#F5A623]" aria-hidden="true" />
              <span className="hidden xl:inline">{t.staffLogin}</span>
            </button>
          )}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            className="lg:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

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
            className="relative z-10 w-[85%] max-w-[330px] h-full bg-[#101A36] text-white flex flex-col justify-between shadow-2xl border-s border-white/15 overflow-y-auto"
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
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogoClick();
                  }}
                  className="min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold text-white hover:bg-white/10 no-underline"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-[#F5A623]" aria-hidden="true" />
                    <span>{t.navHome}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                </a>

                {navItems.map((item) => {
                  const IconComponent = item.Icon;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateToPath(item.href);
                      }}
                      className="min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold text-white hover:bg-white/10 no-underline"
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
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPath('/education/ignou');
                  }}
                  className="min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold text-white hover:bg-white/10 no-underline"
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-[#F5A623]" aria-hidden="true" />
                    <span>{t.ignouShortcut}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                </a>

                <a
                  href="/calculators"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPath('/calculators');
                  }}
                  className="min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold text-white hover:bg-white/10 no-underline"
                >
                  <span className="flex items-center gap-3">
                    <Wrench className="w-5 h-5 text-[#F5A623]" aria-hidden="true" />
                    <span>{t.calculatorsShortcut}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 rtl:rotate-180" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="p-4 border-t border-white/15 space-y-2.5">
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
