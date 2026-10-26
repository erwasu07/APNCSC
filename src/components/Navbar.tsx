import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Search,
  Lock,
  FileText,
  BriefcaseBusiness,
  UsersRound,
  GraduationCap,
  Wrench,
} from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';

interface NavbarProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: LegalTab) => void;
  onOpenAdmin?: () => void;
  onHomeClick?: () => void;
}

export default function Navbar({
  cafeName,
  onOpenAdmin,
  onHomeClick,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    const handleClearSearch = () => {
      setSearchValue('');
    };
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('csc-header-search-clear', handleClearSearch);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('csc-header-search-clear', handleClearSearch);
    };
  }, [mobileMenuOpen]);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);

    if (
      window.location.hash === '#tools' ||
      window.location.hash.startsWith('#tools/') ||
      window.location.hash.startsWith('#apply') ||
      window.location.hash.startsWith('#track') ||
      window.location.pathname !== '/'
    ) {
      if (onHomeClick) onHomeClick();
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleOpenTools = () => {
    setMobileMenuOpen(false);
    window.location.hash = '#tools';
  };

  const handleTrackApplication = () => {
    setMobileMenuOpen(false);
    window.location.hash = '#track';
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const dispatchPortalSearch = (query: string, submit = false) => {
    const needsHomeSwitch =
      window.location.hash === '#tools' ||
      window.location.hash.startsWith('#tools/') ||
      window.location.hash.startsWith('#apply') ||
      window.location.hash.startsWith('#track') ||
      window.location.pathname !== '/';

    if (needsHomeSwitch && (query.trim().length > 0 || submit)) {
      if (onHomeClick) onHomeClick();
      window.location.hash = '';
      setTimeout(() => {
        if (query.trim()) {
          window.dispatchEvent(
            new CustomEvent('csc-header-search', { detail: { query, submit } })
          );
        } else if (submit) {
          window.dispatchEvent(new CustomEvent('focus-csc-search'));
        }
      }, 160);
    } else {
      if (query.trim() || !submit) {
        window.dispatchEvent(
          new CustomEvent('csc-header-search', { detail: { query, submit } })
        );
      } else {
        window.dispatchEvent(new CustomEvent('focus-csc-search'));
      }
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    dispatchPortalSearch(val, false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    dispatchPortalSearch(searchValue, true);
  };

  const handleMobileSearchClick = () => {
    setMobileMenuOpen(false);
    const needsHomeSwitch =
      window.location.hash === '#tools' ||
      window.location.hash.startsWith('#tools/') ||
      window.location.hash.startsWith('#apply') ||
      window.location.hash.startsWith('#track') ||
      window.location.pathname !== '/';

    if (needsHomeSwitch) {
      if (onHomeClick) onHomeClick();
      window.location.hash = '';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('focus-csc-search'));
      }, 150);
    } else {
      window.dispatchEvent(new CustomEvent('focus-csc-search'));
    }
  };

  const navItems = [
    {
      id: 'online-services',
      line1: 'Online',
      line2: 'Services',
      fullLabel: 'Online Services',
      Icon: FileText,
      onClick: () => navigateToSection('services'),
    },
    {
      id: 'jobs-recruitment',
      line1: 'Jobs &',
      line2: 'Recruitment',
      fullLabel: 'Jobs & Recruitment',
      Icon: BriefcaseBusiness,
      onClick: () => navigateToSection('recruitment-section'),
    },
    {
      id: 'government-schemes',
      line1: 'Government',
      line2: 'Schemes',
      fullLabel: 'Government Schemes',
      Icon: UsersRound,
      onClick: () => navigateToSection('schemes-section'),
    },
    {
      id: 'education-admissions',
      line1: 'Education &',
      line2: 'Admissions',
      fullLabel: 'Education & Admissions',
      Icon: GraduationCap,
      onClick: () => navigateToSection('education-resources'),
    },
    {
      id: 'citizen-tools',
      line1: 'Citizen',
      line2: 'Tools',
      fullLabel: 'Citizen Tools',
      Icon: Wrench,
      onClick: handleOpenTools,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#CFD9E8] shadow-[0_2px_10px_rgba(15,23,42,0.06)]">
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
            <button
              type="button"
              onClick={handleLogoClick}
              aria-label={`${cafeName || 'CSC DOST'} - Go to Home`}
              className="flex items-center gap-2.5 xl:gap-3 2xl:gap-3.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE] rounded-xl cursor-pointer"
            >
              <img
                src="/csc-dost-header-logo.png"
                alt="CSC DOST Logo"
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
            </button>
          </div>

          {/* SECTION 2: CENTER — BLUE GRADIENT NAVIGATION + INTEGRATED SEARCH PILL */}
          <div className="h-full flex items-center justify-between gap-2 xl:gap-3.5 2xl:gap-5 pl-2 xl:pl-3.5 pr-2.5 xl:pr-4">
            <nav
              aria-label="Main Navigation"
              className="flex items-center gap-1 xl:gap-2 2xl:gap-3.5 shrink-0"
            >
              {navItems.map((item, idx) => {
                const IconComponent = item.Icon;
                return (
                  <React.Fragment key={item.id}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="group flex items-center gap-1.5 xl:gap-2.5 px-1.5 xl:px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      <IconComponent
                        className="w-[20px] h-[20px] xl:w-[23px] xl:h-[23px] 2xl:w-[27px] 2xl:h-[27px] text-white stroke-[1.9] shrink-0 transition-transform duration-150 group-hover:scale-105"
                        aria-hidden="true"
                      />
                      <span className="text-white text-[11.5px] xl:text-[13px] 2xl:text-[15px] font-medium leading-[1.24] text-left whitespace-nowrap">
                        <span className="block">{item.line1}</span>
                        <span className="block">{item.line2}</span>
                      </span>
                    </button>
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

            {/* Integrated Pill Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className="flex-1 min-w-[185px] xl:min-w-[245px] 2xl:min-w-[330px] max-w-[404px] h-[38px] xl:h-[44px] 2xl:h-[52px] bg-white rounded-full flex items-center pl-3 xl:pl-4 pr-1 shadow-[0_2px_10px_rgba(4,40,92,0.16)]"
            >
              <label htmlFor="csc-header-search-input" className="sr-only">
                Search jobs, schemes, admissions
              </label>
              <Search
                className="w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-[20px] 2xl:h-[20px] text-[#64748B] shrink-0 mr-2 xl:mr-2.5"
                aria-hidden="true"
              />
              <input
                id="csc-header-search-input"
                type="search"
                value={searchValue}
                onChange={handleSearchInputChange}
                placeholder="Search jobs, schemes, admissions..."
                className="w-full bg-transparent border-none text-[11.5px] xl:text-[13px] 2xl:text-[15px] text-[#0F172A] placeholder-[#6B7A90] focus:outline-none pr-1.5"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="w-[30px] h-[30px] xl:w-[36px] xl:h-[36px] 2xl:w-[44px] 2xl:h-[44px] rounded-full bg-[#175CEE] hover:bg-[#124FD1] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Search
                  className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-[19px] 2xl:h-[19px] stroke-[2.2]"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>

          {/* SECTION 3: RIGHT — ACTION BUTTON SECTION */}
          <div className="h-full flex items-center justify-end gap-2 xl:gap-3 2xl:gap-4 pl-2 pr-3 xl:pr-4 2xl:pr-5 pt-1">
            {/* Button 1: Track Application */}
            <button
              type="button"
              onClick={handleTrackApplication}
              className="h-[38px] xl:h-[44px] 2xl:h-[54px] px-3 xl:px-4 2xl:px-5 bg-[#175CEE] hover:bg-[#124FD1] text-white rounded-[11px] xl:rounded-[13px] shadow-[0_2px_8px_rgba(23,92,238,0.24)] inline-flex items-center justify-center gap-1.5 xl:gap-2 text-[11.5px] xl:text-[13px] 2xl:text-[15.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              {/* Crisp Document/Tracking Icon matching the reference */}
              <svg
                className="w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-[21px] 2xl:h-[21px] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="9.5" cy="14" r="1.5" />
                <line x1="13" y1="14" x2="16.5" y2="14" />
                <line x1="8" y1="18" x2="16" y2="18" />
              </svg>
              <span>Track Application</span>
            </button>

            {/* Button 2: Staff Login */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                title="Authorized CSC Staff Login"
                className="h-[38px] xl:h-[44px] 2xl:h-[54px] px-3 xl:px-3.5 2xl:px-4 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#BDCBE0] rounded-[11px] xl:rounded-[13px] shadow-[0_1px_4px_rgba(15,23,42,0.05)] inline-flex items-center justify-center gap-1.5 xl:gap-2 text-[11.5px] xl:text-[13px] 2xl:text-[15.5px] font-semibold whitespace-nowrap transition-colors cursor-pointer"
              >
                <Lock
                  className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-[19px] 2xl:h-[19px] text-[#0F172A] stroke-[2] shrink-0"
                  aria-hidden="true"
                />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE & TABLET HEADER (< 1024px)                                  */}
      {/* ================================================================== */}
      <div className="lg:hidden relative w-full bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FE] to-[#E9F2FE] px-3.5 sm:px-5 h-16 flex items-center justify-between gap-2">
        {/* Mobile Brand Logo + Title */}
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label={`${cafeName || 'CSC DOST'} - Go to Home`}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE] rounded-xl cursor-pointer shrink-0"
        >
          <img
            src="/csc-dost-header-logo.png"
            alt="CSC DOST Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 object-contain"
          />
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight leading-none block">
              <span className="text-[#092442]">CSC</span>{' '}
              <span className="text-[#175CEE]">DOST</span>
            </span>
            <span className="text-[11px] text-[#64748B] font-normal block mt-0.5">
              Citizen Service Portal
            </span>
          </div>
        </button>

        {/* Mobile Right Controls: Search Icon + Hamburger Menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMobileSearchClick}
            aria-label="Search jobs, schemes, admissions"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#F8FAFC] text-[#175CEE] border border-[#CBD5E1] shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          </button>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="w-10 h-10 rounded-xl bg-[#0557AF] hover:bg-[#024EA0] text-white shadow-2xs flex items-center justify-center transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MOBILE NAVIGATION MENU DRAWER (< 1024px)                           */}
      {/* ================================================================== */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="lg:hidden bg-gradient-to-b from-[#0455AC] to-[#02448D] text-white border-t border-white/15 px-4 pt-3.5 pb-5 space-y-3 shadow-xl"
        >
          {/* Mobile Search Pill inside Menu */}
          <form
            onSubmit={handleSearchSubmit}
            role="search"
            className="w-full h-11 bg-white rounded-full flex items-center pl-3.5 pr-1 shadow-sm"
          >
            <Search className="w-4 h-4 text-[#64748B] shrink-0 mr-2" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={handleSearchInputChange}
              placeholder="Search jobs, schemes, admissions..."
              className="w-full bg-transparent border-none text-xs sm:text-sm text-[#0F172A] placeholder-[#6B7A90] focus:outline-none pr-1.5"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="w-9 h-9 rounded-full bg-[#175CEE] text-white flex items-center justify-center shrink-0"
            >
              <Search className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
            </button>
          </form>

          {/* 5 Primary Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const IconComponent = item.Icon;
              return (
                <button
                  key={`mobile-${item.id}`}
                  type="button"
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <IconComponent className="w-5 h-5 text-white/90 stroke-[1.9] shrink-0" aria-hidden="true" />
                  <span>{item.fullLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Action Buttons: Track Application & Staff Login */}
          <div className="pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleTrackApplication}
              className="w-full h-11 px-4 bg-[#175CEE] hover:bg-[#124FD1] text-white rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Track Application</span>
            </button>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full h-11 px-4 bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#BDCBE0] rounded-xl font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#0F172A] shrink-0" aria-hidden="true" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
