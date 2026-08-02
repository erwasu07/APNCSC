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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors duration-300 scroll-mt-24 w-full" id="node-info">
      <div className="w-full max-w-7xl mx-auto space-y-3.5">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black uppercase tracking-wider mb-1">
              <span>VERIFIED PHYSICAL CSC STATION</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              Common Service Centre Node Information
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              Visit our physical digital kiosk for biometric Aadhaar updates, e-KYC, and attestation.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>● ONLINE &amp; ACTIVE</span>
          </span>
        </div>

        {/* Physical Node Info */}
        <div className="bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3">
          
          {/* Node ID Bar */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
            <div className="bg-[#1e1b4b] text-white text-xs font-black px-2.5 py-1 rounded-lg font-mono">
              CSC
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white inline-block mr-2">
                Verified CSC Node Station
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                (ID: <strong className="text-slate-800 dark:text-slate-200">212515670018</strong>)
              </span>
            </div>
          </div>

          {/* Info Grid - 2 Columns on desktop for compact height */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Authorized VLE: </span>
                <span className="text-slate-600 dark:text-slate-400">Wasim Ahmad Khanday (212515670018)</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Operating Hours: </span>
                <span className="text-slate-600 dark:text-slate-400">Mon - Sat: 09:00 AM - 08:30 PM</span>
              </div>
            </div>

            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Physical Address: </span>
                <span className="text-slate-600 dark:text-slate-400">Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Helpdesk Hotline: </span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">+91 70068 33767</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Official Email: </span>
                <span className="text-slate-600 dark:text-slate-400 font-mono">www.khanday09@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Footer Row */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-end text-[10px] text-slate-400 font-mono">
            <span>VLE Rev-2026.1</span>
          </div>

        </div>

      </div>
    </div>
  );
}
