import React, { useState } from 'react';
import { Shield, Calendar, PhoneCall, Cpu, Sparkles, Eye, Languages, Home, Briefcase, Flame, Info, Menu, X, Star, ShieldCheck, Lock, Key, Sun, Moon, BookOpen, Bell, FileCheck, Search } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface NavbarProps {
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
  onHomeClick?: () => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  cafeName,
  onOpenPrivacyPolicy,
  onOpenAdmin,
  onHomeClick
}: NavbarProps) {
  const [lang, setLang] = useState<'EN' | 'HI'>(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie;
      if (cookies.includes('googtrans=/en/hi') || cookies.includes('googtrans=/auto/hi') || localStorage.getItem('site_lang') === 'HI') {
        return 'HI';
      }
    }
    return 'EN';
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('hero');

  const handleLanguageChange = (newLang: 'EN' | 'HI') => {
    setLang(newLang);
    if (typeof window === 'undefined') return;

    localStorage.setItem('site_lang', newLang);
    const code = newLang === 'HI' ? 'hi' : 'en';

    // Set cookie for Google Translate widget
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${code}; path=/;`;
    document.cookie = `googtrans=/en/${code}; domain=${domain}; path=/;`;
    document.cookie = `googtrans=/en/${code}; domain=.${domain}; path=/;`;

    // Attempt to select language inside Google Translate dropdown
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = code;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      // Reload page to apply google translate cookie
      window.location.reload();
    }
  };

  const handleFontSizeChange = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (size === 'normal') root.style.fontSize = '100%';
      else if (size === 'large') root.style.fontSize = '108%';
      else if (size === 'larger') root.style.fontSize = '116%';
    }
  };

  const scrollInto = (id: string) => {
    setActiveItem(id);
    setMobileMenuOpen(false);
    if (id === 'hero' || id === 'home') {
      if (onHomeClick) {
        onHomeClick();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'apply') {
      window.location.hash = '#apply';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'track') {
      window.location.hash = '#track';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setTimeout(() => {
      const targetId = (id === 'csc-info' || id === 'node-info') ? 'node-info' : id;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className="w-full z-50 flex flex-col relative" id="hero">
      {/* MAIN PORTAL HEADER - CENTERED CSC DOST BRANDING */}
      <div className="bg-gradient-to-r from-[#18204e] via-[#1c2661] to-[#171e4a] py-3.5 sm:py-4 px-3 sm:px-4 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          
          {/* Centered CSC DOST Logo & Tagline */}
          <button 
            type="button"
            onClick={() => scrollInto('hero')}
            className="flex items-center justify-center gap-2.5 sm:gap-3 text-center cursor-pointer hover:opacity-95 transition-opacity bg-transparent border-0 p-0"
            title="Go to Homepage"
          >
            <div className="relative shrink-0">
              <img 
                src="/favicon.svg" 
                alt="CSC DOST Logo" 
                width="56"
                height="56"
                fetchPriority="high"
                decoding="async"
                className="w-10 h-10 sm:w-13 sm:h-13 md:w-14 md:h-14 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="text-center sm:text-left space-y-0.5 sm:space-y-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white font-sans tracking-tight leading-none drop-shadow-sm">
                CSC DOST
              </h1>
              <p className="text-[11px] sm:text-sm text-yellow-300 font-bold tracking-tight">
                "A Digital Shop for Digital India"
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* 3. NAVIGATION MENU BAR */}
      <nav className="bg-[#ffffff] text-slate-800 shadow-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between h-12 sm:h-13 gap-1">
          
          {/* Navigation Links - Mobile-optimized horizontal navigation */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-black uppercase tracking-wider h-full overflow-x-auto no-scrollbar whitespace-nowrap py-1 scroll-smooth">
            {[
              { id: 'hero', label: 'HOME', shortLabel: 'HOME', icon: Home },
              { id: 'apply', label: 'APPLY ONLINE', shortLabel: 'APPLY', icon: FileCheck },
              { id: 'track', label: 'TRACK STATUS', shortLabel: 'TRACK', icon: Search },
              { id: 'services', label: 'E-SERVICES', shortLabel: 'SERVICES', icon: Briefcase },
            ].map((item) => {
              const isActive = activeItem === item.id;
              const IconComp = item.icon;
              return (
                <button 
                  key={item.id}
                  type="button"
                  onClick={() => {
                    scrollInto(item.id);
                  }} 
                  className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-1.5 font-black text-[11px] sm:text-xs cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-[#28307d] text-white shadow-xs' 
                      : 'text-slate-700 hover:text-[#28307d] hover:bg-slate-100'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>
                  <span className="inline sm:hidden whitespace-nowrap">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Notifications, Staff Portal Link & Mobile Menu Trigger Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 pl-1 border-l border-slate-200 sm:border-0">
            {/* Push Notifications Alert Trigger */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-push-notification-prompt'));
                }
              }}
              className="relative flex items-center justify-center p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 rounded-lg transition-all cursor-pointer border border-amber-200 dark:border-amber-800 shadow-xs shrink-0"
              title="Enable / Check Sarkari Job Notification Alerts"
              id="navbar-notification-btn"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-bounce" style={{ animationDuration: '3s' }} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1 p-1.5 sm:p-2 bg-[#0a0f1d] hover:bg-slate-800 text-amber-500 hover:text-amber-400 rounded-lg transition-all cursor-pointer border border-slate-800 shadow-xs shrink-0"
                title="Open Staff Portal Login Page"
              >
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 hidden sm:inline" />
              </button>
            )}

            {/* Responsive Mobile Menu Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-slate-700 hover:text-blue-900 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="bg-slate-900 text-white p-4 space-y-3 border-t border-slate-800 shadow-2xl animate-fade-in z-50">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-amber-400" />
                Language / भाषा:
              </span>
              <div className="flex items-center bg-slate-800 p-0.5 rounded text-[11px] font-bold border border-slate-700">
                <button 
                  type="button"
                  onClick={() => handleLanguageChange('EN')} 
                  className={`px-3 py-1 rounded transition-all cursor-pointer font-extrabold ${
                    lang === 'EN' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  ENG
                </button>
                <button 
                  type="button"
                  onClick={() => handleLanguageChange('HI')} 
                  className={`px-3 py-1 rounded transition-all cursor-pointer font-extrabold ${
                    lang === 'HI' 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {[
                { id: 'hero', label: 'HOME', icon: Home },
                { id: 'apply', label: 'APPLY ONLINE', icon: FileCheck },
                { id: 'track', label: 'TRACK STATUS', icon: Search },
                { id: 'services', label: 'E-SERVICES', icon: Briefcase },
                { id: 'sarkari-board', label: 'SARKARI BULLETINS', icon: Flame },
                { id: 'knowledge-hub', label: 'GUIDES & SCHEMES', icon: BookOpen },
                { id: 'node-info', label: 'CSC CENTRE INFO', icon: Info }
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollInto(item.id);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-colors ${
                      isActive ? 'bg-blue-600 text-white font-black' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-left px-3.5 py-2.5 mt-1 text-xs font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-lg flex items-center gap-2 border border-amber-500/30 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>🔑 Staff Portal Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
