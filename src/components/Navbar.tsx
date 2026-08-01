import React, { useState } from 'react';
import { Shield, Calendar, PhoneCall, Cpu, Sparkles, Eye, Languages, Home, Briefcase, Flame, Info, Menu, X, Star, ShieldCheck } from 'lucide-react';
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
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('hero');

  const scrollInto = (id: string) => {
    setActiveItem(id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="w-full z-50 flex flex-col relative" id="main-gov-header">
      {/* 1. TOP UTILITY GOVT BAR - EXACT CSC DOST DESIGN */}
      <div className="bg-[#0b1329] text-xs font-sans text-slate-200 py-1.5 px-3 sm:px-4 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Left: IN badge, VLE Hub, Helpdesk & Operating hours */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-[11px] font-sans">
            <div className="flex items-center gap-1.5">
              <span className="bg-[#f59e0b] text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded uppercase">IN</span>
              <span className="font-extrabold text-amber-400">CSC VLE HUB</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-300 font-medium">Node ID: <strong className="text-white">212515670018</strong></span>
            </div>

            <div className="hidden sm:block text-slate-500">|</div>

            <div className="flex items-center gap-2">
              <span>📞 Helpdesk: <strong className="text-white font-bold">+91 70068 33767</strong></span>
              <span className="text-slate-400 hidden lg:inline">|</span>
              <span className="text-amber-300 font-semibold hidden lg:inline">🕒 Hours: 09:00 AM to 08:30 PM</span>
            </div>
          </div>

          {/* Right: Language, Text Size controllers & WhatsApp Support link */}
          <div className="flex items-center gap-2.5 self-center md:self-auto">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#1e293b] p-0.5 rounded text-[10px] font-bold">
              <button 
                onClick={() => setLang('EN')} 
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${lang === 'EN' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-300 hover:text-white'}`}
              >
                ENG
              </button>
              <button 
                onClick={() => setLang('HI')} 
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${lang === 'HI' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-300 hover:text-white'}`}
              >
                हिंदी
              </button>
            </div>

            {/* Text Size Controls */}
            <div className="hidden sm:flex items-center gap-1">
              <button 
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors cursor-pointer ${fontSize === 'normal' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'}`}
                title="Normal Text Size"
              >
                -A
              </button>
              <button 
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded transition-colors cursor-pointer ${fontSize === 'large' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700'}`}
                title="Large Text Size"
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('larger')}
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

      {/* 2. MAIN CO-BRANDED PORTAL HEADER - EXACT SCREENSHOT BRANDING */}
      <div className="bg-gradient-to-r from-[#18204e] via-[#1c2661] to-[#171e4a] py-3.5 px-4 border-b border-blue-900/60 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-6">
          
          {/* Logo Column: CSC DOST Logo & Tagline */}
          <div className="flex items-center gap-3 text-left">
            <div className="relative shrink-0">
              <img 
                src="/favicon.svg" 
                alt="CSC DOST Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div className="text-left space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-sans tracking-tight leading-none drop-shadow-sm">
                  CSC DOST
                </h1>
                <span className="bg-[#f59e0b] text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                  CSC VLE HUB
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-yellow-300 font-bold tracking-tight">
                "A Digital Shop for Digital India" <span className="text-slate-300 font-medium">| Authorized Desk</span>
              </p>
            </div>
          </div>

          {/* Right Column: Co-branded Digital India & VLE Lockup */}
          <div className="hidden md:flex justify-end items-center">
            <div className="flex items-center gap-4 bg-[#111738]/90 border border-blue-400/30 p-2.5 px-4 rounded-xl shadow-inner">
              
              {/* Digital India Brand */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-900/80 border border-amber-400/60 text-amber-400 flex items-center justify-center font-extrabold text-xs shadow-xs">
                  IN
                </div>
                
                <div className="flex flex-col text-left font-sans select-none">
                  <span className="text-[12px] font-black italic text-white tracking-tight leading-none">
                    DIGITAL <span className="text-blue-400">INDIA</span>
                  </span>
                  <span className="text-[7px] text-slate-300 font-extrabold uppercase tracking-widest leading-none mt-1">
                    Power To Empower
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-[1px] bg-blue-800/80 self-center"></div>

              {/* VLE Code display */}
              <div className="flex flex-col text-left font-sans flex-shrink-0">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                  VLE CODE
                </span>
                <span className="text-[13px] font-black text-emerald-400 tracking-wider leading-tight mt-0.5">
                  212515670018
                </span>
              </div>

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
              { id: 'csc-info', label: 'CSC CENTRE INFO', icon: Info },
              { id: 'staff', label: 'STAFF PORTAL', icon: ShieldCheck, isStaff: true }
            ].map((item) => {
              const isActive = activeItem === item.id || item.isCurrentTab;
              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.isStaff && onOpenAdmin) {
                      onOpenAdmin();
                    } else {
                      scrollInto(item.id);
                    }
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

          {/* Right side: Blinking Live Update Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[11px] font-black tracking-wider transition-all shadow-sm cursor-pointer animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span>LIVE UPDATE &gt;</span>
            </div>

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
          <div className="md:hidden bg-slate-900 text-white p-4 space-y-2 border-t border-slate-800 shadow-2xl animate-fade-in z-50">
            <div className="flex flex-col gap-1">
              {[
                { id: 'hero', label: 'HOME' },
                { id: 'services', label: 'E-SERVICES' },
                { id: 'sarkari-board', label: 'SARKARI BULLETINS' },
                { id: 'csc-info', label: 'CSC CENTRE INFO' },
                { id: 'staff', label: 'STAFF PORTAL', isStaff: true }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.isStaff && onOpenAdmin) {
                      onOpenAdmin();
                    } else {
                      scrollInto(item.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800 rounded-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
