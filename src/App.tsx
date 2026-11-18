import React, { useState, useEffect, lazy, Suspense } from 'react';
import LiveTickerBar from './components/LiveTickerBar';
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
import { Share2, X, MessageCircle, Copy, Check } from 'lucide-react';

// Route-Level & Component-Level Lazy Loading (Code Splitting)
const PortalHomepage = lazy(() => import('./components/PortalHomepage'));
const SarkariDedicatedPageView = lazy(() => import('./components/SarkariDedicatedPageView'));
const ServiceDedicatedPageView = lazy(() => import('./components/ServiceDedicatedPageView'));
const ServiceClusterHubView = lazy(() => import('./components/ServiceClusterHubView'));
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
const CategoryPage = lazy(() => import('./components/category/CategoryPage'));
const ArchivePageView = lazy(() => import('./components/ArchivePageView'));
const DevThumbnailsPreview = lazy(() => import('./components/DevThumbnailsPreview'));
import CookieNotice from './components/CookieNotice';
import { TOOLS_LIST } from './components/tools/toolsData';
import { PUBLISHED_GUIDE_ARTICLES as STATIC_PUBLISHED_GUIDES, GuideArticle } from './data/guidesData';
import { KNOWN_DUPLICATE_MAP } from './data/sarkariMigration';
import { isStaleOver90Days } from './utils/postLifecycle';
import { LanguageProvider } from './contexts/LanguageContext';
import { getPostOgImageUrl } from './utils/postThumbnailMeta';
import {
  applyClientSeo,
  ARCHIVE_SEO,
  formatPostSeoDescription,
  formatPostSeoTitle,
  formatSeoDescription,
  formatSeoTitle,
  getCategorySeoMeta,
  getSchemeSeoMeta,
  DEADLINES_SEO,
  HOMEPAGE_SEO,
  IGNOU_EDUCATION_SEO,
  LEGAL_SEO_MAP,
  PRIVATE_NOINDEX_META,
  SITE_ORIGIN,
  CORE_CATEGORIES,
} from './utils/seoConfig';
import {
  getServiceClusterById,
  validateServiceReadyToPublish,
  ServiceClusterHubOverride,
} from './utils/serviceMetadata';

// Lightweight Skeleton Fallback for Section Containers (Prevents Layout Shift)
function SectionSkeleton({ height = 'min-h-[360px]', title = 'Loading Desk...' }: { height?: string; title?: string }) {
  return (
    <div className={`w-full ${height} bg-[var(--bg-card)] border-b border-[var(--border-default)] px-3 py-5 flex flex-col justify-between animate-pulse font-sans`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--bg-subtle)]" />
            <div className="h-4 w-36 bg-[var(--bg-subtle)] rounded" />
          </div>
          <div className="h-3 w-16 bg-[var(--bg-subtle)] rounded" />
        </div>
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div className="h-24 bg-[var(--bg-subtle)] rounded-xl" />
          <div className="h-24 bg-[var(--bg-subtle)] rounded-xl" />
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
    <div className="w-full min-h-[420px] bg-[var(--bg-card)] border-b border-[var(--border-default)] px-3 py-5 animate-pulse space-y-5">
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] pb-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)]" />
        <div className="space-y-2">
          <div className="h-5 w-48 bg-[var(--bg-subtle)] rounded" />
          <div className="h-3 w-36 bg-[var(--bg-subtle)] rounded" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-full" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-5/6" />
        <div className="h-4 bg-[var(--bg-subtle)] rounded w-4/6" />
      </div>
      <div className="grid grid-cols-1 gap-3 pt-2">
        <div className="h-28 bg-[var(--bg-subtle)] rounded-xl" />
        <div className="h-28 bg-[var(--bg-subtle)] rounded-xl" />
      </div>
      <div className="flex items-center justify-center gap-2 pt-3 text-[var(--text-muted)] text-xs">
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
  email: "urnxtfd@gmail.com",
  address: "Sangran Qazigund, Sangran Qazigund, Anantnag, Jammu and Kashmir 192221",
  officeHours: "Mon - Sat: 08:30 AM - 08:00 PM, Sun: 10:00 AM - 04:00 PM",
  googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.996452296068!2d77.21833441508272!3d28.630041982417724!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd3637e19e75%3A0x6b7a544f84c4f9a7!2sConnaught%20Place%2C%20New%20Delhi%2C%20Delhi%20110001!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
  seoTitle: "CSC DOST",
  seoDescription: "CSC DOST (www.cscdost.com) - Authorized CSC E-Governance and Digital Services Portal. Apply for PAN, Aadhaar updates, Ayushman Bharat card, Voter ID, and digital services.",
  seoKeywords: "cscdost, CSC DOST, cscdost.com, www.cscdost.com, cyber cafe, CSC center, PAN card application, Aadhaar update, online form filling, printing"
};

export default function App() {
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
  const [categoryView, setCategoryView] = useState<'jobs' | 'education' | 'schemes' | 'services' | 'calculators' | 'deadlines' | null>(null);
  const [routeSearch, setRouteSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const [educationSubRoute, setEducationSubRoute] = useState<'all' | 'ignou'>('all');
  const [activeSchemeId, setActiveSchemeId] = useState<string | null>(null);
  const [isNotFoundView, setIsNotFoundView] = useState<boolean>(false);
  const [isArchiveView, setIsArchiveView] = useState<boolean>(false);
  const [isStaffRoute, setIsStaffRoute] = useState<boolean>(false);
  const [isDevThumbnailsView, setIsDevThumbnailsView] = useState<boolean>(false);
  const [publishedGuides, setPublishedGuides] = useState<GuideArticle[]>(STATIC_PUBLISHED_GUIDES);
  const [mergedServices, setMergedServices] = useState<ServiceItem[]>(SERVICES_LIST);
  const [serviceRedirectMap, setServiceRedirectMap] = useState<Record<string, string>>({});
  const [clusterOverrides, setClusterOverrides] = useState<Record<string, ServiceClusterHubOverride>>({});
  const [clusterReadiness, setClusterReadiness] = useState<Record<string, boolean>>({});
  const [activeClusterId, setActiveClusterId] = useState<string | null>(null);

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
    }
  };

  // Fetch initial public data and log view once on mount
  useEffect(() => {
    fetchPublicData();
    fetch('/api/tracker/view', { method: 'POST' }).catch(() => {});
    fetch('/api/guides')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.guides)) {
          setPublishedGuides(data.guides);
        }
      })
      .catch(() => {});
    fetch('/api/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.services)) {
          setMergedServices(data.services);
        }
        if (data?.redirectMap && typeof data.redirectMap === 'object') {
          setServiceRedirectMap(data.redirectMap);
        }
        if (data?.clusterOverrides && typeof data.clusterOverrides === 'object') {
          setClusterOverrides(data.clusterOverrides);
        }
        if (data?.clusterReadiness && typeof data.clusterReadiness === 'object') {
          setClusterReadiness(data.clusterReadiness);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeServicePost?.id) return;
    fetch('/api/tracker/service-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: activeServicePost.id, type: 'view' }),
    }).catch(() => {});
  }, [activeServicePost?.id]);

  // Track route changes and keep post resolution synced with published posts
  useEffect(() => {
    const parseRoute = () => {
      const rawHash = window.location.hash || '';
      const rawPathname = window.location.pathname || '/';
      setRouteSearch(window.location.search || '');
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
      const cleanPath = (effectivePath.split('#')[0].split('?')[0] || '/').replace(/\/+$/, '') || '/';

      // Reset client not found, archive, cluster & scheme flags before evaluating current path
      setIsNotFoundView(false);
      setIsArchiveView(false);
      setIsStaffRoute(false);
      setActiveSchemeId(null);
      setActiveClusterId(null);

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

      // 1. Check legal / informational routes (/privacy-policy, /privacy, /terms-of-service, /terms, /editorial-policy, etc.)
      const legalMatch = cleanPath.match(/^\/(privacy-policy|privacy|terms-of-service|terms|disclaimer|about-us|about|contact-us|contact|refund-policy|refund|editorial-policy|editorial)$/i);
      if (legalMatch) {
        let mappedType: LegalPageType = 'privacy';
        const rawKey = legalMatch[1].toLowerCase();
        if (rawKey === 'privacy-policy' || rawKey === 'privacy') mappedType = 'privacy';
        else if (rawKey === 'terms-of-service' || rawKey === 'terms') mappedType = 'terms';
        else if (rawKey === 'disclaimer') mappedType = 'disclaimer';
        else if (rawKey === 'editorial-policy' || rawKey === 'editorial') mappedType = 'editorial';
        else if (rawKey === 'about-us' || rawKey === 'about') {
          mappedType = 'about';
          if (rawKey === 'about') {
            try { window.history.replaceState(null, '', '/about-us'); } catch {}
          }
        } else if (rawKey === 'contact-us' || rawKey === 'contact') {
          mappedType = 'contact';
          if (rawKey === 'contact') {
            try { window.history.replaceState(null, '', '/contact-us'); } catch {}
          }
        } else if (rawKey === 'refund-policy' || rawKey === 'refund') mappedType = 'refund';

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
        setIsStaffRoute(cleanPath === '/staff' || rawHash === '#staff' || rawHash === '#/staff');
        setIsDevThumbnailsView(false);
        setCategoryView(null);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        return;
      } else {
        setIsAdminView(false);
        setIsStaffRoute(false);
      }

      // 2b. Check Dev Thumbnail Preview route (/dev/thumbnails) - internal QA only (noindex)
      if (cleanPath === '/dev/thumbnails') {
        setIsDevThumbnailsView(true);
        setIsNotFoundView(false);
        setCategoryView(null);
        setIsAdminView(false);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setActiveLegalPage(null);
        return;
      } else {
        setIsDevThumbnailsView(false);
      }

      // 2c. Dedicated Archive Route (/archive)
      if (cleanPath === '/archive') {
        setIsArchiveView(true);
        setCategoryView(null);
        setIsAdminView(false);
        setIsApplyView(false);
        setIsTrackView(false);
        setIsToolsView(false);
        setActiveJobPost(null);
        setActiveServicePost(null);
        setActiveLegalPage(null);
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
        return;
      } else {
        setIsArchiveView(false);
      }

      // 3. Dedicated category routes: /jobs, /education, /education/ignou, /schemes, /services, /calculators, /deadlines
      if (['/jobs', '/education', '/education/ignou', '/schemes', '/services', '/calculators', '/deadlines'].includes(cleanPath)) {
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
        } else if (cleanPath === '/deadlines') {
          setCategoryView('deadlines');
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

      // 6b. Check Consolidated Service Cluster Hub route (/services/cluster/:clusterId)
      const pathClusterMatch = cleanPath.match(/^\/services\/cluster\/([^/?#]+)$/i);
      if (pathClusterMatch) {
        const cid = decodeURIComponent(pathClusterMatch[1]);
        const cluster = getServiceClusterById(cid);
        if (cluster) {
          setActiveClusterId(cluster.clusterId);
          setActiveServicePost(null);
          setActiveJobPost(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          setCategoryView(null);
          setActiveLegalPage(null);
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch {}
          return;
        } else {
          setActiveClusterId(null);
          setActiveServicePost(null);
          setIsNotFoundView(true);
          return;
        }
      }

      // 7. Check Service route (/service/:id, #service/:id, #/service/:id, ?service=:id)
      const pathServiceMatch = cleanPath.match(/^\/service\/([^/?#]+)$/i);
      if (pathServiceMatch) {
        const serviceId = decodeURIComponent(pathServiceMatch[1]);
        const redirectTarget = serviceRedirectMap[serviceId];
        if (redirectTarget) {
          try {
            window.history.replaceState(null, '', redirectTarget);
          } catch {}
          const clusterTargetMatch = redirectTarget.match(/^\/services\/cluster\/([^/?#]+)$/i);
          if (clusterTargetMatch) {
            const cluster = getServiceClusterById(decodeURIComponent(clusterTargetMatch[1]));
            if (cluster) {
              setActiveClusterId(cluster.clusterId);
              setActiveServicePost(null);
              setActiveJobPost(null);
              setIsAdminView(false);
              setIsApplyView(false);
              setIsTrackView(false);
              setIsToolsView(false);
              return;
            }
          }
          const svcTargetMatch = redirectTarget.match(/^\/service\/([^/?#]+)$/i);
          if (svcTargetMatch) {
            const redirectedSvc = mergedServices.find((s) => s.id === decodeURIComponent(svcTargetMatch[1]));
            if (redirectedSvc) {
              setActiveServicePost(redirectedSvc);
              setActiveJobPost(null);
              setIsAdminView(false);
              setIsApplyView(false);
              setIsTrackView(false);
              setIsToolsView(false);
              return;
            }
          }
        }
        const matchService = mergedServices.find(s => s.id === serviceId);
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
        const matchService = mergedServices.find(s => s.id === serviceParam);
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
      if (candidateSchemeId === 'army-agniveer-rally-guide-2026') {
        try { window.history.replaceState(null, '', '/post/army-agniveer-rally-guide-2026'); } catch {}
        const movedPost = syncedPosts.find(i => i.id === 'army-agniveer-rally-guide-2026' && isPublishedSarkariItem(i));
        if (movedPost) {
          setActiveSchemeId(null);
          setActiveJobPost(movedPost);
          setActiveServicePost(null);
          setCategoryView(null);
          setIsAdminView(false);
          setIsApplyView(false);
          setIsTrackView(false);
          setIsToolsView(false);
          setActiveLegalPage(null);
          try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
          return;
        }
      }
      if (candidateSchemeId) {
        const matchScheme = publishedGuides.find((g) => g.id === candidateSchemeId);
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
  }, [syncedPosts, publishedGuides, mergedServices, serviceRedirectMap]);

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
    setActiveClusterId(null);
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
    if (isDevThumbnailsView) {
      applyClientSeo({
        title: 'Thumbnail Preview Matrix | CSC DOST',
        description: 'Internal development preview for generated OG images and list thumbnails.',
        canonicalUrl: `${SITE_ORIGIN}/dev/thumbnails`,
        robots: 'noindex, nofollow',
        ogType: 'website',
      });
      return;
    }
    if (isNotFoundView) {
      applyClientSeo(PRIVATE_NOINDEX_META.notfound);
      return;
    }
    if (isAdminView) {
      applyClientSeo(isStaffRoute ? PRIVATE_NOINDEX_META.staff : PRIVATE_NOINDEX_META.admin);
      return;
    }
    if (isArchiveView) {
      applyClientSeo(ARCHIVE_SEO);
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
      const isNoindexPost =
        isStaleOver90Days(activeJobPost) ||
        Boolean(activeJobPost.duplicateOfId) ||
        Boolean(activeJobPost.robotsNoindex) ||
        Boolean(KNOWN_DUPLICATE_MAP[activeJobPost.id]);
      applyClientSeo({
        title: formatPostSeoTitle(activeJobPost),
        description: formatPostSeoDescription(activeJobPost),
        canonicalUrl: `${SITE_ORIGIN}/post/${activeJobPost.id}`,
        robots: isNoindexPost ? 'noindex, follow' : 'index, follow',
        ogType: 'article',
        ogImage: getPostOgImageUrl(activeJobPost, SITE_ORIGIN),
      });
      return;
    }
    if (activeClusterId) {
      const cluster = getServiceClusterById(activeClusterId);
      if (cluster) {
        applyClientSeo({
          title: formatSeoTitle(cluster.title),
          description: formatSeoDescription(cluster.summary),
          canonicalUrl: `${SITE_ORIGIN}${cluster.hubPath}`,
          robots: clusterReadiness[cluster.clusterId] ? 'index, follow' : 'noindex, follow',
          ogType: 'website',
        });
        return;
      }
    }
    if (activeServicePost) {
      const svcTime =
        activeServicePost.estimatedTime && activeServicePost.estimatedTime.trim()
          ? ` Estimated time: ${activeServicePost.estimatedTime.trim()}.`
          : '';
      const svcReady = validateServiceReadyToPublish(activeServicePost).canPublish;
      applyClientSeo({
        title: formatSeoTitle(activeServicePost.name),
        description: formatSeoDescription(`${activeServicePost.description}${svcTime}`),
        canonicalUrl: `${SITE_ORIGIN}/service/${activeServicePost.id}`,
        robots:
          activeServicePost.robotsNoindex || activeServicePost.duplicateOfId || !svcReady
            ? 'noindex, follow'
            : 'index, follow',
        ogType: 'website',
      });
      return;
    }
    const queryParams = new URLSearchParams(routeSearch || '');
    const hasFilterQuery = ['tab', 'org', 'filter', 'q', 'page', 'sort', 'calc', 'preset', 'service'].some(
      (key) => Boolean(queryParams.get(key))
    );
    if (isToolsView) {
      if (activeToolId) {
        const matchedTool = TOOLS_LIST.find((t) => t.id === activeToolId);
        if (matchedTool) {
          applyClientSeo({
            title: formatSeoTitle(`${matchedTool.name} - Tools`),
            description: formatSeoDescription(matchedTool.shortDescription),
            canonicalUrl: `${SITE_ORIGIN}/tools/${matchedTool.id}`,
            robots: hasFilterQuery ? 'noindex, follow' : 'index, follow',
            ogType: 'website',
          });
          return;
        }
      }
      const toolsMeta = getCategorySeoMeta('tools');
      applyClientSeo({
        ...toolsMeta,
        robots: hasFilterQuery ? 'noindex, follow' : toolsMeta.robots,
      });
      return;
    }
    if (activeSchemeId) {
      const matchedScheme = publishedGuides.find((g) => g.id === activeSchemeId);
      if (matchedScheme) {
        applyClientSeo(getSchemeSeoMeta(matchedScheme));
        return;
      }
    }
    if (categoryView) {
      if (categoryView === 'deadlines') {
        applyClientSeo({
          ...DEADLINES_SEO,
          robots: hasFilterQuery ? 'noindex, follow' : DEADLINES_SEO.robots,
        });
      } else if (categoryView === 'education' && educationSubRoute === 'ignou') {
        applyClientSeo({
          ...IGNOU_EDUCATION_SEO,
          robots: hasFilterQuery ? 'noindex, follow' : IGNOU_EDUCATION_SEO.robots,
        });
      } else {
        const catMeta = getCategorySeoMeta(categoryView);
        applyClientSeo({
          ...catMeta,
          robots: hasFilterQuery ? 'noindex, follow' : catMeta.robots,
        });
      }
      return;
    }
    applyClientSeo(HOMEPAGE_SEO);
  }, [
    isDevThumbnailsView,
    activeLegalPage,
    isAdminView,
    isStaffRoute,
    isArchiveView,
    isApplyView,
    isTrackView,
    activeJobPost,
    activeServicePost,
    activeClusterId,
    isToolsView,
    activeToolId,
    activeSchemeId,
    publishedGuides,
    categoryView,
    educationSubRoute,
    routeSearch,
    isNotFoundView,
  ]);

  // Respect system prefers-color-scheme and sync Tailwind .dark class
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        localStorage.removeItem('theme');
      }
      document.documentElement.classList.remove('light');
      if (typeof window.matchMedia === 'function') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const applySystemTheme = (matches: boolean) => {
          document.documentElement.classList.toggle('dark', matches);
        };
        applySystemTheme(mq.matches);
        const onChange = (e: MediaQueryListEvent) => applySystemTheme(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
      }
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

  const handleGoHome = () => {
    setIsAdminView(false);
    setIsStaffRoute(false);
    setIsArchiveView(false);
    setIsDevThumbnailsView(false);
    setIsToolsView(false);
    setCategoryView(null);
    setActiveSchemeId(null);
    setActiveClusterId(null);
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

  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('home');

  useEffect(() => {
    const searchLower = routeSearch.toLowerCase();
    const pathLower = typeof window !== 'undefined' ? window.location.pathname : '';
    if (isNotificationCenterOpen) {
      setActiveBottomTab('alerts');
    } else if (
      (categoryView === 'jobs' || pathLower === '/jobs') &&
      searchLower.includes('tab=results')
    ) {
      setActiveBottomTab('results');
    } else if (categoryView === 'jobs' || pathLower === '/jobs' || categoryView === 'deadlines') {
      setActiveBottomTab('jobs');
    } else if (categoryView === 'services' || pathLower === '/services' || activeServicePost) {
      setActiveBottomTab('services');
    } else {
      setActiveBottomTab('home');
    }
  }, [isNotificationCenterOpen, categoryView, routeSearch, activeServicePost, isTrackView, isToolsView, isApplyView, activeJobPost, activeLegalPage]);

  const handleBottomNavNavigate = (tab: BottomNavTab) => {
    setActiveBottomTab(tab);
    if (tab === 'home') {
      handleGoHome();
    } else if (tab === 'jobs') {
      navigateToPath('/jobs');
    } else if (tab === 'results') {
      navigateToPath('/jobs?tab=results');
    } else if (tab === 'services') {
      navigateToPath('/services');
    } else if (tab === 'alerts') {
      setIsNotificationCenterOpen(true);
      refreshUnreadCount();
    }
  };

  const currentNavPath = activeLegalPage
    ? LEGAL_PAGE_CONFIG[activeLegalPage].path
    : isArchiveView
    ? '/archive'
    : activeJobPost
    ? `/post/${activeJobPost.id}`
    : activeClusterId
    ? `/services/cluster/${activeClusterId}`
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

  const isHomepageView =
    !isAdminView &&
    !isArchiveView &&
    !isDevThumbnailsView &&
    !activeLegalPage &&
    !isApplyView &&
    !isTrackView &&
    !activeJobPost &&
    !activeServicePost &&
    !activeClusterId &&
    !isToolsView &&
    !isNotFoundView &&
    !categoryView &&
    activeSchemeId === null;

  const calcSearchParams = new URLSearchParams(
    routeSearch || (typeof window !== 'undefined' ? window.location.search : '')
  );
  const activeCalcParam = categoryView === 'calculators' ? calcSearchParams.get('calc') : null;
  const activeCalcTab: 'age' | 'photo' | 'fee' | undefined =
    activeCalcParam === 'age' || activeCalcParam === 'photo' || activeCalcParam === 'fee'
      ? activeCalcParam
      : undefined;
  const activeCalcPreset = calcSearchParams.get('preset') || undefined;
  const activeCalcService = calcSearchParams.get('service') || undefined;

  const isCategoryListingView =
    !isAdminView &&
    !isDevThumbnailsView &&
    !activeLegalPage &&
    !isApplyView &&
    !isTrackView &&
    !activeJobPost &&
    !activeServicePost &&
    !activeClusterId &&
    !isNotFoundView &&
    (categoryView === 'jobs' ||
      categoryView === 'education' ||
      (categoryView === 'schemes' && activeSchemeId === null) ||
      categoryView === 'services' ||
      (categoryView === 'calculators' && !activeCalcTab) ||
      (isToolsView && !activeToolId));

  return (
    <LanguageProvider>
    <div
      className={
        isAdminView
          ? 'min-h-screen w-full bg-[var(--bg-page)] text-[var(--text-primary)] font-sans'
          : activeJobPost
          ? 'min-h-screen w-full bg-[#E4E8E6] dark:bg-[#0B1210] text-[#17201D] dark:text-[#E7EFEB] transition-colors duration-200'
          : isCategoryListingView
          ? 'min-h-screen w-full bg-[#F3F6FC] dark:bg-[#070A12] text-[#0B1226] dark:text-[#EAF0FF] transition-colors duration-200'
          : 'min-h-screen w-full bg-[#DFE5F2] dark:bg-[#05080F] lg:bg-[#F4F6FB] dark:lg:bg-[#0B1120] text-[#101A36] dark:text-[#F1F5F9] font-sans transition-colors duration-200'
      }
    >
      <div
        className={
          isAdminView || activeJobPost || isCategoryListingView
            ? 'w-full min-h-screen flex flex-col justify-between relative overflow-x-clip'
            : 'max-w-[480px] sm:max-w-[720px] lg:max-w-none w-full mx-auto min-h-screen bg-[#F4F6FB] dark:bg-[#0B1120] text-[#101A36] dark:text-[#F1F5F9] text-[14px] flex flex-col justify-between shadow-[0_0_32px_rgba(16,26,54,0.12)] lg:shadow-none relative overflow-x-clip'
        }
      >
        {/* Top LIVE Ticker Bar (Homepage) */}
        {isHomepageView && (
          <LiveTickerBar posts={syncedPosts} onOpenPost={handleOpenJobPage} />
        )}

        {/* Top Sticky Header */}
        {!isAdminView && !isApplyView && !isTrackView && (
          <Navbar
            cafeName={settings.cafeName}
            currentPath={currentNavPath}
            onOpenPrivacyPolicy={(tab) => openLegalModal(tab)}
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
              : activeJobPost || isCategoryListingView
              ? 'flex-grow w-full overflow-x-clip pb-0'
              : isApplyView || isTrackView
              ? 'flex-grow w-full bg-[var(--bg-surface)] overflow-x-clip pb-20 lg:pb-8'
              : 'flex-grow w-full overflow-x-clip pb-4 lg:pb-8'
          }
        >
        {isDevThumbnailsView ? (
          <Suspense fallback={<PageRouteSkeleton message="Loading Thumbnail Preview Matrix..." />}>
            <DevThumbnailsPreview
              posts={syncedPosts}
              onOpenPost={handleOpenJobPage}
              onBackHome={handleGoHome}
            />
          </Suspense>
        ) : isArchiveView ? (
          <Suspense fallback={<SectionSkeleton height="min-h-[420px]" title="Loading Archived Notices..." />}>
            <ArchivePageView
              onOpenPost={handleOpenJobPage}
              onNavigateRoute={navigateToPath}
              onBackHome={handleGoHome}
            />
          </Suspense>
        ) : activeLegalPage ? (
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
                allPosts={syncedPosts}
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
        ) : activeClusterId ? (
          /* CONSOLIDATED SERVICE CLUSTER HUB VIEW (/services/cluster/:clusterId) */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading Service Cluster Hub..." />}>
              <ServiceClusterHubView
                clusterId={activeClusterId}
                allServices={mergedServices}
                hubOverride={clusterOverrides[activeClusterId]}
                onBack={() => navigateToPath('/services')}
                onNavigateRoute={navigateToPath}
                onApplyService={(service) => {
                  handleOpenApplyPage(service);
                }}
              />
            </Suspense>
          </div>
        ) : activeServicePost ? (
          /* DEDICATED FULL-PAGE VIEW FOR COMPREHENSIVE E-SERVICES CATALOGUE */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<PageRouteSkeleton message="Loading CSC E-Service Catalogue..." />}>
              <ServiceDedicatedPageView
                service={activeServicePost}
                allServices={mergedServices}
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
          activeToolId ? (
            /* INDIVIDUAL INTERACTIVE TOOL RUNNER (/tools/[slug]) */
            <div className="animate-fade-in w-full">
              <Suspense fallback={<PageRouteSkeleton message="Loading Free Online Tool..." />}>
                <ToolsHub
                  initialToolId={activeToolId}
                  onSelectTool={(id) => {
                    setActiveToolId(id);
                  }}
                  onNavigateRoute={navigateToPath}
                />
              </Suspense>
            </div>
          ) : (
            /* CATEGORY LISTING TEMPLATE FOR /tools */
            <div className="animate-fade-in w-full">
              <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Document Tools..." />}>
                <CategoryPage
                  category="tools"
                  routeSearch={routeSearch}
                  onNavigateRoute={navigateToPath}
                  onOpenTool={(toolId) => navigateToPath(`/tools/${toolId}`)}
                  onApplyService={handleServiceSelect}
                />
              </Suspense>
            </div>
          )
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
          /* SHARED CATEGORY TEMPLATE FOR /jobs */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Recruitment Notifications..." />}>
              <CategoryPage
                category="jobs"
                routeSearch={routeSearch}
                onNavigateRoute={navigateToPath}
                onOpenPost={handleOpenJobPage}
                onApplyService={handleServiceSelect}
              />
            </Suspense>
          </div>
        ) : categoryView === 'deadlines' ? (
          /* DEDICATED FULL-PAGE VIEW FOR CLOSING DEADLINES */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Closing Deadlines..." />}>
              <SarkariResultDesk
                mode="deadlines"
                routeSearch={routeSearch}
                onNavigateRoute={navigateToPath}
                onApplyService={handleServiceSelect}
                onOpenDedicatedPage={handleOpenJobPage}
              />
            </Suspense>
          </div>
        ) : categoryView === 'education' ? (
          /* SHARED CATEGORY TEMPLATE FOR /education & /education/ignou */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Education & Admissions..." />}>
              <CategoryPage
                category="education"
                educationSubRoute={educationSubRoute === 'ignou'}
                routeSearch={routeSearch}
                onNavigateRoute={navigateToPath}
                onOpenPost={handleOpenJobPage}
                onApplyService={handleServiceSelect}
              />
            </Suspense>
          </div>
        ) : activeSchemeId !== null ? (
          /* INDIVIDUAL SCHEME DETAIL VIEW (/scheme/[slug]) */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Government Scheme Guide..." />}>
              <GuidesKnowledgeHub
                initialArticleId={activeSchemeId}
                onClearInitialArticle={() => navigateToPath('/schemes')}
                onOpenArticle={(articleId) => handleOpenSchemePage(articleId)}
                onSelectService={handleServiceSelect}
                onNavigateRoute={navigateToPath}
              />
            </Suspense>
          </div>
        ) : categoryView === 'schemes' ? (
          /* SHARED CATEGORY TEMPLATE FOR /schemes */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Government Schemes & Guides..." />}>
              <CategoryPage
                category="schemes"
                routeSearch={routeSearch}
                onNavigateRoute={navigateToPath}
                onOpenScheme={handleOpenSchemePage}
                onApplyService={handleServiceSelect}
              />
            </Suspense>
          </div>
        ) : categoryView === 'services' ? (
          /* SHARED CATEGORY TEMPLATE FOR /services */
          <div className="animate-fade-in w-full">
            <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Citizen Services Catalogue..." />}>
              <CategoryPage
                category="services"
                routeSearch={routeSearch}
                onNavigateRoute={navigateToPath}
                onOpenService={handleOpenServicePage}
                onApplyService={handleServiceSelect}
              />
            </Suspense>
          </div>
        ) : categoryView === 'calculators' ? (
          activeCalcTab ? (
            /* INTERACTIVE CALCULATOR RUNNER (/calculators?calc=age|photo|fee) */
            <div className="animate-fade-in w-full">
              <Suspense fallback={<SectionSkeleton height="min-h-[420px]" title="Loading Citizen Calculators..." />}>
                <CitizenToolsDesk
                  isStandalonePage
                  initialTab={activeCalcTab}
                  initialPortal={activeCalcPreset}
                  initialFeeService={activeCalcService}
                  onBackToCatalog={() => navigateToPath('/calculators')}
                  onApplyService={handleServiceSelect}
                  onNavigateRoute={navigateToPath}
                />
              </Suspense>
            </div>
          ) : (
            /* SHARED CATEGORY TEMPLATE FOR /calculators */
            <div className="animate-fade-in w-full">
              <Suspense fallback={<SectionSkeleton height="min-h-[500px]" title="Loading Citizen Calculators..." />}>
                <CategoryPage
                  category="calculators"
                  routeSearch={routeSearch}
                  onNavigateRoute={navigateToPath}
                  onApplyService={handleServiceSelect}
                />
              </Suspense>
            </div>
          )
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
                onNavigateRoute={(route) => navigateToPath(route)}
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

      {/* Fixed Mobile Bottom Navigation Bar (hidden on category listing pages with their own fixed bar) */}
      {!isAdminView && !activeJobPost && !isCategoryListingView && (
        <MobileBottomNav
          activeTab={activeBottomTab}
          onNavigate={handleBottomNavNavigate}
          unreadAlertsCount={unreadNotificationCount}
        />
      )}

      {!isAdminView && (
        <CookieNotice onOpenPrivacy={() => navigateToPath('/privacy-policy')} />
      )}

      </div>
    </div>
    </LanguageProvider>
  );
}
