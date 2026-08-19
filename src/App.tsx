import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import type { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { SARKARI_DATA, SarkariItem } from './data/sarkariData';
import { SERVICES_LIST, ServiceItem } from './servicesData';
import { MessageSquare, ArrowLeft, Share2, X, MessageCircle, Copy, Check } from 'lucide-react';

// Route-Level & Component-Level Lazy Loading (Code Splitting)
const SarkariResultDesk = lazy(() => import('./components/SarkariResultDesk'));
const SarkariDedicatedPageView = lazy(() => import('./components/SarkariDedicatedPageView'));
const ServiceDedicatedPageView = lazy(() => import('./components/ServiceDedicatedPageView'));
const ApplyDedicatedPageView = lazy(() => import('./components/ApplyDedicatedPageView'));
const TrackDedicatedPageView = lazy(() => import('./components/TrackDedicatedPageView'));
const ExploreServicesDesk = lazy(() => import('./components/ExploreServicesDesk'));
const GuidesKnowledgeHub = lazy(() => import('./components/GuidesKnowledgeHub'));
const PushNotificationPrompt = lazy(() => import('./components/PushNotificationPrompt'));
const NodeInformation = lazy(() => import('./components/NodeInformation'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Footer = lazy(() => import('./components/Footer'));
const PrivacyPolicyModal = lazy(() => import('./components/PrivacyPolicyModal'));

// Lightweight Skeleton Fallback for Section Containers (Prevents Layout Shift)
function SectionSkeleton({ height = 'min-h-[360px]', title = 'Loading Desk...' }: { height?: string; title?: string }) {
  return (
    <div className={`w-full ${height} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between animate-pulse font-sans`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-36 sm:w-48 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl hidden sm:block" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl hidden md:block" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs py-2">
        <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-mono font-medium">{title}</span>
      </div>
    </div>
  );
}

// Lightweight Full Page Skeleton (For dedicated service/job routes)
function PageRouteSkeleton({ message = 'Loading Official Notification...' }: { message?: string }) {
  return (
    <div className="w-full min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
      <div className="flex items-center justify-center gap-2 pt-4 text-slate-400 text-xs">
        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs">{message}</span>
      </div>
    </div>
  );
}

const FALLBACK_SETTINGS: WebsiteSettings = {
  cafeName: "CSC DOST",
  phone: "+91 70068 33767, +91 96821 32895",
  whatsapp: "+91 70068 33767",
  email: "www.khanday09@gmail.com",
  address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
  officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
  seoTitle: "CSC DOST",
  seoDescription: "CSC DOST (www.cscdost.com) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
  seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
};

export default function App() {
  const [darkMode] = useState<boolean>(false);
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  const [selectedService, setSelectedService] = useState('');
  const [activeJobPost, setActiveJobPost] = useState<SarkariItem | null>(null);
  const [activeServicePost, setActiveServicePost] = useState<ServiceItem | null>(null);
  const [isApplyView, setIsApplyView] = useState<boolean>(false);
  const [applyInitialService, setApplyInitialService] = useState<string>('');
  const [isTrackView, setIsTrackView] = useState<boolean>(false);
  const [trackInitialToken, setTrackInitialToken] = useState<string>('');

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
      const trackParam = searchParams.get('track') || searchParams.get('token') || searchParams.get('id');

      // 1. Check Apply route
      if (hash.startsWith('#apply')) {
        const applyQuery = hash.includes('?') ? hash.split('?')[1] : '';
        const applyParams = new URLSearchParams(applyQuery);
        const svc = applyParams.get('service') || searchParams.get('service') || '';
        setIsApplyView(true);
        setApplyInitialService(svc);
        setIsTrackView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setIsApplyView(false);
      }

      // 2. Check Track route
      if (hash.startsWith('#track')) {
        const cleanHash = hash.replace(/^#track\/?/, '');
        const trackToken = cleanHash.split('?')[0] || trackParam || '';
        setIsTrackView(true);
        setTrackInitialToken(trackToken);
        setIsApplyView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setIsTrackView(false);
      }

      // 3. Check Service route
      if (serviceParam && !hash.startsWith('#post')) {
        const matchService = SERVICES_LIST.find(s => s.id === serviceParam);
        if (matchService) {
          setActiveServicePost(matchService);
          setActiveJobPost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
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
          setIsApplyView(false);
          setIsTrackView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else {
        setActiveServicePost(null);
      }

      // 4. Check Job/Post route
      if (postParam) {
        const match = SARKARI_DATA.find(i => i.id === postParam);
        if (match) {
          setActiveJobPost(match);
          setActiveServicePost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
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
          setIsApplyView(false);
          setIsTrackView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else {
        setActiveJobPost(null);
      }

      // 5. Check Admin / Staff or Legal Modals
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
    setIsApplyView(false);
    setIsTrackView(false);
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
    setIsApplyView(false);
    setIsTrackView(false);
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

  const handleOpenApplyPage = (serviceName?: string) => {
    setSelectedService(serviceName || '');
    setApplyInitialService(serviceName || '');
    setIsApplyView(true);
    setIsTrackView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    if (serviceName) {
      window.location.hash = `#apply?service=${encodeURIComponent(serviceName)}`;
    } else {
      window.location.hash = '#apply';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseApplyPage = () => {
    setIsApplyView(false);
    if (window.location.hash.startsWith('#apply')) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrackPage = (tokenId?: string) => {
    setTrackInitialToken(tokenId || '');
    setIsTrackView(true);
    setIsApplyView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    if (tokenId) {
      window.location.hash = `#track/${encodeURIComponent(tokenId)}`;
    } else {
      window.location.hash = '#track';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseTrackPage = () => {
    setIsTrackView(false);
    if (window.location.hash.startsWith('#track')) {
      window.history.pushState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleServiceSelect = (serviceName: string) => {
    handleOpenApplyPage(serviceName);
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

  // Scrolls to Digital Application & Appointment Desk or opens apply page
  const handleVisitClick = () => {
    handleOpenApplyPage();
  };

  const handleGoHome = () => {
    setIsAdminView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsApplyView(false);
    setIsTrackView(false);
    setSelectedService('');
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp Group / Community click trigger
  const handleWhatsAppFloating = () => {
    window.open('https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI', '_blank');
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
            <Suspense fallback={<PageRouteSkeleton message="Loading Admin & Staff Portal..." />}>
              <AdminDashboard
                cafeName={settings.cafeName}
                onClose={handleCloseStaffPortal}
              />
            </Suspense>
          </div>
        ) : isApplyView ? (
          /* DEDICATED FULL-PAGE VIEW FOR ONLINE APPLICATION DESK */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading CSC Application Desk..." />}>
              <ApplyDedicatedPageView
                initialService={applyInitialService || selectedService}
                onBack={handleCloseApplyPage}
                onTrackApplication={(token) => {
                  handleCloseApplyPage();
                  handleOpenTrackPage(token);
                }}
              />
            </Suspense>
          </div>
        ) : isTrackView ? (
          /* DEDICATED FULL-PAGE VIEW FOR APPLICATION TRACKING */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading Status Tracker..." />}>
              <TrackDedicatedPageView
                initialToken={trackInitialToken}
                onBack={handleCloseTrackPage}
                onApplyNew={() => {
                  handleCloseTrackPage();
                  handleOpenApplyPage();
                }}
              />
            </Suspense>
          </div>
        ) : activeJobPost ? (
          /* DEDICATED FULL-PAGE VIEW FOR JOBS / NOTIFICATIONS */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading Official Sarkari Notification..." />}>
              <SarkariDedicatedPageView
                item={activeJobPost}
                onBack={handleCloseJobPage}
                onApplyService={(service) => {
                  handleCloseJobPage();
                  handleOpenApplyPage(service);
                }}
                onShare={handleShareItem}
              />
            </Suspense>
          </div>
        ) : activeServicePost ? (
          /* DEDICATED FULL-PAGE VIEW FOR COMPREHENSIVE E-SERVICES CATALOGUE */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading CSC E-Service Catalogue..." />}>
              <ServiceDedicatedPageView
                service={activeServicePost}
                onBack={handleCloseServicePage}
                onApplyService={(service) => {
                  handleCloseServicePage();
                  handleOpenApplyPage(service);
                }}
                onShare={handleShareServiceItem}
              />
            </Suspense>
          </div>
        ) : (
          /* PUBLIC VISITOR INTERFACE */
          <div className="animate-fade-in space-y-4 md:space-y-6 w-full">
            {/* Sarkari Result Bulletin Board at top */}
            <Suspense fallback={<SectionSkeleton height="min-h-[480px]" title="Loading Sarkari Results & Booking Desk..." />}>
              <SarkariResultDesk 
                onApplyService={handleServiceSelect} 
                selectedService={selectedService}
                onOpenDedicatedPage={handleOpenJobPage}
              />
            </Suspense>

            {/* Explore All Government & Digital Services Directory */}
            <Suspense fallback={<SectionSkeleton height="min-h-[380px]" title="Loading Government & Digital Services Catalogue..." />}>
              <ExploreServicesDesk 
                onApplyService={handleServiceSelect} 
                selectedService={selectedService}
                onOpenDedicatedServicePage={handleOpenServicePage}
              />
            </Suspense>

            {/* In-depth Citizen Guides & Scheme Knowledge Hub for AdSense & Citizen Awareness */}
            <Suspense fallback={<SectionSkeleton height="min-h-[320px]" title="Loading Citizen Guides & Knowledge Hub..." />}>
              <GuidesKnowledgeHub onSelectService={handleServiceSelect} />
            </Suspense>
          </div>
        )}

        {/* Common Service Centre Node Information & VLE Verification (relocated to clean bottom) */}
        {!isAdminView && !isApplyView && !isTrackView && (
          <div className="mt-8 px-2 sm:px-4 md:px-0">
            <Suspense fallback={<SectionSkeleton height="min-h-[220px]" title="Loading CSC VLE Verification..." />}>
              <NodeInformation />
            </Suspense>
          </div>
        )}
      </main>

      {/* Global Page Footer (Below the Fold) */}
      <Suspense fallback={<div className="h-28 bg-slate-900 border-t border-slate-800 animate-pulse" />}>
        <Footer 
          cafeName={settings.cafeName} 
          onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
          onOpenAdmin={handleOpenStaffPortal}
        />
      </Suspense>

      {/* Privacy Policy & Terms Interactive Modal */}
      {isPrivacyModalOpen && (
        <Suspense fallback={null}>
          <PrivacyPolicyModal 
            isOpen={isPrivacyModalOpen} 
            onClose={() => setIsPrivacyModalOpen(false)} 
            initialTab={legalModalTab}
          />
        </Suspense>
      )}

      {/* Push Notification Permission Request Dialog */}
      <Suspense fallback={null}>
        <PushNotificationPrompt />
      </Suspense>

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

      {/* Floating WhatsApp Community Group Button */}
      <button
        onClick={handleWhatsAppFloating}
        className="fixed bottom-24 right-6 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all z-40 flex items-center justify-center animate-bounce group cursor-pointer border-2 border-emerald-400"
        title="Join Our CSC DOST WhatsApp Group"
        id="whatsapp-floating-badge"
        style={{ animationDuration: '4s' }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300 whitespace-nowrap">
          Join WhatsApp Group
        </span>
      </button>

    </div>
  );
}
