import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Lock,
  ShieldCheck,
  BookOpen,
  Building2,
  Phone,
  FileSearch
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
  onOpenPrivacyPolicy,
  onOpenAdmin,
  onHomeClick,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMoreDropdownOpen(false);
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
          mobileMenuButtonRef.current?.focus();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navigateToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);

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
    setMoreDropdownOpen(false);
    window.location.hash = '#tools';
  };

  const handleTrackApplication = () => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.location.hash = '#track';
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    if (onHomeClick) {
      onHomeClick();
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0] shadow-2xs">
      {/* Compact Utility Strip */}
      <div className="bg-[#102A43] text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#60A5FA] shrink-0" aria-hidden="true" />
            <span className="font-medium tracking-wide text-slate-100">
              Independent Citizen Portal
            </span>
            <span className="hidden md:inline text-slate-400">
              — Digital Service Assistance, Recruitment Notices &amp; Citizen Tools
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigateToSection('centre-info')}
              className="hidden sm:inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>Sangran Qazigund, Anantnag (J&amp;K)</span>
            </button>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer font-medium"
                title="Authorized CSC Staff Login"
              >
                <Lock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Compact Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo linking to Home */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-xl p-1 -ml-1 cursor-pointer shrink-0"
          aria-label={`${cafeName || 'CSC DOST'} - Go to Home`}
        >
          <img
            src="/favicon.svg"
            alt="CSC DOST Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shrink-0 object-contain"
          />
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#102A43] block leading-none">
              CSC <span className="text-[#2563EB]">DOST</span>
            </span>
            <span className="text-[11px] text-[#64748B] font-medium block mt-0.5">
              Citizen Service Portal
            </span>
          </div>
        </button>

        {/* Desktop Primary Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 text-sm font-semibold text-[#102A43]"
        >
          <button
            type="button"
            onClick={() => navigateToSection('services')}
            className="px-3 py-2 rounded-lg hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Services
          </button>

          <button
            type="button"
            onClick={() => navigateToSection('recruitment-section')}
            className="px-3 py-2 rounded-lg hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Jobs
          </button>

          <button
            type="button"
            onClick={() => navigateToSection('schemes-section')}
            className="px-3 py-2 rounded-lg hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Schemes
          </button>

          <button
            type="button"
            onClick={() => navigateToSection('education-resources')}
            className="px-3 py-2 rounded-lg hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Education
          </button>

          <button
            type="button"
            onClick={handleOpenTools}
            className="px-3 py-2 rounded-lg hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            Tools
          </button>

          {/* More Dropdown (Guides/Blog, About, Contact) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMoreDropdownOpen((prev) => !prev)}
              aria-expanded={moreDropdownOpen}
              aria-haspopup="true"
              className={`px-3 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                moreDropdownOpen
                  ? 'bg-[#F6F8FC] text-[#2563EB]'
                  : 'hover:bg-[#F6F8FC] hover:text-[#2563EB]'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${
                  moreDropdownOpen ? 'rotate-180 text-[#2563EB]' : 'text-[#64748B]'
                }`}
              />
            </button>

            {moreDropdownOpen && (
              <div
                role="menu"
                aria-label="More pages"
                className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToSection('knowledge-hub')}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <span className="block">Guides &amp; Blog</span>
                    <span className="text-[11px] font-normal text-[#64748B]">Step-by-step scheme guides</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToSection('centre-info')}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <span className="block">About Our Centre</span>
                    <span className="text-[11px] font-normal text-[#64748B]">Operator &amp; centre details</span>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToSection('centre-contact')}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <span className="block">Contact &amp; Hours</span>
                    <span className="text-[11px] font-normal text-[#64748B]">Helpdesk &amp; location</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions: Prominent Track Application + Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTrackApplication}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <FileSearch className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Track Application</span>
          </button>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden p-2 rounded-xl text-[#102A43] hover:bg-[#F6F8FC] border border-[#E2E8F0] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          className="lg:hidden bg-white border-b border-[#E2E8F0] px-4 pt-2 pb-5 space-y-1 shadow-md"
        >
          <button
            type="button"
            onClick={() => navigateToSection('services')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer block"
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('recruitment-section')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer block"
          >
            Jobs &amp; Recruitment Notices
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('schemes-section')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer block"
          >
            Government Schemes
          </button>
          <button
            type="button"
            onClick={() => navigateToSection('education-resources')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer block"
          >
            Education Updates
          </button>
          <button
            type="button"
            onClick={handleOpenTools}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#102A43] hover:bg-[#F6F8FC] hover:text-[#2563EB] transition-colors cursor-pointer block"
          >
            Online Document Tools
          </button>

          <div className="pt-2 mt-2 border-t border-[#E2E8F0] space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
              More Resources
            </span>
            <button
              type="button"
              onClick={() => navigateToSection('knowledge-hub')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[#102A43] hover:bg-[#F6F8FC] transition-colors cursor-pointer block"
            >
              Guides &amp; Blog
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('centre-info')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[#102A43] hover:bg-[#F6F8FC] transition-colors cursor-pointer block"
            >
              About Our CSC Centre
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('centre-contact')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-[#102A43] hover:bg-[#F6F8FC] transition-colors cursor-pointer block"
            >
              Contact &amp; Opening Hours
            </button>
          </div>

          <div className="pt-3 mt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleTrackApplication}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl text-center shadow-2xs transition-colors cursor-pointer"
            >
              Track Application Status
            </button>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 px-4 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] border border-[#E2E8F0] text-xs font-semibold rounded-xl text-center transition-colors cursor-pointer"
              >
                Staff Login
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
