import React, { useState } from 'react';
import { Eye, X, ZoomIn } from 'lucide-react';
import { GalleryItem } from '../types';

interface GalleryProps {
  galleryItems: GalleryItem[];
}

export default function Gallery({ galleryItems }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Fallback items if database list is empty
  const defaultGallery: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'Main Computing Workstations',
      category: 'interior',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      description: 'Air-conditioned computing units with comfortable ergonomic chairs and rapid broadband.'
    },
    {
      id: 'gal-2',
      title: 'Authorized SBI CSP Counter',
      category: 'banking',
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
      description: 'Secure, dedicated desk for deposits, withdrawals, passbook printing, and instant account openings.'
    },
    {
      id: 'gal-3',
      title: 'Color Printing & Lamination Hub',
      category: 'printing',
      url: 'https://images.unsplash.com/photo-1615915468538-0fbd857888ca?auto=format&fit=crop&q=80&w=600',
      description: 'Heavy duty, fast multi-color laser plotters, high-res scanners, and warm laminating devices.'
    },
    {
      id: 'gal-4',
      title: 'Active Reception and Form Filling Desk',
      category: 'services',
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
      description: 'Welcoming front helpdesk for query consultation, verification of proofs, and application submission.'
    }
  ];

  const itemsToDisplay = galleryItems && galleryItems.length > 0 ? galleryItems : defaultGallery;

  const filteredItems = itemsToDisplay.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <section id="gallery" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200/40 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-orange-500 font-extrabold tracking-widest text-xs uppercase mb-2 block font-display">Take A Tour</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">
            Our Kiosk Infrastructure Gallery
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            A look inside our clean, professional, air-conditioned premises and hardware configurations.
          </p>
        </div>

        {/* Gallery Filter controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'all', label: 'All Photos' },
            { id: 'interior', label: 'Cafe Interior' },
            { id: 'banking', label: 'Banking CSP Counter' },
            { id: 'printing', label: 'Printing Area' },
            { id: 'services', label: 'Helpdesk' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedCategory === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 hover:bg-slate-200'
              }`}
              id={`gallery-filter-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery grid of photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group cursor-pointer bg-slate-50 dark:bg-slate-850 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800 hover:shadow-lg transition-all"
              id={`gallery-item-${item.id}`}
            >
              <div className="relative overflow-hidden aspect-video bg-slate-200">
                <img 
                  src={item.url} 
                  alt={item.title} 
                  width="400"
                  height="225"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-blue-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-white text-blue-950 rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate font-display">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal overlay */}
        {lightboxIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/25 transition-all"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <div 
              className="max-w-4xl max-h-[80vh] flex flex-col items-center justify-center gap-4 bg-slate-900/60 p-4 rounded-3xl border border-white/15"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={filteredItems[lightboxIndex].url} 
                alt={filteredItems[lightboxIndex].title} 
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="text-center text-white px-4 max-w-lg">
                <h3 className="font-extrabold text-lg text-orange-400 font-display">{filteredItems[lightboxIndex].title}</h3>
                <p className="text-xs text-slate-300 mt-1">{filteredItems[lightboxIndex].description}</p>
              </div>
            </div>

            {/* Lightbox arrows */}
            {filteredItems.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev! === 0 ? filteredItems.length - 1 : prev! - 1));
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all pointer-events-auto"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev! === filteredItems.length - 1 ? 0 : prev! + 1));
                  }}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all pointer-events-auto"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
