import React, { useState, useEffect } from 'react';
import { ArrowUp, ShieldCheck, Heart, Info, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { PolicyTab } from './PrivacyPolicyModal';

interface FooterProps {
  cafeName: string;
  onOpenPrivacyPolicy?: (tab?: PolicyTab) => void;
}

export default function Footer({ cafeName, onOpenPrivacyPolicy }: FooterProps) {
  const [showScroll, setShowScroll] = useState(false);
  const [showCookie, setShowCookie] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dismissCookie = () => {
    setShowCookie(false);
    localStorage.setItem('cookie_dismissed_2026', 'true');
  };

  useEffect(() => {
    if (localStorage.getItem('cookie_dismissed_2026')) {
      setShowCookie(false);
    }
  }, []);

  return (
    <>
      {/* TRICOLOR TOP FOOTER ACCENT */}
      <div className="w-full h-[4px] bg-gradient-to-r from-[#FF9933] via-white to-[#128807] shadow-inner mt-16"></div>

      <footer id="footer" className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          


          {/* GOOGLE MAPS LOCATION CARD */}
          <div className="mb-10 p-5 md:p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
            <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
              
              {/* Location Information */}
              <div className="flex-1 space-y-3 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold w-fit">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>CSC DOST Location</span>
                </div>

                <h3 className="text-base md:text-lg font-black text-white">
                  Visit Our Official Common Service Centre
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Verified CSC Node (ID: <strong className="text-white">212515670018</strong>). Visit us for instant offline assistance with online applications, document verification, Aadhaar &amp; PAN card updates, e-KYC, and digital certificates.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="https://share.google/9jGqiH9vxn5BNUES3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all cursor-pointer group"
                    id="open-google-maps-btn"
                  >
                    <Navigation className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <a
                    href="https://share.google/9jGqiH9vxn5BNUES3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-white underline font-semibold transition-colors flex items-center gap-1"
                  >
                    Get Driving Directions
                  </a>
                </div>
              </div>

              {/* Map Preview / Frame */}
              <div className="w-full md:w-80 lg:w-96 h-48 md:h-auto min-h-[160px] rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950 flex flex-col justify-between p-4 group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-slate-950 pointer-events-none"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-800">
                    Live Location
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="relative z-10 text-center my-auto py-2">
                  <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-white">CSC DOST Service Station</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click to view location map &amp; navigation</p>
                </div>

                <a
                  href="https://share.google/9jGqiH9vxn5BNUES3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[11px] font-bold rounded-lg border border-slate-800 text-center transition-colors block"
                >
                  View Full Map ↗
                </a>
              </div>

            </div>
          </div>



          {/* LEGALITIES & POLICY */}
          <div className="pb-6 mb-6 border-b border-slate-900">
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2">Legalities &amp; Policy</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Biometric demographic transactions are safe &amp; encrypted directly via GoI portals. No client-side records are cached.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold text-slate-400 pt-1">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('privacy');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Privacy Policy
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('terms');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Terms of Use
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('hyperlink');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Hyperlink Policy
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('copyright');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Copyright Policy
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('disclaimer');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Disclaimer
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onOpenPrivacyPolicy) onOpenPrivacyPolicy('help');
                  }}
                  className="hover:text-white underline transition-colors cursor-pointer text-left font-bold"
                >
                  Help &amp; Support
                </button>
              </div>
            </div>
          </div>

          {/* GIGW FOOTER CREDITS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-950 pt-2">
            <div className="text-center md:text-left space-y-1">
              <p>© 2026 Verified Common Service Centre  ID :- 212515670018</p>
              <p className="text-slate-600">All Rights Reserved. Author: @Wasim Ahmad Khanday</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 text-[9px]">
              <span>Last Updated: 11 Jul 2026 (Live Release)</span>
              <span className="bg-slate-900 text-orange-400 px-2 py-0.5 rounded-md font-mono border border-slate-800">
                Visitor Hits Counter: 24,958,102
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Back to Top floating arrow */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-[#e66e19] hover:bg-orange-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all z-40 animate-fade-in"
          aria-label="Back to top"
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Cookie consent compliance banner */}
      {showCookie && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl z-40 animate-fade-in flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">
              We utilize local browser cookies to temporarily store your secure administrator desk credentials and session preferences in accordance with GIGW rules.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={dismissCookie}
              className="px-4 py-1.5 bg-[#e66e19] hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-colors"
              id="cookie-accept-btn"
            >
              I Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
