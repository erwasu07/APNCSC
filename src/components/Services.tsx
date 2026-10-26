import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SERVICES_LIST, CATEGORY_LABELS } from '../servicesData';
import { ColourAccentCard } from './shared/ContentDesignSystem';

interface ServicesProps {
  onServiceSelect: (serviceName: string) => void;
}

export default function Services({ onServiceSelect }: ServicesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    <section id="services" className="py-6 md:py-12 bg-[#F6F8FC] border-t border-[#E2E8F0] transition-colors w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4">
        
        {/* Header Block */}
        <div className="max-w-3xl space-y-1.5 px-1 sm:px-0">
          <span className="text-[#0284C7] font-bold tracking-wider text-xs uppercase block">Authorized Service Catalogue</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#102A43] tracking-tight">
            Explore All Government &amp; Digital Services
          </h2>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Select any service to view required documents and request assistance.
          </p>
        </div>

        {/* Search & Tabs Controls bar */}
        <div className="space-y-3 px-1 sm:px-0">
          <div className="max-w-xl relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for PAN card, Aadhaar update, GST, Domicile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-14 py-2 bg-white border border-[#E2E8F0] rounded-xl text-[#102A43] placeholder-[#64748B] outline-none focus:border-[#2563EB] text-xs sm:text-sm"
              id="service-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B] hover:text-[#102A43] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-x-1.5 gap-y-2 sm:overflow-x-auto pb-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl whitespace-nowrap border transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                  : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
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
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl whitespace-nowrap border transition-colors cursor-pointer ${
                    selectedCategory === key
                      ? 'bg-[#2563EB] text-white border-[#2563EB] font-semibold'
                      : 'bg-white text-[#102A43] border-[#E2E8F0] hover:bg-[#F6F8FC]'
                  }`}
                  id={`category-tab-${key}`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Colour-Accent Cards Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredServices.map((service) => (
              <ColourAccentCard
                key={service.id}
                id={`service-card-${service.id}`}
                categoryType="service"
                categoryLabel="CSC E-Service"
                organisation={CATEGORY_LABELS[service.category]}
                title={service.name}
                summary={service.description}
                metadataLine={
                  service.requirements.length > 0 ? (
                    <span>
                      <strong className="font-semibold text-[#102A43]">Required Docs:</strong>{' '}
                      {service.requirements.slice(0, 2).join(', ')}
                    </span>
                  ) : undefined
                }
                footerMeta={
                  service.price
                    ? `Fee: ${service.price} · Est: ${service.estimatedTime}`
                    : `Est: ${service.estimatedTime}`
                }
                actionLabel="View Service →"
                onPrimaryClick={() => onServiceSelect(service.name)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white border border-[#E2E8F0] rounded-xl max-w-md mx-auto">
            <h3 className="font-bold text-sm text-[#102A43]">No services match your search</h3>
            <p className="text-xs text-[#64748B] mt-1 px-4">
              Try searching with general keywords or check another category.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-3 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
