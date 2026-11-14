import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import MobileBottomNav, { BottomNavTab } from './components/MobileBottomNav';
import type { PolicyTab } from './components/PrivacyPolicyModal';
import { WebsiteSettings, Announcement, GalleryItem } from './types';
import { SARKARI_DATA, SarkariItem, isPublishedSarkariItem } from './data/sarkariData';
import { SERVICES_LIST, ServiceItem } from './servicesData';
import { useSyncedSarkariPosts } from './utils/postDataSync';
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
import LegalPageView, { LEGAL_PAGE_CONFIG, type LegalPageType } from './components/LegalPageView';
const ToolsHub = lazy(() => import('./components/tools/ToolsHub'));
const CitizenToolsDesk = lazy(() => import('./components/CitizenToolsDesk'));
const NotificationCenterModal = lazy(() => import('./components/NotificationCenterModal'));
const NotificationPreferencesModal = lazy(() => import('./components/NotificationPreferencesModal'));
const SarkariResultDesk = lazy(() => import('./components/SarkariResultDesk'));
import { TOOLS_LIST } from './components/tools/toolsData';
import { GUIDE_ARTICLES } from './data/guidesData';
import { LanguageProvider } from './contexts/LanguageContext';
import {
  applyClientSeo,
  getCategorySeoMeta,
  getSchemeSeoMeta,
  HOMEPAGE_SEO,
  IGNOU_EDUCATION_SEO,
  LEGAL_SEO_MAP,
  PRIVATE_NOINDEX_META,
  SITE_ORIGIN,
  CORE_CATEGORIES,
} from './utils/seoConfig';

// Lightweight Skeleton Fallback for Section Containers (Prevents Layout Shift)
function SectionSkeleton({ height = 'min-h-[360px]', title = 'Loading Desk...' }: { height?: string; title?: string }) {
  return (
    <div className={`w-full ${height} bg-[var(--bg-card)] border-b md:border border-[var(--border-default)] rounded-none md:rounded-2xl px-4 py-6 sm:p-6 shadow-none md:shadow-xs flex flex-col justify-between animate-pulse font-sans`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)]" />
            <div className="h-4 w-36 sm:w-48 bg-[var(--bg-subtle)] rounded" />
          </div>
          <div className="h-3 w-16 bg-[var(--bg-subtle)] rounded hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          <div className="h-24 bg-[var(--bg-subtle)] rounded-xl" />
          <div className="h-24 bg-[var(--bg-subtle)] rounded-xl hidden sm:block" />
          <div className="h-24 bg-[var(--bg-subtle)] rounded-xl hidden md:block" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-xs py-2">
        <div className="w-3.5 h-3.5 border-2 border-[var(--brand-accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-[11px] font-mono font-medium">{title}</span>
      </div>
    </div>
  );
}

// Lightweight Full Page Skeleton (For dedicated service/job routes)
function PageRouteSkeleton({ message = 'Loading Official Notification...' }: { message?: string }) {
  return (
    <div className="w-full min-h-[500px] bg-[var(--bg-card)] border-b md:border border-[var(--border-default)] rounded-none md:rounded-2xl px-4 py-6 sm:p-6 shadow-none md:shadow-sm animate-pulse space-y-6">
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)]" />
        <div className="space-y-2">
          <div className="h-5 w-48 sm:w-64 bg-[var(--bg-subtle)] rounded" />
          <div className="h-3 w-36 sm:w-40 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-full" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-5/6" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-4/6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        <div className="h-32 bg-[var(--bg-subtle)] rounded-xl" />
        <div className="h-32 bg-[var(--bg-subtle)] rounded-xl" />
      </div>
      <div className="flex items-center justify-center gap-2 pt-4 text-[var(--text-muted)] text-xs">
        <div className="w-4 h-4 border-2 border-[var(--brand-verified)] border-t-transparent rounded-full animate-spin" />
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

  const syncedPosts = useSyncedSarkariPosts(true);
  const [selectedService, setSelectedService] = useState('');
  const [activeJobPost, setActiveJobPost] = useState<SarkariItem | null>(null);
  const [activeServicePost, setActiveServicePost] = useState<ServiceItem | null>(null);
  const [isApplyView, setIsApplyView] = useState<boolean>(false);
  const [applyInitialService, setApplyInitialService] = useState<string>('');
  const [isTrackView, setIsTrackView] = useState<boolean>(false);
  const [trackInitialToken, setTrackInitialToken] = useState<string>('');
  const [isToolsView, setIsToolsView] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [categoryView, setCategoryView] = useState<'jobs' | 'education' | 'schemes' | 'services' | 'calculators' | null>(null);
  const [educationSubRoute, setEducationSubRoute] = useState<'all' | 'ignou'>('all');
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null);
  const [isNotFoundView, setIsNotFoundView] = useState<boolean>(false);

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

  // Fetch initial public data and log view once on mount
  useEffect(() => {
    fetchPublicData();
    fetch('/api/tracker/view', { method: 'POST' }).catch(() => {});
  }, []);

  // Track route changes and keep post resolution synced with published posts
  useEffect(() => {
    const parseRoute = () => {
      const rawHash = window.location.hash || '';
      const rawPathname = window.location.pathname || '/';
      const searchParams = new URLSearchParams(window.location.search);
      const postParam = searchParams.get('post') || searchParams.get('job') || searchParams.get('notice') || searchParams.get('id');
      const serviceParam = searchParams.get('service');
      const schemeParam = searchParams.get('scheme');
      const trackParam = searchParams.get('track') || searchParams.get('token') || searchParams.get('id');
      const appParam = searchParams.get('appParams') || searchParams.get('page');

      // Determine effective path from pathname, hash route (#/... or #...), or appParams
      let effectivePath = rawPathname;
      if (rawHash.startsWith('#/')) {
        effectivePath = rawHash.slice(1); // '#/privacy' -> '/privacy'
      } else if (rawHash.startsWith('#') && rawHash.length > 1) {
        effectivePath = '/' + rawHash.slice(1); // '#privacy' -> '/privacy'
      } else if (appParam && (effectivePath === '/' || effectivePath === '')) {
        effectivePath = appParam.startsWith('/') ? appParam : '/' + appParam;
      }

      // Clean query parameters and trailing slashes for clean route matching
      const cleanPath = (effectivePath.split('?')[0] || '/').replace(/\/+$/, '') || '/';

      // Reset client not found & scheme flags before evaluating current path
      setIsNotFoundView(false);
      setActiveSchemeId(null);

      // 0. Transparent Migration for Legacy Shared Fragment URLs if supported
      try {
        if (rawHash.match(/^#(?:|\/)(post|job)\//)) {
          const legacyPostId = rawHash.replace(/^#(?:|\/)(post|job)\//, '').split('?')[0];
          if (legacyPostId) {
            window.history.replaceState(null, '', `/post/${legacyPostId}`);
          }
        } else if (rawHash.match(/^#(?:|\/)service\//)) {
          const legacyServiceId = rawHash.replace(/^#(?:|\/)service\//, '').split('?')[0];
          if (legacyServiceId) {
            window.history.replaceState(null, '', `/service/${legacyServiceId}`);
          }
        } else if (rawHash.match(/^#(?:|\/)apply/)) {
          const query = rawHash.includes('?') ? rawHash.slice(rawHash.indexOf('?')) : '';
          window.history.replaceState(null, '', `/apply${query}`);
        } else if (rawHash.match(/^#(?:|\/)track/)) {
          const token = rawHash.replace(/^#(?:|\/)track\/?/, '').split('?')[0];
          window.history.replaceState(null, '', token ? `/track/${token}` : '/track');
        } else if (rawHash.match(/^#(?:|\/)calculators/)) {
          window.history.replaceState(null, '', '/calculators');
        } else if (rawHash.match(/^#(?:|\/)tools/)) {
          const tool = rawHash.replace(/^#(?:|\/)tools\/?/, '').split('?')[0];
          window.history.replaceState(null, '', tool ? `/tools/${tool}` : '/tools');
        }
      } catch {}

      // Handle legacy hash modal dialogs (#privacy, #terms, #disclaimer, etc.) on homepage
      const cleanHash = rawHash.replace(/^#\/?/, '').toLowerCase().split('?')[0];
      if (['privacy', 'terms', 'disclaimer', 'hyperlink', 'copyright', 'help', 'refund'].includes(cleanHash) && (rawPathname === '/' || rawPathname === '')) {
        openLegalModal(cleanHash as PolicyTab);
        setActiveLegalPage(null);
        setCategoryView(null);
        setIsAdminView(false);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        return;
      }

      // 1. Check legal / informational routes (/privacy-policy, /privacy, /terms-of-service, /terms, etc.)
      const legalMatch = cleanPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund)$/i);
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
        setCategoryView(null);
        setIsAdminView(false);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setActiveLegalPage(null);
      }

      // 2. Check Admin / Staff routes
      if (
        cleanPath === '/admin' || 
        cleanPath === '/staff' || 
        rawHash === '#admin' || 
        rawHash === '#staff' || 
        rawHash === '#/admin' || 
        rawHash === '#/staff'
      ) {
        setIsAdminView(true);
        setCategoryView(null);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        return;
      } else {
        setIsAdminView(false);
      }

      // 3. Dedicated category routes: /jobs, /education, /education/ignou, /schemes, /services, /calculators
      if (['/jobs', '/education', '/education/ignou', '/schemes', '/services', '/calculators'].includes(cleanPath)) {
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setActiveLegalPage(null);
        setIsAdminView(false);

        if (cleanPath === '/jobs') {
          setCategoryView('jobs');
          setEducationSubRoute('all');
        } else if (cleanPath === '/education') {
          setCategoryView('education');
          setEducationSubRoute('all');
        } else if (cleanPath === '/education/ignou') {
          setCategoryView('education');
          setEducationSubRoute('ignou');
        } else if (cleanPath === '/schemes') {
          setCategoryView('schemes');
          setEducationSubRoute('all');
        } else if (cleanPath === '/services') {
          setCategoryView('services');
          setEducationSubRoute('all');
        } else if (cleanPath === '/calculators') {
          setCategoryView('calculators');
          setEducationSubRoute('all');
        }

        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setCategoryView(null);
        setEducationSubRoute('all');
      }

      // 4. Check Apply route (/apply, #apply, #/apply)
      const pathApplyMatch = cleanPath === '/apply';
      if (pathApplyMatch || rawHash.startsWith('#apply') || rawHash.startsWith('#/apply')) {
        const queryFromHash = rawHash.includes('?') ? rawHash.split('?')[1] : '';
        const applyParams = new URLSearchParams(queryFromHash);
        const svc = applyParams.get('service') || searchParams.get('service') || '';
        setIsApplyView(true);
        setApplyInitialService(svc);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setIsApplyView(false);
      }

      // 5. Check Track route (/track, /track/:token, #track, #/track)
      const pathTrackMatch = cleanPath.match(/^\/track(?:\/([^/?#]+))?$/i);
      if (pathTrackMatch || rawHash.startsWith('#track') || rawHash.startsWith('#/track')) {
        const cleanHash = rawHash.replace(/^#(?:|\/)track\/?/, '');
        const trackToken = (pathTrackMatch ? pathTrackMatch[1] : null) || cleanHash.split('?')[0] || trackParam || '';
        setIsTrackView(true);
        setTrackInitialToken(trackToken);
        setIsApplyView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setIsTrackView(false);
      }

      // 6. Check Tools route (/tools, /tools/:toolId, #tools, #/tools)
      const pathToolsMatch = cleanPath.match(/^\/tools(?:\/([^/?#]+))?$/i);
      if (pathToolsMatch || rawHash.startsWith('#tools') || rawHash.startsWith('#/tools')) {
        let toolParam = null;
        if (pathToolsMatch && pathToolsMatch[1]) {
          toolParam = pathToolsMatch[1];
        } else if (rawHash.match(/^#(?:|\/)tools\//)) {
          toolParam = rawHash.replace(/^#(?:|\/)tools\//, '').split('?')[0];
        }
        if (toolParam && !TOOLS_LIST.some((t) => t.id === toolParam)) {
          setIsToolsView(false);
          setActiveToolId(null);
          setIsNotFoundView(true);
          return;
        }
        setIsToolsView(true);
        setActiveToolId(toolParam || null);
        setIsApplyView(false);
        setIsTrackView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setIsAdminView(false);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setIsToolsView(false);
      }

      // 7. Check Service route (/service/:id, #service/:id, #/service/:id, ?service=:id)
      const pathServiceMatch = cleanPath.match(/^\/service\/([^/?#]+)$/i);
      if (pathServiceMatch) {
        const serviceId = decodeURIComponent(pathServiceMatch[1]);
        const matchService = SERVICES_LIST.find(s => s.id === serviceId);
        if (matchService) {
          setActiveServicePost(matchService);
          setActiveJobPost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        } else {
          setActiveServicePost(null);
          setActiveJobPost(null);
          setIsNotFoundView(true);
          return;
        }
      }

      if (serviceParam && !cleanPath.startsWith('/post')) {
        const matchService = SERVICES_LIST.find(s => s.id === serviceParam);
        if (matchService) {
          setActiveServicePost(matchService);
          setActiveJobPost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        }
      }

      // 7b. Check Dedicated Scheme Guide route (/scheme/:id or ?scheme=:id)
      const pathSchemeMatch = cleanPath.match(/^\/scheme\/([^/?#]+)$/i);
      const candidateSchemeId = pathSchemeMatch ? decodeURIComponent(pathSchemeMatch[1]) : schemeParam;
      if (candidateSchemeId) {
        const matchScheme = GUIDE_ARTICLES.find((g) => g.id === candidateSchemeId);
        if (matchScheme) {
          setActiveSchemeId(matchScheme.id);
          setCategoryView('schemes');
          setActiveJobPost(null);
          setActiveServicePost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          setActiveLegalPage(null);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        } else if (pathSchemeMatch) {
          setActiveSchemeId(null);
          setCategoryView(null);
          setIsNotFoundView(true);
          return;
        }
      }

      // 8. Check Job/Post route (/post/:id, /job/:id, #post/:id, #/post/:id, ?post=:id)
      const pathPostMatch = cleanPath.match(/^\/(?:post|job|jobs|sarkari|notice|admissions|notification)\/([^/?#]+)$/i);
      if (pathPostMatch) {
        const postId = decodeURIComponent(pathPostMatch[1]);
        const match = syncedPosts.find(i => i.id === postId && isPublishedSarkariItem(i));
        if (match) {
          setActiveJobPost(match);
          setActiveServicePost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        } else {
          setActiveJobPost(null);
          setActiveServicePost(null);
          setIsNotFoundView(true);
          return;
        }
      }

      if (postParam) {
        const match = syncedPosts.find(i => i.id === postParam && isPublishedSarkariItem(i));
        if (match) {
          setActiveJobPost(match);
          setActiveServicePost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        }
      }

      // Reset post/service states when returning to homepage
      setActiveJobPost(null);
      setActiveServicePost(null);

      // 9. Legacy fallback modals if any hash remains
      if (rawHash === '#hyperlink') {
        openLegalModal('hyperlink');
      } else if (rawHash === '#copyright') {
        openLegalModal('copyright');
      } else if (rawHash === '#disclaimer') {
        openLegalModal('disclaimer');
      } else if (rawHash === '#help') {
        openLegalModal('help');
      }

      // 10. Genuine unknown path check (anything other than / displays 404)
      if (cleanPath !== '/' && cleanPath !== '') {
        setIsNotFoundView(true);
      }
    };

    parseRoute();
    window.addEventListener('hashchange', parseRoute);
    window.addEventListener('popstate', parseRoute);
    return () => {
      window.removeEventListener('hashchange', parseRoute);
      window.removeEventListener('popstate', parseRoute);
    };
  }, [syncedPosts]);

  const navigateToPath = (path: string) => {
    try {
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = path;
    }
  };

  const handleOpenJobPage = (item: SarkariItem) => {
    setActiveJobPost(item);
    setActiveServicePost(null);
    setIsApplyView(false);
    setIsTrackView(false);
    setIsToolsView(false);
    try {
      window.history.pushState(null, '', `/post/${item.id}`);
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleCloseJobPage = () => {
    setActiveJobPost(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenServicePage = (item: ServiceItem) => {
    setActiveServicePost(item);
    setActiveJobPost(null);
    setIsApplyView(false);
    setIsTrackView(false);
    setIsToolsView(false);
    try {
      window.history.pushState(null, '', `/service/${item.id}`);
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleCloseServicePage = () => {
    setActiveServicePost(null);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenSchemePage = (schemeId: string) => {
    setActiveSchemeId(schemeId);
    setCategoryView('schemes');
    setIsNotFoundView(false);
    setIsApplyView(false);
    setIsTrackView(false);
    setIsToolsView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    setActiveLegalPage(null);
    try {
      window.history.pushState(null, '', `/scheme/${encodeURIComponent(schemeId)}`);
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenApplyPage = (serviceName?: string) => {
    setSelectedService(serviceName || '');
    setApplyInitialService(serviceName || '');
    setIsApplyView(true);
    setIsTrackView(false);
    setIsToolsView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    const targetUrl = serviceName ? `/apply?service=${encodeURIComponent(serviceName)}` : '/apply';
    try {
      window.history.pushState(null, '', targetUrl);
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleCloseApplyPage = () => {
    setIsApplyView(false);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenTrackPage = (tokenId?: string) => {
    setTrackInitialToken(tokenId || '');
    setIsTrackView(true);
    setIsApplyView(false);
    setIsToolsView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    const targetUrl = tokenId ? `/track/${encodeURIComponent(tokenId)}` : '/track';
    try {
      window.history.pushState(null, '', targetUrl);
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleCloseTrackPage = () => {
    setIsTrackView(false);
    try {
      window.history.pushState(null, '', '/');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
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

  // Sync document head SEO metadata accurately across all routes
  useEffect(() => {
    if (isNotFoundView) {
      applyClientSeo(PRIVATE_NOINDEX_META.notfound);
      return;
    }
    if (isAdminView) {
      applyClientSeo(PRIVATE_NOINDEX_META.admin);
      return;
    }
    if (isApplyView) {
      applyClientSeo(PRIVATE_NOINDEX_META.apply);
      return;
    }
    if (isTrackView) {
      applyClientSeo(PRIVATE_NOINDEX_META.track);
      return;
    }
    if (activeLegalPage) {
      applyClientSeo(LEGAL_SEO_MAP[activeLegalPage] || LEGAL_SEO_MAP.privacy);
      return;
    }
    if (activeJobPost) {
      applyClientSeo({
        title: `${activeJobPost.title} | CSC DOST`,
        description:
          activeJobPost.shortInfo ||
          `View official notification dates, eligibility and application details for ${activeJobPost.title} on CSC DOST.`,
        canonicalUrl: `${SITE_ORIGIN}/post/${activeJobPost.id}`,
        robots: 'index, follow',
        ogType: 'article',
      });
      return;
    }
    if (activeServicePost) {
      applyClientSeo({
        title: `${activeServicePost.name} | CSC DOST`,
        description: `${activeServicePost.description} Estimated time: ${activeServicePost.estimatedTime}.`,
        canonicalUrl: `${SITE_ORIGIN}/service/${activeServicePost.id}`,
        robots: 'index, follow',
        ogType: 'website',
      });
      return;
    }
    if (isToolsView) {
      if (activeToolId) {
        const matchedTool = TOOLS_LIST.find((t) => t.id === activeToolId);
        if (matchedTool) {
          applyClientSeo({
            title: `${matchedTool.name} – Document Tools | CSC DOST`,
            description: matchedTool.shortDescription,
            canonicalUrl: `${SITE_ORIGIN}/tools/${matchedTool.id}`,
            robots: 'index, follow',
            ogType: 'website',
          });
          return;
        }
      }
      applyClientSeo(getCategorySeoMeta('tools'));
      return;
    }
    if (activeSchemeId) {
      const matchedScheme = GUIDE_ARTICLES.find((g) => g.id === activeSchemeId);
      if (matchedScheme) {
        applyClientSeo(getSchemeSeoMeta(matchedScheme));
        return;
      }
    }
    if (categoryView) {
      if (categoryView === 'education' && educationSubRoute === 'ignou') {
        applyClientSeo(IGNOU_EDUCATION_SEO);
      } else {
        applyClientSeo(getCategorySeoMeta(categoryView));
      }
      return;
    }
    applyClientSeo(HOMEPAGE_SEO);
  }, [
    activeLegalPage,
    isAdminView,
    isApplyView,
    isTrackView,
    activeJobPost,
    activeServicePost,
    isToolsView,
    activeToolId,
    activeSchemeId,
    categoryView,
    educationSubRoute,
    isNotFoundView,
  ]);

  // Respect system prefers-color-scheme instead of forcing light mode
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        localStorage.removeItem('theme');
      }
      document.documentElement.classList.remove('light');
    } catch {}
  }, []);

  const handleOpenStaffPortal = () => {
    setIsAdminView(true);
    try {
      window.location.hash = '#staff';
    } catch {}
  };

  const handleCloseStaffPortal = () => {
    setIsAdminView(false);
    try {
      if (window.location.hash === '#staff' || window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname);
      }
    } catch {}
  };

  // Scrolls to Digital Application & Appointment Desk or opens apply page
  const handleVisitClick = () => {
    handleOpenApplyPage();
  };

  const handleGoHome = () => {
    setIsAdminView(false);
    setIsToolsView(false);
    setCategoryView(null);
    setActiveSchemeId(null);
    setIsNotFoundView(false);
    setActiveToolId(null);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsApplyView(false);
    setIsTrackView(false);
    setActiveLegalPage(null);
    setSelectedService('');
    try {
      if (window.location.pathname !== '/' || window.location.hash) {
        window.history.pushState(null, '', '/');
      }
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenToolsPage = (toolId?: string) => {
    setIsToolsView(true);
    setActiveToolId(toolId || null);
    setCategoryView(null);
    setIsNotFoundView(false);
    setIsApplyView(false);
    setIsTrackView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    setActiveLegalPage(null);
    try {
      window.history.pushState(null, '', toolId ? `/tools/${toolId}` : '/tools');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleOpenCalculatorsPage = () => {
    setCategoryView('calculators');
    setIsToolsView(false);
    setIsNotFoundView(false);
    setIsApplyView(false);
    setIsTrackView(false);
    setActiveJobPost(null);
    setActiveServicePost(null);
    setIsAdminView(false);
    setActiveLegalPage(null);
    try {
      window.history.pushState(null, '', '/calculators');
    } catch {}
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  // WhatsApp Group / Community click trigger
  const handleWhatsAppFloating = () => {
    window.open('https://chat.whatsapp.com/GqeYfcw1sdN0EQtGvVR1fI', '_blank');
  };

  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('home');

  useEffect(() => {
    if (isTrackView || window.location.pathname.startsWith('/track')) {
      setActiveBottomTab('track');
    } else if (isToolsView || window.location.pathname.startsWith('/tools')) {
      setActiveBottomTab('tools');
    } else if (categoryView === 'jobs' || window.location.pathname === '/jobs') {
      setActiveBottomTab('jobs');
    } else if (categoryView === 'services' || window.location.pathname === '/services') {
      setActiveBottomTab('services');
    } else {
      setActiveBottomTab('home');
    }
  }, [isTrackView, isToolsView, categoryView, isApplyView, activeJobPost, activeServicePost, activeLegalPage]);

  const handleBottomNavNavigate = (tab: BottomNavTab) => {
    setActiveBottomTab(tab);
    if (tab === 'home') {
      handleGoHome();
    } else if (tab === 'jobs') {
      setCategoryView('jobs');
      setIsApplyView(false);
      setIsTrackView(false);
      setIsToolsView(false);
      setActiveJobPost(null);
      setActiveServicePost(null);
      setActiveLegalPage(null);
      setIsAdminView(false);
      try {
        if (window.location.pathname !== '/jobs') {
          window.history.pushState(null, '', '/jobs');
        }
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'services') {
      setCategoryView('services');
      setIsApplyView(false);
      setIsTrackView(false);
      setIsToolsView(false);
      setActiveJobPost(null);
      setActiveServicePost(null);
      setActiveLegalPage(null);
      setIsAdminView(false);
      try {
        if (window.location.pathname !== '/services') {
          window.history.pushState(null, '', '/services');
        }
      } catch {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'tools') {
      handleOpenToolsPage();
    } else if (tab === 'track') {
      handleOpenTrackPage();
    }
  };

  const currentNavPath = activeLegalPage
    ? LEGAL_PAGE_CONFIG[activeLegalPage].path
    : activeJobPost
    ? `/post/${activeJobPost.id}`
    : activeServicePost
    ? `/service/${activeServicePost.id}`
    : isToolsView
    ? activeToolId
      ? `/tools/${activeToolId}`
      : '/tools'
    : activeSchemeId
    ? `/scheme/${activeSchemeId}`
    : categoryView === 'education' && educationSubRoute === 'ignou'
    ? '/education/ignou'
    : categoryView
    ? `/${categoryView}`
    : '/';

  return (
    <LanguageProvider>
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] text-base flex flex-col justify-between font-sans transition-colors duration-200 w-full max-w-full overflow-x-hidden">
      
      {/* Top Navigation Panel (hidden in Staff Management Console and dedicated Apply/Track pages which use their own compact header) */}
      {!isAdminView && !isApplyView && !isTrackView && (
        <Navbar
          cafeName={settings.cafeName}
          currentPath={currentNavPath}
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
            ? 'flex-grow w-full min-h-screen bg-[var(--bg-page)] overflow-x-hidden'
            : isApplyView || isTrackView
            ? 'flex-grow w-full bg-[var(--bg-surface)] overflow-x-hidden pb-20 md:pb-6'
            : 'flex-grow w-full max-w-7xl mx-auto px-0 md:px-6 py-0 md:py-6 pb-20 md:pb-6 overflow-x-hidden'
        }
      >
        {activeLegalPage ? (
          <LegalPageView
            pageType={activeLegalPage}
            onNavigate={(type) => {
              const cfg = LEGAL_PAGE_CONFIG[type];
              try {
                if (cfg?.path) {
                  window.history.pushState(null, '', cfg.path);
                }
              } catch {}
              setActiveLegalPage(type);
            }}
            onBackToHome={handleGoHome}
          />
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
                onNavigateRoute={navigateToPath}
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
                onBack={() => navigateToPath('/services')}
                onNavigateRoute={navigateToPath}
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
                onNavigateRoute={navigateToPath}
              />
            </Suspense>
          </div>
        ) : isNotFoundView ? (
          /* GENUINE 404 PAGE VIEW FOR UNRECOGNIZED CLIENT ROUTES */
          <div className="animate-fade-in w-full px-4 py-12 flex items-center justify-center">
            <div className="max-w-lg w-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 text-center shadow-xs space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--status-closing-bg)] border border-[var(--status-closing-border)] text-[var(--status-closing-text)] text-xs font-bold">
                HTTP 404 · Page Not Found
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                Page Could Not Be Found
              </h1>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                The page or notice you requested does not exist or may have moved. Browse our main sections below or return to the homepage.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoHome();
                  }}
                  className="min-h-[44px] inline-flex items-center px-4 py-2.5 bg-[#101A36] text-white text-sm font-bold rounded-xl hover:bg-[#1E2B4F] transition-colors no-underline"
                >
                  Return to Homepage
                </a>
                {CORE_CATEGORIES.map((cat) => (
                  <a
                    key={cat.slug}
                    href={cat.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToPath(cat.path);
                    }}
                    className="min-h-[44px] inline-flex items-center px-3.5 py-2.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] hover:text-[#1F9D6B] border border-[var(--border-default)] text-sm font-semibold rounded-xl transition-colors no-underline"
                  >
                    {cat.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : categoryView === 'jobs' ? (
          /* DEDICATED FULL-PAGE VIEW FOR JOBS & RECRUITMENT */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Recruitment Notifications..." />}>
              <SarkariResultDesk
                mode="jobs"
                onNavigateRoute={navigateToPath}
                onApplyService={handleServiceSelect}
                onOpenDedicatedPage={handleOpenJobPage}
              />
            </Suspense>
          </div>
        ) : categoryView === 'education' ? (
          /* DEDICATED FULL-PAGE VIEW FOR EDUCATION & ADMISSIONS (INCLUDING /education/ignou) */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Education & Admissions..." />}>
              <SarkariResultDesk
                mode="education"
                initialTab={educationSubRoute === 'ignou' ? 'ignou' : 'all'}
                educationSubRoute={educationSubRoute === 'ignou'}
                onNavigateRoute={navigateToPath}
                onApplyService={handleServiceSelect}
                onOpenDedicatedPage={handleOpenJobPage}
              />
            </Suspense>
          </div>
        ) : categoryView === 'schemes' || activeSchemeId !== null ? (
          /* DEDICATED FULL-PAGE VIEW FOR GOVERNMENT SCHEMES & GUIDES */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Government Schemes & Guides..." />}>
              <GuidesKnowledgeHub
                initialArticleId={activeSchemeId}
                onClearInitialArticle={() => navigateToPath('/schemes')}
                onOpenArticle={(articleId) => handleOpenSchemePage(articleId)}
                onSelectService={handleServiceSelect}
                onNavigateRoute={navigateToPath}
              />
            </Suspense>
          </div>
        ) : categoryView === 'services' ? (
          /* DEDICATED FULL-PAGE VIEW FOR CSC E-SERVICES */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Citizen Services Catalogue..." />}>
              <ExploreServicesDesk
                onApplyService={handleServiceSelect}
                selectedService={selectedService}
                onOpenDedicatedServicePage={handleOpenServicePage}
                onNavigateRoute={navigateToPath}
              />
            </Suspense>
          </div>
        ) : categoryView === 'calculators' ? (
          /* DEDICATED FULL-PAGE VIEW FOR CITIZEN CALCULATORS */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[420px]" title="Loading Citizen Calculators..." />}>
              <CitizenToolsDesk
                isStandalonePage
                onApplyService={handleServiceSelect}
                onNavigateRoute={navigateToPath}
              />
            </Suspense>
          </div>
        ) : (
          /* MOBILE-FIRST CSC DOST HOMEPAGE */
          <div className="animate-fade-in space-y-0 w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[520px]" title="Loading CSC DOST Citizen Portal..." />}>
              <PortalHomepage
                onOpenJob={handleOpenJobPage}
                onOpenService={handleOpenServicePage}
                onApplyService={handleServiceSelect}
                onOpenGuide={(guideId) => handleOpenSchemePage(guideId)}
                onOpenTrack={() => handleOpenTrackPage()}
                onOpenLegal={openLegalModal}
                onNavigateRoute={(route) => {
                  if (route.startsWith('/scheme/')) {
                    const id = route.slice('/scheme/'.length);
                    if (id) handleOpenSchemePage(id);
                  } else if (route === '/jobs') {
                    navigateToPath('/jobs');
                  } else if (route === '/education') {
                    navigateToPath('/education');
                  } else if (route === '/education/ignou') {
                    navigateToPath('/education/ignou');
                  } else if (route === '/schemes' || route.startsWith('/schemes#')) {
                    navigateToPath('/schemes');
                  } else if (route === '/services' || route.startsWith('/services#')) {
                    navigateToPath('/services');
                  } else if (route === '/calculators') {
                    handleOpenCalculatorsPage();
                  } else if (route === '/tools' || route.startsWith('/tools#')) {
                    handleOpenToolsPage();
                  } else if (route === '/apply') {
                    handleOpenApplyPage();
                  } else if (route === '/track') {
                    handleOpenTrackPage();
                  }
                }}
              />
            </Suspense>
          </div>
        )}
      </main>

      {/* Global Page Footer (Below the Fold) */}
      {!isAdminView && (
        <Suspense fallback={<div className="h-20 bg-[var(--bg-header-dark)] border-t border-white/10" />}>
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
            onClose={() => {
              setIsPrivacyModalOpen(false);
              try {
                if (window.location.hash.startsWith('#privacy') || window.location.hash.startsWith('#terms') || window.location.hash.startsWith('#disclaimer') || window.location.hash.startsWith('#refund') || window.location.hash.startsWith('#help') || window.location.hash.startsWith('#hyperlink') || window.location.hash.startsWith('#copyright')) {
                  window.history.replaceState(null, '', window.location.pathname || '/');
                }
              } catch {}
            }} 
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
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl relative text-[#101A36]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#101A36]" />
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

            <p className="text-sm text-[#475569] font-medium">
              Share <strong className="text-[#101A36]">{shareData.name}</strong> with candidates or on WhatsApp:
            </p>

            {/* Formatted WhatsApp Notification Preview */}
            <div className="p-3 bg-[#ECFDF5] border border-[#1F9D6B]/40 rounded-xl text-xs text-[#101A36] font-sans whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {shareData.text}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* PATH A — SHARE ON WHATSAPP */}
              <a
                href={shareData.whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-[#1F9D6B] hover:bg-[#198258] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </div>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Formatted Alert</span>
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
                  className="flex items-center justify-between p-3.5 bg-[#101A36] hover:bg-[#1E2B4F] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4" />
                    <span>Share via Other Apps (System Share)</span>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">Native</span>
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
                className="flex items-center justify-between p-3.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#101A36] rounded-xl font-semibold text-sm transition-colors border border-[#1F9D6B]/30 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {copyMessageSuccess ? (
                    <Check className="w-4 h-4 text-[#1F9D6B]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#1F9D6B]" />
                  )}
                  <span>
                    {copyMessageSuccess
                      ? 'WhatsApp Message Copied!'
                      : 'Copy Formatted WhatsApp Message'}
                  </span>
                </div>
                <span className="text-[11px] text-[#1F9D6B] font-mono">Text</span>
              </button>

              {/* Copy Direct Page Link Fallback */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareData.url);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2500);
                }}
                className="flex items-center justify-between p-3.5 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#101A36] rounded-xl font-semibold text-sm transition-colors border border-[#E2E8F0] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {copySuccess ? <Check className="w-4 h-4 text-[#1F9D6B]" /> : <Copy className="w-4 h-4 text-[#64748B]" />}
                  <span>{copySuccess ? 'Link Copied to Clipboard!' : 'Copy Direct Page Link'}</span>
                </div>
                <span className="text-[11px] text-[#64748B] font-mono">URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Updates Group Button - Compact 48px circle on mobile with safe-area and bottom nav clearance */}
      {!isAdminView && !isApplyView && !isTrackView && !isPrivacyModalOpen && !showShareModal && (
        <button
          type="button"
          onClick={handleWhatsAppFloating}
          className={`fixed bottom-[calc(68px+max(0.75rem,env(safe-area-inset-bottom)))] end-3.5 sm:bottom-6 sm:end-6 w-12 h-12 sm:w-auto sm:h-11 sm:px-4 bg-[#1F9D6B] hover:bg-[#198258] text-white rounded-full shadow-md transition-colors z-30 ${
            activeJobPost || activeServicePost
              ? 'hidden md:flex'
              : 'flex'
          } items-center justify-center sm:gap-2 cursor-pointer border border-[#198258] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F9D6B]`}
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

      {/* Fixed Mobile Bottom Navigation Bar (4 items: Home, Services, Jobs, Track) */}
      {!isAdminView && (
        <MobileBottomNav
          activeTab={activeBottomTab}
          onNavigate={handleBottomNavNavigate}
        />
      )}

    </div>
    </LanguageProvider>
  );
}
