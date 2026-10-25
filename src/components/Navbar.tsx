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
  GraduationCap,
  Sparkles,
  ArrowRight
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

    if (target === 'home') {
      if (onHomeClick) onHomeClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Return to home view first if currently in a subview (like apply, track, post details)
    if (onHomeClick) onHomeClick();

    setTimeout(() => {
      if (target === 'services') {
        const el = document.getElementById('services-bento') || document.getElementById('services-catalogue');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'schemes') {
        const el = document.getElementById('schemes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'jobs') {
        const el = document.getElementById('recruitment-section') || document.getElementById('sarkari-board');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'education') {
        const el = document.getElementById('education-resources');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'tools') {
        const el = document.getElementById('citizen-tools');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'blog' || target === 'guides') {
        const el = document.getElementById('knowledge-hub');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (target === 'about') {
        const el = document.getElementById('node-info');
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
    }, 50);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'schemes', label: 'Government Schemes' },
    { id: 'jobs', label: 'Latest Jobs' },
    { id: 'education', label: 'Education' },
    { id: 'tools', label: 'Tools' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-[#E2E8F0] transition-shadow duration-200" style={{ boxShadow: isScrolled ? '0 4px 12px rgba(16, 42, 86, 0.08)' : 'none' }}>
      
      {/* Top Quiet Citizen Advisory Ribbon */}
      <div className="bg-[#102A56] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-[#F59E0B]">Independent Citizen Portal</span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="text-slate-300 truncate">Digital Assistance, Official Recruitment Updates &amp; Citizen Welfare Guides</span>
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
                className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1 font-medium text-[#F59E0B]"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Title */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg p-1 -ml-1 shrink-0"
          title="CSC DOST - Home"
        >
          <img
            src="/favicon.svg"
            alt="CSC DOST"
            width="38"
            height="38"
            className="w-9 h-9 sm:w-9 sm:h-9 object-contain shrink-0"
          />
          <div className="leading-tight">
            <span className="text-lg sm:text-xl font-black text-[#102A56] tracking-tight block">
              CSC DOST
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] block">
              Digital Citizen Desk
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-0.5 2xl:gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => navigateTo(link.id)}
              className={`px-2.5 py-1.5 text-[13px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeItem === link.id
                  ? 'text-[#2563EB] bg-[#EFF6FF]'
                  : 'text-[#0F172A] hover:text-[#2563EB] hover:bg-[#F8FAFC]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Functional Search Trigger + Explore Services CTA + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Functional Search Control */}
          <button
            type="button"
            onClick={triggerSearchFocus}
            className="flex items-center gap-2 px-3 py-2 text-xs text-[#64748B] bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#E2E8F0] rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            title="Search jobs, schemes, guides and services (Press / or Ctrl+K)"
            aria-label="Search CSC DOST"
          >
            <Search className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden md:inline font-semibold">Search...</span>
            <kbd className="hidden lg:inline text-[10px] bg-white border border-[#E2E8F0] px-1.5 py-0.5 rounded text-slate-400 font-mono">
              /
            </kbd>
          </button>

          {/* Explore Services CTA Button */}
          <button
            type="button"
            onClick={() => navigateTo('services')}
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
          >
            <span>Explore Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#E2E8F0] px-4 py-4 space-y-3 shadow-lg animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E2E8F0]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => navigateTo(link.id)}
                className={`text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeItem === link.id
                    ? 'text-[#2563EB] bg-[#EFF6FF]'
                    : 'text-[#0F172A] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigateTo('services')}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl text-center shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('track')}
              className="w-full py-2 bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] text-xs font-bold rounded-xl text-center cursor-pointer"
            >
              Track Existing Application
            </button>
          </div>
        </div>
      )}

    </header>
  );
}
