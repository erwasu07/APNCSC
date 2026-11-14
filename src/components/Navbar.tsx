import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Lock,
  FileText,
  BriefcaseBusiness,
  UsersRound,
  GraduationCap,
  Wrench,
  Home,
  Compass,
  ChevronRight,
  Bell,
  Calculator,
} from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';

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
  onOpenNotificationCenter,
  unreadNotificationCount = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Prevent background page scroll while mobile navigation drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
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

  const handleOpenTools = () => navigateToPath('/tools');
  const handleTrackApplication = () => navigateToPath('/track');

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
      try {
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    }
  };

  const navItems = [
    {
      id: 'jobs-recruitment',
      href: '/jobs',
      line1: 'Jobs &',
      line2: 'Recruitment',
      fullLabel: 'Jobs & Recruitment',
      Icon: BriefcaseBusiness,
      onClick: () => navigateToPath('/jobs'),
    },
    {
      id: 'education-admissions',
      href: '/education',
      line1: 'Education &',
      line2: 'Admissions',
      fullLabel: 'Education & Admissions',
      Icon: GraduationCap,
      onClick: () => navigateToPath('/education'),
    },
    {
      id: 'government-schemes',
      href: '/schemes',
      line1: 'Government',
      line2: 'Schemes',
      fullLabel: 'Government Schemes',
      Icon: UsersRound,
      onClick: () => navigateToPath('/schemes'),
    },
    {
      id: 'csc-e-services',
      href: '/services',
      line1: 'CSC',
      line2: 'E-Services',
      fullLabel: 'CSC E-Services',
      Icon: FileText,
      onClick: () => navigateToPath('/services'),
    },
    {
      id: 'document-tools',
      href: '/tools',
      line1: 'Document',
      line2: 'Tools',
      fullLabel: 'Document Tools',
      Icon: Wrench,
      onClick: handleOpenTools,
    },
    {
      id: 'citizen-calculators',
      href: '/calculators',
      line1: 'Citizen',
      line2: 'Calculators',
      fullLabel: 'Citizen Calculators',
      Icon: Calculator,
      onClick: () => navigateToPath('/calculators'),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#CFD9E8] shadow-[0_3px_12px_rgba(6,69,143,0.12)]">
      {/* ================================================================== */}
      {/* DESKTOP SINGLE-ROW HEADER (>= 1024px)                              */}
      {/* ================================================================== */}
      <div className="hidden lg:block relative w-full h-[86px] xl:h-[96px] 2xl:h-[112px] overflow-hidden select-none">
        {/* Precision Multi-Layer SVG Curved Background (Matches 1917x118 Reference) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1917 118"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Center Dark-to-Bright Blue Horizontal Navigation Gradient */}
            <linearGradient id="cscNavBlueGrad" x1="270" y1="0" x2="1650" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0874DC" />
              <stop offset="12%" stopColor="#0767C6" />
              <stop offset="30%" stopColor="#0557AF" />
              <stop offset="52%" stopColor="#024EA0" />
              <stop offset="78%" stopColor="#045BB3" />
              <stop offset="94%" stopColor="#0665C2" />
              <stop offset="100%" stopColor="#0D7EF2" />
            </linearGradient>

            {/* Left Bright-Blue Curved Accent Ribbon Gradient */}
            <linearGradient id="cscLeftRibbonGrad" x1="279" y1="0" x2="415" y2="118" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1399F8" />
              <stop offset="50%" stopColor="#0E93F7" />
              <stop offset="100%" stopColor="#0B84F0" />
            </linearGradient>

            {/* Left White-to-Light-Blue Branding Background Gradient */}
            <linearGradient id="cscLeftBrandGrad" x1="0" y1="0" x2="380" y2="118" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F9FBFF" />
              <stop offset="60%" stopColor="#F4F8FE" />
              <stop offset="100%" stopColor="#ECF3FC" />
            </linearGradient>

            {/* Right Top Lip Bright-Blue Transition Gradient */}
            <linearGradient id="cscRightLipGrad" x1="1540" y1="0" x2="1917" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0E7DF2" />
              <stop offset="50%" stopColor="#0E8DF7" />
              <stop offset="100%" stopColor="#0D96FB" />
            </linearGradient>

            {/* Right Action Section Soft Light-Blue to White Gradient */}
            <linearGradient id="cscRightActionGrad" x1="1490" y1="60" x2="1917" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#CCE4FE" />
              <stop offset="28%" stopColor="#DAEBFD" />
              <stop offset="65%" stopColor="#EAF3FE" />
              <stop offset="100%" stopColor="#F7FAFF" />
            </linearGradient>
          </defs>

          {/* 1. Base Center Blue Navigation Fill */}
          <rect x="0" y="0" width="1917" height="118" fill="url(#cscNavBlueGrad)" />

          {/* 2. Left Bright-Blue Accent Curve Layer */}
          <path
            d="M 0,0 L 306,0 C 338,3 355,28 369,60 C 381,90 392,113 422,118 L 0,118 Z"
            fill="url(#cscLeftRibbonGrad)"
          />

          {/* 3. Left White/Light-Blue Branding Curve Layer */}
          <path
            d="M 0,0 L 276,0 C 314,3 333,28 346,60 C 358,90 370,113 402,118 L 0,118 Z"
            fill="url(#cscLeftBrandGrad)"
          />

          {/* 4. Right Bright-Blue Top Lip & Curved Wave Layer */}
          <path
            d="M 1612,0 L 1917,0 L 1917,118 L 1476,118 C 1508,112 1524,86 1538,56 C 1552,24 1576,3 1612,0 Z"
            fill="url(#cscRightLipGrad)"
          />

          {/* 5. Right Soft Light-Blue/White Action Panel Curved Layer */}
          <path
            d="M 1917,17 L 1606,17 C 1572,17 1558,25 1548,50 C 1536,80 1518,112 1480,118 L 1917,118 Z"
            fill="url(#cscRightActionGrad)"
          />
        </svg>

        {/* Foreground Interactive Header Content (Aligned to the 3 Curved Sections) */}
        <div className="relative z-10 w-full h-full grid grid-cols-[20.2%_60.1%_19.7%] items-center">
          {/* SECTION 1: LEFT — WHITE BRANDING SECTION */}
          <div className="h-full flex items-center pl-3.5 xl:pl-6 2xl:pl-8 pr-6">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleLogoClick();
              }}
              aria-label={`${cafeName || 'CSC DOST'} - Home`}
              className="flex items-center gap-2.5 xl:gap-3 2xl:gap-3.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE] rounded-xl cursor-pointer no-underline"
            >
              <img
                src="/csc-dost-header-logo.png"
                alt=""
                className="w-[50px] h-[50px] xl:w-[58px] xl:h-[58px] 2xl:w-[70px] 2xl:h-[70px] rounded-full shrink-0 object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="text-[21px] xl:text-[25px] 2xl:text-[32px] font-extrabold tracking-[-0.02em] leading-none whitespace-nowrap">
                  <span className="text-[#092442]">CSC</span>{' '}
                  <span className="text-[#175CEE]">DOST</span>
                </span>
                <span className="text-[11px] xl:text-[12.5px] 2xl:text-[15px] text-[#64748B] font-normal tracking-[-0.01em] leading-tight mt-1 whitespace-nowrap">
                  Citizen Service Portal
                </span>
              </div>
            </a>
          </div>

          {/* SECTION 2: CENTER — BLUE GRADIENT NAVIGATION */}
          <div className="h-full flex items-center justify-center gap-1 xl:gap-2 2xl:gap-3 pl-2 xl:pl-3 pr-2 xl:pr-3">
            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-0.5 xl:gap-1.5 2xl:gap-2.5 shrink-0"
            >
              {navItems.map((item, idx) => {
                const IconComponent = item.Icon;
                return (
                  <React.Fragment key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick();
                      }}
                      className="group flex items-center gap-1.5 xl:gap-2 px-1.5 xl:px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 no-underline"
                    >
                      <IconComponent
                        className="w-[17px] h-[17px] xl:w-[20px] xl:h-[20px] 2xl:w-[24px] 2xl:h-[24px] text-white stroke-[1.9] shrink-0 transition-transform duration-150 group-hover:scale-105"
                        aria-hidden="true"
                      />
                      <span className="text-white text-[10.5px] xl:text-[12px] 2xl:text-[14px] font-medium leading-[1.2] text-left whitespace-nowrap">
                        <span className="block">{item.line1}</span>
                        <span className="block">{item.line2}</span>
                      </span>
                    </a>
                    {idx < navItems.length - 1 && (
                      <span
                        className="h-7 xl:h-8 2xl:h-9 w-[1px] bg-white/20 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          {/* SECTION 3: RIGHT — ACTION BUTTON SECTION */}
          <div className="h-full flex items-center justify-end gap-2 xl:gap-2.5 2xl:gap-3 pl-2 pr-3 xl:pr-4 2xl:pr-5 pt-1">
            {/* Staff Login */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                title="Authorized CSC Staff Login"
                className="h-[38px] xl:h-[44px] 2xl:h-[50px] px-3.5 xl:px-4 2xl:px-5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#BDCBE0] rounded-[11px] xl:rounded-[13px] shadow-[0_1px_4px_rgba(15,23,42,0.05)] inline-flex items-center justify-center gap-1.5 xl:gap-2 text-[12px] xl:text-[13.5px] 2xl:text-[15px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                <Lock
                  className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-[18px] 2xl:h-[18px] text-[#0F172A] stroke-[2] shrink-0"
                  aria-hidden="true"
                />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PREMIUM TWO-ROW MOBILE HEADER (< 1024px)                           */}
      {/* ================================================================== */}
      {/* ================================================================== */}
      {/* COMPACT MOBILE HEADER (58–64px) - APPROVED CENTERED DESIGN          */}
      {/* ================================================================== */}
      <div className="lg:hidden relative w-full select-none bg-white">
        {/* COMPACT WHITE HEADER WITH CENTERED BRAND & SEARCH ON RIGHT */}
        <div className="relative w-full h-[60px] bg-white border-b border-[#E2E8F0] flex items-center justify-between px-3 sm:px-4">
          {/* Left Slot: Subtle Staff Login trigger / optical spacer */}
          <div className="w-10 flex items-center justify-start">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-[#175CEE] hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Staff login"
                aria-label="Staff login"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Centered Brand: CSC DOST + Citizen Service Portal */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLogoClick();
            }}
            aria-label={`${cafeName || 'CSC DOST'} - Home`}
            className="flex items-center justify-center gap-2 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE] rounded-xl cursor-pointer no-underline"
          >
            <img
              src="/csc-dost-header-logo.png"
              alt=""
              className="w-9 h-9 rounded-full shrink-0 object-contain drop-shadow-2xs"
            />
            <div className="flex flex-col items-start justify-center leading-none text-left">
              <span className="text-[18px] sm:text-[19px] font-extrabold tracking-[-0.02em] leading-none whitespace-nowrap">
                <span className="text-[#092442]">CSC</span>{' '}
                <span className="text-[#175CEE]">DOST</span>
              </span>
              <span className="text-[10px] sm:text-[10.5px] text-[#64748B] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                Citizen Service Portal
              </span>
            </div>
          </a>

          {/* Right Slot: Balanced spacer */}
          <div className="w-10 flex items-center justify-end" aria-hidden="true" />
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE NAVIGATION MENU DRAWER + BACKDROP (< 1024px)                */}
      {/* ================================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Outside Tap Backdrop */}
          <div
            className="fixed inset-0 bg-[#092442]/55 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Over Mobile Drawer */}
          <nav
            id="mobile-navigation-drawer"
            aria-label="Mobile Navigation Drawer"
            className="relative z-10 w-[86%] max-w-[340px] h-full bg-gradient-to-b from-[#06458F] via-[#0757AF] to-[#043875] text-white flex flex-col justify-between shadow-2xl border-l border-white/15 overflow-y-auto"
          >
            {/* Top Drawer Header + Close Button */}
            <div>
              <div className="flex items-center justify-between px-4 py-3.5 bg-white text-[#092442] border-b border-[#D5E2F2]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/csc-dost-header-logo.png"
                    alt=""
                    className="w-9 h-9 rounded-full shrink-0 object-contain"
                  />
                  <div>
                    <span className="text-base font-extrabold tracking-tight leading-none block">
                      <span className="text-[#092442]">CSC</span>{' '}
                      <span className="text-[#175CEE]">DOST</span>
                    </span>
                    <span className="text-[10.5px] text-[#64748B] font-medium block mt-0.5">
                      Citizen Service Portal
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    mobileMenuButtonRef.current?.focus();
                  }}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#092442] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
                </button>
              </div>

              {/* Navigation Links List */}
              <div className="px-3 py-3 space-y-1">
                {/* 0. Notifications */}
                {onOpenNotificationCenter && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenNotificationCenter();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium bg-white/10 text-white hover:bg-white/20 active:bg-white/25 transition-colors cursor-pointer text-left mb-1.5"
                  >
                    <span className="flex items-center gap-3">
                      <Bell className="w-[19px] h-[19px] text-amber-400 fill-amber-400 shrink-0" aria-hidden="true" />
                      <span>Notifications</span>
                    </span>
                    {unreadNotificationCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#175CEE] text-white">
                        {unreadNotificationCount} new
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                    )}
                  </button>
                )}

                {/* 1. Home */}
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogoClick();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left no-underline"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0" aria-hidden="true" />
                    <span>Home</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                </a>

                {/* 2–7. Six Primary Categories */}
                {navItems.map((item) => {
                  const IconComponent = item.Icon;
                  return (
                    <a
                      key={`drawer-${item.id}`}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        item.onClick();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left no-underline"
                    >
                      <span className="flex items-center gap-3">
                        <IconComponent
                          className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item.fullLabel}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                    </a>
                  );
                })}

                {/* More */}
                <a
                  href="/schemes"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToPath('/schemes');
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left no-underline"
                >
                  <span className="flex items-center gap-3">
                    <Compass className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0" aria-hidden="true" />
                    <span>Citizen Guides</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Bottom Section: TRACK APPLICATION & STAFF LOGIN */}
            <div className="p-4 border-t border-white/15 bg-[#04346C]/60 space-y-2.5">
              {/* TRACK APPLICATION — Blue filled button, white icon & text */}
              <a
                href="/track"
                onClick={(e) => {
                  e.preventDefault();
                  handleTrackApplication();
                }}
                className="w-full h-11 px-4 bg-[#175CEE] hover:bg-[#124FD1] active:scale-[0.99] text-white rounded-xl font-bold text-xs tracking-wide uppercase inline-flex items-center justify-center gap-2 shadow-[0_3px_10px_rgba(23,92,238,0.35)] transition-all cursor-pointer no-underline"
              >
                <FileText className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                <span>TRACK APPLICATION</span>
              </a>

              {/* STAFF LOGIN — White outlined button, navy-blue icon & text */}
              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full h-11 px-4 bg-white hover:bg-[#F8FAFC] active:scale-[0.99] text-[#092442] border border-[#BDCBE0] rounded-xl font-bold text-xs tracking-wide uppercase inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#092442] shrink-0" aria-hidden="true" />
                  <span>STAFF LOGIN</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

