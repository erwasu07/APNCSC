import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export const FAQS: FAQItem[] = [
  {
    q: 'Is CSC DOST an official government department?',
    a: 'No. CSC DOST (cscdost.com) is an independent citizen digital assistance and informational portal operated by Authorized CSC VLE Wasim Ahmad Khanday (CSC ID: 212515670018). We provide verified informational summaries, application assistance, and document support. Official government portals are always directly linked for verification and final submissions.',
    category: 'Portal & Trust'
  },
  {
    q: 'How do I verify if a job notification is genuine before applying?',
    a: 'Every recruitment update on CSC DOST displays the official portal domain (e.g. jkssb.nic.in, joinindianarmy.nic.in, ssc.gov.in, rrbapply.gov.in) and a direct "Official Portal" link. We recommend reviewing the PDF notification directly on the official department server before submitting personal details or application fees.',
    category: 'Recruitment'
  },
  {
    q: 'Can I apply online through the CSC DOST desk or do I have to visit in person?',
    a: 'You can do both. You can use our "Apply Online" desk to upload your documents, generate a reference tracking token, and have our authorized operators process your application. For services requiring biometric authentication (such as Aadhaar fingerprint/iris updates), you can visit our physical center at Sangran Qazigund, Anantnag.',
    category: 'Application Desk'
  },
  {
    q: 'What should I do if my payment was deducted on an official exam portal but the receipt failed?',
    a: 'Bank reconciliations on government recruitment portals (JKSSB, SSC, RRB) typically take 24 to 48 hours. Avoid making a duplicate payment immediately. Log in to the official portal to check "Re-verify Payment" or contact our helpdesk with your bank UTR number and transaction reference for guidance.',
    category: 'Payments'
  },
  {
    q: 'What documents are typically needed for Aadhaar updates or new PAN cards?',
    a: 'For Aadhaar updates, UIDAI accepts valid Proof of Identity (PoI) and Proof of Address (PoA) such as Voter ID, electricity bill, bank passbook with photo seal, or Domicile Certificate. For new PAN applications, Aadhaar OTP verification allows paperless e-PAN generation within hours.',
    category: 'Identity Services'
  }
];

export default function FrequentlyAskedQuestions() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  // Schema.org FAQPage structured data for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQS.map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  return (
    <section 
      id="faq-section" 
      aria-labelledby="faq-heading" 
      className="scroll-mt-20 py-2 sm:py-4"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-[#E3E8EF]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-6 h-6 rounded-md bg-[#EFF4FF] text-[#155EEF] flex items-center justify-center shrink-0">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#155EEF]">
                Citizen Help Desk
              </span>
            </div>
            <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6B7A] mt-1">
              Clear answers to common queries regarding notifications, verification, services, and online filing.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setOpenFaqIndex(openFaqIndex === null ? 0 : null)}
              className="text-[#155EEF] hover:text-[#0B57D0] font-semibold text-xs transition-colors cursor-pointer"
            >
              {openFaqIndex === null ? 'Expand first' : 'Collapse active'}
            </button>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-[#E3E8EF] mt-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            const faqId = `faq-item-${idx}`;
            const answerId = `faq-answer-${idx}`;

            return (
              <div key={idx} className="py-4 first:pt-4 last:pb-0">
                <button
                  type="button"
                  id={faqId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF] rounded-lg p-1 -m-1 transition-colors hover:text-[#155EEF]"
                >
                  <span className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${isOpen ? 'text-[#155EEF]' : 'text-[#172033]'}`}>
                    {faq.q}
                  </span>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isOpen ? 'bg-[#EFF4FF] text-[#155EEF]' : 'bg-[#F8FAFC] text-[#5F6B7A]'}`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={faqId}
                    className="mt-3 text-xs sm:text-sm text-[#5F6B7A] leading-relaxed pr-8 animate-fade-in pl-1"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
