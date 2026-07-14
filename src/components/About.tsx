import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, Award } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Graphic/Illustration Left */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              {/* Image from Unsplash with matching tone */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600" 
                  alt="Modern Cyber Cafe Computing Area" 
                  className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Float Over card */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 bg-blue-600 text-white p-6 rounded-3xl shadow-xl max-w-xs">
                <span className="text-3xl font-extrabold italic block">10+ Years</span>
                <span className="text-xs text-blue-100 font-bold uppercase tracking-wider block mt-1">Of Credible Service Delivery in Delhi NCR</span>
              </div>
            </div>
          </div>

          {/* Text Content Right */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-2 block font-display">Who We Are</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
                Authorized CSC E-Governance Center Since 2016
              </h2>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
              Founded on the pillars of data transparency, speed, and citizen empowerment, we are an official Common Services Center (CSC). We bridge the digital divide by helping villagers, farmers, senior citizens, and businesses easily submit application forms, manage state certificates, and retrieve vital digital assistance.
            </p>

            {/* Mission / Vision split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-slate-850 dark:text-white flex items-center gap-2 text-sm font-display">
                  <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                  Our Mission
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  To offer zero-error, secure, and rapid electronic services access to every citizen at extremely minimal, regulated service fees.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-slate-850 dark:text-white flex items-center gap-2 text-sm font-display">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  Our Vision
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  To expand e-governance literacy, enabling citizens to claim their legal government benefits, schemes, and pensions seamlessly from their native locations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Trust Us section */}
        <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-900">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
              Why Customers Choose Us
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your security and credentials privacy is our absolute priority
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-850 dark:text-white font-display">100% Data Security</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Biometric verification, end-to-end encryption, and immediate file clearing after processing to prevent identity thefts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-center shadow-sm">
              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-850 dark:text-white font-display">Superfast Fiber Net</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Dual 300 Mbps broadband fibers ensures zero transaction freezes or timeout errors while buying railway or flight tickets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-center shadow-sm">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-850 dark:text-white font-display">Empathetic Assistance</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Special support for elderly or illiterate applicants in explaining pension eligibility and biometric e-KYC updates.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-center shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-850 dark:text-white font-display">Government Regulated</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Official registration certificates displayed at center. Only standard authorized transaction charges applied.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
