import React, { useState, useEffect } from 'react';
import { Phone, Users, CheckCircle, Calendar, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { Announcement, WebsiteSettings } from '../types';

interface HeroProps {
  settings: WebsiteSettings;
  announcements: Announcement[];
  onVisitClick: () => void;
}

export default function Hero({ settings, announcements, onVisitClick }: HeroProps) {
  const [activeAnnIndex, setActiveAnnIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAnnIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [announcements]);

  const activeAnn = announcements[activeAnnIndex];

  // WhatsApp click handler
  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello! I would like to enquire about your services at ${settings.cafeName}.`);
    const cleanNumber = settings.whatsapp.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <section id="hero" className="relative py-12 md:py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Background blobs */}
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-300 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute -right-20 top-20 w-80 h-80 bg-orange-300 dark:bg-orange-900/20 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Dynamic Announcements Carousel Alert */}
        {activeAnn && (
          <div className="mb-8 max-w-3xl mx-auto animate-fade-in">
            <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 shadow-sm ${
              activeAnn.type === 'warning' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40' :
              activeAnn.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
              activeAnn.type === 'error' ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40' :
              'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/40'
            }`}>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase mt-0.5 tracking-wider select-none ${
                activeAnn.type === 'warning' ? 'bg-orange-500 text-white' :
                activeAnn.type === 'success' ? 'bg-emerald-600 text-white' :
                activeAnn.type === 'error' ? 'bg-rose-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {activeAnn.type === 'warning' ? 'Alert' : activeAnn.type === 'success' ? 'Update' : activeAnn.type === 'error' ? 'Important' : 'Info'}
              </span>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{activeAnn.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activeAnn.content}</p>
              </div>
              {announcements.length > 1 && (
                <div className="flex gap-1 self-center">
                  {announcements.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveAnnIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeAnnIndex === idx ? 'bg-blue-600 w-4' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      aria-label={`Announcement bullet ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 rounded-full text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Government Approved Authorized CSC Center
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-950 dark:text-white leading-tight tracking-tight font-display">
              Simplify Your Documentations &amp; <span className="text-blue-600 relative inline-block">Digital Services<span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 dark:bg-blue-900/40 -z-10 rounded"></span></span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Skip the long queues. APNACSC provides safe e-governance registrations, official certificates applications, online form filling, and professional high-speed printing under one roof.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onVisitClick}
                className="w-full sm:w-auto px-8 py-4 bg-[#0a3a75] hover:bg-blue-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                id="hero-visit-btn"
              >
                Visit Our Store
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm transition-all flex items-center justify-center gap-2"
                id="hero-whatsapp-btn"
              >
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                WhatsApp Message
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-4">
              <span className="flex items-center gap-1">✅ Aadhaar Card &amp; PAN Verified</span>
              <span className="flex items-center gap-1">✅ Authorized CSC Services</span>
              <span className="flex items-center gap-1">✅ High-Speed Fiber Internet</span>
            </div>
          </div>

          {/* Graphical Cards Right Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Glass Card Showcase */}
              <div className="relative z-10 p-6 rounded-3xl border glass-panel shadow-2xl dark:shadow-slate-950/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 font-display">
                  <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                  APNACSC Digital Portal
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/20">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                      👤
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Aadhaar &amp; PAN Services</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Update details, apply new cards, or print instantly</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/20">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 flex items-center justify-center font-bold">
                      📝
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Government Registrations</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Voter ID, Ayushman Card, and dynamic state updates</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                      📄
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">E-Form Submission Help</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Sarkari jobs, admission forms, and admit cards support</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-blue-900 dark:bg-blue-950 text-white rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-orange-400 font-extrabold uppercase tracking-wide">Portal Office Hours</span>
                    <span className="text-xs font-semibold">{settings.officeHours.split(',')[0]}</span>
                  </div>
                  <button 
                    onClick={onVisitClick}
                    className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold rounded-lg transition-colors"
                  >
                    Apply Now
                  </button>
                </div>
              </div>

              {/* Decorative side badge */}
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-lg z-20 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">Authorized CSC</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">ID: 495811029410</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Counter Badges Section */}
        <div className="mt-16 sm:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">15,000+</span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1 block">Happy Customers</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">35,000+</span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1 block">Services Completed</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">10+</span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1 block">Years Experience</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="block text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">100%</span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1 block">Safe &amp; Verified</span>
          </div>
        </div>

      </div>
    </section>
  );
}
