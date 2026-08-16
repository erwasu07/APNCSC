import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SarkariResultDesk from './components/SarkariResultDesk';
import SarkariDedicatedPageView from './components/SarkariDedicatedPageView';
import ServiceDedicatedPageView from './components/ServiceDedicatedPageView';
import ExploreServicesDesk from './components/ExploreServicesDesk';
import GuidesKnowledgeHub from './components/GuidesKnowledgeHub';
import PushNotificationPrompt from './components/PushNotificationPrompt';
import NodeInformation from './components/NodeInformation';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import PrivacyPolicyModal, { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { SARKARI_DATA, SarkariItem } from './data/sarkariData';
import { SERVICES_LIST, ServiceItem } from './servicesData';
import { MessageSquare, ArrowLeft, Share2, X, MessageCircle, Copy, Check } from 'lucide-react';

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
  const [activeJobPost, setActiveJobPost] = useState<SarkariItem | null>(null);
  const [activeServicePost, setActiveServicePost] = useState<ServiceItem | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('privacy');

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ title: string; text: string; url: string; name: string } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

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

  // Track page views on mount and update document title and URL hashes
  useEffect(() => {
    fetchPublicData();
    fetch('/api/tracker/view', { method: 'POST' }).catch(() => {});

    const parseRoute = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const postParam = searchParams.get('post') || searchParams.get('job');
      const serviceParam = searchParams.get('service');

      if (serviceParam) {
        const matchService = SERVICES_LIST.find(s => s.id === serviceParam);
        if (matchService) {
          setActiveServicePost(matchService);
          setActiveJobPost(null);
          setIsAdminView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      if (hash.startsWith('#service/')) {
        const serviceId = hash.replace(/^#service\//, '');
        const matchService = SERVICES_LIST.find(s => s.id === serviceId);
        if (matchService) {
          setActiveServicePost(matchService);
          setActiveJobPost(null);
          setIsAdminView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else {
        setActiveServicePost(null);
      }

      if (postParam) {
        const match = SARKARI_DATA.find(i => i.id === postParam);
        if (match) {
          setActiveJobPost(match);
          setActiveServicePost(null);
          setIsAdminView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      if (hash.startsWith('#post/') || hash.startsWith('#job/')) {
        const postId = hash.replace(/^#(post|job)\//, '');
        const match = SARKARI_DATA.find(i => i.id === postId);
        if (match) {
          setActiveJobPost(match);
          setActiveServicePost(null);
          setIsAdminView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else {
        setActiveJobPost(null);
      }

      if (hash === '#admin' || hash === '#staff') {
        setIsAdminView(true);
      } else if (hash === '#privacy') {
        openLegalModal('privacy');
      } else if (hash === '#terms') {
        openLegalModal('terms');
      } else if (hash === '#hyperlink') {
        openLegalModal('hyperlink');
      } else if (hash === '#copyright') {
        openLegalModal('copyright');
      } else if (hash === '#disclaimer') {
        openLegalModal('disclaimer');
      } else if (hash === '#help') {
        openLegalModal('help');
      }
    };

    parseRoute();
    window.addEventListener('hashchange', parseRoute);
    window.addEventListener('popstate', parseRoute);
    return () => {
      window.removeEventListener('hashchange', parseRoute);
      window.removeEventListener('popstate', parseRoute);
    };
  }, []);

  const handleOpenJobPage = (item: SarkariItem) => {
    setActiveJobPost(item);
    setActiveServicePost(null);
    window.location.hash = `#post/${item.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseJobPage = () => {
    setActiveJobPost(null);
    if (window.location.hash.startsWith('#post/') || window.location.hash.startsWith('#job/')) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenServicePage = (item: ServiceItem) => {
    setActiveServicePost(item);
    setActiveJobPost(null);
    window.location.hash = `#service/${item.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseServicePage = () => {
    setActiveServicePost(null);
    if (window.location.hash.startsWith('#service/')) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareServiceItem = async (item: ServiceItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.cscdost.com';
    const shareUrl = `${origin}/#service/${item.id}`;
    const shareTitle = `📌 ${item.name} - CSC DOST`;
    const shareText = `📌 *${item.name}*\n💰 Fee: ${item.price}\n⏱️ Turnaround: ${item.estimatedTime}\n\n${item.description}\n\n👉 Full details & apply online:\n${shareUrl}`;

    const data = { title: shareTitle, text: shareText, url: shareUrl, name: item.name };
    setShareData(data);

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (e) {
        // Fallback to modal
      }
    }
    setShowShareModal(true);
  };

  const handleShareItem = async (item: SarkariItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.cscdost.com';
    const shareUrl = `${origin}/#post/${item.id}`;
    const shareTitle = `📢 ${item.title}`;
    const shareText = `📢 *${item.title}*\n${item.lastDate ? `⏰ *Last Date:* ${item.lastDate}\n` : ''}${item.totalPosts ? `👥 *Vacancies/Seats:* ${item.totalPosts}\n` : ''}\n${item.shortInfo ? item.shortInfo + '\n\n' : ''}👉 Read full notification & apply at CSC DOST:\n${shareUrl}`;

    const data = { title: shareTitle, text: shareText, url: shareUrl, name: item.title };
    setShareData(data);

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch (e) {
        // Fallback to modal
      }
    }
    setShowShareModal(true);
  };

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
    setActiveJobPost(null);
    setActiveServicePost(null);
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
        ) : activeJobPost ? (
          /* DEDICATED FULL-PAGE VIEW FOR JOBS / NOTIFICATIONS */
          <div className="animate-fade-in w-full">
            <SarkariDedicatedPageView
              item={activeJobPost}
              onBack={handleCloseJobPage}
              onApplyService={(service) => {
                handleCloseJobPage();
                handleServiceSelect(service);
              }}
              onShare={handleShareItem}
            />
          </div>
        ) : activeServicePost ? (
          /* DEDICATED FULL-PAGE VIEW FOR COMPREHENSIVE E-SERVICES CATALOGUE */
          <div className="animate-fade-in w-full">
            <ServiceDedicatedPageView
              service={activeServicePost}
              onBack={handleCloseServicePage}
              onApplyService={(service) => {
                handleCloseServicePage();
                handleServiceSelect(service);
              }}
              onShare={handleShareServiceItem}
            />
          </div>
        ) : (
          /* PUBLIC VISITOR INTERFACE */
          <div className="animate-fade-in space-y-4 md:space-y-6 w-full">
            {/* Sarkari Result Bulletin Board at top */}
            <SarkariResultDesk 
              onApplyService={handleServiceSelect} 
              selectedService={selectedService}
              onOpenDedicatedPage={handleOpenJobPage}
            />

            {/* Explore All Government & Digital Services Directory */}
            <ExploreServicesDesk 
              onApplyService={handleServiceSelect} 
              selectedService={selectedService}
              onOpenDedicatedServicePage={handleOpenServicePage}
            />

            {/* In-depth Citizen Guides & Scheme Knowledge Hub for AdSense & Citizen Awareness */}
            <GuidesKnowledgeHub onSelectService={handleServiceSelect} />
          </div>
        )}

        {/* Common Service Centre Node Information & VLE Verification (relocated to clean bottom) */}
        {!isAdminView && (
          <div className="mt-8 px-2 sm:px-4 md:px-0">
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

      {/* Global Share Options Modal */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-[70] animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base font-display">Share Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Share <strong className="text-slate-900">{shareData.name}</strong> with candidates or via social networks:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5" />
                  <span>Share via WhatsApp</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Instant</span>
              </a>

              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5" />
                  <span>Share on Telegram</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Channel</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareData.url);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2500);
                }}
                className="flex items-center justify-between p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-all border border-slate-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {copySuccess ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-600" />}
                  <span>{copySuccess ? 'Link Copied to Clipboard!' : 'Copy Direct Page Link'}</span>
                </div>
                <span className="text-[10px] text-slate-600 font-mono">URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
