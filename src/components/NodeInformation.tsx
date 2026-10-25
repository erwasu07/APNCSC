import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  UserCheck,
  Building2,
  Award,
  Phone,
  Mail,
  ExternalLink,
  X,
  Eye,
  ShieldCheck,
  User,
  FileCheck,
  Info,
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';

export default function NodeInformation() {
  const [selectedCertificate, setSelectedCertificate] = useState<'csc' | 'udyam' | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [pendingCertificate, setPendingCertificate] = useState<'csc' | 'udyam' | null>(null);

  // Visitor verification form state (persisted to vle_inquiries in Supabase)
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorAddress, setVisitorAddress] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleRequestUnlock = (certType?: 'csc' | 'udyam') => {
    if (isUnlocked) {
      if (certType) setSelectedCertificate(certType);
      return;
    }
    setPendingCertificate(certType || null);
    setFormError('');
    setShowInquiryModal(true);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim() || !visitorAddress.trim()) {
      setFormError('Please enter your Full Name, Contact Number, and Village/City.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const sb = getSupabaseClient();
      if (sb) {
        await sb.from('vle_inquiries').insert([
          {
            visitor_name: visitorName.trim(),
            visitor_phone: visitorPhone.trim(),
            visitor_address: visitorAddress.trim(),
            purpose:
              visitorPurpose.trim() ||
              `Viewed ${pendingCertificate ? pendingCertificate.toUpperCase() : 'CSC & UDYAM'} Registration Details`,
          },
        ]);
      }
    } catch {
      // Unlock gracefully even if network is offline
    } finally {
      setIsSubmitting(false);
      setIsUnlocked(true);
      setShowInquiryModal(false);
      if (pendingCertificate) {
        setSelectedCertificate(pendingCertificate);
      }
    }
  };

  return (
    <section
      id="centre-info"
      aria-labelledby="centre-info-heading"
      className="w-full max-w-7xl mx-auto px-0 md:px-6 scroll-mt-20 py-0 md:py-2"
    >
      <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-4 sm:p-8 shadow-none md:shadow-2xs space-y-3.5 md:space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-3 md:pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                Verified Local Assistance Centre
              </span>
            </div>
            <h2
              id="centre-info-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Your Local CSC Assistance Centre
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Visit us in person or request online support from our authorised Common Service Centre in Anantnag, Jammu &amp; Kashmir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleRequestUnlock('csc')}
              className="min-h-[40px] px-3.5 py-2 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span>View CSC Certificate</span>
            </button>
            <button
              type="button"
              onClick={() => handleRequestUnlock('udyam')}
              className="min-h-[40px] px-3.5 py-2 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
              <span>View Udyam Certificate</span>
            </button>
          </div>
        </div>

        {/* 3 Customer-Friendly Information Blocks (Open Rows on Mobile, Cards on Desktop) */}
        <div className="-mx-4 md:mx-0 divide-y divide-[#E2E8F0] md:divide-y-0 border-y md:border-0 border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-5">
          {/* Card 1: Our CSC Centre */}
          <div className="px-4 py-3.5 md:p-5 rounded-none md:rounded-xl bg-white md:bg-[#F6F8FC] border-0 md:border md:border-[#E2E8F0] flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" aria-hidden="true" />
                  <span>Open for Assistance</span>
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#102A43]">Our CSC Centre</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Digital Seva Common Service Centre providing citizen e-services, form submissions, document scanning, and certificate assistance.
                </p>
              </div>

              <dl className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-[#64748B]">CSC Centre ID:</dt>
                  <dd className="font-bold text-[#102A43]">212515670018</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[#64748B]">Udyam Registration:</dt>
                  <dd className="font-bold text-[#102A43]">UDYAM-JK-01-0041957</dd>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1">
                  <dt className="text-[#64748B] shrink-0">Location:</dt>
                  <dd className="font-semibold text-[#102A43] text-right">
                    Sangran Qazigund, Anantnag, J&amp;K — 192221
                  </dd>
                </div>
              </dl>
            </div>

            <a
              href="https://maps.google.com/?q=Sangran+Qazigund+Anantnag+Jammu+and+Kashmir+192221"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] w-full py-2 px-3 bg-white hover:bg-blue-50 text-[#2563EB] border border-[#E2E8F0] rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Location on Google Maps</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          {/* Card 2: Meet Your Operator */}
          <div className="px-4 py-3.5 md:p-5 rounded-none md:rounded-xl bg-white md:bg-[#F6F8FC] border-0 md:border md:border-[#E2E8F0] flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Authorised VLE
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#102A43]">Meet Your Operator</h3>
                <p className="text-sm font-bold text-[#2563EB] mt-0.5">
                  Wasim Ahmad Khanday
                </p>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Dedicated Village Level Entrepreneur (VLE) helping citizens, students, and job applicants across Anantnag and Jammu &amp; Kashmir prepare accurate online submissions.
                </p>
              </div>

              <ul className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-xs text-[#102A43]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Online form filling &amp; document verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Biometric e-KYC &amp; smart card assistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  <span>Direct application tracking &amp; support</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleRequestUnlock('csc')}
              className="min-h-[40px] w-full py-2 px-3 bg-white hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
              <span>
                {isUnlocked ? 'View Operator Registration' : 'Verify & View Operator Credentials'}
              </span>
            </button>
          </div>

          {/* Card 3: Contact & Opening Hours */}
          <div
            id="centre-contact"
            className="px-4 py-3.5 md:p-5 rounded-none md:rounded-xl bg-white md:bg-[#F6F8FC] border-0 md:border md:border-[#E2E8F0] flex flex-col justify-between space-y-3 scroll-mt-24"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Clock className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[#102A43] bg-white border border-[#E2E8F0] px-2.5 py-0.5 rounded-full">
                  Mon – Sat
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#102A43]">
                  Contact &amp; Opening Hours
                </h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Reach out by phone or email during working hours for help with an existing request or document checklist.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Mon – Sat Hours:</span>
                  <span className="font-bold text-[#102A43]">09:00 AM – 08:30 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Phone / Helpdesk:</span>
                  <a
                    href="tel:+917006833767"
                    className="font-bold text-[#2563EB] hover:underline"
                  >
                    +91 70068 33767
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Email:</span>
                  <a
                    href="mailto:www.khanday09@gmail.com"
                    className="font-semibold text-[#102A43] hover:text-[#2563EB] truncate max-w-[180px]"
                  >
                    www.khanday09@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+917006833767"
                className="min-h-[40px] py-2 px-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Call Centre</span>
              </a>
              <a
                href="mailto:www.khanday09@gmail.com"
                className="min-h-[40px] py-2 px-3 bg-white hover:bg-blue-50 text-[#102A43] border border-[#E2E8F0] rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Clear Independent Portal Transparency Notice */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F6F8FC] border border-[#E2E8F0] text-xs text-[#64748B]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong className="text-[#102A43]">Independent Citizen Service Portal:</strong> CSC DOST (<span className="font-medium text-[#102A43]">cscdost.com</span>) is an independent digital service assistance portal operated by Authorised CSC VLE Wasim Ahmad Khanday and is not an official government department website. Official government portal links are provided across our notices for direct verification.
          </p>
        </div>
      </div>

      {/* VISITOR VERIFICATION MODAL FOR VIEWING OFFICIAL CERTIFICATES */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60">
          <div className="relative max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden">
            <div className="px-4 sm:px-6 py-4 bg-[#102A43] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    Verify Your Details to View Official Certificates
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Share your basic contact details to view our full registration documents
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="p-4 sm:p-6 space-y-3.5">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Tariq Ahmad"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F6F8FC] focus:bg-white text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F6F8FC] focus:bg-white text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                  Village / Town / City *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Qazigund, Anantnag"
                    value={visitorAddress}
                    onChange={(e) => setVisitorAddress(e.target.value)}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F6F8FC] focus:bg-white text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                  Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Verifying centre registration"
                  value={visitorPurpose}
                  onChange={(e) => setVisitorPurpose(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] bg-[#F6F8FC] focus:bg-white text-[#102A43] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:text-[#102A43] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[40px] px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying…' : 'View Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL CERTIFICATE VIEWER MODAL */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/75"
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            className="relative max-w-4xl w-full h-full md:h-auto bg-white rounded-none md:rounded-2xl border-0 md:border md:border-[#E2E8F0] shadow-2xl overflow-hidden flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#102A43] text-white">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    {selectedCertificate === 'csc'
                      ? 'CSC e-Governance Services India Limited — Registration Certificate'
                      : 'Ministry of MSME — Udyam Registration Certificate'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {selectedCertificate === 'csc'
                      ? 'VLE: Wasim Ahmad Khanday | CSC ID: 212515670018'
                      : 'Enterprise: CSC DOST | Reg: UDYAM-JK-01-0041957'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close certificate viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 bg-[#F6F8FC] flex items-center justify-center max-h-[75vh] overflow-y-auto">
              <img
                src={
                  selectedCertificate === 'csc'
                    ? '/vle-certificate.png'
                    : '/udyam-certificate.png'
                }
                alt={
                  selectedCertificate === 'csc'
                    ? 'CSC VLE Certificate - Wasim Ahmad Khanday'
                    : 'Udyam Registration Certificate - UDYAM-JK-01-0041957'
                }
                className="w-full h-auto max-h-[68vh] object-contain rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
              />
            </div>

            <div className="px-6 py-3 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
              <span>Sangran Qazigund, Anantnag, Jammu &amp; Kashmir — 192221</span>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-1.5 bg-[#102A43] text-white font-semibold rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
