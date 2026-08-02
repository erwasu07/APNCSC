import React, { useState } from 'react';
import { Shield, Calendar, PhoneCall, Cpu, Sparkles, Eye, Languages, Home, Briefcase, Flame, Info, Menu, X, Star, ShieldCheck, Lock, Key } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
  onOpenAdmin?: () => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  cafeName,
  onOpenPrivacyPolicy,
  onOpenAdmin
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
    setTimeout(() => {
      if (id === 'hero' || id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetId = (id === 'csc-info' || id === 'node-info') ? 'node-info' : id;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="w-full z-50 flex flex-col relative" id="hero">
      {/* 1. TOP UTILITY GOVT BAR - EXACT CSC DOST DESIGN */}
      <div className="bg-[#0b1329] text-xs font-sans text-slate-200 py-1.5 px-3 sm:px-4 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: Helpdesk & Operating hours */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-[11px] font-sans">
            <div className="flex items-center gap-2">
              <span>📞 Helpdesk: <strong className="text-white font-bold">+91 70068 33767</strong></span>
              <span className="text-slate-400 hidden lg:inline">|</span>
              <span className="text-amber-300 font-semibold hidden lg:inline">🕒 Hours: 09:00 AM to 08:30 PM</span>
            </div>
          </div>

          {/* Right: Language, Text Size controllers & WhatsApp Support link */}
          <div className="flex items-center gap-2.5 self-center md:self-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#1e293b] p-0.5 rounded text-[10px] font-bold border border-slate-700/60 shadow-xs">
              <button 
                onClick={() => handleLanguageChange('EN')} 
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer font-extrabold flex items-center gap-1 ${
                  lang === 'EN' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="Switch portal language to English"
              >
                ENG
              </button>
              <button 
                onClick={() => handleLanguageChange('HI')} 
                className={`px-2.5 py-0.5 rounded transition-all cursor-pointer font-extrabold flex items-center gap-1 ${
                  lang === 'HI' 
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="पोर्टल की भाषा हिंदी में बदलें"
              >
                हिंदी
              </button>
            </div>

            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-1">
              <button 
                onClick={() => handleFontSizeChange('normal')}
                className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors cursor-pointer ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'}`}
                title="Normal Text Size"
              >
                -A
              </button>
              <button 
                onClick={() => handleFontSizeChange('large')}
                className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors cursor-pointer ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'}`}
                title="Large Text Size"
              >
                A
              </button>
              <button 
                onClick={() => handleFontSizeChange('larger')}
                className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors cursor-pointer ${fontSize === 'larger' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'}`}
                title="Larger Text Size"
              >
                +A
              </button>
            </div>

            <a
              href="https://wa.me/917006833767?text=Hello!%20I%20need%20assistance%20with%20a%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-md flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>💬</span>
              <span>WhatsApp Live Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN PORTAL HEADER - CENTERED CSC DOST BRANDING */}
      <div className="bg-gradient-to-r from-[#18204e] via-[#1c2661] to-[#171e4a] py-4 px-4 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          
          {/* Centered CSC DOST Logo & Tagline */}
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="relative shrink-0">
              <img 
                src="/favicon.svg" 
                alt="CSC DOST Logo" 
                className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-sans tracking-tight leading-none drop-shadow-sm">
                CSC DOST
              </h1>
              <p className="text-xs sm:text-sm text-yellow-300 font-bold tracking-tight">
                "A Digital Shop for Digital India"
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. NAVIGATION MENU BAR */}
      <nav className="bg-[#ffffff] text-slate-800 shadow-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-12 sm:h-13">
          
          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 text-xs sm:text-sm font-black uppercase tracking-wider h-full">
            {[
              { id: 'hero', label: 'HOME', icon: Home },
              { id: 'services', label: 'E-SERVICES', icon: Briefcase },
              { id: 'sarkari-board', label: 'SARKARI BULLETINS', icon: Flame, isCurrentTab: true },
              { id: 'node-info', label: 'CSC CENTRE INFO', icon: Info }
            ].map((item) => {
              const isActive = activeItem === item.id || item.isCurrentTab;
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    scrollInto(item.id);
                  }} 
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 font-black text-xs cursor-pointer ${
                    item.isCurrentTab 
                      ? 'bg-[#28307d] text-white shadow-sm' 
                      : 'text-slate-700 hover:text-[#28307d] hover:bg-slate-100'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right side: Staff Portal Link & Mobile Menu Trigger Button */}
          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden sm:flex items-center gap-1.5 p-2 bg-[#0a0f1d] hover:bg-slate-800 text-amber-500 hover:text-amber-400 rounded-lg transition-all cursor-pointer border border-slate-800 shadow-xs"
                title="Open Staff Portal Login Page"
              >
                <Lock className="w-4 h-4 text-amber-500" />
                <Key className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Responsive Mobile Menu Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-blue-900 rounded-lg cursor-pointer"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 text-white p-4 space-y-3 border-t border-slate-800 shadow-2xl animate-fade-in z-50">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-amber-400" />
                Language / भाषा:
              </span>
              <div className="flex items-center bg-slate-800 p-0.5 rounded text-[11px] font-bold border border-slate-700">
                <button 
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
                { id: 'hero', label: 'HOME' },
                { id: 'services', label: 'E-SERVICES' },
                { id: 'sarkari-board', label: 'SARKARI BULLETINS' },
                { id: 'node-info', label: 'CSC CENTRE INFO' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    scrollInto(item.id);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  {item.label}
                </button>
              ))}

              {onOpenAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full text-left px-3 py-2 mt-1 text-xs font-black text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-lg flex items-center gap-2 border border-amber-500/30 cursor-pointer"
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
