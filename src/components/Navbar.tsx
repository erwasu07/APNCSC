import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Lock, 
  FileText, 
  CreditCard, 
  Fingerprint, 
  BookOpen, 
  Briefcase, 
  Award, 
  Info, 
  Phone, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface NavbarProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
  onHomeClick?: () => void;
  onOpenService?: (serviceId: string) => void;
}

export default function Navbar({
  cafeName,
  onOpenPrivacyPolicy,
  onOpenAdmin,
  onHomeClick,
  onOpenService
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const triggerSearchFocus = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('focus-csc-search'));
    const searchInput = document.getElementById('portal-universal-search') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => searchInput.focus(), 300);
    }
  };

  const navigateTo = (target: string) => {
    setActiveItem(target);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);

    if (target === 'home') {
      if (onHomeClick) onHomeClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (target === 'jobs') {
      const el = document.getElementById('recruitment-section') || document.getElementById('sarkari-board');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'schemes') {
      const el = document.getElementById('schemes-section') || document.getElementById('knowledge-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'aadhaar') {
      window.location.hash = '#service/aadhaar-card-services';
      return;
    }

    if (target === 'pan') {
      window.location.hash = '#service/pan-card-new-correction';
      return;
    }

    if (target === 'guides') {
      const el = document.getElementById('knowledge-hub') || document.getElementById('popular-guides-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'about') {
      const el = document.getElementById('about-section') || document.getElementById('node-info');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'contact') {
      const el = document.getElementById('node-info') || document.getElementById('footer');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target === 'apply') {
      window.location.hash = '#apply';
      return;
    }

    if (target === 'track') {
      window.location.hash = '#track';
      return;
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-[#E3E8EF] transition-shadow duration-200" style={{ boxShadow: isScrolled ? '0 2px 8px rgba(18, 48, 74, 0.08)' : 'none' }}>
      
      {/* Top Quiet Citizen Advisory Ribbon */}
      <div className="bg-[#12304A] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-emerald-400">Independent Portal</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 truncate">Digital Assistance, Recruitment Updates & Citizen Scheme Guides</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-slate-300">
            <button
              onClick={() => navigateTo('track')}
              className="hover:text-white transition-colors cursor-pointer font-medium"
            >
              Track Application
            </button>
            <span className="text-slate-500">·</span>
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-medium text-amber-400"
                title="Staff Operator Dashboard"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0] rounded-lg p-1 -ml-1"
          title="CSC DOST - Home"
        >
          <img
            src="/favicon.svg"
            alt="CSC DOST"
            width="40"
            height="40"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
          />
          <div className="leading-tight">
            <span className="text-lg sm:text-xl font-extrabold text-[#172033] tracking-tight block">
              CSC DOST
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#5F6B7A] block">
              Citizen Information Portal
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'home'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigateTo('jobs')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'jobs'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            Jobs
          </button>

          <button
            type="button"
            onClick={() => navigateTo('schemes')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'schemes'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            Schemes
          </button>

          <button
            type="button"
            onClick={() => navigateTo('aadhaar')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'aadhaar'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            Aadhaar
          </button>

          <button
            type="button"
            onClick={() => navigateTo('pan')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'pan'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            PAN
          </button>

          <button
            type="button"
            onClick={() => navigateTo('guides')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'guides'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            Guides
          </button>

          <button
            type="button"
            onClick={() => navigateTo('about')}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              activeItem === 'about'
                ? 'text-[#0B57D0] bg-blue-50/80 font-bold'
                : 'text-[#172033] hover:text-[#0B57D0] hover:bg-slate-50'
            }`}
          >
            About
          </button>
        </nav>

        {/* Right Action: Search Trigger + Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={triggerSearchFocus}
            className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-[#5F6B7A] bg-[#F7F9FC] hover:bg-slate-100 border border-[#E3E8EF] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B57D0]"
            title="Search jobs, schemes, guides and services"
            aria-label="Search CSC DOST"
          >
            <Search className="w-4 h-4 text-[#5F6B7A]" />
            <span className="hidden md:inline font-medium">Search CSC DOST...</span>
            <kbd className="hidden md:inline text-[10px] bg-white border border-[#E3E8EF] px-1.5 py-0.5 rounded text-slate-400">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('apply')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-[#0B57D0] hover:bg-[#0842a0] text-white text-xs sm:text-sm font-bold rounded-lg transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B57D0]"
          >
            Apply Online
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#172033] hover:bg-[#F7F9FC] rounded-lg cursor-pointer lg:hidden border border-transparent hover:border-[#E3E8EF]"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E3E8EF] bg-white px-4 py-4 space-y-3 shadow-lg animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto">
          
          {/* Quick Search inside Mobile Menu */}
          <button
            type="button"
            onClick={triggerSearchFocus}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#5F6B7A] bg-[#F7F9FC] border border-[#E3E8EF] rounded-lg text-left"
          >
            <Search className="w-4 h-4 text-[#5F6B7A]" />
            <span>Search CSC DOST...</span>
          </button>

          <div className="grid grid-cols-1 gap-1 text-sm font-medium text-[#172033]">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Home</span>
              <span className="text-xs text-[#5F6B7A]">Main Portal</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('jobs')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Jobs &amp; Recruitment</span>
              <span className="text-xs text-[#5F6B7A]">JKSSB, Army, SSC, RRB</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('schemes')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Government Schemes</span>
              <span className="text-xs text-[#5F6B7A]">PM-KISAN, Ayushman</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('aadhaar')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Aadhaar</span>
              <span className="text-xs text-[#5F6B7A]">Update &amp; Revalidation</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('pan')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>PAN Card</span>
              <span className="text-xs text-[#5F6B7A]">New Application &amp; Correction</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('guides')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Guides &amp; Knowledge Hub</span>
              <span className="text-xs text-[#5F6B7A]">Step-by-step Procedures</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('about')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>About CSC DOST</span>
              <span className="text-xs text-[#5F6B7A]">VLE Operator &amp; Mission</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F7F9FC] transition-colors flex items-center justify-between"
            >
              <span>Contact &amp; Location</span>
              <span className="text-xs text-[#5F6B7A]">Sangran Qazigund Center</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#E3E8EF] flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigateTo('apply')}
              className="w-full py-2.5 bg-[#0B57D0] hover:bg-[#0842a0] text-white font-bold text-center rounded-lg text-sm"
            >
              Apply Online via CSC Desk
            </button>

            <button
              type="button"
              onClick={() => navigateTo('track')}
              className="w-full py-2.5 bg-[#F7F9FC] hover:bg-slate-100 text-[#172033] font-semibold text-center rounded-lg text-sm border border-[#E3E8EF]"
            >
              Track Existing Application
            </button>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Staff Operator Login</span>
              </button>
            )}
          </div>

        </div>
      )}

    </header>
  );
}
