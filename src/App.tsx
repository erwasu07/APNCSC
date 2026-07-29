import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SarkariResultDesk from './components/SarkariResultDesk';
import ExploreServicesDesk from './components/ExploreServicesDesk';
import Testimonials from './components/Testimonials';
import Faqs from './components/Faqs';
import Footer from './components/Footer';
import PrivacyPolicyModal, { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { ShieldCheck, MessageSquare, PhoneCall, Sparkles, Building2, HelpCircle } from 'lucide-react';

const FALLBACK_SETTINGS: WebsiteSettings = {
  cafeName: "CSC DOST",
  phone: "+91 70068 33767, +91 96821 32895",
  whatsapp: "+91 70068 33767",
  email: "contact@cscdost.online",
  address: "Shop No. 12, Ground Floor, Royal Plaza, Near Main Bus Stand, Sector 15, New Delhi, Pin - 110001",
  officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
  seoTitle: "CSC DOST",
  seoDescription: "CSC DOST - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
  seoKeywords: "cscdost, CSC DOST, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
};

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [selectedService, setSelectedService] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('privacy');

  const openLegalModal = (tab: PolicyTab = 'privacy') => {
    setLegalModalTab(tab);
    setIsPrivacyModalOpen(true);
  };
  
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

    const checkHash = () => {
      if (window.location.hash === '#privacy') {
        openLegalModal('privacy');
      } else if (window.location.hash === '#terms') {
        openLegalModal('terms');
      } else if (window.location.hash === '#hyperlink') {
        openLegalModal('hyperlink');
      } else if (window.location.hash === '#copyright') {
        openLegalModal('copyright');
      } else if (window.location.hash === '#disclaimer') {
        openLegalModal('disclaimer');
      } else if (window.location.hash === '#help') {
        openLegalModal('help');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  useEffect(() => {
    if (settings?.seoTitle) {
      document.title = settings.seoTitle;
    }
  }, [settings]);

  // Enforce light theme mode across portal
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, [darkMode]);

  // Handle service redirection trigger
  const handleServiceSelect = (serviceName: string) => {
    setSelectedService(serviceName);
    setTimeout(() => {
      const el = document.getElementById('booking-portal-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      const nameInput = document.getElementById('applicant-name-input') as HTMLInputElement | null;
      if (nameInput) {
        try {
          nameInput.focus({ preventScroll: true });
        } catch {
          nameInput.focus();
        }
      }
    }, 350);
  };

  // Scrolls to Digital Application & Appointment Desk
  const handleVisitClick = () => {
    setTimeout(() => {
      const el = document.getElementById('booking-portal-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);

    setTimeout(() => {
      const nameInput = document.getElementById('applicant-name-input') as HTMLInputElement | null;
      if (nameInput) {
        try {
          nameInput.focus({ preventScroll: true });
        } catch {
          nameInput.focus();
        }
      }
    }, 350);
  };

  // WhatsApp click trigger
  const handleWhatsAppFloating = () => {
    const text = encodeURIComponent(`Hello! I need assistance with a service. Is someone available?`);
    const cleanNumber = settings.whatsapp.replace(/[^0-9+]/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation Panel */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        cafeName={settings.cafeName}
        onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
      />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        {/* PUBLIC VISITOR INTERFACE */}
        <div className="animate-fade-in">
          {/* Sarkari Result Bulletin Board at top */}
          <SarkariResultDesk onApplyService={handleServiceSelect} selectedService={selectedService} />

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
      <Footer 
        cafeName={settings.cafeName} 
        onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
      />

      {/* Privacy Policy & Terms Interactive Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
        initialTab={legalModalTab}
      />

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
