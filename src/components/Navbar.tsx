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
  Home,
  Compass,
  ChevronRight,
  Bell,
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Handle Escape key and external search clear events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        } else if (mobileSearchOpen) {
          setMobileSearchOpen(false);
          mobileSearchButtonRef.current?.focus();
        }
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
  }, [mobileMenuOpen, mobileSearchOpen]);

  // Prevent background page scroll while mobile navigation drawer is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (mobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [mobileSearchOpen]);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);

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
    setMobileSearchOpen(false);
    window.location.hash = '#tools';
  };

  const handleTrackApplication = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    window.location.hash = '#track';
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
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
    setMobileSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          mobileSearchInputRef.current?.focus();
        }, 40);
      }
      return next;
    });
  };

  const handleCloseMobileSearch = () => {
    setMobileSearchOpen(false);
    if (searchValue.trim()) {
      setSearchValue('');
      dispatchPortalSearch('', false);
    }
    mobileSearchButtonRef.current?.focus();
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
          <div className="h-full flex items-center justify-end gap-2 xl:gap-2.5 2xl:gap-3 pl-2 pr-3 xl:pr-4 2xl:pr-5 pt-1">
            {/* Notification Bell Button */}
            {onOpenNotificationCenter && (
              <button
                type="button"
                onClick={onOpenNotificationCenter}
                title="Notifications"
                aria-label="Open notifications"
                className="relative h-[38px] w-[38px] xl:h-[44px] xl:w-[44px] 2xl:h-[54px] 2xl:w-[54px] bg-white hover:bg-[#F8FAFC] text-[#0F172A] border border-[#BDCBE0] rounded-[11px] xl:rounded-[13px] shadow-[0_1px_4px_rgba(15,23,42,0.05)] inline-flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Bell className="w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-[20px] 2xl:h-[20px] text-amber-500 fill-amber-400" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#175CEE] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

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
      {/* PREMIUM TWO-ROW MOBILE HEADER (< 1024px)                           */}
      {/* ================================================================== */}
      <div className="lg:hidden relative w-full select-none overflow-hidden">
        {/* ROW 1 — BRANDING AND ACTIONS WITH CURVED BLUE WAVE BACKGROUND */}
        <div className="relative w-full h-[68px] sm:h-[74px] overflow-hidden">
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 430 74"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Base Blue Transition Fill connecting seamlessly to Row 2 */}
              <linearGradient id="cscMobRow1BaseBlue" x1="0" y1="0" x2="430" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0874DC" />
                <stop offset="35%" stopColor="#0757AF" />
                <stop offset="70%" stopColor="#06458F" />
                <stop offset="100%" stopColor="#0874DC" />
              </linearGradient>

              {/* Left Bright-Blue Curved Wave Accent behind Search Button */}
              <linearGradient id="cscMobLeftWaveAccent" x1="0" y1="0" x2="135" y2="74" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1399F8" />
                <stop offset="55%" stopColor="#0B84F0" />
                <stop offset="100%" stopColor="#0874DC" />
              </linearGradient>

              {/* Right Soft Light-Blue Curved Wave Accent near Hamburger Button */}
              <linearGradient id="cscMobRightWaveAccent" x1="310" y1="0" x2="430" y2="74" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#DCEBFE" />
                <stop offset="55%" stopColor="#C4DDFD" />
                <stop offset="100%" stopColor="#9EC6FC" />
              </linearGradient>

              {/* Central Clean White Branding Surface */}
              <linearGradient id="cscMobCenterWhiteGrad" x1="55" y1="0" x2="375" y2="74" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="75%" stopColor="#FAFCFF" />
                <stop offset="100%" stopColor="#F0F6FE" />
              </linearGradient>
            </defs>

            {/* 1. Base Blue Layer (matches Row 2 top border) */}
            <rect x="0" y="0" width="430" height="74" fill="url(#cscMobRow1BaseBlue)" />

            {/* 2. Left Bright-Blue Curved Wave Accent Behind Search Button */}
            <path
              d="M 0,0 L 106,0 C 86,16 76,42 54,60 C 36,71 18,74 0,74 Z"
              fill="url(#cscMobLeftWaveAccent)"
            />

            {/* 3. Right Soft Light-Blue Curved Wave Accent Near Hamburger Button */}
            <path
              d="M 332,0 L 430,0 L 430,72 C 406,72 388,61 372,42 C 358,24 348,8 332,0 Z"
              fill="url(#cscMobRightWaveAccent)"
            />

            {/* 4. Bright-Blue Rim Highlight Along Left-to-Bottom Curve */}
            <path
              d="M 88,0 L 352,0 C 370,12 384,38 404,58 C 414,67 422,71 430,72 L 430,74 L 0,74 L 0,68 C 22,68 42,58 58,36 C 70,18 78,6 88,0 Z"
              fill="#1399F8"
              fillOpacity="0.45"
            />

            {/* 5. Main Clean White Central Branding Surface with Flowing S-Curves */}
            <path
              d="M 78,0 L 358,0 C 374,10 386,34 404,52 C 414,61 422,66 430,68 L 430,0 L 78,0 Z"
              fill="#E5F0FE"
              fillOpacity="0.65"
            />
            <path
              d="M 82,0 L 348,0 C 366,12 378,36 396,54 C 408,65 420,69 430,70 L 52,70 C 66,56 72,34 78,14 C 80,7 81,3 82,0 Z"
              fill="url(#cscMobCenterWhiteGrad)"
            />
            {/* Extended White Top-Center-Right Cradle */}
            <path
              d="M 66,0 L 392,0 C 406,0 418,6 430,16 L 430,66 C 414,65 398,55 384,38 C 370,21 356,4 336,0 L 66,0 Z"
              fill="#F4F9FF"
              fillOpacity="0.85"
            />
            <path
              d="M 72,0 L 374,0 C 392,14 404,42 424,60 C 426,62 428,63 430,64 L 38,68 C 56,56 64,32 70,10 L 72,0 Z"
              fill="url(#cscMobCenterWhiteGrad)"
            />
          </svg>

          {/* Balanced 3-Column Row 1 Content — Guarantees True Viewport Centering for Brand */}
          <div className="relative z-10 w-full h-full grid grid-cols-[52px_1fr_52px] sm:grid-cols-[60px_1fr_60px] items-center px-2.5 sm:px-4">
            {/* LEFT: Circular White Search Button */}
            <div className="flex items-center justify-start">
              <button
                ref={mobileSearchButtonRef}
                type="button"
                onClick={handleMobileSearchClick}
                aria-expanded={mobileSearchOpen}
                aria-controls="csc-mobile-search-panel"
                aria-label={
                  mobileSearchOpen
                    ? 'Close search bar'
                    : 'Search jobs, schemes, admissions'
                }
                className="w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-full bg-white hover:bg-[#F8FBFF] active:scale-95 text-[#0874DC] border border-[#D5E2F2] shadow-[0_3px_10px_rgba(6,69,143,0.22)] flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE]"
              >
                <Search className="w-[19px] h-[19px] stroke-[2.3]" aria-hidden="true" />
              </button>
            </div>

            {/* CENTER: Visually Centered CSC DOST Logo + Brand Name + Subtitle */}
            <div className="flex items-center justify-center min-w-0 px-1">
              <button
                type="button"
                onClick={handleLogoClick}
                aria-label={`${cafeName || 'CSC DOST'} - Go to Home`}
                className="inline-flex items-center justify-center gap-2 sm:gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE] rounded-xl cursor-pointer max-w-full"
              >
                <img
                  src="/csc-dost-header-logo.png"
                  alt="CSC DOST Logo"
                  className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-full shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(9,36,66,0.12)]"
                />
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[20px] min-[375px]:text-[21px] sm:text-[23px] font-extrabold tracking-[-0.02em] leading-none whitespace-nowrap">
                    <span className="text-[#092442]">CSC</span>{' '}
                    <span className="text-[#175CEE]">DOST</span>
                  </span>
                  <span className="text-[10.5px] min-[375px]:text-[11px] sm:text-[12px] text-[#475569] font-medium tracking-[-0.01em] leading-tight mt-0.5 whitespace-nowrap">
                    Citizen Service Portal
                  </span>
                </div>
              </button>
            </div>

            {/* RIGHT: Blue Rounded Hamburger Menu Button */}
            <div className="flex items-center justify-end">
              <button
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setMobileMenuOpen((prev) => !prev);
                }}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
                aria-label={
                  mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
                }
                className="w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-[12px] bg-gradient-to-b from-[#0874DC] via-[#0757AF] to-[#06458F] hover:from-[#097CEB] hover:to-[#053B7A] active:scale-95 text-white border border-white/25 shadow-[0_3px_10px_rgba(6,69,143,0.28)] flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#175CEE]"
              >
                {mobileMenuOpen ? (
                  <X className="w-[22px] h-[22px] stroke-[2.3]" aria-hidden="true" />
                ) : (
                  <Menu className="w-[22px] h-[22px] stroke-[2.3]" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* EXPANDABLE MOBILE SEARCH INTERFACE (When Left Search Button is Clicked) */}
        {mobileSearchOpen && (
          <div
            id="csc-mobile-search-panel"
            className="w-full bg-[#06458F] border-t border-white/15 px-3 py-2.5 shadow-inner"
          >
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className="w-full h-[42px] bg-white rounded-full flex items-center pl-3.5 pr-1 shadow-[0_2px_10px_rgba(4,40,92,0.22)]"
            >
              <label htmlFor="csc-mobile-header-search-input" className="sr-only">
                Search jobs, schemes, admissions...
              </label>
              <Search
                className="w-4 h-4 text-[#0874DC] shrink-0 mr-2"
                aria-hidden="true"
              />
              <input
                ref={mobileSearchInputRef}
                id="csc-mobile-header-search-input"
                type="search"
                value={searchValue}
                onChange={handleSearchInputChange}
                placeholder="Search jobs, schemes, admissions..."
                className="w-full bg-transparent border-none text-[13px] text-[#0F172A] placeholder-[#64748B] focus:outline-none pr-1"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="h-[34px] px-3 rounded-full bg-[#175CEE] hover:bg-[#124FD1] text-white text-xs font-semibold flex items-center justify-center shrink-0 transition-colors cursor-pointer mr-1"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleCloseMobileSearch}
                aria-label="Close search"
                className="w-[34px] h-[34px] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {/* ROW 2 — PREMIUM BLUE-GRADIENT 5-ITEM NAVIGATION BAR */}
        <nav
          aria-label="Mobile Category Navigation"
          className="relative w-full bg-gradient-to-r from-[#06458F] via-[#0757AF] to-[#0874DC] border-t border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] overflow-x-auto no-scrollbar"
        >
          <div className="flex items-stretch justify-between min-w-full">
            {navItems.map((item, idx) => {
              const IconComponent = item.Icon;
              return (
                <React.Fragment key={`mob-row2-${item.id}`}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex-1 min-w-[64px] min-h-[62px] sm:min-h-[66px] py-1.5 px-1 flex flex-col items-center justify-center gap-1 text-center text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
                  >
                    <IconComponent
                      className="w-[18px] h-[18px] min-[375px]:w-[19px] min-[375px]:h-[19px] sm:w-[21px] sm:h-[21px] text-white stroke-[1.9] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-[10px] min-[360px]:text-[10.5px] min-[390px]:text-[11px] sm:text-[12px] font-medium leading-[1.15] tracking-[-0.01em] text-white">
                      <span className="block whitespace-nowrap">{item.line1}</span>
                      <span className="block whitespace-nowrap">{item.line2}</span>
                    </span>
                  </button>
                  {idx < navItems.length - 1 && (
                    <span
                      className="self-center h-8 sm:h-9 w-[1px] bg-white/20 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </nav>
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
                    alt="CSC DOST Logo"
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
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0" aria-hidden="true" />
                    <span>Home</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                </button>

                {/* 2–6. Five Primary Service Categories */}
                {navItems.map((item) => {
                  const IconComponent = item.Icon;
                  return (
                    <button
                      key={`drawer-${item.id}`}
                      type="button"
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-3">
                        <IconComponent
                          className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item.fullLabel}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                    </button>
                  );
                })}

                {/* 7. More */}
                <button
                  type="button"
                  onClick={() => navigateToSection('knowledge-hub')}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-white hover:bg-white/12 active:bg-white/20 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-3">
                    <Compass className="w-[19px] h-[19px] text-white/90 stroke-[1.9] shrink-0" aria-hidden="true" />
                    <span>More</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/50" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Bottom Section: TRACK APPLICATION & STAFF LOGIN */}
            <div className="p-4 border-t border-white/15 bg-[#04346C]/60 space-y-2.5">
              {/* TRACK APPLICATION — Blue filled button, white icon & text */}
              <button
                type="button"
                onClick={handleTrackApplication}
                className="w-full h-11 px-4 bg-[#175CEE] hover:bg-[#124FD1] active:scale-[0.99] text-white rounded-xl font-bold text-xs tracking-wide uppercase inline-flex items-center justify-center gap-2 shadow-[0_3px_10px_rgba(23,92,238,0.35)] transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
                <span>TRACK APPLICATION</span>
              </button>

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

