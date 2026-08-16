import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SarkariResultDesk from './components/SarkariResultDesk';
import ExploreServicesDesk from './components/ExploreServicesDesk';
import GuidesKnowledgeHub from './components/GuidesKnowledgeHub';
import PushNotificationPrompt from './components/PushNotificationPrompt';
import NodeInformation from './components/NodeInformation';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import PrivacyPolicyModal, { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const FALLBACK_SETTINGS: WebsiteSettings = {
  cafeName: "CSC DOST",
  phone: "+91 70068 33767, +91 96821 32895",
  whatsapp: "+91 70068 33767",
  email: "www.khanday09@gmail.com",
  address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
  officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
  seoTitle: "CSC DOST",
  seoDescription: "CSC DOST (www.cscdost.com / www.cscdost.online) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
  seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cscdost.online, www.cscdost.online, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
};

export default function App() {
  const [darkMode] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

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
        const txt = await res.text();
        const data = txt ? JSON.parse(txt) : {};
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
      if (window.location.hash === '#admin' || window.location.hash === '#staff') {
        setIsAdminView(true);
      } else if (window.location.hash === '#privacy') {
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

  // Enforce portal light white theme mode always
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const handleOpenStaffPortal = () => {
    setIsAdminView(true);
    window.location.hash = '#staff';
  };

  const handleCloseStaffPortal = () => {
    setIsAdminView(false);
    if (window.location.hash === '#staff' || window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };
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

  const handleGoHome = () => {
    setIsAdminView(false);
    setSelectedService('');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp Channel click trigger
  const handleWhatsAppFloating = () => {
    window.open('https://whatsapp.com/channel/0029VbDgSe75a248qEZAbL3g', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation Panel */}
      <Navbar
        cafeName={settings.cafeName}
        onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
        onOpenAdmin={handleOpenStaffPortal}
        onHomeClick={handleGoHome}
      />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-0 md:px-6 py-2 md:py-6 overflow-x-hidden">
        {isAdminView ? (
          <div className="px-2 sm:px-4 md:px-0">
            <div className="mb-4 px-2 sm:px-0">
              <button
                onClick={handleCloseStaffPortal}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Public Services Portal</span>
              </button>
            </div>
            <AdminDashboard
              cafeName={settings.cafeName}
              onClose={handleCloseStaffPortal}
            />
          </div>
        ) : (
          /* PUBLIC VISITOR INTERFACE */
          <div className="animate-fade-in space-y-4 md:space-y-6 w-full">
            {/* Sarkari Result Bulletin Board at top */}
            <SarkariResultDesk onApplyService={handleServiceSelect} selectedService={selectedService} />

            {/* Explore All Government & Digital Services Directory */}
            <ExploreServicesDesk onApplyService={handleServiceSelect} selectedService={selectedService} />

            {/* In-depth Citizen Guides & Scheme Knowledge Hub for AdSense & Citizen Awareness */}
            <GuidesKnowledgeHub onSelectService={handleServiceSelect} />

            {/* Common Service Centre Node Information */}
            <NodeInformation />
          </div>
        )}
      </main>

      {/* Global Page Footer */}
      <Footer 
        cafeName={settings.cafeName} 
        onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
        onOpenAdmin={handleOpenStaffPortal}
      />

      {/* Privacy Policy & Terms Interactive Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
        initialTab={legalModalTab}
      />

      {/* Push Notification Permission Request Dialog */}
      <PushNotificationPrompt />

      {/* Floating WhatsApp Channel Button */}
      <button
        onClick={handleWhatsAppFloating}
        className="fixed bottom-24 right-6 p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all z-40 flex items-center justify-center animate-bounce group cursor-pointer"
        title="Join Our CSC DOST WhatsApp Channel"
        id="whatsapp-floating-badge"
        style={{ animationDuration: '4s' }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300 whitespace-nowrap">
          Join WhatsApp Channel
        </span>
      </button>

    </div>
  );
}
