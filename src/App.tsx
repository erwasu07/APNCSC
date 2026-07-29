import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SarkariResultDesk from './components/SarkariResultDesk';
import ExploreServicesDesk from './components/ExploreServicesDesk';
import Testimonials from './components/Testimonials';
import Faqs from './components/Faqs';
import Footer from './components/Footer';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { ShieldCheck, MessageSquare, PhoneCall, Sparkles, Building2, HelpCircle } from 'lucide-react';

const FALLBACK_SETTINGS: WebsiteSettings = {
  cafeName: "APNACSC Digital Cyber Cafe",
  phone: "+91 70068 33767, +91 96821 32895",
  whatsapp: "+91 70068 33767",
  email: "contact@apnacsc.com",
  address: "Shop No. 12, Ground Floor, Royal Plaza, Near Main Bus Stand, Sector 15, New Delhi, Pin - 110001",
  officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
  seoTitle: "cscdost - APNACSC Digital Cyber Cafe & CSP Portal",
  seoDescription: "Authorized CSC E-Governance and Digital Services. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and manage all your digital printing, GST, and business registrations in Sector 15, New Delhi.",
  seoKeywords: "cscdost, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing, photocopy, GST return, MSME registration"
};

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [selectedService, setSelectedService] = useState('');
  
  const [settings, setSettings] = useState<WebsiteSettings>(FALLBACK_SETTINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [serverLoading, setServerLoading] = useState(true);

  // Sync public parameters on mount and load settings
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public-data');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.gallery) setGallery(data.gallery);
      }
    } catch (err) {
      console.warn('Backend server connection not established yet. Utilizing fallback mock settings.');
    } finally {
      setServerLoading(false);
    }
  };

  // Track page views on mount and update document title
  useEffect(() => {
    fetchPublicData();
    fetch('/api/tracker/view', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    if (settings?.seoTitle) {
      document.title = settings.seoTitle;
    }
  }, [settings]);

  // Sync theme changes with body classList
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Handle service redirection trigger
  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
  };

  // Scrolls to footer
  const handleVisitClick = () => {
    setTimeout(() => {
      const el = document.getElementById('footer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // WhatsApp click trigger
  const handleWhatsAppFloating = () => {
    const text = encodeURIComponent(`Hello! I need assistance with a service. Is someone available?`);
    const cleanNumber = settings.whatsapp.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-300">
      
      {/* Top Navigation Panel */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        cafeName={settings.cafeName}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {/* PUBLIC VISITOR INTERFACE */}
        <div className="animate-fade-in">
          {/* Sarkari Result Bulletin Board at top */}
          <SarkariResultDesk onApplyService={handleServiceSelect} />

          {/* Explore All Government & Digital Services Directory */}
          <ExploreServicesDesk onApplyService={handleServiceSelect} />

          {/* Hero section */}
          <Hero
            settings={settings}
            announcements={announcements}
            onVisitClick={handleVisitClick}
          />

          {/* Reviews Section */}
          <Testimonials />

          {/* FAQs Accordion */}
          <Faqs />
        </div>
      </main>

      {/* Global Page Footer */}
      <Footer cafeName={settings.cafeName} />

      {/* Floating WhatsApp Chat Button */}
      <button
        onClick={handleWhatsAppFloating}
        className="fixed bottom-24 right-6 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all z-40 flex items-center justify-center animate-bounce group"
        title="Instant Help on WhatsApp"
        id="whatsapp-floating-badge"
        style={{ animationDuration: '4s' }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300">
          WhatsApp Live Support
        </span>
      </button>

    </div>
  );
}
