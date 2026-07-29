import React, { useState } from 'react';
import { Sun, Moon, Shield, Calendar, PhoneCall, Cpu, Sparkles, Eye, Languages, Home, Briefcase, Flame, Info, Headphones, Menu, X, Star, ShieldCheck } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
}

export default function Navbar({
  darkMode,
  setDarkMode,
  cafeName,
  onOpenPrivacyPolicy
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
      {/* 1. TOP UTILITY GOVT BAR - CSC.GOV.IN DESIGN */}
      <div className="bg-[#eaeaea] dark:bg-slate-950 border-b border-slate-300 dark:border-slate-900 text-xs font-sans text-slate-700 dark:text-slate-300 py-1.5 sm:py-2 px-3 sm:px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-3">
          {/* Left: Text Size controllers (Hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-1.5 self-center sm:self-auto">
            <span className="text-slate-700 dark:text-slate-300 font-bold text-[10px] sm:text-[11px] mr-0.5 sm:mr-1">Text Size :</span>
            <button 
              onClick={() => setFontSize('normal')}
              className="px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-[11px] font-extrabold text-white bg-[#5bc0de] hover:bg-[#31b0d5] border border-[#46b8da] rounded shadow-sm transition-colors cursor-pointer"
              title="Normal Text Size"
            >
              -A
            </button>
            <button 
              onClick={() => setFontSize('large')}
              className="px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-[11px] font-extrabold text-white bg-[#5bc0de] hover:bg-[#31b0d5] border border-[#46b8da] rounded shadow-sm transition-colors cursor-pointer"
              title="Large Text Size"
            >
              A
            </button>
            <button 
              onClick={() => setFontSize('larger')}
              className="px-1.5 py-0.5 sm:px-2 text-[10px] sm:text-[11px] font-extrabold text-white bg-[#5bc0de] hover:bg-[#31b0d5] border border-[#46b8da] rounded shadow-sm transition-colors cursor-pointer"
              title="Larger Text Size"
            >
              +A
            </button>
          </div>

          {/* Right: Helpdesk number and operating hours */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-sans text-slate-700 dark:text-slate-300 text-center sm:text-left">
            <span className="text-sm sm:text-base text-slate-800 dark:text-slate-200">📞</span>
            <span className="leading-snug">
              Helpdesk <span className="font-bold text-slate-950 dark:text-white">+91 70068 33767</span> - <span className="text-[#a4630a] dark:text-amber-400 font-extrabold">Hours: 09:00 AM to 08:30 PM (Mon-Sat)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. INDIAN FLAG TRICOLOR BAR */}
      <div className="w-full h-[3px] sm:h-[4px] bg-gradient-to-r from-[#FF9933] via-white to-[#128807] shadow-sm z-10"></div>

      {/* 3. MAIN CO-BRANDED PORTAL HEADER */}
      <div className="bg-white dark:bg-slate-900 py-2 sm:py-5 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-6">
          
          {/* Logo Column: Common Services Centre (CSC) */}
          <div className="flex-1 text-center md:text-left flex flex-row items-center justify-center md:justify-start gap-2 sm:gap-3">
            <img src="/favicon.svg" alt="CSC DOST Logo" className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain shrink-0 drop-shadow-sm" referrerPolicy="no-referrer" />
            <div className="text-left md:text-left">
              <h1 className="text-xs sm:text-xl md:text-[27px] font-extrabold text-[#0051a5] dark:text-blue-400 font-sans tracking-tight leading-tight">
                Common Services Centre (CSC)
              </h1>
              <p className="text-[7.5px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                A Digital Shop for Digital India • CSC DOST
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Co-branded CSC Digital Seva & Digital India Logo lockup (Hidden on mobile to save vertical space) */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-4">
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-2.5 px-4 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm hover:shadow transition-all max-w-full overflow-hidden">
              
              {/* Left Brand: Digital India */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  {/* Saffron (orange) top-right curve */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent transform rotate-45"></div>
                  {/* Green bottom-left curve */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-b-emerald-600 border-l-emerald-600 border-t-transparent border-r-transparent transform rotate-45 animate-pulse"></div>
                  {/* Inner logo: Blue 'i' with a blue diamond dot */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-500 font-extrabold text-lg italic leading-none -mt-1 select-none">i</span>
                    {/* Tiny diamond representing 'Power to Empower' */}
                    <div className="w-1.5 h-1.5 bg-blue-700 dark:bg-blue-500 rotate-45 -mt-0.5 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex flex-col text-left font-sans select-none">
                  <span className="text-[12px] font-black italic text-slate-850 dark:text-white tracking-tight leading-none">
                    digital <span className="text-blue-700 dark:text-blue-400">india</span>
                  </span>
                  <span className="text-[6.5px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-1">
                    Power To Empower
                  </span>
                </div>
              </div>

              {/* Vertical Elegant Divider */}
              <div className="h-9 w-[1px] bg-slate-200 dark:bg-slate-800 self-center"></div>

              {/* Right Brand: CSC & Digital Seva */}
              <div className="flex flex-col text-left font-sans flex-shrink-0">
                {/* CSC Logo header line */}
                <div className="flex items-center gap-1">
                  {/* Stylized "CSC" */}
                  <span className="text-sm font-black tracking-tighter text-[#0051a5] dark:text-blue-400">C</span>
                  <span className="text-sm font-black tracking-tighter text-[#708090] dark:text-slate-400 border-x border-slate-300 dark:border-slate-700 px-0.5">S</span>
                  <span className="text-sm font-black tracking-tighter text-[#0051a5] dark:text-blue-400">C</span>
                  <span className="text-[5.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-tight scale-90 origin-left">
                    e-Gov Services
                  </span>
                </div>

                {/* DIGITAL SEVA main brand with orange divider line */}
                <div className="mt-0.5 border-b border-orange-500 pb-0.5 pr-1">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider block leading-none">
                    DIGITAL <span className="text-blue-800 dark:text-blue-400">SEVA</span>
                  </span>
                </div>

                {/* Common Services Center subtitle */}
                <span className="text-[7.5px] text-cyan-600 dark:text-cyan-400 font-bold leading-normal mt-0.5 select-none">
                  Common Services Center
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 4. PREMIUM NAVIGATION MENU BAR WITH DECENT COLORS, HOVER EFFECTS, AND HIGHLIGHTED TEXTS */}
      <nav className="bg-gradient-to-r from-[#0d3164]/95 via-[#0c2a54]/95 to-[#0d3164]/95 dark:from-[#091f3b]/95 dark:via-[#051426]/95 dark:to-[#091f3b]/95 text-white shadow-xl sticky top-0 z-50 border-y border-white/10 dark:border-slate-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          
          {/* Navigation Links with premium effects */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 text-sm lg:text-base font-black uppercase tracking-wider h-full">
            {[
              { id: 'hero', label: 'Home', icon: Home, highlight: false },
              { id: 'services', label: 'E-Services', icon: Briefcase, highlight: true },
              { id: 'sarkari-board', label: 'Sarkari Bulletins', icon: Flame, badge: 'Hot' }
            ].map((item) => {
              const IconComp = item.icon;
              const isActive = activeItem === item.id;
              return (
                <button 
                  key={item.id}
                  onClick={() => scrollInto(item.id)} 
                  className={`relative px-5 py-2.5 mx-1 rounded-2xl transition-all duration-300 flex items-center gap-2.5 group cursor-pointer overflow-hidden ${
                    isActive 
                      ? 'bg-white/10 text-white shadow-inner font-extrabold border border-white/10' 
                      : 'text-slate-200/90 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Animated backdrop glow on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  
                  {/* Icon with beautiful float effect */}
                  <IconComp className={`w-5 h-5 transform group-hover:scale-110 group-hover:-translate-y-0.5 transition-all duration-300 ${
                    isActive ? 'text-amber-400' : 'text-slate-300 group-hover:text-amber-300'
                  }`} />
                  
                  {/* Text highlight and hover color shifts */}
                  <span className={`relative z-10 transition-colors duration-300 ${
                    item.highlight 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 font-extrabold' 
                      : isActive 
                      ? 'text-amber-300' 
                      : 'text-slate-100 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>

                  {/* Premium badge */}
                  {item.badge && (
                    <span className="px-1.5 py-0.5 bg-red-650 text-[9px] text-white font-extrabold uppercase rounded-md leading-none animate-pulse shadow-sm shadow-red-500/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Precise slider underline active state */}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[3.5px] bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Accessibility Settings & Mode switches */}
          <div className="flex items-center gap-2">
            
            {/* Help & Support Button */}
            <button
              onClick={() => onOpenPrivacyPolicy && onOpenPrivacyPolicy('help')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Help & Support Center"
              id="help-support-nav-btn"
            >
              <Headphones className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Help &amp; Support</span>
            </button>

            {/* Privacy Policy Button */}
            <button
              onClick={() => onOpenPrivacyPolicy && onOpenPrivacyPolicy('privacy')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="View Privacy Policy"
              id="privacy-policy-nav-btn"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Privacy Policy</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-white/90 hover:text-amber-400 hover:bg-white/10 rounded-xl transition-all relative group cursor-pointer"
              aria-label="Toggle theme"
              id="theme-nav-toggle"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-white" />}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Responsive Mobile Menu Trigger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/95 hover:text-amber-400 hover:bg-white/10 rounded-xl transition-all"
              aria-label="Open Menu"
              id="mobile-menu-trigger"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* 5. SLICK MOBILE PREMIUM MENU DRAWER WITH ACCENT COLORS & GLOW EFFECTS */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0d2a54]/98 dark:bg-[#06152a]/98 backdrop-blur-lg border-b border-white/10 dark:border-slate-800 p-4 space-y-2 shadow-2xl animate-fade-in z-50">
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'hero', label: 'Home', icon: Home, highlight: false },
                { id: 'services', label: 'E-Services', icon: Briefcase, highlight: true },
                { id: 'sarkari-board', label: 'Sarkari Bulletins', icon: Flame, badge: 'Hot' }
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = activeItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollInto(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/30 text-amber-300 font-extrabold'
                        : 'hover:bg-white/5 text-slate-100 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-300'}`} />
                      <span className={`text-xs uppercase tracking-wider font-semibold ${
                        item.highlight ? 'text-amber-300 font-bold' : ''
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 bg-red-650 text-[8px] text-white font-extrabold uppercase rounded-md animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]"></div>}
                    </div>
                  </button>
                );
              })}

              {/* Help & Support Mobile Item */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('help');
                }}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all hover:bg-white/5 text-slate-100 hover:text-white cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-teal-400" />
                <span className="text-xs uppercase tracking-wider font-semibold text-teal-300">
                  Help &amp; Support
                </span>
              </button>

              {/* Privacy Policy Mobile Item */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('privacy');
                }}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all hover:bg-white/5 text-slate-100 hover:text-white cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300">
                  Privacy Policy
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
