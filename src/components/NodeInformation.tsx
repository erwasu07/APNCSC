import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  Navigation, 
  Star, 
  ExternalLink 
} from 'lucide-react';

export default function NodeInformation() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm transition-colors duration-300 scroll-mt-24 w-full" id="node-info">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 rounded-md text-xs font-black uppercase tracking-wider shadow-xs">
            <span>VERIFIED PHYSICAL CSC STATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            Common Service Centre Node Information
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Visit our physical digital kiosk for biometric Aadhaar updates, e-KYC, and physical document attestation.
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Left Column: Physical Node Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5 flex flex-col justify-between">
            
            {/* Node ID Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-[#1e1b4b] text-white text-base font-black px-3 py-1.5 rounded-xl uppercase tracking-wider font-mono">
                  CSC
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Verified CSC Node Station
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold">
                    Node ID: <span className="text-slate-900 dark:text-slate-200">212515670018</span>
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d1fae5] text-[#047857] dark:bg-emerald-950/60 dark:text-emerald-400 rounded-full text-xs font-black border border-[#a7f3d0] dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping"></span>
                <span>● ONLINE &amp; ACTIVE</span>
              </span>
            </div>

            {/* Info Rows */}
            <div className="space-y-3.5 text-xs font-sans text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Authorized Village Level Entrepreneur (VLE):</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Wasim Ahmad Khanday (Certified VLE ID: 212515670018)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Station Physical Address:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">CSC DOST Kiosk, Main Market, Near Bus Stand, District CSC Hub, Jammu &amp; Kashmir - 192301</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Desk Operating Hours:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">Monday to Saturday: 09:00 AM - 08:30 PM (Sunday Reserved)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Direct Citizen Helpdesk Hotline:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">+91 70068 33767</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Official Email Support:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400 font-mono">khanday09@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ministry of Electronics &amp; IT Partner</span>
              </span>
              <span>VLE Rev-2026.1</span>
            </div>

          </div>

          {/* Right Column: Dark Navigation Card */}
          <div className="lg:col-span-5 bg-[#0c1021] text-white rounded-2xl border border-indigo-950 shadow-md p-6 flex flex-col justify-between space-y-5">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black tracking-wide flex items-center gap-2">
                  <span>⚡ Live Navigation &amp; Maps Location</span>
                </h3>
                <span className="bg-[#312e81] text-[#a5b4fc] text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                  GPS Active
                </span>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-extrabold text-white">
                  CSC DOST VLE Hub #212515670018
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  District CSC Hub, J&amp;K
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  Located near Bus Stand main market. Biometric e-KYC scanner and instant card printing machinery ready on premise.
                </p>
              </div>

              {/* Rating Badge */}
              <div className="bg-[#1e1a0e] text-[#fbbf24] border border-[#78350f] p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <Star className="w-4 h-4 fill-[#fbbf24] text-[#fbbf24] shrink-0" />
                <span>Verified Google Business Listing • 4.9 ★★★★★ (1,240+ Reviews)</span>
              </div>
            </div>

            {/* Google Maps Button */}
            <a
              href="https://share.google/9jGqiH9vxn5BNUES3"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-center"
            >
              <Navigation className="w-4 h-4" />
              <span>📍 Open in Google Maps for Directions ↗</span>
            </a>

          </div>

        </div>

      </div>
    </div>
  );
}
