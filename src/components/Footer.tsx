import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  Lock,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { LegalTab } from './PrivacyPolicyModal';

interface FooterProps {
  cafeName: string;
  onOpenPrivacyPolicy: (tab?: LegalTab) => void;
  onOpenAdmin?: () => void;
}

export default function Footer({
  cafeName,
  onOpenPrivacyPolicy,
  onOpenAdmin,
}: FooterProps) {
  const scrollToSection = (id: string) => {
    if (
      window.location.hash === '#tools' ||
      window.location.hash.startsWith('#tools/') ||
      window.location.hash.startsWith('#apply') ||
      window.location.hash.startsWith('#track')
    ) {
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-[#102A43] text-slate-300 border-t border-slate-800 mt-0 md:mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 space-y-6 md:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Column 1: Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/favicon.svg"
                alt="CSC DOST Logo"
                className="w-10 h-10 rounded-xl shrink-0 object-contain"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                  {cafeName || 'CSC DOST'}
                </span>
                <span className="text-xs text-slate-400 font-medium block mt-1">
                  Citizen Service &amp; Information Portal
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Digital service assistance, online application submissions, recruitment notices, government scheme guides, education updates, and document preparation tools for citizens.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                CSC ID: 212515670018
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
                UDYAM-JK-01-0041957
              </span>
            </div>
          </div>

          {/* Column 2: Main Navigation (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Main Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('popular-services')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Popular Services
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('services')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Complete Service Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('recruitment-section')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Latest Jobs &amp; Notices
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('schemes-section')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Government Schemes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('education-resources')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Education Updates
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#tools';
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Online Document Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#track';
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Track Application Status
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Guides, Policies & Official Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Guides &amp; Policies
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('knowledge-hub')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Citizen Guides &amp; Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('centre-info')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  About Our Centre
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('faq-section')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy('privacy')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy('terms')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenPrivacyPolicy('disclaimer')}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  Disclaimer &amp; Refund Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Helpdesk (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact &amp; Centre Details
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Sangran Qazigund, Anantnag, Jammu &amp; Kashmir — 192221
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
                <a href="tel:+917006833767" className="hover:text-white transition-colors">
                  +91 70068 33767
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:www.khanday09@gmail.com"
                  className="hover:text-white transition-colors break-all"
                >
                  www.khanday09@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
                <span>Mon – Sat: 09:00 AM – 08:30 PM</span>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href="https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Join WhatsApp Group</span>
                <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Independent Service Disclaimer Box */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong className="text-white">Independent Service Disclaimer:</strong> CSC DOST (<span className="text-white">https://www.cscdost.com/</span>) is an independent citizen service assistance and informational portal operated by Authorised CSC VLE Wasim Ahmad Khanday (CSC ID: 212515670018). This website is not affiliated with or operated by any government ministry or recruitment board. Applicants are advised to verify official notifications on their respective government domains before final submission.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Staff Login */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} {cafeName || 'CSC DOST'}. Operated by Wasim Ahmad Khanday, Sangran Qazigund, Anantnag (J&amp;K).
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenPrivacyPolicy('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onOpenPrivacyPolicy('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onOpenPrivacyPolicy('disclaimer')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Disclaimer
            </button>
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Authorized CSC Staff Login"
              >
                <Lock className="w-3 h-3" aria-hidden="true" />
                <span>Staff Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
