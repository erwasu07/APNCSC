import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Database, 
  CreditCard, 
  Laptop, 
  Cpu, 
  Share2, 
  Lock, 
  ExternalLink, 
  UserCheck, 
  RefreshCw, 
  Mail, 
  Phone, 
  Globe, 
  X, 
  Check, 
  Copy, 
  Printer, 
  Building2, 
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sec-1');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const policyText = `CSC Dost - Privacy Policy
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

Welcome to CSC Dost. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website https://www.cscdost.online/ or utilize our digital services, online form filling, printing, and allied assistance.

1. INFORMATION WE COLLECT
- Personal Identification Information: Name, phone number, email address, postal address, and date of birth.
- Service & Document Details: Identity details (Aadhaar, PAN, photographs, certificates) required for government applications.
- Payment Information: Secure transaction details processed via authorized gateways.
- Technical Data: IP address, browser type, cookies, and device analytics.

2. HOW WE USE YOUR INFORMATION
- Service Delivery: Processing online forms, printing, and citizen queries.
- Communication: Updates, receipts, status notifications, and customer support.
- Operations: Website performance, logs, and security maintenance.
- Legal & Compliance: Preventing fraud and abiding by legal mandates.

3. SHARING AND DISCLOSURE OF INFORMATION
- Service Fulfillment: Sharing with government portals/boards for processing applications.
- Service Providers: Trusted partners (payment gateways, hosting, SMS providers) under confidentiality.
- Legal Requirements: Compliance with statutory orders and protecting rights.

4. DATA SECURITY
Technical, physical, and administrative safeguards to protect your personal data and sensitive documents.

5. THIRD-PARTY LINKS
External links to government/payment portals are subject to their own privacy policies.

6. CHILDREN'S PRIVACY
Intended for general audience. No intentional collection from minors under 18 without guardian consent.

7. CHANGES TO THIS PRIVACY POLICY
Updates will be posted with an updated Effective Date.

8. CONTACT US
Website: https://www.cscdost.online/
Email: cscdost.support@gmail.com
Phone: 7006833767`;

    navigator.clipboard.writeText(policyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TRICOLOR HEADER ACCENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#128807]"></div>

        {/* MODAL NAVBAR / HEADER */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                  Privacy Policy
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  CSC DOST
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Effective Date: <strong>July 29, 2026</strong></span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Copy Privacy Policy Text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Print Policy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QUICK NAVIGATION BAR */}
        <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2 text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] shrink-0 font-extrabold mr-1">Quick Jump:</span>
          {[
            { id: 'sec-1', label: '1. Information Collected' },
            { id: 'sec-2', label: '2. How We Use' },
            { id: 'sec-3', label: '3. Data Sharing' },
            { id: 'sec-4', label: '4. Security' },
            { id: 'sec-5', label: '5. Third-Party Links' },
            { id: 'sec-6', label: '6. Children' },
            { id: 'sec-7', label: '7. Updates' },
            { id: 'sec-8', label: '8. Contact' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeSection === item.id 
                  ? 'bg-[#0051a5] text-white shadow-xs' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* POLICY CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* WELCOME / HERO NOTICE CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-sm uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>Website &amp; Business Overview</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                  <span>https://www.cscdost.online/</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
              Welcome to <strong>CSC Dost</strong>. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://www.cscdost.online/</a> or utilize our digital services, online form filling, printing, and allied assistance.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">
              Please read this Privacy Policy carefully. By accessing or using our website and services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          {/* 1. INFORMATION WE COLLECT */}
          <section id="sec-1" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-xl shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  1. Information We Collect
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data gathered through interaction, form submissions, and online service inquiries.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {/* Personal Identification */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Personal Identification</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Name, phone number, email address, postal address, and date of birth when provided by you for registration, candidate verification, or service requests.
                </p>
              </div>

              {/* Service & Documents */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Service &amp; Document Details</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Information, documents, and identity details (such as Aadhaar, PAN, photographs, or academic certificates) required specifically for processing online applications, government/citizen services, or documentation requested by you.
                </p>
              </div>

              {/* Payment Information */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Payment Information</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Transaction details, payment confirmations, and billing information processed through secure payment gateways (we do <strong>not</strong> store your complete banking credentials or sensitive card PINs/CVVs on our servers).
                </p>
              </div>

              {/* Technical Data */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wide">
                  <Laptop className="w-4 h-4 text-purple-500" />
                  <span>Technical Data</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  IP address, browser type, device information, operating system, and browsing behavior collected automatically through cookies and analytics tools to improve website performance.
                </p>
              </div>
            </div>
          </section>

          {/* 2. HOW WE USE YOUR INFORMATION */}
          <section id="sec-2" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  2. How We Use Your Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Purposes for processing your data for efficient service delivery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Service Delivery</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To process your online applications, service requests, print jobs, and customer queries efficiently.</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Communication</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To contact you regarding the status of your services, send confirmations, updates, receipts, or respond to your inquiries.</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Business Operations</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To manage our website, improve user experience, maintain transaction records, and ensure proper functioning of our portal.</p>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Legal &amp; Compliance</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To comply with applicable legal obligations, prevent fraudulent activities, and safeguard our business rights.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. SHARING AND DISCLOSURE */}
          <section id="sec-3" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xs">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  3. Sharing and Disclosure of Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Strictly controlled disclosure policy — we never sell or rent your personal data.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 font-medium">
              We value your trust and do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:
            </p>

            <ul className="space-y-2.5 text-xs">
              <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.1</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Service Fulfillment:</strong> With authorized government portals, official boards, or service partners <em>strictly</em> as required to complete the specific application or service requested by you.
                </div>
              </li>
              <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.2</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Service Providers:</strong> With trusted third-party vendors (such as payment gateway providers, hosting services, or SMS notification providers) who assist us in operating our website and conducting our business, under strict confidentiality obligations.
                </div>
              </li>
              <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.3</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Legal Requirements:</strong> When required by law, court order, or governmental regulations, or to protect the safety, rights, and property of CSC Dost, our customers, or others.
                </div>
              </li>
            </ul>
          </section>

          {/* 4. DATA SECURITY */}
          <section id="sec-4" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  4. Data Security
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Safeguarding your documents and personal records.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 text-xs space-y-2">
              <p className="text-slate-700 dark:text-amber-200 font-medium leading-relaxed">
                We implement appropriate technical, physical, and administrative security measures to protect your personal data and sensitive documents from unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                However, please note that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* 5. THIRD-PARTY LINKS & 6. CHILDREN'S PRIVACY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            
            {/* 5. Third Party Links */}
            <section id="sec-5" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  5. Third-Party Links
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Our website may contain links to external websites, payment portals, or government resources (such as official service portals). We are not responsible for the privacy practices or content of such third-party sites. We encourage you to read the privacy policies of any external website you visit.
              </p>
            </section>

            {/* 6. Children's Privacy */}
            <section id="sec-6" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  6. Children's Privacy
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Our services are generally intended for a general audience. We do not knowingly collect personal information from individuals under the age of 18 without parental or guardian consent. If you believe we have inadvertently collected information from a minor, please contact us immediately so we can take steps to remove it.
              </p>
            </section>
          </div>

          {/* 7. CHANGES TO THIS PRIVACY POLICY */}
          <section id="sec-7" className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500 text-white rounded-xl shadow-xs">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  7. Changes to This Privacy Policy
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Periodic policy updates and notifications.
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated "Effective Date." We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          {/* 8. CONTACT US CARD */}
          <section id="sec-8" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500 text-white rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    8. Contact Us
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Questions, concerns, or requests regarding this Privacy Policy?
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                CSC DOST Helpdesk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                </span>
                <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                  https://www.cscdost.online/
                </a>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                </span>
                <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                  cscdost.support@gmail.com
                </a>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Support
                </span>
                <a href="tel:7006833767" className="font-bold text-amber-300 hover:underline block">
                  +91 7006833767
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            © 2026 CSC Dost. All Rights Reserved.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0051a5] hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            I Understand &amp; Agree
          </button>
        </div>

      </div>
    </div>
  );
}
