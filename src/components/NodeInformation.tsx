import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink,
  Award,
  Maximize2,
  X,
  FileCheck2,
  Calendar,
  CheckCircle2,
  QrCode
} from 'lucide-react';

export default function NodeInformation() {
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors duration-300 scroll-mt-24 w-full" id="node-info">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-slate-950 rounded text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-slate-950" />
                VERIFIED PHYSICAL CSC STATION
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-extrabold uppercase tracking-wider">
                <Award className="w-3 h-3 text-amber-300" />
                AUTHORIZED CSC VLE CERTIFIED
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              CSC Centre Info &amp; Authorized VLE Credentials
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
              Verified digital kiosk operated by authorized CSC Village Level Entrepreneur (VLE) Wasim Ahmad Khanday.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 rounded-full text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>● ONLINE &amp; ACTIVE NODE</span>
          </span>
        </div>

        {/* Physical Node Info & Certificate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left / Top Col: Center Details */}
          <div className="lg:col-span-7 bg-slate-50/70 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-3 flex flex-col justify-between">
            
            {/* Node ID Bar */}
            <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="bg-[#1e1b4b] text-white text-xs font-black px-2.5 py-1 rounded-lg font-mono">
                  CSC
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white inline-block mr-1">
                    Verified CSC Node Station
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    (ID: <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">212515670018</strong>)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-[10.5px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <Award className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>Verify VLE Certificate</span>
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Authorized VLE: </span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Wasim Ahmad Khanday</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Center Name: </span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">CSC Common Service Centre</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Registration Date: </span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">11-11-2020</span>
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
                  <span className="text-slate-600 dark:text-slate-400">Sangran Qazigund, Anantnag, Jammu and Kashmir 192221</span>
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
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                VLE Reg. Active &amp; Govt Approved
              </span>
              <span>VLE Rev-2026.1</span>
            </div>

          </div>

          {/* Right Col: Interactive Certificate Proof Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-3.5 text-white space-y-3 border border-indigo-700/50 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Official CSC VLE Certificate
                  </span>
                </div>
                <span className="px-1.5 py-0.5 bg-emerald-500 text-slate-950 font-black rounded text-[9px] uppercase font-mono">
                  VERIFIED
                </span>
              </div>

              <p className="text-[11px] text-slate-200 leading-tight">
                Issued by <strong>CSC E-Governance Services India Limited</strong> (Ministry of Electronics &amp; IT, Govt of India).
              </p>

              {/* Certificate Preview Box */}
              <div 
                onClick={() => setShowCertificateModal(true)}
                className="group relative bg-white rounded-lg p-2 overflow-hidden border border-amber-400/40 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
              >
                <img 
                  src="/csc-vle-certificate.svg" 
                  alt="Official CSC VLE Certificate - Wasim Ahmad Khanday" 
                  width="360"
                  height="144"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-36 object-contain rounded"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  <span className="px-3 py-1.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Click to View Full Certificate</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate Key Info Bar */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-950/60 p-2 rounded-lg border border-indigo-800/60 font-mono">
              <div>
                <span className="text-slate-400 block">CSC ID:</span>
                <strong className="text-amber-300 font-black text-xs">212515670018</strong>
              </div>
              <div>
                <span className="text-slate-400 block">REGISTRATION DATE:</span>
                <strong className="text-emerald-400 font-bold">11-11-2020</strong>
              </div>
            </div>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Inspect Full Certificate Proof</span>
            </button>
          </div>

        </div>

      </div>

      {/* FULL CERTIFICATE MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400/20 text-amber-400 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold font-display leading-tight">
                    Official Common Service Center VLE Certificate
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    CSC ID: 212515670018 • Registration Date: 11-11-2020
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCertificateModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Close Certificate Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Main Certificate Graphic Display */}
              <div className="bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <img 
                  src="/csc-vle-certificate.svg" 
                  alt="Official CSC VLE Certificate of Wasim Ahmad Khanday" 
                  width="800"
                  height="550"
                  loading="lazy"
                  decoding="async"
                  className="w-full max-h-[55vh] object-contain rounded shadow-lg bg-white"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Verified Details Breakdown Table */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Certificate Registry Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Authorized VLE Name</span>
                    <strong className="text-slate-900 dark:text-white font-bold">Wasim Ahmad Khanday</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">CSC ID Number</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-black">212515670018</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Date of Registration</span>
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">11-11-2020</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Center Name</span>
                    <strong className="text-slate-900 dark:text-white font-bold">CSC Common Service Centre</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Date of Birth</span>
                    <strong className="text-slate-500 dark:text-slate-400 font-mono italic">Protected / Hidden for Security</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">District &amp; State</span>
                    <strong className="text-slate-900 dark:text-white font-bold">Anantnag, Jammu &amp; Kashmir</strong>
                  </div>
                </div>

                <div className="pt-2 text-[10.5px] text-slate-500 leading-relaxed italic border-t border-slate-200/60 dark:border-slate-800">
                  Electronic certificate issued by CSC E-Governance Services India Limited, Ministry of Electronics and Information Technology, Government of India, New Delhi.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <a 
                href="/csc-vle-certificate.svg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open High-Res Certificate</span>
              </a>

              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
