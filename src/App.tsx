import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import type { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { SARKARI_DATA, SarkariItem } from './data/sarkariData';
import { SERVICES_LIST, ServiceItem } from './servicesData';
import {
  buildWhatsAppNotification,
  buildServiceWhatsAppNotification,
} from './utils/whatsappFormatter';
import { MessageSquare, ArrowLeft, Share2, X, MessageCircle, Copy, Check } from 'lucide-react';

// Route-Level & Component-Level Lazy Loading (Code Splitting)
const PortalHomepage = lazy(() => import('./components/PortalHomepage'));
const SarkariDedicatedPageView = lazy(() => import('./components/SarkariDedicatedPageView'));
const ServiceDedicatedPageView = lazy(() => import('./components/ServiceDedicatedPageView'));
const ApplyDedicatedPageView = lazy(() => import('./components/ApplyDedicatedPageView'));
const TrackDedicatedPageView = lazy(() => import('./components/TrackDedicatedPageView'));
const ExploreServicesDesk = lazy(() => import('./components/ExploreServicesDesk'));
const GuidesKnowledgeHub = lazy(() => import('./components/GuidesKnowledgeHub'));
const FrequentlyAskedQuestions = lazy(() => import('./components/FrequentlyAskedQuestions'));
const PushNotificationPrompt = lazy(() => import('./components/PushNotificationPrompt'));
const NodeInformation = lazy(() => import('./components/NodeInformation'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Footer = lazy(() => import('./components/Footer'));
const PrivacyPolicyModal = lazy(() => import('./components/PrivacyPolicyModal'));
const LegalPageView = lazy(() => import('./components/LegalPageView'));
import type { LegalPageType } from './components/LegalPageView';
import { LEGAL_PAGE_CONFIG } from './components/LegalPageView';
const ToolsHub = lazy(() => import('./components/tools/ToolsHub'));
const NotificationCenterModal = lazy(() => import('./components/NotificationCenterModal'));
const NotificationPreferencesModal = lazy(() => import('./components/NotificationPreferencesModal'));

// Lightweight Skeleton Fallback for Section Containers (Prevents Layout Shift)
function SectionSkeleton({ height = 'min-h-[360px]', title = 'Loading Desk...' }: { height?: string; title?: string }) {
  return (
    <div className={`w-full ${height} bg-white dark:bg-slate-900 border-b md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-2xl px-4 py-6 sm:p-6 shadow-none md:shadow-xs flex flex-col justify-between animate-pulse font-sans`}>
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
    <div className="w-full min-h-[500px] bg-white dark:bg-slate-900 border-b md:border border-slate-200 dark:border-slate-800 rounded-none md:rounded-2xl px-4 py-6 sm:p-6 shadow-none md:shadow-sm animate-pulse space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-5 w-48 sm:w-64 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-36 sm:w-40 bg-slate-100 dark:bg-slate-800 rounded" />
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
  const [isToolsView, setIsToolsView] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageType | null>(null);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('privacy');

  // Push Notifications & Center Modals State
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  const refreshUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/center');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          const readSaved = localStorage.getItem('csc_read_notifications');
          const readSet = new Set(readSaved ? JSON.parse(readSaved) : []);
          const unread = data.items.filter((i: any) => !readSet.has(i.id)).length;
          setUnreadNotificationCount(unread);
        }
      }
    } catch {}
  };

  useEffect(() => {
    refreshUnreadCount();
    const handleOpenPrefs = () => setIsPreferencesModalOpen(true);
    window.addEventListener('open-push-preferences', handleOpenPrefs);
    return () => window.removeEventListener('open-push-preferences', handleOpenPrefs);
  }, []);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{
    title: string;
    text: string;
    url: string;
    whatsappShareUrl: string;
    name: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyMessageSuccess, setCopyMessageSuccess] = useState(false);

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
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const postParam = searchParams.get('post') || searchParams.get('job') || searchParams.get('notice') || searchParams.get('id');
      const serviceParam = searchParams.get('service');
      const trackParam = searchParams.get('track') || searchParams.get('token') || searchParams.get('id');

      // Check direct pathname matches (e.g. /post/xyz, /job/xyz, /sarkari/xyz, /notice/xyz, /admissions/xyz, /service/xyz)
      const pathPostMatch = pathname.match(/^\/(?:post|job|jobs|sarkari|notice|admissions|notification)\/([^/?#]+)/i);
      const pathServiceMatch = pathname.match(/^\/service\/([^/?#]+)/i);
      const pathTrackMatch = pathname.match(/^\/track\/([^/?#]+)/i);
      const pathApplyMatch = pathname.startsWith('/apply');

      // Check legal / informational routes (/privacy-policy, /terms-of-service, /disclaimer, /about-us, /contact-us, /refund-policy)
      const legalMatch = pathname.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)(?:\/)?$/i);
      if (legalMatch) {
        let mappedType: LegalPageType = 'privacy';
        const rawKey = legalMatch[1].toLowerCase();
        if (rawKey === 'privacy-policy' || rawKey === 'privacy') mappedType = 'privacy';
        else if (rawKey === 'terms-of-service' || rawKey === 'terms') mappedType = 'terms';
        else if (rawKey === 'disclaimer') mappedType = 'disclaimer';
        else if (rawKey === 'about-us' || rawKey === 'about') mappedType = 'about';
        else if (rawKey === 'contact-us' || rawKey === 'contact') mappedType = 'contact';
        else if (rawKey === 'refund-policy' || rawKey === 'refund') mappedType = 'refund';

        setActiveLegalPage(mappedType);
        setIsAdminView(false);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setActiveLegalPage(null);
      }

      // 1. Check Apply route
      if (hash.startsWith('#apply') || pathApplyMatch) {
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
      if (hash.startsWith('#track') || pathTrackMatch) {
        const cleanHash = hash.replace(/^#track\/?/, '');
        const trackToken = (pathTrackMatch ? pathTrackMatch[1] : null) || cleanHash.split('?')[0] || trackParam || '';
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

      // 2.5 Check Tools route (/tools, /tools/:toolId, #tools, #tools/:toolId)
      const pathToolsMatch = pathname.match(/^\/tools(?:\/([^/?#]+))?/i);
      if (hash.startsWith('#tools') || pathToolsMatch) {
        let toolParam = null;
        if (pathToolsMatch && pathToolsMatch[1]) {
          toolParam = pathToolsMatch[1];
        } else if (hash.startsWith('#tools/')) {
          toolParam = hash.replace(/^#tools\//, '').split('?')[0];
        }
        setIsToolsView(true);
        setActiveToolId(toolParam || null);
        setIsApplyView(false);
        setIsTrackView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setIsToolsView(false);
      }

      // 3. Check Service route
      if (pathServiceMatch) {
        const matchService = SERVICES_LIST.find(s => s.id === pathServiceMatch[1]);
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
      if (pathPostMatch) {
        const match = SARKARI_DATA.find(i => i.id === pathPostMatch[1]);
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
    const payload = buildServiceWhatsAppNotification(item);
    setShareData({
      title: payload.nativeShareData.title,
      text: payload.message,
      url: payload.canonicalUrl,
      whatsappShareUrl: payload.whatsappShareUrl,
      name: item.name,
    });
    setShowShareModal(true);
  };

  const handleShareItem = async (item: SarkariItem) => {
    const payload = buildWhatsAppNotification(item);
    setShareData({
      title: payload.nativeShareData.title,
      text: payload.message,
      url: payload.canonicalUrl,
      whatsappShareUrl: payload.whatsappShareUrl,
      name: payload.shortTitle || item.title,
    });
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
    setIsToolsView(false);
    setActiveToolId(null);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsApplyView(false);
    setIsTrackView(false);
    setActiveLegalPage(null);
    setSelectedService('');
    if (window.location.pathname !== '/' || window.location.hash) {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WhatsApp Group / Community click trigger
  const handleWhatsAppFloating = () => {
    window.open('https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#102A43] flex flex-col justify-between font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation Panel (hidden in Staff Management Console and dedicated Apply/Track pages which use their own compact header) */}
      {!isAdminView && !isApplyView && !isTrackView && !activeLegalPage && (
        <Navbar
          cafeName={settings.cafeName}
          onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
          onOpenAdmin={handleOpenStaffPortal}
          onHomeClick={handleGoHome}
          onOpenNotificationCenter={() => {
            setIsNotificationCenterOpen(true);
            refreshUnreadCount();
          }}
          unreadNotificationCount={unreadNotificationCount}
        />
      )}

      {/* Main Container */}
      <main
        className={
          isAdminView
            ? 'flex-grow w-full min-h-screen bg-[#F6F8FC] overflow-x-hidden'
            : isApplyView || isTrackView
            ? 'flex-grow w-full bg-white overflow-x-hidden'
            : 'flex-grow w-full max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-6 overflow-x-hidden'
        }
      >
        {activeLegalPage ? (
          <Suspense fallback={<PageRouteSkeleton message="Loading Information & Policy..." />}>
            <LegalPageView
              pageType={activeLegalPage}
              onNavigate={(type) => {
                const cfg = LEGAL_PAGE_CONFIG[type];
                window.history.pushState(null, '', cfg.path);
                setActiveLegalPage(type);
              }}
              onBackToHome={handleGoHome}
            />
          </Suspense>
        ) : isAdminView ? (
          <Suspense fallback={<PageRouteSkeleton message="Loading CSC Staff Management Console..." />}>
            <AdminDashboard
              cafeName={settings.cafeName}
              onClose={handleCloseStaffPortal}
            />
          </Suspense>
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
        ) : isToolsView ? (
          /* DEDICATED FULL-PAGE VIEW FOR FREE ONLINE TOOLS HUB */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading Free Online Tools Hub..." />}>
              <ToolsHub
                initialToolId={activeToolId || undefined}
                onSelectTool={(id) => {
                  setActiveToolId(id);
                }}
              />
            </Suspense>
          </div>
        ) : (
          /* PUBLIC VISITOR INTERFACE */
          <div className="animate-fade-in space-y-0 md:space-y-10 pb-16 md:pb-6 w-full">
            
            {/* Dedicated Modern Citizen Homepage Layout */}
            <Suspense fallback={<SectionSkeleton height="min-h-[520px]" title="Loading CSC DOST Citizen Portal..." />}>
              <PortalHomepage
                onOpenJob={handleOpenJobPage}
                onOpenService={handleOpenServicePage}
                onApplyService={handleServiceSelect}
                onOpenGuide={(guideId) => {
                  window.dispatchEvent(
                    new CustomEvent('open-guide-article', { detail: { guideId } })
                  );
                  const el = document.getElementById('knowledge-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenTrack={() => handleOpenTrackPage()}
                onOpenLegal={openLegalModal}
              />
            </Suspense>

            {/* Complete Organised Service Directory */}
            <div id="services-catalogue" className="scroll-mt-20">
              <Suspense fallback={<SectionSkeleton height="min-h-[380px]" title="Loading Complete Service Directory..." />}>
                <ExploreServicesDesk 
                  onApplyService={handleServiceSelect} 
                  selectedService={selectedService}
                  onOpenDedicatedServicePage={handleOpenServicePage}
                />
              </Suspense>
            </div>

            {/* In-depth Citizen Guides & Scheme Knowledge Hub */}
            <div id="knowledge-hub" className="scroll-mt-20">
              <Suspense fallback={<SectionSkeleton height="min-h-[320px]" title="Loading Citizen Guides & Knowledge Hub..." />}>
                <GuidesKnowledgeHub onSelectService={handleServiceSelect} />
              </Suspense>
            </div>

            {/* Your Local CSC Assistance Centre (Centre Information & Trust) */}
            <div className="scroll-mt-20">
              <Suspense fallback={<SectionSkeleton height="min-h-[220px]" title="Loading Local CSC Centre Information..." />}>
                <NodeInformation />
              </Suspense>
            </div>

            {/* Streamlined Frequently Asked Questions */}
            <div id="faq" className="scroll-mt-20">
              <Suspense fallback={<SectionSkeleton height="min-h-[260px]" title="Loading Frequently Asked Questions..." />}>
                <FrequentlyAskedQuestions />
              </Suspense>
            </div>

          </div>
        )}
      </main>

      {/* Global Page Footer (Below the Fold) */}
      {!isAdminView && (
        <Suspense fallback={<div className="h-28 bg-[#102A43] border-t border-slate-800" />}>
          <Footer 
            cafeName={settings.cafeName} 
            onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
            onOpenAdmin={handleOpenStaffPortal}
          />
        </Suspense>
      )}

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

      {/* In-Website Notification Center Drawer Modal */}
      {isNotificationCenterOpen && (
        <Suspense fallback={null}>
          <NotificationCenterModal
            isOpen={isNotificationCenterOpen}
            onClose={() => {
              setIsNotificationCenterOpen(false);
              refreshUnreadCount();
            }}
            onOpenPreferences={() => {
              setIsNotificationCenterOpen(false);
              setIsPreferencesModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Web Push Notification Preferences Modal */}
      {isPreferencesModalOpen && (
        <Suspense fallback={null}>
          <NotificationPreferencesModal
            isOpen={isPreferencesModalOpen}
            onClose={() => setIsPreferencesModalOpen(false)}
            onOpenIOSGuide={() => window.dispatchEvent(new CustomEvent('open-push-notification-prompt'))}
          />
        </Suspense>
      )}

      {/* Global Share Options Modal */}
      {showShareModal && shareData && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl relative text-[#102A43]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#2563EB]" />
                <h3 className="font-bold text-base">Share Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] font-medium">
              Share <strong className="text-[#102A43]">{shareData.name}</strong> with candidates or on WhatsApp:
            </p>

            {/* Formatted WhatsApp Notification Preview */}
            <div className="p-3 bg-[#E8F8F0] border border-emerald-300/60 rounded-xl text-[11.5px] text-[#102A43] font-sans whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {shareData.text}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* PATH A — SHARE ON WHATSAPP */}
              <a
                href={shareData.whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Formatted Alert</span>
              </a>

              {/* PATH B — NATIVE SHARE (Other Apps) */}
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // Pass text (which already includes the single canonical URL) without a separate duplicate url field
                      await navigator.share({
                        title: shareData.title,
                        text: shareData.text,
                      });
                    } catch {
                      // User cancelled native share sheet
                    }
                  }}
                  className="flex items-center justify-between p-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4" />
                    <span>Share via Other Apps (System Share)</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Native</span>
                </button>
              )}

              {/* Copy Formatted WhatsApp Message */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareData.text);
                  setCopyMessageSuccess(true);
                  setTimeout(() => setCopyMessageSuccess(false), 2500);
                }}
                className="flex items-center justify-between p-3.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-950 rounded-xl font-semibold text-xs transition-colors border border-emerald-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {copyMessageSuccess ? (
                    <Check className="w-4 h-4 text-[#16A34A]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#16A34A]" />
                  )}
                  <span>
                    {copyMessageSuccess
                      ? 'WhatsApp Message Copied!'
                      : 'Copy Formatted WhatsApp Message'}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-mono">Text</span>
              </button>

              {/* Copy Direct Page Link Fallback */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareData.url);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2500);
                }}
                className="flex items-center justify-between p-3.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#102A43] rounded-xl font-semibold text-xs transition-colors border border-[#E2E8F0] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {copySuccess ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
                  <span>{copySuccess ? 'Link Copied to Clipboard!' : 'Copy Direct Page Link'}</span>
                </div>
                <span className="text-[10px] text-[#64748B] font-mono">URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Updates Group Button - Compact 48px circle on mobile with safe-area clearance */}
      {!isAdminView && !isApplyView && !isTrackView && !isPrivacyModalOpen && !showShareModal && (
        <button
          type="button"
          onClick={handleWhatsAppFloating}
          className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3.5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-auto sm:h-11 sm:px-4 bg-[#16A34A] hover:bg-emerald-700 text-white rounded-full shadow-md transition-colors z-30 ${
            activeJobPost || activeServicePost
              ? 'hidden md:flex'
              : 'flex'
          } items-center justify-center sm:gap-2 cursor-pointer border border-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]`}
          title="Join CSC DOST WhatsApp Updates Group"
          id="whatsapp-floating-badge"
          aria-label="Join CSC DOST WhatsApp Updates Group"
        >
          <MessageCircle className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
            Join WhatsApp Updates Group
          </span>
        </button>
      )}

    </div>
  );
}
