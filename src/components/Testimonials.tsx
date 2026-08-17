import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Ramesh Chander',
      role: 'Farmer & Pensioner',
      stars: 5,
      comment: 'I am a pensioner and was facing problems with my PM Kisan e-KYC for months. The assistant at Apex Digital completed my biometric scan in under 5 minutes. Outstanding speed and very respectul behavior.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Simran Jeet Kaur',
      role: 'Delhi University Student',
      stars: 5,
      comment: 'Filled my PG admission form and digital scholarship forms here. The typing was perfect, error-free, and they scanned all my credentials meticulously. Highly recommend them over standard cyber cafes!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
    },
    {
      name: 'Gaurav Singhal',
      role: 'Local Retailer',
      stars: 5,
      comment: 'Opened my SBI kiosk savings account here and routinely transfer money using AEPS fingerprint. I do not have to waste hours traveling to the main SBI city branch now. A lifesaver for Sector 15 residents.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
    }
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-1 block font-display">Client Reviews</span>
          <h2 className="text-3xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
            What Our Customers Say
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Read real, verified reviews from the people who visit us daily.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              id={`testimonial-card-${index}`}
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-150 dark:border-slate-800/60">
                <img 
                  src={rev.avatar} 
                  alt={rev.name} 
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white font-display">{rev.name}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{rev.role}</span>
                </div>
                <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-450 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
