import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Clock, Check } from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS, ServiceItem } from '../servicesData';

interface ServicesProps {
  onServiceSelect: (serviceName: string) => void;
}

export default function Services({ onServiceSelect }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filteredServices = SERVICES_LIST.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.requirements.some(req => req.toLowerCase().includes(searchLower));
    
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="services" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-2 block font-display">Authorized Service Catalogue</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
            Explore All Government &amp; Digital Services
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-base sm:text-lg">
            Authorized CSC center delivering over 25+ certified services. Select any service to view required documents and apply instantly.
          </p>
        </div>

        {/* Search & Tabs Controls bar */}
        <div className="space-y-6 mb-10">
          {/* Real-time search */}
          <div className="max-w-xl mx-auto relative group">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for PAN card, Aadhaar update, GST, Passbook, resume typing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium text-sm"
              id="service-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs Scroll wrapper */}
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none px-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
              id="category-tab-all"
            >
              All Services ({SERVICES_LIST.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const count = SERVICES_LIST.filter(s => s.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                  }`}
                  id={`category-tab-${key}`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-white dark:hover:bg-slate-850 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                id={`service-card-${service.id}`}
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {CATEGORY_LABELS[service.category]}
                    </span>
                    {service.popular && (
                      <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-[9px] font-extrabold uppercase tracking-wider rounded-full">
                        ★ Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Document Requirements Tags */}
                  <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-850">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
                      Required Documents:
                    </h4>
                    <ul className="space-y-1.5">
                      {service.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>Est: {service.estimatedTime}</span>
                  </div>

                  <button
                    onClick={() => onServiceSelect(service.name)}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 dark:text-blue-400 dark:hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                    id={`service-apply-btn-${service.id}`}
                  >
                    Apply Now
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-3xl max-w-md mx-auto">
            <span className="text-4xl block mb-2">🔍</span>
            <h3 className="font-bold text-slate-850 dark:text-white">No services match your search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-4">
              Try searching with general keywords or check another category. You can also send us a message in the custom query box!
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
