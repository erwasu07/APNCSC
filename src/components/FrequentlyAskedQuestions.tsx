import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export const FAQS: FAQItem[] = [
  {
    q: 'How do I request service or application assistance on CSC DOST?',
    a: 'Select any service or recruitment form on our portal, review the document checklist, and click "Request Service Assistance" or "Apply Online". Fill in your applicant details, upload clear scans of your documents, and submit your request. For biometric services such as Aadhaar fingerprint/iris updates, you can visit our centre at Sangran Qazigund, Anantnag in person.',
    category: 'Requesting Assistance',
  },
  {
    q: 'How can I track the status of my submitted request?',
    a: 'Every online submission generates a unique CSC DOST Reference Token. Click the "Track Application" button in the top header and enter your Reference Token or registered mobile number to check real-time operator updates, verification remarks, and completion status.',
    category: 'Tracking Requests',
  },
  {
    q: 'What documents are typically required for PAN, Aadhaar, Domicile, or Job forms?',
    a: 'Most applications require a valid Aadhaar Card, a recent passport-size photograph, a scanned signature, and relevant supporting proofs (such as a 10th Marksheet for date of birth, Ration Card/PRC for J&K Domicile, or academic certificates for recruitment exams). Each service page lists its exact document checklist before you apply.',
    category: 'Required Documents',
  },
  {
    q: 'How do fees and payments work for services on CSC DOST?',
    a: 'Service charges consist of the applicable official government or statutory portal fee (if any) plus a transparent CSC operator assistance charge for document preparation, formatting, and form filing. The estimated fee breakdown is clearly shown on every service card and confirmation screen before submission.',
    category: 'Fees & Payments',
  },
  {
    q: 'How does CSC DOST relate to official government portals?',
    a: 'CSC DOST (cscdost.com) is an independent citizen service assistance portal operated by Authorised CSC VLE Wasim Ahmad Khanday (CSC ID: 212515670018) and is not a government department. Submitting a request on CSC DOST initiates operator assistance at our centre, while final application approval and certificate issuance are always performed by the respective official government authority.',
    category: 'Portal & Official Links',
  },
];

export default function FrequentlyAskedQuestions() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  // Schema.org FAQPage structured data for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section
      id="faq-section"
      aria-labelledby="faq-heading"
      className="w-full max-w-7xl mx-auto px-0 md:px-6 scroll-mt-20 py-0 md:py-2"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-4 sm:p-8 shadow-none md:shadow-2xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 md:pb-5 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                Citizen Help &amp; Support
              </span>
            </div>
            <h2
              id="faq-heading"
              className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Clear answers about requesting service assistance, tracking applications, required documents, and fees.
            </p>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="divide-y divide-[#E2E8F0]">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            const faqId = `faq-item-${idx}`;
            const answerId = `faq-answer-${idx}`;

            return (
              <div key={idx} className="py-3.5 last:pb-0">
                <button
                  type="button"
                  id={faqId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFaq(idx)}
                  className="w-full min-h-[40px] text-left flex items-start justify-between gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg p-1 -m-1 transition-colors hover:text-[#2563EB]"
                >
                  <span
                    className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                      isOpen ? 'text-[#2563EB]' : 'text-[#102A43]'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isOpen
                        ? 'bg-blue-50 text-[#2563EB]'
                        : 'bg-[#F6F8FC] text-[#64748B]'
                    }`}
                  >
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
                    className="mt-2 text-xs sm:text-sm text-[#64748B] leading-relaxed pr-6 pl-1"
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
