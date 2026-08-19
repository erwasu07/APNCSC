import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      q: 'What is CSC DOST and what can you help me apply for?',
      a: 'CSC DOST (cscdost.com) is an independent digital assistance service center. We assist citizens in filling online application forms for PAN Cards, Voter IDs, e-Shram Cards, Passport applications, Ayushman Bharat health cards, Driving Licenses, and state-level certificates (Caste, Income, Domicile, and Marriage Certificates) on official government portals.'
    },
    {
      q: 'What original documents do I need to bring for Aadhaar updates?',
      a: 'For demographic updates (like updating your name, address, or date of birth), please carry original proof files such as Voter ID cards, utility electricity/water bills in your name, bank passbooks with active photo seals, or matriculation marksheets. We will scan your original documents and guide you safely through the e-KYC submission.'
    },
    {
      q: 'How long does a new PAN Card application take to process?',
      a: 'If your Aadhaar is linked to your active mobile number, we can generate an instant e-PAN card copy in under 1 hour! The premium physical PVC PAN card is dispatched by the income tax department via Speed Post and reaches your residential address within 7 to 12 working days.'
    },
    {
      q: 'Can I book a specific timeslot before visiting your Cyber Cafe?',
      a: 'Absolutely! You can utilize the "Book Desk Slot" button on this portal to reserve a dedicated morning or afternoon window. Booking ensures a staff member is assigned to look over your file immediately, bypassing standard peak-hour queues.'
    },
    {
      q: 'Do you charge extra or double fees for form filing?',
      a: 'No, our service charges are regulated and strictly in compliance with government-specified CSC service tariffs. We always print official transaction receipts and provide status slips displaying the registered application fee.'
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-150 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-1 block font-display">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Find answers to commonly asked questions regarding CSC services, application requirements, and timelines.
          </p>
        </div>

        {/* FAQ Accordion list */}
        <div className="space-y-3.5">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-950/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
                id={`faq-item-${index}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm sm:text-base text-slate-850 dark:text-white tracking-tight leading-snug font-display">
                      {item.q}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {/* Collapsible Answer container */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-60 border-t border-slate-200/50 dark:border-slate-800/60 p-5 bg-white dark:bg-slate-900' : 'max-h-0'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
