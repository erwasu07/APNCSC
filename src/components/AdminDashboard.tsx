import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db, auth } from '../lib/firebase';
import {
  uploadReceiptFileToSupabase,
  getSupabaseClient,
  fetchSupabaseApplications,
  testSupabaseLiveConnection,
  updateSupabaseApplicationStatus,
  deleteSupabaseApplication,
  isDeletedApplicationRecord,
  isUuidString
} from '../lib/supabase';
import { getFormEndpoint, setFormEndpoint } from '../lib/getform';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  FileText,
  CheckCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Lock,
  User,
  Key,
  LogOut,
  X,
  FileSpreadsheet,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  IndianRupee,
  ExternalLink,
  Check,
  Upload,
  MessageSquare,
  Database,
  Copy,
  CheckSquare,
  Square,
  Edit3,
  Users,
  PhoneCall,
  MessageCircle,
  MapPin,
  ShieldAlert,
  Globe,
  Radio,
  AlertCircle,
  LayoutDashboard,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Settings,
  ArrowLeft,
  MoreHorizontal,
  ArrowUpDown,
  FileCheck,
  SlidersHorizontal,
  Sparkles,
  FileImage,
  File
} from 'lucide-react';
import WhatsAppBroadcaster from './WhatsAppBroadcaster';

interface AdminDashboardProps {
  cafeName: string;
  onClose?: () => void;
}

type NavSectionId =
  | 'overview'
  | 'all_apps'
  | 'pending_apps'
  | 'process_apps'
  | 'completed_apps'
  | 'rejected_apps'
  | 'documents'
  | 'payments'
  | 'vle_logs'
  | 'whatsapp_sync'
  | 'reports';

export default function AdminDashboard({ cafeName, onClose }: AdminDashboardProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('csc_admin_authed') === 'true';
  });
  const [staffDisplayName, setStaffDisplayName] = useState<string>(() => {
    return sessionStorage.getItem('csc_staff_name') || 'Mahi';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const globalSearchInputRef = useRef<HTMLInputElement>(null);

  // Navigation & Layout State
  const [activeNav, setActiveNav] = useState<NavSectionId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // New Realtime Arrival Notifications
  const [realtimeAlerts, setRealtimeAlerts] = useState<Array<{ id: string; appId: string; name: string; service: string; time: string }>>([]);

  // VLE Inquiries state
  const [vleInquiries, setVleInquiries] = useState<any[]>([]);
  const [vleSearchQuery, setVleSearchQuery] = useState<string>('');
  const [vleFilterState, setVleFilterState] = useState<string>('all');
  const [selectedVleIds, setSelectedVleIds] = useState<string[]>([]);

  // Applications & Filtering State
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'name_asc'>('newest');

  // Table Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);

  // Document & Payment View Search
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [docTypeFilter, setDocTypeFilter] = useState<'all' | 'image' | 'pdf' | 'receipt'>('all');
  const [paymentViewFilter, setPaymentViewFilter] = useState<'all' | 'upi_paid' | 'cash_collected' | 'cash_pending' | 'pending_verification'>('all');

  // Right-Side Application Details Drawer State
  const [drawerAppId, setDrawerAppId] = useState<string | null>(null);
  const [drawerNoteInput, setDrawerNoteInput] = useState<string>('');
  const [drawerNoteDirty, setDrawerNoteDirty] = useState<boolean>(false);
  const [savingDrawerNote, setSavingDrawerNote] = useState<boolean>(false);

  // Lightbox & Toast States
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ name: string; url: string; type?: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Bulk Actions & Copy States
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  // Mark Completed Upload Modal States
  const [uploadModalApp, setUploadModalApp] = useState<any | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Getform.io / Formspree & Supabase Integration Modal States
  const [showGetformModal, setShowGetformModal] = useState(false);
  const [snippetTab, setSnippetTab] = useState<'getform' | 'supabase' | 'sql'>('supabase');
  const [getformEndpointInput, setGetformEndpointInput] = useState<string>(() => getFormEndpoint());
  const [getformTestResult, setGetformTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  // Supabase Live Sync & Diagnostics States
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<{
    loading: boolean;
    lastSyncedAt?: string;
    error?: string;
    count?: number;
  } | null>(null);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);
  const [supabaseDiagnostic, setSupabaseDiagnostic] = useState<{
    running: boolean;
    result?: any;
    testedAt?: string;
  } | null>(null);

  // References to keep data maps in sync across all providers
  const serverApiMapRef = useRef<Map<string, any>>(new Map());
  const firestoreAppsMapRef = useRef<Map<string, any>>(new Map());
  const firestoreAptsMapRef = useRef<Map<string, any>>(new Map());
  const supabaseMapRef = useRef<Map<string, any>>(new Map());
  const mutationVersionRef = useRef<number>(0);
  const updateCombinedAppsRef = useRef<(() => void) | null>(null);

  // Helper to purge deleted application records from all in-memory maps and localStorage caches
  const removeRecordsFromAllMapsAndStorage = (rawIdentifiers: Array<string | undefined | null>) => {
    const targetSet = new Set(
      rawIdentifiers
        .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
        .map(v => v.trim().toLowerCase())
    );
    if (targetSet.size === 0) return;

    const matchesTarget = (entry: any, mapKey?: string): boolean => {
      if (mapKey && targetSet.has(String(mapKey).trim().toLowerCase())) return true;
      if (!entry || typeof entry !== 'object') return false;
      const candidates = [
        entry.id,
        entry.appId,
        entry.token_id,
        entry.token,
        entry.tokenNo,
        entry.supabaseId,
        entry.payload?.appId,
        entry.payload?.token,
        entry.id ? `CSC-${String(entry.id).slice(0, 8)}` : ''
      ];
      return candidates.some(
        c => typeof c === 'string' && c.trim().length > 0 && targetSet.has(c.trim().toLowerCase())
      );
    };

    const pruneMap = (m: Map<string, any>) => {
      for (const [k, v] of Array.from(m.entries())) {
        if (matchesTarget(v, k)) {
          m.delete(k);
        }
      }
    };

    pruneMap(serverApiMapRef.current);
    pruneMap(supabaseMapRef.current);
    pruneMap(firestoreAppsMapRef.current);
    pruneMap(firestoreAptsMapRef.current);

    try {
      const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      if (Array.isArray(localApps)) {
        const filteredLocal = localApps.filter((item: any) => !matchesTarget(item));
        localStorage.setItem('csc_local_applications', JSON.stringify(filteredLocal));
      }
      const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
      if (Array.isArray(web3Apps)) {
        const filteredWeb3 = web3Apps.filter((item: any) => !matchesTarget(item));
        localStorage.setItem('csc_web3forms_submissions', JSON.stringify(filteredWeb3));
      }
    } catch (e) {
      console.warn('Local storage prune notice:', e);
    }
  };

  // Debounce search query (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Synchronize sidebar status nav items with filterStatus
  const handleSelectNav = (navId: NavSectionId) => {
    setActiveNav(navId);
    setMobileSidebarOpen(false);
    setCurrentPage(1);

    if (navId === 'all_apps' || navId === 'overview') {
      setFilterStatus('all');
    } else if (navId === 'pending_apps') {
      setFilterStatus('pending');
    } else if (navId === 'process_apps') {
      setFilterStatus('approved');
    } else if (navId === 'completed_apps') {
      setFilterStatus('completed');
    } else if (navId === 'rejected_apps') {
      setFilterStatus('rejected');
    }
  };

  // Focus Username input field upon redirection to Staff Login
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        if (usernameInputRef.current) {
          try {
            usernameInputRef.current.focus({ preventScroll: false });
          } catch {
            usernameInputRef.current.focus();
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts: Escape closes drawer/modals, Ctrl+K focuses search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        globalSearchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (selectedDocPreview) {
          setSelectedDocPreview(null);
        } else if (uploadModalApp) {
          setUploadModalApp(null);
        } else if (showGetformModal) {
          setShowGetformModal(false);
        } else if (drawerAppId) {
          handleCloseDrawer();
        } else if (openRowMenuId) {
          setOpenRowMenuId(null);
        } else if (profileMenuOpen) {
          setProfileMenuOpen(false);
        } else if (notificationsOpen) {
          setNotificationsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDocPreview, uploadModalApp, showGetformModal, drawerAppId, drawerNoteDirty, openRowMenuId, profileMenuOpen, notificationsOpen]);

  // Active drawer application object (always live-synced with `applications`)
  const selectedDrawerApp = useMemo(() => {
    if (!drawerAppId) return null;
    return applications.find(a => (a.appId || a.id) === drawerAppId) || null;
  }, [drawerAppId, applications]);

  const handleOpenDrawer = (app: any) => {
    const id = app.appId || app.id;
    setDrawerAppId(id);
    setDrawerNoteInput(app.staffNotes || '');
    setDrawerNoteDirty(false);
    setOpenRowMenuId(null);
  };

  const handleCloseDrawer = () => {
    if (drawerNoteDirty) {
      const confirmDiscard = window.confirm('You have unsaved staff remarks. Close without saving?');
      if (!confirmDiscard) return;
    }
    setDrawerAppId(null);
    setDrawerNoteDirty(false);
  };

  const handleTestGetformEndpoint = async () => {
    setGetformTestResult({ status: 'testing' });
    const cleanUrl = getformEndpointInput.trim();
    setFormEndpoint(cleanUrl);

    if (!cleanUrl || cleanUrl.includes('YOUR_UNIQUE_ENDPOINT')) {
      setGetformTestResult({
        status: 'error',
        message: 'Please replace YOUR_UNIQUE_ENDPOINT with your actual Getform.io or Formspree endpoint URL (e.g. https://getform.io/f/xyza123).'
      });
      return;
    }

    try {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData()
      });

      if (res.ok || res.status === 200 || res.status === 400 || res.status === 422) {
        setGetformTestResult({
          status: 'success',
          message: 'Saved & Verified! Getform.io / Formspree endpoint is active and ready to process form submissions.'
        });
      } else {
        setGetformTestResult({
          status: 'error',
          message: `Endpoint responded with status ${res.status}. Please double-check your Getform.io or Formspree form ID.`
        });
      }
    } catch (err: any) {
      setGetformTestResult({
        status: 'error',
        message: `Network error or CORS notice testing endpoint: ${err?.message || String(err)}. URL saved successfully.`
      });
    }
  };

  const runSupabaseDiagnosticTest = async () => {
    setSupabaseDiagnostic({ running: true });
    try {
      const res = await testSupabaseLiveConnection();
      setSupabaseDiagnostic({
        running: false,
        result: res,
        testedAt: new Date().toLocaleTimeString()
      });
    } catch (e: any) {
      setSupabaseDiagnostic({
        running: false,
        result: {
          overallStatus: 'error',
          supabaseUrl: 'https://yvxqyczeavhfwxxjxwgl.supabase.co',
          tableAccess: { success: false, message: e?.message || String(e) },
          columnsStatus: { fullSchema: false, message: 'Diagnostic test failed' },
          storageAccess: { success: false, message: 'Diagnostic test failed' },
          rawErrors: [e?.message || String(e)]
        },
        testedAt: new Date().toLocaleTimeString()
      });
    }
  };

  // Monitor Firebase Auth state change
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('csc_admin_authed', 'true');
        if (user.email) {
          const emailUser = user.email.split('@')[0];
          setStaffDisplayName(emailUser);
          sessionStorage.setItem('csc_staff_name', emailUser);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setAuthLoading(true);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    try {
      if (trimmedUser === 'Mahi' && trimmedPass === 'Wasu@9687') {
        setStaffDisplayName('Mahi');
        sessionStorage.setItem('csc_staff_name', 'Mahi');
        try {
          await signInAnonymously(auth);
        } catch {
          setIsAuthenticated(true);
          sessionStorage.setItem('csc_admin_authed', 'true');
        }
      } else if (trimmedUser.includes('@')) {
        await signInWithEmailAndPassword(auth, trimmedUser, trimmedPass);
        const namePart = trimmedUser.split('@')[0];
        setStaffDisplayName(namePart);
        sessionStorage.setItem('csc_staff_name', namePart);
      } else {
        setLoginError('Invalid Staff Credentials. Use "Mahi" / "Wasu@9687" or a registered staff email.');
      }
    } catch (err: any) {
      console.error('Staff authentication notice:', err);
      if (trimmedUser === 'Mahi' && trimmedPass === 'Wasu@9687') {
        setStaffDisplayName('Mahi');
        sessionStorage.setItem('csc_staff_name', 'Mahi');
        setIsAuthenticated(true);
        sessionStorage.setItem('csc_admin_authed', 'true');
      } else {
        setLoginError(err.message || 'Staff authentication failed. Check credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickFirebaseAuth = async () => {
    setLoginError(null);
    setAuthLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Staff auth notice:', err);
    } finally {
      setStaffDisplayName('Mahi');
      sessionStorage.setItem('csc_staff_name', 'Mahi');
      setIsAuthenticated(true);
      sessionStorage.setItem('csc_admin_authed', 'true');
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setIsAuthenticated(false);
    sessionStorage.removeItem('csc_admin_authed');
    setProfileMenuOpen(false);
  };

  // Robust Date/Timestamp Helpers
  const getTimestampMs = (dateVal: any): number => {
    if (!dateVal) return 0;
    try {
      if (typeof dateVal === 'object' && dateVal !== null) {
        if (typeof dateVal.toDate === 'function') return dateVal.toDate().getTime();
        if (typeof dateVal.seconds === 'number') return dateVal.seconds * 1000;
      }
      if (typeof dateVal === 'number') return dateVal;
      const parsed = new Date(String(dateVal)).getTime();
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  const formatDisplayDate = (dateVal: any): string => {
    if (!dateVal) return 'N/A';
    try {
      const ms = getTimestampMs(dateVal);
      if (!ms) return String(dateVal);
      const d = new Date(ms);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(dateVal);
    }
  };

  const formatShortDate = (dateVal: any): string => {
    if (!dateVal) return 'N/A';
    try {
      const ms = getTimestampMs(dateVal);
      if (!ms) return String(dateVal);
      const d = new Date(ms);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return String(dateVal);
    }
  };

  const formatShortTime = (dateVal: any): string => {
    if (!dateVal) return '';
    try {
      const ms = getTimestampMs(dateVal);
      if (!ms) return '';
      const d = new Date(ms);
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Connect real-time Cloud Firestore listener, Central Server API, and Supabase Realtime
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    let unsubApps: (() => void) | null = null;
    let unsubApts: (() => void) | null = null;

    const updateCombinedApplications = () => {
      const map = new Map<string, any>();

      // Authoritative remote sources: Server API + Firestore + Supabase
      // (Only fall back to localStorage if all remote maps are empty and still offline)
      const remoteEntries = [
        ...Array.from(serverApiMapRef.current.values()),
        ...Array.from(firestoreAppsMapRef.current.values()),
        ...Array.from(firestoreAptsMapRef.current.values()),
        ...Array.from(supabaseMapRef.current.values())
      ];

      let sourceEntries = remoteEntries;
      if (remoteEntries.length === 0) {
        try {
          const localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
          const web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
          sourceEntries = [...web3Apps, ...localApps];
        } catch {}
      }

      sourceEntries.forEach((app) => {
        if (!app || isDeletedApplicationRecord(app)) return;

        const resolvedTokenId =
          app.token_id ||
          app.appId ||
          app.payload?.appId ||
          app.payload?.token ||
          app.token ||
          app.tokenNo ||
          (app.id && String(app.id).length < 25 ? app.id : `CSC-${String(app.id).slice(0, 8)}`);

        const canonicalKey = String(resolvedTokenId || app.id || '').trim();
        if (!canonicalKey) return;

        const existing = map.get(canonicalKey) || {};
        if (isDeletedApplicationRecord(existing)) return;

        let parsedDocUrls: any[] = [];
        if (app.document_urls) {
          try {
            const raw = typeof app.document_urls === 'string' ? JSON.parse(app.document_urls) : app.document_urls;
            if (Array.isArray(raw)) {
              parsedDocUrls = raw.map((u: any, idx: number) => {
                if (typeof u === 'string') {
                  return {
                    id: `supa-doc-${idx}`,
                    name: `Uploaded Document ${idx + 1}`,
                    url: u,
                    dataUrl: u
                  };
                }
                return {
                  id: u.id || `supa-doc-${idx}`,
                  name: u.name || `Uploaded Document ${idx + 1}`,
                  url: u.url || u.dataUrl || '',
                  dataUrl: u.url || u.dataUrl || '',
                  size: u.size || 0,
                  type: u.type || 'application/octet-stream'
                };
              });
            }
          } catch {}
        }

        let mergedDocs = existing.documents || [];
        if (parsedDocUrls.length > 0 && mergedDocs.length === 0) {
          mergedDocs = parsedDocUrls;
        } else if (Array.isArray(app.documents) && app.documents.length > 0) {
          if (app.documents.some((d: any) => d.dataUrl || d.url) || mergedDocs.length === 0) {
            mergedDocs = app.documents;
          }
        } else if (Array.isArray(app.payload?.documents) && app.payload.documents.length > 0) {
          mergedDocs = app.payload.documents;
        }

        const getPriority = (st?: string) => {
          if (!st) return 0;
          const l = st.toLowerCase();
          if (l.includes('completed')) return 3;
          if (l.includes('approved') || l.includes('process') || l.includes('reject')) return 2;
          if (l.includes('pending') || l.includes('registered')) return 1;
          return 1;
        };

        const existingPriority = getPriority(existing.status);
        const newPriority = getPriority(app.status || app.payload?.status);

        let resolvedStatus = existing.status || 'Pending';
        if (newPriority >= existingPriority && (app.status || app.payload?.status)) {
          resolvedStatus = app.status || app.payload?.status;
        }
        if (resolvedStatus.toLowerCase() === 'registered') {
          resolvedStatus = 'Pending';
        }

        const resolvedSupabaseId =
          app.supabaseId ||
          (isUuidString(app.id) ? String(app.id) : undefined) ||
          existing.supabaseId;

        map.set(canonicalKey, {
          ...existing,
          ...app,
          appId: resolvedTokenId,
          id: app.id || existing.id || canonicalKey,
          supabaseId: resolvedSupabaseId,
          name:
            app.full_name ||
            app.name ||
            app.customerName ||
            app.applicantName ||
            app.payload?.customerName ||
            app.payload?.applicantName ||
            existing.name ||
            'N/A',
          phone:
            app.whatsapp_number ||
            app.phone ||
            app.phoneNumber ||
            app.mobile ||
            app.payload?.phoneNumber ||
            existing.phone ||
            'N/A',
          email:
            app.email_address ||
            app.email ||
            app.emailAddress ||
            app.payload?.emailAddress ||
            existing.email ||
            'N/A',
          service:
            app.service_selected ||
            app.service ||
            app.selectedService ||
            app.eService ||
            app.payload?.selectedService ||
            existing.service ||
            'General Service',
          documents: mergedDocs,
          uploadedDocuments:
            (app.uploadedDocuments && app.uploadedDocuments.length > 0)
              ? app.uploadedDocuments
              : (existing.uploadedDocuments || []),
          paymentMode:
            app.payment_mode ||
            app.paymentMode ||
            app.payload?.paymentMode ||
            existing.paymentMode ||
            'cash',
          utrNumber:
            app.utr_number ||
            app.utrNumber ||
            app.payload?.utrNumber ||
            existing.utrNumber ||
            'N/A',
          totalAmount:
            Number(app.total_amount) ||
            Number(app.totalAmount) ||
            Number(app.payload?.totalAmount) ||
            existing.totalAmount ||
            0,
          userCategory:
            app.user_category ||
            app.userCategory ||
            app.payload?.userCategory ||
            existing.userCategory ||
            'General/OBC',
          dateOfBirth:
            app.dateOfBirth ||
            app.payload?.dateOfBirth ||
            existing.dateOfBirth ||
            'N/A',
          message:
            app.message ||
            app.additionalDetails ||
            app.payload?.message ||
            existing.message ||
            '',
          staffNotes:
            app.staffNotes ||
            app.payload?.staffNotes ||
            existing.staffNotes ||
            '',
          staffNoteUpdatedAt:
            app.staffNoteUpdatedAt ||
            app.payload?.staffNoteUpdatedAt ||
            existing.staffNoteUpdatedAt ||
            null,
          submittedAt:
            app.created_at ||
            app.createdAt ||
            app.submittedAt ||
            app.payload?.submittedAt ||
            existing.submittedAt ||
            'Recent',
          updatedAt:
            app.updatedAt ||
            app.statusUpdatedAt ||
            existing.updatedAt ||
            null,
          finalReceiptUrl:
            app.finalReceiptUrl ||
            app.payload?.finalReceiptUrl ||
            existing.finalReceiptUrl ||
            null,
          status: resolvedStatus
        });
      });

      const combinedList = Array.from(map.values()).filter(item => !isDeletedApplicationRecord(item));
      combinedList.sort((a, b) => {
        const getTs = (item: any) => {
          return getTimestampMs(item.created_at || item.createdAt || item.submittedAt || item.date || 0);
        };
        return getTs(b) - getTs(a);
      });

      setApplications(combinedList);
      setLoading(false);
    };

    updateCombinedAppsRef.current = updateCombinedApplications;

    // Central Server API fetch helper (race-safe: discards stale responses across mutations)
    const fetchServerAppointments = () => {
      const versionAtStart = mutationVersionRef.current;
      fetch('/api/appointments')
        .then(res => res.json())
        .then(resData => {
          if (versionAtStart !== mutationVersionRef.current) {
            return; // Discard stale in-flight response that started before a deletion
          }
          const list = resData?.data || resData || [];
          if (Array.isArray(list)) {
            serverApiMapRef.current.clear();
            list.forEach((item: any) => {
              if (!item || isDeletedApplicationRecord(item)) return;
              const key = item.appId || item.id || item.token;
              if (key) {
                serverApiMapRef.current.set(String(key), item);
              }
            });
            updateCombinedApplications();
          }
        })
        .catch(err => console.warn('Server API fetch warning:', err));
    };

    // Dedicated Supabase Data Fetcher (ORDER BY created_at DESC, race-safe)
    const fetchSupabaseData = async (showToast = false) => {
      const versionAtStart = mutationVersionRef.current;
      setSupabaseSyncStatus(prev => ({ ...(prev || {}), loading: true }));
      try {
        const res = await fetchSupabaseApplications();
        if (versionAtStart !== mutationVersionRef.current) {
          return; // Discard stale in-flight response that started before a deletion
        }
        if (res.error) {
          console.warn('Supabase fetch notice:', res.error);
          setSupabaseSyncStatus({
            loading: false,
            error: res.error,
            lastSyncedAt: new Date().toLocaleTimeString()
          });
          if (showToast) {
            setSupabaseSyncError(`Supabase Sync Notice: ${res.error}`);
            setTimeout(() => setSupabaseSyncError(null), 7000);
          }
        } else {
          setSupabaseSyncError(null);
          supabaseMapRef.current.clear();
          const activeRows = (res.data || []).filter((row: any) => !isDeletedApplicationRecord(row));
          activeRows.forEach((row: any) => {
            const key =
              row.token_id ||
              row.appId ||
              row.payload?.appId ||
              row.payload?.token ||
              (row.id && String(row.id).length < 25 ? row.id : `CSC-${String(row.id).slice(0, 8)}`);
            if (key) {
              supabaseMapRef.current.set(String(key), row);
            }
          });
          updateCombinedApplications();
          setSupabaseSyncStatus({
            loading: false,
            count: activeRows.length,
            lastSyncedAt: new Date().toLocaleTimeString()
          });
          if (showToast) {
            setActionSuccess(`Synchronized ${activeRows.length} application(s) from Supabase.`);
            setTimeout(() => setActionSuccess(null), 3500);
          }
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        setSupabaseSyncStatus({
          loading: false,
          error: msg,
          lastSyncedAt: new Date().toLocaleTimeString()
        });
        if (showToast) {
          setSupabaseSyncError(`Supabase connection error: ${msg}`);
          setTimeout(() => setSupabaseSyncError(null), 7000);
        }
      }
    };

    // Expose refresh helpers
    (window as any).__csc_refresh_supabase = fetchSupabaseData;
    (window as any).__csc_refresh_server = fetchServerAppointments;

    fetchServerAppointments();
    fetchSupabaseData(false);

    // SSE Real-Time Stream Connection
    let sseSource: EventSource | null = null;
    try {
      sseSource = new EventSource('/api/realtime/stream');
      sseSource.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (!msg || !msg.type) return;

          const eventData = msg.payload || msg.data;

          if (msg.type === 'APPOINTMENT_DELETED' && eventData) {
            mutationVersionRef.current++;
            const idsToPurge = [
              eventData.id,
              eventData.appId,
              eventData.supabaseId,
              ...(Array.isArray(eventData.deletedSupabaseIds) ? eventData.deletedSupabaseIds : []),
              ...(Array.isArray(eventData.deletedTokenIds) ? eventData.deletedTokenIds : [])
            ];
            removeRecordsFromAllMapsAndStorage(idsToPurge);
            updateCombinedApplications();
            return;
          }

          if (msg.type === 'APPOINTMENTS_BULK_DELETED' && eventData) {
            mutationVersionRef.current++;
            const idsToPurge = [
              ...(Array.isArray(eventData.deletedIds) ? eventData.deletedIds : []),
              ...(Array.isArray(eventData.deletedSupabaseIds) ? eventData.deletedSupabaseIds : []),
              ...(Array.isArray(eventData.deletedTokenIds) ? eventData.deletedTokenIds : [])
            ];
            removeRecordsFromAllMapsAndStorage(idsToPurge);
            updateCombinedApplications();
            return;
          }

          if ((msg.type === 'NEW_APPOINTMENT' || msg.type === 'APPOINTMENT_ADDED') && eventData) {
            if (!isDeletedApplicationRecord(eventData)) {
              const incomingId = eventData.appId || eventData.token_id || eventData.id || 'New';
              setRealtimeAlerts(prev => [
                {
                  id: `${incomingId}-${Date.now()}`,
                  appId: incomingId,
                  name: eventData.name || eventData.full_name || 'Customer',
                  service: eventData.service || eventData.service_selected || 'CSC Application',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                },
                ...prev.slice(0, 9)
              ]);
              setActionSuccess(`New customer application received: ${incomingId}`);
              setTimeout(() => setActionSuccess(null), 4500);
            }
          }

          fetchServerAppointments();
          fetchSupabaseData(false);
        } catch {}
      };
    } catch (e) {
      console.warn('SSE stream init notice:', e);
    }

    const pollInterval = setInterval(() => {
      fetchServerAppointments();
    }, 6000);

    let supabaseChannel: any = null;
    const supabaseClient = getSupabaseClient();

    if (supabaseClient) {
      try {
        supabaseChannel = supabaseClient
          .channel('realtime-staff-portal-apps')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'applications' },
            (payload) => {
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const newApp = payload.new as any;
                const synthKey = newApp?.id ? `CSC-${String(newApp.id).slice(0, 8)}` : '';
                const key =
                  newApp?.token_id ||
                  newApp?.appId ||
                  newApp?.payload?.appId ||
                  newApp?.payload?.token ||
                  synthKey ||
                  newApp?.id;

                if (isDeletedApplicationRecord(newApp)) {
                  mutationVersionRef.current++;
                  removeRecordsFromAllMapsAndStorage([
                    newApp?.id,
                    newApp?.token_id,
                    newApp?.appId,
                    newApp?.payload?.appId,
                    synthKey
                  ]);
                  updateCombinedApplications();
                  return;
                }

                if (key) {
                  const isNewInsert = payload.eventType === 'INSERT' && !supabaseMapRef.current.has(String(key));
                  supabaseMapRef.current.set(String(key), newApp);
                  updateCombinedApplications();
                  if (isNewInsert) {
                    setRealtimeAlerts(prev => [
                      {
                        id: `${key}-${Date.now()}`,
                        appId: String(key),
                        name: newApp.full_name || newApp.name || 'Customer',
                        service: newApp.service_selected || newApp.service || 'Application',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      },
                      ...prev.slice(0, 9)
                    ]);
                    setActionSuccess(`New Supabase application received: ${key}`);
                    setTimeout(() => setActionSuccess(null), 4500);
                  }
                }
              } else if (payload.eventType === 'DELETE') {
                const oldApp = payload.old as any;
                mutationVersionRef.current++;
                const synthKey = oldApp?.id ? `CSC-${String(oldApp.id).slice(0, 8)}` : '';
                removeRecordsFromAllMapsAndStorage([
                  oldApp?.id,
                  oldApp?.token_id,
                  oldApp?.appId,
                  oldApp?.token,
                  synthKey
                ]);
                updateCombinedApplications();
              }
            }
          )
          .subscribe();
      } catch (sbErr) {
        console.warn('Supabase Realtime subscription notice:', sbErr);
      }
    }

    const handleLocalSync = () => {
      fetchServerAppointments();
      updateCombinedApplications();
    };

    window.addEventListener('csc_appointment_created', handleLocalSync);
    window.addEventListener('csc_appointment_updated', handleLocalSync);
    window.addEventListener('storage', handleLocalSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('csc_portal_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_APPOINTMENT' && event.data?.payload) {
          const app = event.data.payload;
          if (!isDeletedApplicationRecord(app)) {
            const key = app.appId || app.id || app.token;
            if (key) {
              serverApiMapRef.current.set(String(key), app);
            }
          }
        }
        updateCombinedApplications();
      };
    } catch {}

    try {
      let appsCache: any[] = [];
      let aptsCache: any[] = [];

      const publishCombinedData = () => {
        firestoreAppsMapRef.current.clear();
        firestoreAptsMapRef.current.clear();

        appsCache.forEach((app) => {
          if (isDeletedApplicationRecord(app)) return;
          const key = app.appId || app.id || app.token;
          if (key) firestoreAppsMapRef.current.set(String(key), app);
        });

        aptsCache.forEach((apt) => {
          if (isDeletedApplicationRecord(apt)) return;
          const key = apt.appId || apt.id || apt.token;
          if (key) {
            if (firestoreAppsMapRef.current.has(String(key))) {
              firestoreAppsMapRef.current.set(String(key), { ...firestoreAppsMapRef.current.get(String(key)), ...apt });
            } else {
              firestoreAptsMapRef.current.set(String(key), apt);
            }
          }
        });

        updateCombinedApplications();
      };

      unsubApps = onSnapshot(
        collection(db, 'applications'),
        (snapshot) => {
          appsCache = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          publishCombinedData();
        },
        (err) => {
          console.error('Firestore "applications" error:', err);
          setLoading(false);
        }
      );

      unsubApts = onSnapshot(
        collection(db, 'appointments'),
        (snapshot) => {
          aptsCache = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          publishCombinedData();
        },
        (err) => {
          console.error('Firestore "appointments" error:', err);
          setLoading(false);
        }
      );

      onSnapshot(
        collection(db, 'vle_inquiries'),
        (snapshot) => {
          const remoteInquiries = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));

          let localInquiries: any[] = [];
          try {
            localInquiries = JSON.parse(localStorage.getItem('csc_vle_inquiries_log') || '[]');
          } catch {}

          const mergedMap = new Map<string, any>();
          remoteInquiries.forEach((item: any) => mergedMap.set(item.id || item.inquiryId, item));
          localInquiries.forEach((item: any) => {
            const key = item.id || item.inquiryId;
            if (key && !mergedMap.has(key)) {
              mergedMap.set(key, item);
            }
          });

          setVleInquiries(Array.from(mergedMap.values()));
        },
        (err) => {
          console.warn('Firestore "vle_inquiries" notice:', err);
          try {
            const localInquiries = JSON.parse(localStorage.getItem('csc_vle_inquiries_log') || '[]');
            setVleInquiries(localInquiries);
          } catch {}
        }
      );
    } catch (fsErr) {
      console.error('Firestore connection exception:', fsErr);
      setLoading(false);
    }

    return () => {
      clearInterval(pollInterval);
      if (sseSource) sseSource.close();
      if (unsubApps) unsubApps();
      if (unsubApts) unsubApts();
      if (supabaseChannel && supabaseClient) {
        supabaseClient.removeChannel(supabaseChannel);
      }
      window.removeEventListener('csc_appointment_created', handleLocalSync);
      window.removeEventListener('csc_appointment_updated', handleLocalSync);
      window.removeEventListener('storage', handleLocalSync);
      if (bc) bc.close();
    };
  }, [isAuthenticated]);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setLoading(true);
    window.dispatchEvent(new Event('csc_appointment_updated'));
    if ((window as any).__csc_refresh_server) {
      (window as any).__csc_refresh_server();
    }
    if ((window as any).__csc_refresh_supabase) {
      await (window as any).__csc_refresh_supabase(true);
    }
    setTimeout(() => setLoading(false), 300);
  };

  // Status Update Handler
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const targetApp = applications.find(a => a.appId === appId || a.id === appId || a.supabaseId === appId);
    const supabaseUuid = targetApp?.supabaseId || (isUuidString(targetApp?.id) ? String(targetApp.id) : '');
    const isoNow = new Date().toISOString();
    const updatePayload = {
      status: newStatus,
      updatedAt: isoNow,
      statusUpdatedAt: isoNow
    };

    try {
      await setDoc(doc(db, 'applications', appId), updatePayload, { merge: true });
    } catch {
      try {
        await updateDoc(doc(db, 'applications', appId), updatePayload);
      } catch (err) {
        console.warn('Firestore "applications" status update error:', err);
      }
    }

    try {
      await setDoc(doc(db, 'appointments', appId), updatePayload, { merge: true });
    } catch {
      try {
        await updateDoc(doc(db, 'appointments', appId), updatePayload);
      } catch (err) {
        console.warn('Firestore "appointments" status update error:', err);
      }
    }

    try {
      const local = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      const updatedLocal = local.map((a: any) => (a.appId === appId || a.id === appId) ? { ...a, ...updatePayload } : a);
      localStorage.setItem('csc_local_applications', JSON.stringify(updatedLocal));

      const web3 = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
      const updatedWeb3 = web3.map((a: any) => (a.appId === appId || a.id === appId) ? { ...a, ...updatePayload } : a);
      localStorage.setItem('csc_web3forms_submissions', JSON.stringify(updatedWeb3));
    } catch (e) {
      console.error('Local storage cache update error:', e);
    }

    if (serverApiMapRef.current.has(appId)) {
      serverApiMapRef.current.set(appId, { ...serverApiMapRef.current.get(appId), ...updatePayload });
    }
    if (supabaseMapRef.current.has(appId)) {
      supabaseMapRef.current.set(appId, { ...supabaseMapRef.current.get(appId), status: newStatus });
    }

    setApplications(prev =>
      prev.map(a =>
        (a.appId === appId || a.id === appId)
          ? { ...a, status: newStatus, updatedAt: isoNow, statusUpdatedAt: isoNow }
          : a
      )
    );

    fetch(`/api/appointments/${encodeURIComponent(appId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(err => console.warn('Server status update warning:', err));

    try {
      await updateSupabaseApplicationStatus(appId, newStatus, supabaseUuid);
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }

    setActionSuccess(`Application ${appId} updated to "${newStatus}"`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Permanent Single Delete Handler (Verified Database Persistence)
  const handleDelete = async (appId: string) => {
    if (!appId) return;
    if (!window.confirm(`Are you sure you want to PERMANENTLY remove application ${appId}? This action cannot be undone.`)) {
      return;
    }

    const targetApp = applications.find(
      a => a.appId === appId || a.id === appId || a.supabaseId === appId
    );
    const supabaseUuid =
      targetApp?.supabaseId ||
      (isUuidString(targetApp?.id) ? String(targetApp.id) : '') ||
      (isUuidString(appId) ? appId : '');

    // Increment mutation version so any in-flight poll started prior to this delete is discarded
    mutationVersionRef.current++;

    let deleteVerified = false;
    let deleteErrorMsg = '';
    let extraDeletedIds: string[] = [];

    // 1. Delete via authoritative server endpoint (deletes from Supabase + local db.json and verifies affectedCount)
    try {
      const qs = supabaseUuid ? `?supabaseId=${encodeURIComponent(supabaseUuid)}` : '';
      const res = await fetch(`/api/appointments/${encodeURIComponent(appId)}${qs}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const resData = await res.json().catch(() => ({}));

      if (res.ok && resData.success && Number(resData.affectedCount) > 0) {
        deleteVerified = true;
        extraDeletedIds = [
          ...(Array.isArray(resData.deletedSupabaseIds) ? resData.deletedSupabaseIds : []),
          ...(Array.isArray(resData.deletedTokenIds) ? resData.deletedTokenIds : [])
        ];
      } else {
        deleteErrorMsg = resData.error || `Server deletion returned HTTP ${res.status}`;
      }
    } catch (netErr: any) {
      deleteErrorMsg = netErr?.message || 'Server connection error';
    }

    // 2. Direct Supabase fallback if server route was unreachable or record only existed in client Supabase view
    if (!deleteVerified) {
      const directRes = await deleteSupabaseApplication(appId, supabaseUuid);
      if (directRes.success && directRes.affectedCount > 0) {
        deleteVerified = true;
        extraDeletedIds = [
          ...directRes.deletedSupabaseIds,
          ...directRes.deletedTokenIds
        ];
      } else if (directRes.error) {
        deleteErrorMsg = directRes.error;
      }
    }

    if (!deleteVerified) {
      setSupabaseSyncError(
        `Could not delete application ${appId}: ${deleteErrorMsg || 'No matching record was affected in the database.'}`
      );
      setTimeout(() => setSupabaseSyncError(null), 7000);
      return;
    }

    // 3. Confirmed database deletion: purge from all in-memory maps, localStorage, and Firestore
    mutationVersionRef.current++;
    const allIdentifiersToPurge = [
      appId,
      targetApp?.id,
      targetApp?.appId,
      supabaseUuid,
      ...extraDeletedIds
    ];
    removeRecordsFromAllMapsAndStorage(allIdentifiersToPurge);

    try {
      await deleteDoc(doc(db, 'applications', appId));
    } catch {}
    try {
      await deleteDoc(doc(db, 'appointments', appId));
    } catch {}

    setApplications(prev =>
      prev.filter(
        a =>
          a.appId !== appId &&
          a.id !== appId &&
          (!supabaseUuid || a.supabaseId !== supabaseUuid)
      )
    );
    setSelectedAppIds(prev => prev.filter(id => id !== appId && id !== targetApp?.id));
    if (drawerAppId === appId || drawerAppId === targetApp?.id) {
      setDrawerAppId(null);
      setDrawerNoteDirty(false);
    }

    setActionSuccess(`Application ${appId} permanently removed.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Selection Toggle Logic
  const toggleSelectApp = (appId: string) => {
    setSelectedAppIds(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = (list: any[]) => {
    const allIds = list.map(a => a.appId || a.id).filter(Boolean);
    if (selectedAppIds.length >= allIds.length && allIds.length > 0) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(allIds);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedAppIds.length === 0) return;
    for (const id of selectedAppIds) {
      await handleUpdateStatus(id, newStatus);
    }
    setActionSuccess(`Updated ${selectedAppIds.length} application(s) to "${newStatus}".`);
    setSelectedAppIds([]);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Permanent Bulk Delete Handler (Verified Database Persistence)
  const handleBulkDelete = async () => {
    if (selectedAppIds.length === 0) return;
    if (!window.confirm(`Permanently remove ${selectedAppIds.length} selected application(s)? This action cannot be undone.`)) {
      return;
    }

    const itemsPayload = selectedAppIds.map(selId => {
      const found = applications.find(a => a.appId === selId || a.id === selId || a.supabaseId === selId);
      const supabaseId =
        found?.supabaseId ||
        (isUuidString(found?.id) ? String(found.id) : '') ||
        (isUuidString(selId) ? selId : '');
      return {
        id: selId,
        appId: found?.appId || selId,
        supabaseId
      };
    });

    mutationVersionRef.current++;

    let confirmedIds: string[] = [];
    let extraDeletedIds: string[] = [];
    let failedCount = 0;
    let bulkErrorMsg = '';

    try {
      const res = await fetch('/api/appointments/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload })
      });
      const resData = await res.json().catch(() => ({}));

      if (Number(resData.affectedCount) > 0 && Array.isArray(resData.deletedIds)) {
        confirmedIds = resData.deletedIds;
        extraDeletedIds = [
          ...(Array.isArray(resData.deletedSupabaseIds) ? resData.deletedSupabaseIds : []),
          ...(Array.isArray(resData.deletedTokenIds) ? resData.deletedTokenIds : [])
        ];
        failedCount = Array.isArray(resData.failedItems) ? resData.failedItems.length : 0;
        if (failedCount > 0 && resData.failedItems[0]?.error) {
          bulkErrorMsg = resData.failedItems[0].error;
        }
      } else {
        bulkErrorMsg = resData.error || `Server bulk deletion returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      bulkErrorMsg = err?.message || 'Network error during bulk deletion';
    }

    // Fallback to client-side Supabase deletion if server endpoint failed
    if (confirmedIds.length === 0) {
      for (const item of itemsPayload) {
        const directRes = await deleteSupabaseApplication(item.appId, item.supabaseId);
        if (directRes.success && directRes.affectedCount > 0) {
          confirmedIds.push(item.id);
          extraDeletedIds.push(...directRes.deletedSupabaseIds, ...directRes.deletedTokenIds);
        } else {
          failedCount++;
          if (directRes.error) bulkErrorMsg = directRes.error;
        }
      }
    }

    if (confirmedIds.length === 0) {
      setSupabaseSyncError(
        `Bulk deletion failed: ${bulkErrorMsg || '0 records were affected in the database.'}`
      );
      setTimeout(() => setSupabaseSyncError(null), 7000);
      return;
    }

    mutationVersionRef.current++;
    const allPurgeIds = [...confirmedIds, ...extraDeletedIds];
    removeRecordsFromAllMapsAndStorage(allPurgeIds);

    for (const id of confirmedIds) {
      try {
        await deleteDoc(doc(db, 'applications', id));
        await deleteDoc(doc(db, 'appointments', id));
      } catch {}
    }

    const confirmedSet = new Set(allPurgeIds.map(s => String(s).toLowerCase()));
    setApplications(prev =>
      prev.filter(
        a =>
          !confirmedSet.has(String(a.appId || '').toLowerCase()) &&
          !confirmedSet.has(String(a.id || '').toLowerCase()) &&
          !confirmedSet.has(String(a.supabaseId || '').toLowerCase())
      )
    );
    setSelectedAppIds(prev => prev.filter(id => !confirmedSet.has(String(id).toLowerCase())));
    if (drawerAppId && confirmedSet.has(String(drawerAppId).toLowerCase())) {
      setDrawerAppId(null);
      setDrawerNoteDirty(false);
    }

    if (failedCount > 0) {
      setSupabaseSyncError(`Deleted ${confirmedIds.length} application(s), but ${failedCount} failed: ${bulkErrorMsg}`);
      setTimeout(() => setSupabaseSyncError(null), 7000);
    } else {
      setActionSuccess(`Permanently deleted ${confirmedIds.length} application(s).`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Save Internal Staff Note / Remark
  const handleSaveStaffNote = async (appId: string, noteText: string) => {
    if (!appId) return;
    setSavingDrawerNote(true);
    const isoNow = new Date().toISOString();
    const updatePayload = { staffNotes: noteText, staffNoteUpdatedAt: isoNow };

    try {
      await setDoc(doc(db, 'applications', appId), updatePayload, { merge: true });
    } catch (e) {
      console.warn('Firestore staffNote notice:', e);
    }

    try {
      const local = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      const updatedLocal = local.map((a: any) => (a.appId === appId || a.id === appId) ? { ...a, ...updatePayload } : a);
      localStorage.setItem('csc_local_applications', JSON.stringify(updatedLocal));
    } catch {}

    setApplications(prev =>
      prev.map(a => (a.appId === appId || a.id === appId) ? { ...a, ...updatePayload } : a)
    );

    setDrawerNoteDirty(false);
    setSavingDrawerNote(false);
    setActionSuccess(`Staff remark saved for ${appId}`);
    setTimeout(() => setActionSuccess(null), 2500);
  };

  // Send Direct WhatsApp Update to Applicant
  const handleSendWhatsAppNotification = (app: any) => {
    const rawPhone = app.phone || app.phoneNumber || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const name = app.name || app.customerName || 'Valued Customer';
    const appId = app.appId || app.id || 'N/A';
    const service = app.service || app.selectedService || 'CSC Service';
    const status = app.status || 'Pending';

    const text = encodeURIComponent(
      `Hello ${name},\n\nUpdate regarding your CSC Application:\n*Token ID:* ${appId}\n*Service:* ${service}\n*Status:* ${status}\n\nThank you,\nCSC Digital Services Desk`
    );

    window.open(`https://wa.me/${phoneWithCode}?text=${text}`, '_blank');
  };

  // Copy 1-Click Application Summary or Reference ID
  const handleCopyAppInfo = (app: any) => {
    const appId = app.appId || app.id;
    const summary = `CSC Token: ${appId}\nName: ${app.name || app.customerName}\nPhone: ${app.phone || app.phoneNumber}\nService: ${app.service || app.selectedService}\nFee: ₹${app.totalAmount || 0}\nStatus: ${app.status || 'Pending'}`;
    navigator.clipboard.writeText(summary);
    setCopiedAppId(appId);
    setActionSuccess(`Copied summary for ${appId}`);
    setTimeout(() => {
      setCopiedAppId(null);
      setActionSuccess(null);
    }, 2000);
  };

  const handleCopyTokenId = (tokenId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(tokenId);
    setCopiedAppId(tokenId);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  // Export Applications to CSV (supports full or filtered list)
  const handleExportCSV = (customList?: any[]) => {
    const targetList = customList || filteredApplications;
    if (targetList.length === 0) return;
    const headers = ['Token ID', 'Applicant Name', 'Mobile', 'Email', 'Requested Service', 'Category', 'Payment Mode', 'UTR Reference', 'Amount (INR)', 'Submitted Date', 'Application Status', 'Staff Remarks'];
    const rows = targetList.map(a => [
      a.appId || a.id || '',
      `"${(a.name || a.customerName || '').replace(/"/g, '""')}"`,
      a.phone || a.phoneNumber || '',
      a.email || a.emailAddress || '',
      `"${(a.service || a.selectedService || '').replace(/"/g, '""')}"`,
      `"${(a.userCategory || '').replace(/"/g, '""')}"`,
      a.paymentMode || 'cash',
      a.utrNumber || 'N/A',
      a.totalAmount || 0,
      `"${formatDisplayDate(a.createdAt || a.submittedAt || a.date)}"`,
      `"${a.status || 'Pending'}"`,
      `"${(a.staffNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CSC_Applications_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionSuccess(`Exported ${targetList.length} application record(s) to CSV.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Export VLE Visitor Inquiries to CSV
  const handleExportVLEInquiriesCSV = () => {
    if (vleInquiries.length === 0) return;
    const headers = ['Inquiry ID', 'Visitor Name', 'Mobile Number', 'Email Address', 'State / UT', 'Address / District', 'Timestamp', 'Status'];
    const rows = vleInquiries.map(inq => [
      inq.id || inq.inquiryId || '',
      `"${inq.name || ''}"`,
      inq.phone || '',
      inq.email || '',
      `"${inq.state || ''}"`,
      `"${inq.address || ''}"`,
      `"${formatDisplayDate(inq.timestamp || inq.createdAt)}"`,
      `"${inq.status || 'Verified'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VLE_Visitor_Access_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteVleInquiry = async (inquiryId: string) => {
    if (!inquiryId) return;
    if (window.confirm(`Permanently remove visitor log for ID ${inquiryId}?`)) {
      try {
        await deleteDoc(doc(db, 'vle_inquiries', inquiryId));
      } catch (err) {
        console.warn('Firestore delete inquiry notice:', err);
      }

      try {
        const local = JSON.parse(localStorage.getItem('csc_vle_inquiries_log') || '[]');
        const updated = local.filter((item: any) => item.id !== inquiryId && item.inquiryId !== inquiryId);
        localStorage.setItem('csc_vle_inquiries_log', JSON.stringify(updated));
      } catch {}

      setVleInquiries(prev => prev.filter(item => item.id !== inquiryId && item.inquiryId !== inquiryId));
      setActionSuccess(`Visitor inquiry record ${inquiryId} removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleClearAllVleInquiries = async () => {
    if (vleInquiries.length === 0) return;
    if (window.confirm(`Are you sure you want to PURGE ALL ${vleInquiries.length} visitor access logs? This cannot be undone.`)) {
      for (const inq of vleInquiries) {
        const id = inq.id || inq.inquiryId;
        if (id) {
          try {
            await deleteDoc(doc(db, 'vle_inquiries', id));
          } catch {}
        }
      }
      try {
        localStorage.removeItem('csc_vle_inquiries_log');
      } catch {}

      setVleInquiries([]);
      setSelectedVleIds([]);
      setActionSuccess('All VLE Visitor Access logs cleared.');
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleBulkDeleteVle = async () => {
    if (selectedVleIds.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedVleIds.length} selected visitor log(s)?`)) {
      for (const id of selectedVleIds) {
        try {
          await deleteDoc(doc(db, 'vle_inquiries', id));
        } catch {}
      }
      try {
        const local = JSON.parse(localStorage.getItem('csc_vle_inquiries_log') || '[]');
        const updated = local.filter((item: any) => !selectedVleIds.includes(item.id) && !selectedVleIds.includes(item.inquiryId));
        localStorage.setItem('csc_vle_inquiries_log', JSON.stringify(updated));
      } catch {}

      setVleInquiries(prev => prev.filter(item => !selectedVleIds.includes(item.id) && !selectedVleIds.includes(item.inquiryId)));
      setActionSuccess(`Removed ${selectedVleIds.length} visitor log(s).`);
      setSelectedVleIds([]);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Classification Helpers
  const isOnlinePayment = (app: any): boolean => {
    const mode = (app.paymentMode || app.payment_mode || '').toLowerCase();
    const st = (app.status || '').toLowerCase();
    const utr = (app.utrNumber || app.utr_number || '').trim();
    return mode === 'online' || mode === 'upi' || st.includes('online') || st.includes('upi') || (utr !== '' && utr !== 'N/A' && utr !== 'none');
  };

  const getAppCategoryStatus = (app: any): 'pending' | 'approved' | 'completed' | 'rejected' => {
    const st = (app.status || 'Pending').toLowerCase();
    if (st.includes('completed') || st.includes('done')) return 'completed';
    if (st.includes('reject') || st.includes('cancel')) return 'rejected';
    if (st.includes('approved') || st.includes('process') || st.includes('under') || st.includes('verif')) return 'approved';
    return 'pending';
  };

  const getPaymentStatusInfo = (app: any): { label: string; colorClass: string; isVerifiedRevenue: boolean } => {
    const online = isOnlinePayment(app);
    const catStatus = getAppCategoryStatus(app);
    const utr = (app.utrNumber || app.utr_number || '').trim();
    const hasUtr = utr !== '' && utr !== 'N/A' && utr !== 'none';

    if (catStatus === 'rejected') {
      return {
        label: 'Cancelled',
        colorClass: 'bg-red-50 text-[#DC2626] border-red-200',
        isVerifiedRevenue: false
      };
    }
    if (online) {
      if (hasUtr || catStatus === 'completed' || catStatus === 'approved') {
        return {
          label: 'UPI Paid',
          colorClass: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
          isVerifiedRevenue: true
        };
      }
      return {
        label: 'Pending Verification',
        colorClass: 'bg-amber-50 text-[#F59E0B] border-amber-200',
        isVerifiedRevenue: false
      };
    }
    // Cash Counter
    if (catStatus === 'completed') {
      return {
        label: 'Cash Collected',
        colorClass: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
        isVerifiedRevenue: true
      };
    }
    return {
      label: 'Pay at Counter',
      colorClass: 'bg-slate-100 text-[#64748B] border-slate-200',
      isVerifiedRevenue: false
    };
  };

  // Real KPI Metrics Computed from Applications
  const kpiStats = useMemo(() => {
    let pending = 0;
    let underProcess = 0;
    let completed = 0;
    let rejected = 0;
    let upiCount = 0;
    let cashCount = 0;
    let verifiedRevenue = 0;
    let totalPipelineAmount = 0;
    let totalDocs = 0;

    applications.forEach((app) => {
      const cat = getAppCategoryStatus(app);
      if (cat === 'pending') pending++;
      else if (cat === 'approved') underProcess++;
      else if (cat === 'completed') completed++;
      else if (cat === 'rejected') rejected++;

      const online = isOnlinePayment(app);
      if (online) upiCount++;
      else cashCount++;

      const amt = Number(app.totalAmount) || Number(app.total_amount) || Number(app.payload?.totalAmount) || 0;
      totalPipelineAmount += amt;

      const payInfo = getPaymentStatusInfo(app);
      if (payInfo.isVerifiedRevenue) {
        verifiedRevenue += amt;
      }

      const docLen = Array.isArray(app.documents) ? app.documents.length : 0;
      const upDocLen = Array.isArray(app.uploadedDocuments) ? app.uploadedDocuments.length : 0;
      const urlDocLen = Array.isArray(app.document_urls) ? app.document_urls.length : 0;
      totalDocs += Math.max(docLen, upDocLen, urlDocLen, app.mandatoryDocName ? 1 : 0);
    });

    return {
      total: applications.length,
      pending,
      underProcess,
      completed,
      rejected,
      upiCount,
      cashCount,
      verifiedRevenue,
      totalPipelineAmount,
      totalDocs
    };
  }, [applications]);

  // All Uploaded Documents flattened for the Dedicated Document Management view
  const allDocumentsCatalog = useMemo(() => {
    const list: Array<{
      uid: string;
      appId: string;
      applicantName: string;
      phone: string;
      service: string;
      status: string;
      submittedAt: any;
      docName: string;
      docUrl: string;
      docSize: number;
      docType: string;
      isFinalReceipt?: boolean;
      appRef: any;
    }> = [];

    applications.forEach((app) => {
      const appId = app.appId || app.id || 'N/A';
      const rawDocs = Array.isArray(app.documents) ? app.documents : [];
      rawDocs.forEach((d: any, idx: number) => {
        const url = d.dataUrl || d.url || '';
        if (url || d.name) {
          list.push({
            uid: `${appId}-doc-${idx}`,
            appId,
            applicantName: app.name || app.customerName || 'Applicant',
            phone: app.phone || app.phoneNumber || 'N/A',
            service: app.service || app.selectedService || 'Service',
            status: app.status || 'Pending',
            submittedAt: app.createdAt || app.submittedAt || app.date,
            docName: d.name || `Document ${idx + 1}`,
            docUrl: url,
            docSize: typeof d.size === 'number' ? d.size : 0,
            docType: d.type || (url.startsWith('data:image/') || /\.(jpg|jpeg|png|webp)$/i.test(d.name || '') ? 'image/jpeg' : url.startsWith('data:application/pdf') || /\.pdf$/i.test(d.name || '') ? 'application/pdf' : 'application/octet-stream'),
            isFinalReceipt: false,
            appRef: app
          });
        }
      });

      if (app.finalReceiptUrl) {
        list.push({
          uid: `${appId}-receipt`,
          appId,
          applicantName: app.name || app.customerName || 'Applicant',
          phone: app.phone || app.phoneNumber || 'N/A',
          service: app.service || app.selectedService || 'Service',
          status: app.status || 'Completed',
          submittedAt: app.updatedAt || app.submittedAt,
          docName: `Processed Receipt (${appId})`,
          docUrl: app.finalReceiptUrl,
          docSize: 0,
          docType: 'application/pdf',
          isFinalReceipt: true,
          appRef: app
        });
      }
    });

    return list.filter((docItem) => {
      const q = docSearchQuery.toLowerCase().trim();
      const matchesQ =
        !q ||
        docItem.docName.toLowerCase().includes(q) ||
        docItem.appId.toLowerCase().includes(q) ||
        docItem.applicantName.toLowerCase().includes(q) ||
        docItem.service.toLowerCase().includes(q);

      if (!matchesQ) return false;
      if (docTypeFilter === 'receipt') return Boolean(docItem.isFinalReceipt);
      if (docTypeFilter === 'image') return docItem.docType.startsWith('image/');
      if (docTypeFilter === 'pdf') return docItem.docType === 'application/pdf' || docItem.docName.toLowerCase().endsWith('.pdf');
      return true;
    });
  }, [applications, docSearchQuery, docTypeFilter]);

  // Filtered & Sorted Applications for the Data Table
  const filteredApplications = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    const qDigits = q.replace(/\D/g, '');
    const nowMs = Date.now();

    const filtered = applications.filter((app) => {
      const name = (app.name || app.customerName || app.applicantName || '').toLowerCase();
      const phone = (app.phone || app.phoneNumber || app.mobile || '').toLowerCase();
      const email = (app.email || app.emailAddress || '').toLowerCase();
      const appId = (app.appId || app.id || '').toLowerCase();
      const service = (app.service || app.selectedService || app.eService || '').toLowerCase();
      const utr = (app.utrNumber || '').toLowerCase();

      const appIdDigits = appId.replace(/\D/g, '');
      const phoneDigits = phone.replace(/\D/g, '');

      const matchesQuery =
        !q ||
        name.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        appId.includes(q) ||
        service.includes(q) ||
        utr.includes(q) ||
        (qDigits.length >= 2 && (appIdDigits.includes(qDigits) || phoneDigits.includes(qDigits)));

      if (!matchesQuery) return false;

      // Status filter
      const catStatus = getAppCategoryStatus(app);
      if (filterStatus === 'pending' && catStatus !== 'pending') return false;
      if (filterStatus === 'approved' && catStatus !== 'approved') return false;
      if (filterStatus === 'completed' && catStatus !== 'completed') return false;
      if (filterStatus === 'rejected' && catStatus !== 'rejected') return false;
      if (filterStatus === 'online' && !isOnlinePayment(app)) return false;
      if (filterStatus === 'cash' && isOnlinePayment(app)) return false;

      // Payment dropdown filter
      if (paymentFilter === 'online' && !isOnlinePayment(app)) return false;
      if (paymentFilter === 'cash' && isOnlinePayment(app)) return false;

      // Date range filter
      if (dateRangeFilter !== 'all') {
        const ts = getTimestampMs(app.created_at || app.createdAt || app.submittedAt || app.date);
        if (ts > 0) {
          const diffDays = (nowMs - ts) / (1000 * 60 * 60 * 24);
          if (dateRangeFilter === 'today' && diffDays > 1) return false;
          if (dateRangeFilter === '7days' && diffDays > 7) return false;
          if (dateRangeFilter === '30days' && diffDays > 30) return false;
        }
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'oldest') {
        return getTimestampMs(a.created_at || a.createdAt || a.submittedAt) - getTimestampMs(b.created_at || b.createdAt || b.submittedAt);
      }
      if (sortBy === 'amount_high') {
        return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      }
      if (sortBy === 'name_asc') {
        return String(a.name || '').localeCompare(String(b.name || ''));
      }
      return getTimestampMs(b.created_at || b.createdAt || b.submittedAt) - getTimestampMs(a.created_at || a.createdAt || a.submittedAt);
    });

    return filtered;
  }, [applications, debouncedSearch, filterStatus, paymentFilter, dateRangeFilter, sortBy]);

  // Paginated Applications
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedApplications = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, safeCurrentPage, pageSize]);

  // Filter VLE Inquiries
  const filteredVleInquiries = useMemo(() => {
    return vleInquiries.filter((inq) => {
      const q = vleSearchQuery.toLowerCase().trim();
      const name = (inq.name || '').toLowerCase();
      const phone = (inq.phone || '').toLowerCase();
      const email = (inq.email || '').toLowerCase();
      const state = (inq.state || '').toLowerCase();
      const address = (inq.address || '').toLowerCase();
      const id = (inq.id || inq.inquiryId || '').toLowerCase();

      const matchesQuery =
        !q ||
        name.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        state.includes(q) ||
        address.includes(q) ||
        id.includes(q);

      if (vleFilterState === 'all') return matchesQuery;
      if (vleFilterState === 'jk') return matchesQuery && (state.includes('jammu') || state.includes('kashmir') || state.includes('ladakh'));
      if (vleFilterState === 'other') return matchesQuery && !state.includes('jammu') && !state.includes('kashmir') && !state.includes('ladakh');
      return matchesQuery;
    });
  }, [vleInquiries, vleSearchQuery, vleFilterState]);

  const hasActiveFilters = searchQuery.trim() !== '' || filterStatus !== 'all' || paymentFilter !== 'all' || dateRangeFilter !== 'all' || sortBy !== 'newest';

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setFilterStatus('all');
    setPaymentFilter('all');
    setDateRangeFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    if (['pending_apps', 'process_apps', 'completed_apps', 'rejected_apps'].includes(activeNav)) {
      setActiveNav('all_apps');
    }
  };

  // Status Badge Helper
  const renderApplicationStatusBadge = (statusRaw?: string) => {
    const st = (statusRaw || 'Pending').toLowerCase();
    if (st.includes('completed') || st.includes('done')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Completed
        </span>
      );
    }
    if (st.includes('reject') || st.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-[#DC2626] border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Rejected
        </span>
      );
    }
    if (st.includes('approved') || st.includes('process') || st.includes('under') || st.includes('verif')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          Under Process
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        Pending
      </span>
    );
  };

  // Current Section Metadata for Top Header
  const sectionHeaderInfo: Record<NavSectionId, { title: string; subtitle: string; breadcrumb: string }> = {
    overview: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time operational metrics, customer applications, and payment performance.',
      breadcrumb: 'Overview'
    },
    all_apps: {
      title: 'Customer Applications',
      subtitle: 'Complete directory of all submitted citizen service and recruitment applications.',
      breadcrumb: 'Applications / All'
    },
    pending_apps: {
      title: 'Pending Applications',
      subtitle: 'Newly submitted customer applications awaiting initial staff review.',
      breadcrumb: 'Applications / Pending'
    },
    process_apps: {
      title: 'Under Process',
      subtitle: 'Approved applications currently being filed or processed at the CSC desk.',
      breadcrumb: 'Applications / Under Process'
    },
    completed_apps: {
      title: 'Completed Applications',
      subtitle: 'Successfully processed applications and issued citizen acknowledgments.',
      breadcrumb: 'Applications / Completed'
    },
    rejected_apps: {
      title: 'Rejected Applications',
      subtitle: 'Applications closed or rejected due to incomplete details or invalid documents.',
      breadcrumb: 'Applications / Rejected'
    },
    documents: {
      title: 'Uploaded Documents',
      subtitle: 'Secure repository of customer identity proofs, certificates, and processed receipts.',
      breadcrumb: 'Storage / Documents'
    },
    payments: {
      title: 'Payment Records',
      subtitle: 'Verified UPI transactions, UTR references, and CSC cash counter collections.',
      breadcrumb: 'Finance / Payments'
    },
    vle_logs: {
      title: 'VLE Visitor Access Logs',
      subtitle: 'Identity verification records for visitors unlocking CSC VLE station credentials.',
      breadcrumb: 'Operations / Visitor Logs'
    },
    whatsapp_sync: {
      title: 'WhatsApp Channel & Group Sync',
      subtitle: 'Broadcast official recruitment alerts and scheme updates to WhatsApp subscribers.',
      breadcrumb: 'Operations / WhatsApp Sync'
    },
    reports: {
      title: 'Reports & Export',
      subtitle: 'Generate filtered CSV reports and inspect live Supabase database & storage health.',
      breadcrumb: 'Operations / Reports & Export'
    }
  };

  // ============================================================================
  // LOGIN VIEW (WHEN UNAUTHENTICATED)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white md:bg-[#F6F8FC] flex flex-col justify-center items-center px-0 py-0 md:px-4 md:py-12">
        <div className="w-full max-w-md bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-lg px-4 py-8 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#101B35] text-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              CSC DOST Staff Console
            </h1>
            <p className="text-xs text-[#64748B]">
              Sign in with authorized operator credentials to manage applications and documents.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#DC2626] text-xs font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="staff-username-input" className="block text-xs font-semibold text-[#111827] mb-1.5">
                Operator Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  ref={usernameInputRef}
                  id="staff-username-input"
                  type="text"
                  required
                  autoFocus
                  placeholder="Enter staff username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="staff-password-input" className="block text-xs font-semibold text-[#111827] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  id="staff-password-input"
                  type="password"
                  required
                  placeholder="Enter staff password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{authLoading ? 'Authenticating...' : 'Sign In to Staff Console'}</span>
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2.5 text-[#64748B] font-medium">Or Operator Session</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickFirebaseAuth}
            disabled={authLoading}
            className="w-full py-2.5 px-4 bg-[#F6F8FC] hover:bg-slate-100 text-[#111827] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E2E8F0]"
          >
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>One-Click Authorized Staff Access</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs text-[#64748B] hover:text-[#111827] font-medium transition-colors flex items-center justify-center gap-1.5 pt-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Resolved Authenticated Staff Name
  const authenticatedStaffLabel = firebaseUser?.email
    ? firebaseUser.email
    : `${staffDisplayName} (Staff Admin)`;

  // Sidebar Navigation Groups
  const mainNavItems: Array<{ id: NavSectionId; label: string; icon: any; count?: number; badgeColor?: string }> = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'all_apps', label: 'Customer Applications', icon: FileText, count: kpiStats.total },
    { id: 'pending_apps', label: 'Pending Applications', icon: Clock, count: kpiStats.pending, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'process_apps', label: 'Under Process', icon: RefreshCw, count: kpiStats.underProcess, badgeColor: 'bg-blue-500/20 text-blue-300' },
    { id: 'completed_apps', label: 'Completed Applications', icon: CheckCircle2, count: kpiStats.completed, badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'rejected_apps', label: 'Rejected Applications', icon: XCircle, count: kpiStats.rejected, badgeColor: 'bg-red-500/20 text-red-300' },
    { id: 'documents', label: 'Uploaded Documents', icon: FolderOpen, count: allDocumentsCatalog.length },
    { id: 'payments', label: 'Payment Records', icon: CreditCard, count: kpiStats.upiCount + kpiStats.cashCount }
  ];

  const operationsNavItems: Array<{ id: NavSectionId; label: string; icon: any; count?: number }> = [
    { id: 'vle_logs', label: 'VLE Visitor Access Logs', icon: ShieldAlert, count: vleInquiries.length },
    { id: 'whatsapp_sync', label: 'WhatsApp Channel & Sync', icon: Radio },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet }
  ];

  const isApplicationsView = ['overview', 'all_apps', 'pending_apps', 'process_apps', 'completed_apps', 'rejected_apps'].includes(activeNav);

  // ============================================================================
  // ENTERPRISE DASHBOARD SHELL
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#111827] flex font-sans antialiased selection:bg-[#2563EB] selection:text-white">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ==================================================================== */}
      {/* 1. COLLAPSIBLE LEFT SIDEBAR (#101B35) */}
      {/* ==================================================================== */}
      <aside
        aria-label="Staff Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 bg-[#101B35] text-white flex flex-col border-r border-white/10 transition-all duration-200 select-none ${
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[252px]'
        } ${
          mobileSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Branding Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-white block truncate">
                  CSC DOST
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  Staff Management Console
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links Scroll Container */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-6 scrollbar-thin">
          {/* MAIN NAVIGATION */}
          <div className="space-y-1">
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Main Navigation
              </div>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={sidebarCollapsed && !mobileSidebarOpen ? `${item.label}${item.count !== undefined ? ` (${item.count})` : ''}` : undefined}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  } ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {(!sidebarCollapsed || mobileSidebarOpen) && item.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white font-semibold'
                          : item.badgeColor || 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* OPERATIONS */}
          <div className="space-y-1">
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Operations
              </div>
            )}
            {operationsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={sidebarCollapsed && !mobileSidebarOpen ? item.label : undefined}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  } ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>
                  {(!sidebarCollapsed || mobileSidebarOpen) && item.count !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md shrink-0 ${
                        isActive ? 'bg-white/20 text-white font-semibold' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION: Staff Profile, Settings, Return to Public Website, Logout */}
        <div className="p-2.5 border-t border-white/10 space-y-1.5 shrink-0 bg-[#0c152b]">
          {/* Staff Profile */}
          <div
            title={sidebarCollapsed && !mobileSidebarOpen ? `Signed in as ${authenticatedStaffLabel}` : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/5 border border-white/5 ${
              sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
              {staffDisplayName.charAt(0).toUpperCase()}
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white block truncate">
                  {authenticatedStaffLabel}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Authorized Operator
                </span>
              </div>
            )}
          </div>

          {/* Settings / Supabase Diagnostics */}
          <button
            type="button"
            title={sidebarCollapsed && !mobileSidebarOpen ? 'Backend & Supabase Settings' : undefined}
            onClick={() => {
              setShowGetformModal(true);
              setSnippetTab('supabase');
              runSupabaseDiagnosticTest();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors cursor-pointer ${
              sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
            {(!sidebarCollapsed || mobileSidebarOpen) && <span className="truncate">Backend &amp; Settings</span>}
          </button>

          {/* Return to Public Website */}
          {onClose && (
            <button
              type="button"
              title={sidebarCollapsed && !mobileSidebarOpen ? 'Return to Public Website' : undefined}
              onClick={onClose}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors cursor-pointer ${
                sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 shrink-0" />
              {(!sidebarCollapsed || mobileSidebarOpen) && <span className="truncate">Return to Public Site</span>}
            </button>
          )}

          {/* Logout & Collapse Row */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              title={sidebarCollapsed && !mobileSidebarOpen ? 'Logout' : undefined}
              onClick={handleLogout}
              className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors cursor-pointer ${
                sidebarCollapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {(!sidebarCollapsed || mobileSidebarOpen) && <span>Logout</span>}
            </button>

            <button
              type="button"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:bg-white/8 hover:text-white transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN CONTENT COLUMN */}
      {/* ==================================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[252px]'
        }`}
      >
        {/* ================================================================== */}
        {/* 2. COMPACT TOP HEADER */}
        {/* ================================================================== */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Breadcrumb & Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-xl text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                <span>CSC Console</span>
                <span>/</span>
                <span className="text-[#111827]">{sectionHeaderInfo[activeNav].breadcrumb}</span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-[#111827] tracking-tight truncate">
                {sectionHeaderInfo[activeNav].title}
              </h1>
            </div>
          </div>

          {/* Right: Search Shortcut, Supabase Status, Refresh, Export CSV, Notifications, Staff Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Compact Header Search Shortcut */}
            <div className="hidden md:flex items-center relative w-56 lg:w-64">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 pointer-events-none" />
              <input
                ref={globalSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!isApplicationsView) setActiveNav('all_apps');
                }}
                placeholder="Quick search (Ctrl+K)..."
                className="w-full pl-8 pr-12 py-1.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-lg text-xs text-[#111827] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#64748B] hover:text-[#111827]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-[#64748B] bg-white border border-[#E2E8F0] rounded">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Real Supabase Connection Status Indicator */}
            <button
              type="button"
              onClick={() => {
                setShowGetformModal(true);
                setSnippetTab('supabase');
                runSupabaseDiagnosticTest();
              }}
              title={
                supabaseSyncStatus?.error
                  ? `Supabase Error: ${supabaseSyncStatus.error}`
                  : supabaseSyncStatus?.lastSyncedAt
                  ? `Supabase Live (${supabaseSyncStatus.count ?? applications.length} records, synced at ${supabaseSyncStatus.lastSyncedAt})`
                  : 'Click to inspect Supabase connection diagnostics'
              }
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                supabaseSyncStatus?.loading
                  ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                  : supabaseSyncStatus?.error
                  ? 'bg-red-50 text-[#DC2626] border-red-200'
                  : 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100/70'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseSyncStatus?.loading
                    ? 'bg-[#2563EB] animate-ping'
                    : supabaseSyncStatus?.error
                    ? 'bg-[#DC2626]'
                    : 'bg-[#16A34A]'
                }`}
              />
              <span>
                {supabaseSyncStatus?.loading
                  ? 'Syncing...'
                  : supabaseSyncStatus?.error
                  ? 'Sync Notice'
                  : 'Supabase Live'}
              </span>
            </button>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-lg bg-white hover:bg-[#F6F8FC] text-[#111827] border border-[#E2E8F0] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Refresh applications from Supabase & Server"
            >
              <RefreshCw className={`w-4 h-4 text-[#64748B] ${loading || supabaseSyncStatus?.loading ? 'animate-spin text-[#2563EB]' : ''}`} />
              <span className="hidden xl:inline">Refresh</span>
            </button>

            {/* Export CSV Action */}
            <button
              type="button"
              onClick={() => handleExportCSV()}
              disabled={applications.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F6F8FC] text-[#111827] border border-[#E2E8F0] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Export current applications view to CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Export CSV</span>
            </button>

            {/* Notification Indicator */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(prev => !prev);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2 rounded-lg bg-white hover:bg-[#F6F8FC] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0] transition-colors cursor-pointer"
                title="Application alerts & pending notifications"
              >
                <Bell className="w-4 h-4" />
                {(realtimeAlerts.length > 0 || kpiStats.pending > 0) && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                    {realtimeAlerts.length > 0 ? realtimeAlerts.length : kpiStats.pending}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F8FC]">
                    <span className="text-xs font-bold text-[#111827]">Activity &amp; Alerts</span>
                    {realtimeAlerts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRealtimeAlerts([])}
                        className="text-[11px] font-medium text-[#2563EB] hover:underline cursor-pointer"
                      >
                        Clear alerts
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0]">
                    {realtimeAlerts.length > 0 ? (
                      realtimeAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            const found = applications.find(a => (a.appId || a.id) === alert.appId);
                            if (found) handleOpenDrawer(found);
                            setNotificationsOpen(false);
                          }}
                          className="p-3 hover:bg-[#F6F8FC] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                            <span className="font-mono font-bold text-[#2563EB]">{alert.appId}</span>
                            <span>{alert.time}</span>
                          </div>
                          <p className="text-xs font-semibold text-[#111827] mt-0.5">{alert.name}</p>
                          <p className="text-[11px] text-[#64748B] truncate">{alert.service}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center space-y-2">
                        <p className="text-xs font-medium text-[#111827]">
                          {kpiStats.pending} Pending Application(s)
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Realtime listener is active. New customer submissions will appear here immediately.
                        </p>
                        {kpiStats.pending > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectNav('pending_apps');
                              setNotificationsOpen(false);
                            }}
                            className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                          >
                            View Pending Applications →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Staff Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(prev => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F6F8FC] border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-md bg-[#111C3D] text-white flex items-center justify-center text-xs font-bold">
                  {staffDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-[#111827] max-w-[120px] truncate">
                  {staffDisplayName}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-4 py-2.5 border-b border-[#E2E8F0] bg-[#F6F8FC]">
                    <p className="text-xs font-bold text-[#111827] truncate">{authenticatedStaffLabel}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{cafeName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setShowGetformModal(true);
                      setSnippetTab('supabase');
                      runSupabaseDiagnosticTest();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Supabase &amp; Form Diagnostics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleExportCSV(applications);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Export All Applications CSV</span>
                  </button>
                  {onClose && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onClose();
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>Return to Public Website</span>
                    </button>
                  )}
                  <div className="border-t border-[#E2E8F0] mt-1 pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-[#DC2626] hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ================================================================== */}
        {/* WORKSPACE BODY */}
        {/* ================================================================== */}
        <div className="flex-1 p-0 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-0 md:space-y-6">
          {/* Status Toast / Sync Error Banners */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border-b md:border border-emerald-200 rounded-none md:rounded-xl text-[#16A34A] text-xs font-semibold flex items-center justify-between gap-2 shadow-none md:shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccess(null)}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {supabaseSyncError && (
            <div className="p-3.5 bg-red-50 border-b md:border border-red-200 rounded-none md:rounded-xl text-[#DC2626] text-xs font-semibold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="truncate">{supabaseSyncError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSupabaseSyncError(null)}
                className="p-1 hover:bg-red-100 rounded-lg shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. DASHBOARD OVERVIEW & 8 KPI CARDS */}
          {/* ================================================================ */}
          {activeNav === 'overview' && (
            <section
              aria-label="Key Performance Indicators"
              className="bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 divide-y divide-[#E2E8F0] md:divide-y-0 grid grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4"
            >
              {[
                {
                  id: 'kpi-total',
                  title: 'Total Applications',
                  value: kpiStats.total,
                  subtitle: 'All synced submissions',
                  icon: FileText,
                  iconBg: 'bg-blue-50 text-[#2563EB]',
                  onClick: () => handleSelectNav('all_apps')
                },
                {
                  id: 'kpi-pending',
                  title: 'Pending Applications',
                  value: kpiStats.pending,
                  subtitle: 'Awaiting staff action',
                  icon: Clock,
                  iconBg: 'bg-amber-50 text-[#F59E0B]',
                  onClick: () => handleSelectNav('pending_apps')
                },
                {
                  id: 'kpi-process',
                  title: 'Under Process',
                  value: kpiStats.underProcess,
                  subtitle: 'Approved & active filing',
                  icon: RefreshCw,
                  iconBg: 'bg-blue-50 text-[#2563EB]',
                  onClick: () => handleSelectNav('process_apps')
                },
                {
                  id: 'kpi-completed',
                  title: 'Completed Applications',
                  value: kpiStats.completed,
                  subtitle: 'Processed & delivered',
                  icon: CheckCircle2,
                  iconBg: 'bg-emerald-50 text-[#16A34A]',
                  onClick: () => handleSelectNav('completed_apps')
                },
                {
                  id: 'kpi-revenue',
                  title: 'Total Verified Revenue',
                  value: `₹${kpiStats.verifiedRevenue.toLocaleString('en-IN')}`,
                  subtitle: `Pipeline total: ₹${kpiStats.totalPipelineAmount.toLocaleString('en-IN')}`,
                  icon: IndianRupee,
                  iconBg: 'bg-emerald-50 text-[#16A34A]',
                  onClick: () => handleSelectNav('payments')
                },
                {
                  id: 'kpi-upi',
                  title: 'UPI Paid',
                  value: kpiStats.upiCount,
                  subtitle: 'Online UTR submissions',
                  icon: CreditCard,
                  iconBg: 'bg-purple-50 text-[#8B5CF6]',
                  onClick: () => {
                    setActiveNav('all_apps');
                    setPaymentFilter('online');
                  }
                },
                {
                  id: 'kpi-cash',
                  title: 'Cash Counter Applications',
                  value: kpiStats.cashCount,
                  subtitle: 'Pay at CSC desk',
                  icon: Users,
                  iconBg: 'bg-slate-100 text-[#111C3D]',
                  onClick: () => {
                    setActiveNav('all_apps');
                    setPaymentFilter('cash');
                  }
                },
                {
                  id: 'kpi-docs',
                  title: 'Uploaded Documents',
                  value: kpiStats.totalDocs,
                  subtitle: 'Customer files & receipts',
                  icon: FolderOpen,
                  iconBg: 'bg-blue-50 text-[#2563EB]',
                  onClick: () => handleSelectNav('documents')
                }
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.id}
                    onClick={card.onClick}
                    className="bg-white border-0 odd:border-r odd:border-[#E2E8F0] md:odd:border-r md:border md:border-[#E2E8F0] hover:border-[#2563EB]/50 rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[112px] md:min-h-[124px]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-semibold text-[#64748B]">
                        {card.title}
                      </span>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3">
                      {loading && applications.length === 0 ? (
                        <div className="h-7 w-20 bg-slate-100 rounded animate-pulse" />
                      ) : (
                        <div className="text-2xl font-bold text-[#111827] tracking-tight font-mono">
                          {card.value}
                        </div>
                      )}
                      <p className="text-[11px] text-[#64748B] mt-0.5 truncate">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* ================================================================ */}
          {/* 4. CUSTOMER APPLICATIONS TABLE & TOOLBAR */}
          {/* ================================================================ */}
          {isApplicationsView && (
            <section aria-label="Customer Applications Management" className="space-y-0 md:space-y-4">
              {/* Bulk Selection Bar */}
              {selectedAppIds.length > 0 && (
                <div className="p-3.5 bg-[#111C3D] text-white rounded-none md:rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                    <span>{selectedAppIds.length} application(s) selected</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('Approved & Under Process')}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Under Process</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('Completed')}
                      className="px-3 py-1.5 bg-[#16A34A] hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-[#DC2626] hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppIds([])}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              {/* Search and Filter Toolbar */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 shadow-none md:shadow-2xs space-y-3">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Debounced Search Input */}
                  <div className="relative flex-1 max-w-xl">
                    <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by applicant name, mobile, email, token ID, service, or UTR..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#111827]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Desktop Filter Controls */}
                  <div className="hidden md:flex items-center gap-2 flex-wrap">
                    {/* Status Dropdown */}
                    <select
                      aria-label="Filter by Application Status"
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="all">Status: All ({applications.length})</option>
                      <option value="pending">Pending ({kpiStats.pending})</option>
                      <option value="approved">Under Process ({kpiStats.underProcess})</option>
                      <option value="completed">Completed ({kpiStats.completed})</option>
                      <option value="rejected">Rejected ({kpiStats.rejected})</option>
                    </select>

                    {/* Payment Method Dropdown */}
                    <select
                      aria-label="Filter by Payment Method"
                      value={paymentFilter}
                      onChange={(e) => {
                        setPaymentFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="all">Payment: All Methods</option>
                      <option value="online">UPI Online ({kpiStats.upiCount})</option>
                      <option value="cash">Cash Counter ({kpiStats.cashCount})</option>
                    </select>

                    {/* Date Range Dropdown */}
                    <select
                      aria-label="Filter by Date Range"
                      value={dateRangeFilter}
                      onChange={(e) => {
                        setDateRangeFilter(e.target.value as any);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="all">Date: All Time</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>

                    {/* Sort Control */}
                    <select
                      aria-label="Sort Applications"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="amount_high">Sort: Amount (High–Low)</option>
                      <option value="name_asc">Sort: Applicant (A–Z)</option>
                    </select>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleExportCSV(filteredApplications)}
                      disabled={filteredApplications.length === 0}
                      className="px-3 py-2 bg-[#111C3D] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export ({filteredApplications.length})</span>
                    </button>
                  </div>

                  {/* Mobile Filter Drawer Trigger */}
                  <div className="flex md:hidden items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileFilterDrawerOpen(prev => !prev)}
                      className="flex-1 py-2 px-3 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] flex items-center justify-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Filters &amp; Sort</span>
                    </button>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="py-2 px-3 bg-red-50 text-[#DC2626] rounded-xl text-xs font-semibold"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleExportCSV(filteredApplications)}
                      className="py-2 px-3 bg-[#111C3D] text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Mobile Filter Panel */}
                {mobileFilterDrawerOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-[#E2E8F0] md:hidden">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827]"
                    >
                      <option value="all">Status: All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Under Process</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827]"
                    >
                      <option value="all">Payment: All Methods</option>
                      <option value="online">UPI Online</option>
                      <option value="cash">Cash Counter</option>
                    </select>
                    <select
                      value={dateRangeFilter}
                      onChange={(e) => setDateRangeFilter(e.target.value as any)}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827]"
                    >
                      <option value="all">Date: All Time</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827]"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="amount_high">Sort: Amount (High–Low)</option>
                      <option value="name_asc">Sort: Applicant (A–Z)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* PROFESSIONAL APPLICATIONS DATA TABLE (DESKTOP) & ROWS (MOBILE) */}
              {/* ============================================================== */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-2xs overflow-hidden">
                {loading && applications.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#2563EB]" />
                    <p className="text-xs font-semibold text-[#64748B]">
                      Synchronizing applications from Supabase...
                    </p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#F6F8FC] border border-[#E2E8F0] flex items-center justify-center mx-auto text-[#64748B]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-[#111827]">No matching applications found</h3>
                      <p className="text-xs text-[#64748B]">
                        {hasActiveFilters
                          ? 'Try adjusting your search query or clearing active filters.'
                          : 'New customer applications will automatically appear here in real time.'}
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* DESKTOP DATA TABLE (md and up) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                            <th className="py-3.5 pl-4 pr-2 w-10">
                              <button
                                type="button"
                                onClick={() => toggleSelectAll(paginatedApplications)}
                                className="text-[#64748B] hover:text-[#111827] flex items-center cursor-pointer"
                                title="Select all rows on this page"
                              >
                                {paginatedApplications.length > 0 &&
                                paginatedApplications.every(a => selectedAppIds.includes(a.appId || a.id)) ? (
                                  <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </th>
                            <th className="py-3.5 px-3">Application ID</th>
                            <th className="py-3.5 px-3">Applicant</th>
                            <th className="py-3.5 px-3">Requested Service</th>
                            <th className="py-3.5 px-3">Submitted Date</th>
                            <th className="py-3.5 px-3">Payment Method</th>
                            <th className="py-3.5 px-3">Payment Status</th>
                            <th className="py-3.5 px-3">Application Status</th>
                            <th className="py-3.5 px-3">Documents</th>
                            <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0] text-xs">
                          {paginatedApplications.map((app, idx) => {
                            const appId = app.appId || app.id || `CSC-${idx + 1}`;
                            const isSelected = selectedAppIds.includes(appId);
                            const isDrawerOpenForRow = drawerAppId === appId;
                            const rawDocs = Array.isArray(app.documents) ? app.documents : [];
                            const textDocs = Array.isArray(app.uploadedDocuments) ? app.uploadedDocuments : [];
                            const docCount = rawDocs.length || textDocs.length;
                            const online = isOnlinePayment(app);
                            const payStatus = getPaymentStatusInfo(app);

                            return (
                              <tr
                                key={appId}
                                onClick={() => handleOpenDrawer(app)}
                                className={`group transition-colors duration-150 cursor-pointer ${
                                  isDrawerOpenForRow
                                    ? 'bg-blue-50/70'
                                    : isSelected
                                    ? 'bg-blue-50/40'
                                    : 'hover:bg-[#F6F8FC]'
                                }`}
                              >
                                {/* Checkbox */}
                                <td
                                  className="py-3.5 pl-4 pr-2 align-middle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectApp(appId);
                                  }}
                                >
                                  <button type="button" className="text-[#64748B] hover:text-[#2563EB] flex items-center cursor-pointer">
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>
                                </td>

                                {/* Application ID + Copy */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-[#111C3D] bg-[#F6F8FC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                                      {appId}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyTokenId(appId, e)}
                                      className="p-1 text-[#64748B] hover:text-[#2563EB] rounded hover:bg-white transition-colors cursor-pointer"
                                      title="Copy Application ID"
                                    >
                                      {copiedAppId === appId ? (
                                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Applicant */}
                                <td className="py-3.5 px-3 align-middle max-w-[200px]">
                                  <div className="font-semibold text-[#111827] truncate">
                                    {app.name || app.customerName || 'N/A'}
                                  </div>
                                  <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                                    {app.phone || app.phoneNumber || 'N/A'}
                                    {app.email && app.email !== 'N/A' ? ` · ${app.email}` : ''}
                                  </div>
                                </td>

                                {/* Requested Service */}
                                <td className="py-3.5 px-3 align-middle max-w-[220px]">
                                  <div
                                    title={app.service || app.selectedService || 'General Service'}
                                    className="font-semibold text-[#111827] truncate"
                                  >
                                    {app.service || app.selectedService || 'General Service'}
                                  </div>
                                  <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                                    {app.userCategory || 'General/OBC'}
                                    {app.staffNotes ? ' · 📝 Has Staff Remark' : ''}
                                  </div>
                                </td>

                                {/* Submitted Date */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  <div className="font-medium text-[#111827]">
                                    {formatShortDate(app.createdAt || app.submittedAt || app.date)}
                                  </div>
                                  <div className="text-[11px] text-[#64748B]">
                                    {formatShortTime(app.createdAt || app.submittedAt || app.date)}
                                  </div>
                                </td>

                                {/* Payment Method */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  <div className="font-semibold text-[#111827]">
                                    {online ? 'UPI Online' : 'Cash Counter'}
                                  </div>
                                  <div className="text-[11px] font-mono text-[#64748B]">
                                    ₹{Number(app.totalAmount || 0).toLocaleString('en-IN')}
                                    {online && app.utrNumber && app.utrNumber !== 'N/A' ? ` · UTR: ${String(app.utrNumber).slice(-6)}` : ''}
                                  </div>
                                </td>

                                {/* Payment Status */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${payStatus.colorClass}`}>
                                    {payStatus.label}
                                  </span>
                                </td>

                                {/* Application Status */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  {renderApplicationStatusBadge(app.status)}
                                </td>

                                {/* Documents */}
                                <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                                  {docCount > 0 ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (rawDocs.length > 0 && (rawDocs[0].dataUrl || rawDocs[0].url)) {
                                          setSelectedDocPreview({
                                            name: rawDocs[0].name || 'Document',
                                            url: rawDocs[0].dataUrl || rawDocs[0].url,
                                            type: rawDocs[0].type
                                          });
                                        } else {
                                          handleOpenDrawer(app);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F6F8FC] hover:bg-blue-50 text-[#111827] hover:text-[#2563EB] border border-[#E2E8F0] text-[11px] font-semibold transition-colors cursor-pointer"
                                      title="Click to preview attached documents"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                                      <span>{docCount} {docCount === 1 ? 'File' : 'Files'}</span>
                                    </button>
                                  ) : (
                                    <span className="text-[11px] text-[#64748B]">None</span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td
                                  className="py-3.5 pl-3 pr-5 align-middle whitespace-nowrap text-right"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="inline-flex items-center justify-end gap-1.5 relative">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDrawer(app)}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                      View Details
                                    </button>

                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => setOpenRowMenuId(openRowMenuId === appId ? null : appId)}
                                        className="p-1.5 rounded-lg bg-[#F6F8FC] hover:bg-slate-200/70 text-[#64748B] hover:text-[#111827] border border-[#E2E8F0] transition-colors cursor-pointer"
                                        title="More actions"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </button>

                                      {openRowMenuId === appId && (
                                        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-40 py-1 text-left">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenRowMenuId(null);
                                              handleUpdateStatus(appId, 'Approved & Under Process');
                                            }}
                                            className="w-full px-3.5 py-2 text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                                          >
                                            <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
                                            <span>Mark Under Process</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenRowMenuId(null);
                                              setUploadModalApp(app);
                                              setReceiptDataUrl(app.finalReceiptUrl || '');
                                            }}
                                            className="w-full px-3.5 py-2 text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                                          >
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                                            <span>Complete &amp; Receipt</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenRowMenuId(null);
                                              handleUpdateStatus(appId, 'Rejected');
                                            }}
                                            className="w-full px-3.5 py-2 text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                                          >
                                            <XCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                                            <span>Mark Rejected</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenRowMenuId(null);
                                              handleSendWhatsAppNotification(app);
                                            }}
                                            className="w-full px-3.5 py-2 text-xs font-medium text-[#111827] hover:bg-[#F6F8FC] flex items-center gap-2 cursor-pointer"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5 text-[#16A34A]" />
                                            <span>Send WhatsApp Update</span>
                                          </button>
                                          <div className="border-t border-[#E2E8F0] my-1" />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setOpenRowMenuId(null);
                                              handleDelete(appId);
                                            }}
                                            className="w-full px-3.5 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete Application</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* RESPONSIVE MOBILE APPLICATION CARDS (< md) */}
                    <div className="md:hidden divide-y divide-[#E2E8F0]">
                      {paginatedApplications.map((app, idx) => {
                        const appId = app.appId || app.id || `CSC-${idx + 1}`;
                        const rawDocs = Array.isArray(app.documents) ? app.documents : [];
                        const textDocs = Array.isArray(app.uploadedDocuments) ? app.uploadedDocuments : [];
                        const docCount = rawDocs.length || textDocs.length;
                        const online = isOnlinePayment(app);
                        const payStatus = getPaymentStatusInfo(app);

                        return (
                          <div
                            key={appId}
                            onClick={() => handleOpenDrawer(app)}
                            className="p-4 hover:bg-[#F6F8FC] transition-colors space-y-3 cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-[#111C3D] bg-[#F6F8FC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                                  {appId}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyTokenId(appId, e)}
                                  className="p-1 text-[#64748B]"
                                  title="Copy Application ID"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {renderApplicationStatusBadge(app.status)}
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-[#111827]">
                                {app.name || app.customerName || 'N/A'}
                              </h3>
                              <p className="text-xs font-medium text-[#2563EB] mt-0.5">
                                {app.service || app.selectedService || 'General Service'}
                              </p>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                {app.phone || app.phoneNumber || 'N/A'} · {formatShortDate(app.createdAt || app.submittedAt || app.date)}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${payStatus.colorClass}`}>
                                  {online ? 'UPI' : 'Cash'} · ₹{app.totalAmount || 0}
                                </span>
                                {docCount > 0 && (
                                  <span className="text-[11px] font-medium text-[#64748B] flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-[#2563EB]" />
                                    {docCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-[#2563EB]">
                                View Details →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Table Footer / Pagination */}
                    <div className="px-4 sm:px-6 py-3.5 bg-[#F6F8FC] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
                      <div className="flex items-center gap-3">
                        <span>
                          Showing{' '}
                          <strong className="text-[#111827]">
                            {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredApplications.length)}
                          </strong>{' '}
                          of <strong className="text-[#111827]">{filteredApplications.length}</strong> application(s)
                        </span>
                        <select
                          aria-label="Rows per page"
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#111827] cursor-pointer"
                        >
                          <option value={15}>15 / page</option>
                          <option value={30}>30 / page</option>
                          <option value={50}>50 / page</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={safeCurrentPage <= 1}
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#111827] font-medium hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          Previous
                        </button>
                        <span className="px-2.5 font-semibold text-[#111827]">
                          Page {safeCurrentPage} of {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={safeCurrentPage >= totalPages}
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[#111827] font-medium hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* 5. DEDICATED DOCUMENT MANAGEMENT INTERFACE */}
          {/* ================================================================ */}
          {activeNav === 'documents' && (
            <section aria-label="Uploaded Documents Repository" className="space-y-0 md:space-y-4">
              {/* Document Search & Filter Bar */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 shadow-none md:shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search documents by file name, applicant, or Application ID..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'all', label: 'All Files' },
                    { id: 'image', label: 'Images' },
                    { id: 'pdf', label: 'PDF Documents' },
                    { id: 'receipt', label: 'Processed Receipts' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDocTypeFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        docTypeFilter === tab.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[#F6F8FC] text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {allDocumentsCatalog.length === 0 ? (
                <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-12 text-center space-y-2">
                  <FolderOpen className="w-10 h-10 text-[#64748B] mx-auto" />
                  <h3 className="text-sm font-bold text-[#111827]">No uploaded documents found</h3>
                  <p className="text-xs text-[#64748B]">
                    Customer identity documents and processed receipts linked to applications will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          <th className="py-3.5 px-4">File Name &amp; Type</th>
                          <th className="py-3.5 px-4">Linked Application</th>
                          <th className="py-3.5 px-4">Applicant</th>
                          <th className="py-3.5 px-4">Service</th>
                          <th className="py-3.5 px-4">File Size</th>
                          <th className="py-3.5 px-4">Upload Date</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] text-xs">
                        {allDocumentsCatalog.map((docItem) => {
                          const isImg = docItem.docType.startsWith('image/');
                          const FileIcon = isImg ? FileImage : FileText;
                          return (
                            <tr key={docItem.uid} className="hover:bg-[#F6F8FC] transition-colors">
                              <td className="py-3.5 px-4 align-middle">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    docItem.isFinalReceipt
                                      ? 'bg-emerald-50 text-[#16A34A]'
                                      : isImg
                                      ? 'bg-purple-50 text-[#8B5CF6]'
                                      : 'bg-blue-50 text-[#2563EB]'
                                  }`}>
                                    <FileIcon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 max-w-[220px]">
                                    <span className="font-semibold text-[#111827] block truncate">
                                      {docItem.docName}
                                    </span>
                                    <span className="text-[11px] text-[#64748B]">
                                      {docItem.isFinalReceipt ? 'Official Processed Receipt' : docItem.docType}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDrawer(docItem.appRef)}
                                  className="font-mono font-bold text-[#2563EB] hover:underline cursor-pointer"
                                >
                                  {docItem.appId}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 align-middle">
                                <div className="font-semibold text-[#111827]">{docItem.applicantName}</div>
                                <div className="text-[11px] text-[#64748B]">{docItem.phone}</div>
                              </td>
                              <td className="py-3.5 px-4 align-middle max-w-[200px] truncate text-[#111827]">
                                {docItem.service}
                              </td>
                              <td className="py-3.5 px-4 align-middle whitespace-nowrap font-mono text-[#64748B]">
                                {docItem.docSize > 0 ? `${(docItem.docSize / 1024).toFixed(1)} KB` : 'Stored'}
                              </td>
                              <td className="py-3.5 px-4 align-middle whitespace-nowrap text-[#64748B]">
                                {formatShortDate(docItem.submittedAt)}
                              </td>
                              <td className="py-3.5 px-4 align-middle whitespace-nowrap text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {docItem.docUrl && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedDocPreview({
                                            name: docItem.docName,
                                            url: docItem.docUrl,
                                            type: docItem.docType
                                          })
                                        }
                                        className="px-2.5 py-1.5 rounded-lg bg-[#F6F8FC] hover:bg-blue-50 text-[#111827] hover:text-[#2563EB] border border-[#E2E8F0] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Preview</span>
                                      </button>
                                      <a
                                        href={docItem.docUrl}
                                        download={docItem.docName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                      </a>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================================================================ */}
          {/* 6. PAYMENT OVERVIEW & LEDGER */}
          {/* ================================================================ */}
          {activeNav === 'payments' && (
            <section aria-label="Payment Records Overview" className="space-y-0 md:space-y-5">
              {/* Payment KPI Summary Row */}
              <div className="bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 divide-y divide-[#E2E8F0] md:divide-y-0 grid grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4">
                <div className="bg-white border-0 border-r border-[#E2E8F0] md:border rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Verified Collected Revenue</span>
                  <span className="text-xl md:text-2xl font-bold text-[#16A34A] font-mono mt-2 block">
                    ₹{kpiStats.verifiedRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Confirmed UPI &amp; completed cash orders
                  </span>
                </div>

                <div className="bg-white border-0 md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">UPI Online Transactions</span>
                  <span className="text-xl md:text-2xl font-bold text-[#8B5CF6] font-mono mt-2 block">
                    {kpiStats.upiCount}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Online QR / UTR submissions
                  </span>
                </div>

                <div className="bg-white border-0 border-r border-[#E2E8F0] md:border rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Cash Counter Applications</span>
                  <span className="text-xl md:text-2xl font-bold text-[#111C3D] font-mono mt-2 block">
                    {kpiStats.cashCount}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Collected upon desk completion
                  </span>
                </div>

                <div className="bg-white border-0 md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Total Pipeline Value</span>
                  <span className="text-xl md:text-2xl font-bold text-[#2563EB] font-mono mt-2 block">
                    ₹{kpiStats.totalPipelineAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-1 block">
                    Includes pending cash counter filings
                  </span>
                </div>
              </div>

              {/* Payment Filter Bar */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 shadow-none md:shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'all', label: 'All Payment Records' },
                    { id: 'upi_paid', label: 'UPI Online' },
                    { id: 'cash_collected', label: 'Cash Collected (Completed)' },
                    { id: 'cash_pending', label: 'Cash Pending at Counter' },
                    { id: 'pending_verification', label: 'Pending Verification' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentViewFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        paymentViewFilter === tab.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[#F6F8FC] text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleExportCSV(applications)}
                  className="px-3 py-1.5 bg-[#111C3D] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Payment Ledger</span>
                </button>
              </div>

              {/* Payment Ledger Table */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                        <th className="py-3.5 px-4">Application ID</th>
                        <th className="py-3.5 px-4">Applicant</th>
                        <th className="py-3.5 px-4">Service</th>
                        <th className="py-3.5 px-4">Method</th>
                        <th className="py-3.5 px-4">UTR / Reference</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Payment Status</th>
                        <th className="py-3.5 px-4">Application Status</th>
                        <th className="py-3.5 px-4 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {applications
                        .filter((app) => {
                          const online = isOnlinePayment(app);
                          const payInfo = getPaymentStatusInfo(app);
                          if (paymentViewFilter === 'upi_paid') return online;
                          if (paymentViewFilter === 'cash_collected') return !online && payInfo.isVerifiedRevenue;
                          if (paymentViewFilter === 'cash_pending') return !online && !payInfo.isVerifiedRevenue;
                          if (paymentViewFilter === 'pending_verification') return payInfo.label === 'Pending Verification';
                          return true;
                        })
                        .map((app, i) => {
                          const appId = app.appId || app.id || `CSC-${i + 1}`;
                          const online = isOnlinePayment(app);
                          const payInfo = getPaymentStatusInfo(app);
                          return (
                            <tr
                              key={appId}
                              onClick={() => handleOpenDrawer(app)}
                              className="hover:bg-[#F6F8FC] transition-colors cursor-pointer"
                            >
                              <td className="py-3.5 px-4 font-mono font-bold text-[#111C3D]">{appId}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-[#111827]">{app.name || app.customerName || 'N/A'}</div>
                                <div className="text-[11px] text-[#64748B]">{app.phone || app.phoneNumber || 'N/A'}</div>
                              </td>
                              <td className="py-3.5 px-4 max-w-[200px] truncate text-[#111827]">
                                {app.service || app.selectedService || 'Service'}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-[#111827]">
                                {online ? 'UPI Online' : 'Cash Counter'}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[#64748B]">
                                {app.utrNumber && app.utrNumber !== 'N/A' ? app.utrNumber : '—'}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#111827]">
                                ₹{Number(app.totalAmount || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${payInfo.colorClass}`}>
                                  {payInfo.label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">{renderApplicationStatusBadge(app.status)}</td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDrawer(app);
                                  }}
                                  className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                                >
                                  Details →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* 7. VLE VISITOR ACCESS LOGS */}
          {/* ================================================================ */}
          {activeNav === 'vle_logs' && (
            <section aria-label="VLE Visitor Access Logs" className="space-y-0 md:space-y-5">
              {/* VLE Metrics */}
              <div className="bg-white md:bg-transparent border-b border-[#E2E8F0] md:border-0 divide-y divide-[#E2E8F0] md:divide-y-0 grid grid-cols-2 lg:grid-cols-4 gap-0 md:gap-4">
                <div className="bg-white border-0 border-r border-[#E2E8F0] md:border rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Total Verified Visitors</span>
                  <span className="text-xl md:text-2xl font-bold text-[#111827] font-mono mt-2 block">
                    {vleInquiries.length}
                  </span>
                </div>
                <div className="bg-white border-0 md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">J&amp;K / Ladakh Residents</span>
                  <span className="text-xl md:text-2xl font-bold text-[#16A34A] font-mono mt-2 block">
                    {vleInquiries.filter(i => (i.state || '').toLowerCase().includes('jammu') || (i.state || '').toLowerCase().includes('kashmir') || (i.state || '').toLowerCase().includes('ladakh')).length}
                  </span>
                </div>
                <div className="bg-white border-0 border-r border-[#E2E8F0] md:border rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Other States / UTs</span>
                  <span className="text-xl md:text-2xl font-bold text-[#2563EB] font-mono mt-2 block">
                    {vleInquiries.filter(i => !(i.state || '').toLowerCase().includes('jammu') && !(i.state || '').toLowerCase().includes('kashmir') && !(i.state || '').toLowerCase().includes('ladakh')).length}
                  </span>
                </div>
                <div className="bg-white border-0 md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs">
                  <span className="text-xs font-semibold text-[#64748B] block">Verification Status</span>
                  <span className="text-xl md:text-2xl font-bold text-[#8B5CF6] font-mono mt-2 block">
                    100% Logged
                  </span>
                </div>
              </div>

              {/* Bulk Selection Bar for VLE */}
              {selectedVleIds.length > 0 && (
                <div className="p-3.5 bg-[#111C3D] text-white rounded-none md:rounded-xl flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold">{selectedVleIds.length} visitor log(s) selected</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBulkDeleteVle}
                      className="px-3 py-1.5 bg-[#DC2626] hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Delete Selected ({selectedVleIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedVleIds([])}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* VLE Toolbar */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 shadow-none md:shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search visitor name, phone, email, state, address..."
                    value={vleSearchQuery}
                    onChange={(e) => setVleSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#111827] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: 'all', label: `All (${vleInquiries.length})` },
                    { id: 'jk', label: 'J&K / Ladakh' },
                    { id: 'other', label: 'Other States' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVleFilterState(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                        vleFilterState === tab.id
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-[#F6F8FC] text-[#64748B] border-[#E2E8F0] hover:text-[#111827]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleExportVLEInquiriesCSV}
                    disabled={vleInquiries.length === 0}
                    className="px-3 py-1.5 bg-[#111C3D] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Logs CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAllVleInquiries}
                    disabled={vleInquiries.length === 0}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#DC2626] border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge All</span>
                  </button>
                </div>
              </div>

              {/* VLE Table */}
              {filteredVleInquiries.length === 0 ? (
                <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-12 text-center space-y-2">
                  <ShieldAlert className="w-10 h-10 text-[#64748B] mx-auto" />
                  <h3 className="text-sm font-bold text-[#111827]">No Visitor Access Logs Found</h3>
                  <p className="text-xs text-[#64748B]">
                    When visitors verify their identity on the CSC Station / VLE Credentials card, their details appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl shadow-none md:shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F6F8FC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                          <th className="py-3.5 pl-4 pr-2 w-10">
                            <button
                              type="button"
                              onClick={() => {
                                const allIds = filteredVleInquiries.map(i => i.id || i.inquiryId).filter(Boolean);
                                if (selectedVleIds.length >= allIds.length && allIds.length > 0) {
                                  setSelectedVleIds([]);
                                } else {
                                  setSelectedVleIds(allIds);
                                }
                              }}
                              className="text-[#64748B] hover:text-[#111827] flex items-center cursor-pointer"
                            >
                              {selectedVleIds.length >= filteredVleInquiries.length && filteredVleInquiries.length > 0 ? (
                                <CheckSquare className="w-4 h-4 text-[#2563EB]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="py-3.5 px-4">Inquiry ID</th>
                          <th className="py-3.5 px-4">Visitor Name</th>
                          <th className="py-3.5 px-4">Contact</th>
                          <th className="py-3.5 px-4">State &amp; District</th>
                          <th className="py-3.5 px-4">Timestamp</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] text-xs">
                        {filteredVleInquiries.map((inq, idx) => {
                          const inqId = inq.id || inq.inquiryId || `VLE-${idx}`;
                          const rawPhone = inq.phone || '';
                          const cleanPhone = rawPhone.replace(/\D/g, '');
                          const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          const isSelected = selectedVleIds.includes(inqId);

                          return (
                            <tr key={inqId} className="hover:bg-[#F6F8FC] transition-colors">
                              <td className="py-3.5 pl-4 pr-2 align-middle">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedVleIds(prev =>
                                      prev.includes(inqId) ? prev.filter(id => id !== inqId) : [...prev, inqId]
                                    )
                                  }
                                  className="text-[#64748B] hover:text-[#2563EB] flex items-center cursor-pointer"
                                >
                                  {isSelected ? <CheckSquare className="w-4 h-4 text-[#2563EB]" /> : <Square className="w-4 h-4" />}
                                </button>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#111C3D]">{inqId}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-[#111827]">{inq.name || 'Verified Visitor'}</div>
                                <span className="inline-flex items-center text-[10px] font-semibold text-[#16A34A]">
                                  ✓ VLE Credentials Unlocked
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-medium text-[#111827]">{inq.phone || 'N/A'}</div>
                                <div className="text-[11px] text-[#64748B]">{inq.email || ''}</div>
                              </td>
                              <td className="py-3.5 px-4 max-w-[220px]">
                                <div className="font-semibold text-[#111827]">{inq.state || 'N/A'}</div>
                                <div className="text-[11px] text-[#64748B] truncate">{inq.address || ''}</div>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B]">
                                {formatDisplayDate(inq.timestamp || inq.createdAt)}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {cleanPhone && (
                                    <>
                                      <a
                                        href={`tel:${cleanPhone}`}
                                        className="px-2.5 py-1 rounded-lg bg-[#F6F8FC] hover:bg-slate-200/70 text-[#111827] border border-[#E2E8F0] font-semibold flex items-center gap-1"
                                      >
                                        <PhoneCall className="w-3 h-3 text-[#2563EB]" />
                                        <span>Call</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(`Hello ${inq.name || ''}, thank you for verifying on our CSC Digital Portal. How may we assist you today?`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1 rounded-lg bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                                      >
                                        <MessageCircle className="w-3 h-3" />
                                        <span>WhatsApp</span>
                                      </a>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVleInquiry(inqId)}
                                    className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete visitor log"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================================================================ */}
          {/* 8. WHATSAPP CHANNEL & GROUP SYNC */}
          {/* ================================================================ */}
          {activeNav === 'whatsapp_sync' && (
            <section aria-label="WhatsApp Channel and Group Synchronization" className="space-y-0 md:space-y-4">
              {/* Status Strip */}
              <div className="bg-white border-b md:border border-[#E2E8F0] rounded-none md:rounded-2xl p-4 md:p-5 shadow-none md:shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#111827]">
                        WhatsApp Channel &amp; Community Broadcast Desk
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        ● Ready
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Format and dispatch verified recruitment notifications, date sheets, and CSC service updates directly to your WhatsApp Channel and Groups.
                    </p>
                  </div>
                </div>
              </div>

              <WhatsAppBroadcaster cafeName={cafeName} />
            </section>
          )}

          {/* ================================================================ */}
          {/* 9. REPORTS & CSV EXPORT + SUPABASE DIAGNOSTICS */}
          {/* ================================================================ */}
          {activeNav === 'reports' && (
            <section aria-label="Reports and Data Export" className="space-y-0 md:space-y-6">
              <div className="bg-white md:bg-transparent divide-y divide-[#E2E8F0] md:divide-y-0 border-b border-[#E2E8F0] md:border-0 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-6 md:p-6 shadow-none md:shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">Complete Applications Report (CSV)</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Export all {applications.length} customer applications including applicant contact details, service requested, payment UTR, status, and internal staff remarks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportCSV(applications)}
                    disabled={applications.length === 0}
                    className="w-full py-2.5 px-4 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All Applications CSV ({applications.length})</span>
                  </button>
                </div>

                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-6 md:p-6 shadow-none md:shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">VLE Visitor Access Logs (CSV)</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Export all {vleInquiries.length} verified visitor identity logs recorded from the public VLE credentials verification station.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportVLEInquiriesCSV}
                    disabled={vleInquiries.length === 0}
                    className="w-full py-2.5 px-4 bg-[#111C3D] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Visitor Logs CSV ({vleInquiries.length})</span>
                  </button>
                </div>

                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-6 md:p-6 shadow-none md:shadow-2xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827]">Supabase &amp; Backend Diagnostics</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Verify live read/write connectivity to <code className="font-mono">public.applications</code> and the <code className="font-mono">documents</code> storage bucket.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGetformModal(true);
                      setSnippetTab('supabase');
                      runSupabaseDiagnosticTest();
                    }}
                    className="w-full py-2.5 px-4 bg-white hover:bg-[#F6F8FC] text-[#111827] border border-[#E2E8F0] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-[#2563EB]" />
                    <span>Open Live Diagnostics Suite</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 10. MANDATORY RIGHT-SIDE APPLICATION DETAILS DRAWER */}
      {/* ==================================================================== */}
      {selectedDrawerApp && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={handleCloseDrawer}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-app-id-heading"
              className="w-screen max-w-full sm:max-w-[540px] bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col justify-between overflow-hidden animate-fade-in"
            >
              {/* DRAWER HEADER */}
              <div className="px-6 py-4 bg-[#111C3D] text-white flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 id="drawer-app-id-heading" className="text-base font-mono font-bold tracking-tight truncate">
                      {selectedDrawerApp.appId || selectedDrawerApp.id}
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleCopyTokenId(selectedDrawerApp.appId || selectedDrawerApp.id)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                      title="Copy Application Reference"
                    >
                      {copiedAppId === (selectedDrawerApp.appId || selectedDrawerApp.id) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                    Submitted: {formatDisplayDate(selectedDrawerApp.createdAt || selectedDrawerApp.submittedAt || selectedDrawerApp.date)}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {renderApplicationStatusBadge(selectedDrawerApp.status)}
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title="Close Drawer (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DRAWER SCROLLABLE BODY */}
              <div className="p-0 md:p-6 overflow-y-auto divide-y divide-[#E2E8F0] md:divide-y-0 md:space-y-6 flex-1 bg-white md:bg-[#F6F8FC]">
                {/* SECTION A — APPLICANT INFORMATION */}
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-5 md:p-5 space-y-4 shadow-none md:shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C3D] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Applicant Information</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopyAppInfo(selectedDrawerApp)}
                      className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Summary</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Full Name</span>
                      <span className="font-bold text-[#111827] text-sm mt-0.5 block">
                        {selectedDrawerApp.name || selectedDrawerApp.customerName || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Mobile / WhatsApp</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-[#111827]">
                          {selectedDrawerApp.phone || selectedDrawerApp.phoneNumber || 'N/A'}
                        </span>
                        {(selectedDrawerApp.phone || selectedDrawerApp.phoneNumber) && (
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppNotification(selectedDrawerApp)}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#16A34A] border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100 cursor-pointer"
                          >
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Email Address</span>
                      <span className="font-medium text-[#111827] mt-0.5 block break-all">
                        {selectedDrawerApp.email || selectedDrawerApp.emailAddress || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Category &amp; DOB</span>
                      <span className="font-medium text-[#111827] mt-0.5 block">
                        {selectedDrawerApp.userCategory || 'General/OBC'}
                        {selectedDrawerApp.dateOfBirth && selectedDrawerApp.dateOfBirth !== 'N/A'
                          ? ` · DOB: ${selectedDrawerApp.dateOfBirth}`
                          : ''}
                      </span>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-[#E2E8F0]">
                      <span className="text-[11px] font-medium text-[#64748B] block">Requested Service</span>
                      <span className="font-bold text-[#2563EB] text-sm mt-0.5 block">
                        {selectedDrawerApp.service || selectedDrawerApp.selectedService || 'General Service'}
                      </span>
                    </div>

                    {selectedDrawerApp.message && selectedDrawerApp.message !== 'None' && (
                      <div className="sm:col-span-2 p-3 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block mb-1">
                          Applicant Instructions / Additional Details
                        </span>
                        <p className="text-xs text-[#111827] leading-relaxed whitespace-pre-wrap">
                          {selectedDrawerApp.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION B — APPLICATION STATUS & WORKFLOW */}
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-5 md:p-5 space-y-4 shadow-none md:shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C3D] flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Application Status Control</span>
                    </h3>
                    {(selectedDrawerApp.statusUpdatedAt || selectedDrawerApp.updatedAt) && (
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Updated: {formatShortDate(selectedDrawerApp.statusUpdatedAt || selectedDrawerApp.updatedAt)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedDrawerApp.appId || selectedDrawerApp.id, 'Pending')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        getAppCategoryStatus(selectedDrawerApp) === 'pending'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-[#F6F8FC] text-[#111827] border-[#E2E8F0] hover:border-amber-400'
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedDrawerApp.appId || selectedDrawerApp.id, 'Approved & Under Process')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        getAppCategoryStatus(selectedDrawerApp) === 'approved'
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                          : 'bg-[#F6F8FC] text-[#111827] border-[#E2E8F0] hover:border-[#2563EB]'
                      }`}
                    >
                      Under Process
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadModalApp(selectedDrawerApp);
                        setReceiptDataUrl(selectedDrawerApp.finalReceiptUrl || '');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        getAppCategoryStatus(selectedDrawerApp) === 'completed'
                          ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-xs'
                          : 'bg-[#F6F8FC] text-[#111827] border-[#E2E8F0] hover:border-[#16A34A]'
                      }`}
                    >
                      Complete
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedDrawerApp.appId || selectedDrawerApp.id, 'Rejected')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        getAppCategoryStatus(selectedDrawerApp) === 'rejected'
                          ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-xs'
                          : 'bg-[#F6F8FC] text-[#111827] border-[#E2E8F0] hover:border-[#DC2626]'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* SECTION C — PAYMENT DETAILS */}
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-5 md:p-5 space-y-3.5 shadow-none md:shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C3D] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Payment Details</span>
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getPaymentStatusInfo(selectedDrawerApp).colorClass}`}>
                      {getPaymentStatusInfo(selectedDrawerApp).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Payment Method</span>
                      <span className="font-bold text-[#111827] mt-0.5 block">
                        {isOnlinePayment(selectedDrawerApp) ? 'UPI Online' : 'Cash Counter'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-medium text-[#64748B] block">Fee Amount</span>
                      <span className="font-mono font-bold text-[#16A34A] text-sm mt-0.5 block">
                        ₹{Number(selectedDrawerApp.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-medium text-[#64748B] block">UTR / Reference No.</span>
                      <span className="font-mono font-semibold text-[#111827] mt-0.5 block break-all">
                        {selectedDrawerApp.utrNumber && selectedDrawerApp.utrNumber !== 'N/A'
                          ? selectedDrawerApp.utrNumber
                          : 'Not Applicable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION D — UPLOADED DOCUMENTS */}
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-5 md:p-5 space-y-3.5 shadow-none md:shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C3D] flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>
                        Uploaded Customer Documents (
                        {(Array.isArray(selectedDrawerApp.documents) ? selectedDrawerApp.documents.length : 0) ||
                          (Array.isArray(selectedDrawerApp.uploadedDocuments) ? selectedDrawerApp.uploadedDocuments.length : 0)}
                        )
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadModalApp(selectedDrawerApp);
                        setReceiptDataUrl(selectedDrawerApp.finalReceiptUrl || '');
                      }}
                      className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{selectedDrawerApp.finalReceiptUrl ? 'Update Receipt' : 'Attach Final Receipt'}</span>
                    </button>
                  </div>

                  {/* Final Processed Receipt Banner if uploaded */}
                  {selectedDrawerApp.finalReceiptUrl && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#111827] block truncate">
                            Final Processed Receipt / Certificate
                          </span>
                          <span className="text-[10px] text-[#16A34A] block">Ready for citizen download</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDocPreview({
                              name: `Receipt-${selectedDrawerApp.appId}`,
                              url: selectedDrawerApp.finalReceiptUrl
                            })
                          }
                          className="px-2.5 py-1 bg-white text-[#111827] border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Preview
                        </button>
                        <a
                          href={selectedDrawerApp.finalReceiptUrl}
                          download={`Receipt-${selectedDrawerApp.appId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#16A34A] text-white rounded-lg text-xs font-semibold"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Customer Uploaded Files List */}
                  {Array.isArray(selectedDrawerApp.documents) && selectedDrawerApp.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDrawerApp.documents.map((docItem: any, dIdx: number) => {
                        const fileUrl = docItem.dataUrl || docItem.url || '';
                        return (
                          <div
                            key={docItem.id || dIdx}
                            className="p-3 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-[#111827] block truncate">
                                  {docItem.name || `Document ${dIdx + 1}`}
                                </span>
                                <span className="text-[10px] font-mono text-[#64748B]">
                                  {docItem.size ? `${(docItem.size / 1024).toFixed(1)} KB` : 'Attached File'}
                                  {docItem.type ? ` · ${docItem.type}` : ''}
                                </span>
                              </div>
                            </div>

                            {fileUrl && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDocPreview({
                                      name: docItem.name || `Document ${dIdx + 1}`,
                                      url: fileUrl,
                                      type: docItem.type
                                    })
                                  }
                                  className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-[#111827] hover:text-[#2563EB] border border-[#E2E8F0] rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview</span>
                                </button>
                                <a
                                  href={fileUrl}
                                  download={docItem.name || `Document-${dIdx + 1}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : Array.isArray(selectedDrawerApp.uploadedDocuments) && selectedDrawerApp.uploadedDocuments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDrawerApp.uploadedDocuments.map((docStr: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 bg-[#F6F8FC] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#111827]"
                        >
                          📎 {docStr}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B] italic">
                      No supporting documents uploaded with this application.
                    </p>
                  )}
                </div>

                {/* SECTION E — STAFF INTERNAL REMARKS */}
                <div className="bg-white border-0 md:border md:border-[#E2E8F0] rounded-none md:rounded-2xl px-4 py-5 md:p-5 space-y-3 shadow-none md:shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C3D] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Staff Internal Remarks</span>
                    </h3>
                    {selectedDrawerApp.staffNoteUpdatedAt && (
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Saved: {formatDisplayDate(selectedDrawerApp.staffNoteUpdatedAt)}
                      </span>
                    )}
                  </div>

                  {selectedDrawerApp.staffNotes && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-[#111827]">
                      <span className="text-[10px] font-bold uppercase text-amber-800 block mb-0.5">
                        Current Recorded Note ({staffDisplayName}):
                      </span>
                      <p className="font-medium">{selectedDrawerApp.staffNotes}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Add internal processing notes, verification remarks, or follow-up details..."
                      value={drawerNoteInput}
                      onChange={(e) => {
                        setDrawerNoteInput(e.target.value);
                        setDrawerNoteDirty(e.target.value !== (selectedDrawerApp.staffNotes || ''));
                      }}
                      className="w-full p-3 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#2563EB] resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      {drawerNoteDirty && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerNoteInput(selectedDrawerApp.staffNotes || '');
                            setDrawerNoteDirty(false);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#111827] cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={savingDrawerNote}
                        onClick={() => handleSaveStaffNote(selectedDrawerApp.appId || selectedDrawerApp.id, drawerNoteInput)}
                        className="px-4 py-1.5 bg-[#111C3D] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingDrawerNote ? 'Saving...' : 'Save Remark'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION F — QUICK ACTIONS FOOTER */}
              <div className="px-6 py-4 bg-white border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppNotification(selectedDrawerApp)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Applicant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(selectedDrawerApp.appId || selectedDrawerApp.id)}
                    className="p-2 text-[#64748B] hover:text-[#DC2626] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Application Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="px-4 py-2 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#111827] border border-[#E2E8F0] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalApp(selectedDrawerApp);
                      setReceiptDataUrl(selectedDrawerApp.finalReceiptUrl || '');
                    }}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MARK COMPLETED FILE UPLOAD MODAL */}
      {/* ==================================================================== */}
      {uploadModalApp && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setUploadError(null);

              let finalUrl = receiptDataUrl ? receiptDataUrl.trim() : '';

              if (!finalUrl && selectedReceiptFile) {
                try {
                  finalUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(selectedReceiptFile);
                  });
                } catch (readErr) {
                  console.error('Failed to read file:', readErr);
                }
              }

              if (!finalUrl) {
                setUploadError('Please select a receipt file or enter a valid document URL.');
                return;
              }

              setIsUploadingReceipt(true);

              try {
                const isoNow = new Date().toISOString();
                const updatePayload = {
                  status: 'Completed',
                  finalReceiptUrl: finalUrl,
                  updatedAt: isoNow,
                  statusUpdatedAt: isoNow
                };

                const docRef = doc(db, 'applications', uploadModalApp.appId);
                try {
                  await updateDoc(docRef, updatePayload);
                } catch {
                  await setDoc(docRef, updatePayload, { merge: true });
                }

                try {
                  const appointmentRef = doc(db, 'appointments', uploadModalApp.appId);
                  await updateDoc(appointmentRef, updatePayload);
                } catch {}

                try {
                  const local = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
                  const updatedLocal = local.map((a: any) =>
                    a.appId === uploadModalApp.appId || a.id === uploadModalApp.appId ? { ...a, ...updatePayload } : a
                  );
                  localStorage.setItem('csc_local_applications', JSON.stringify(updatedLocal));
                } catch {}

                fetch(`/api/appointments/${uploadModalApp.appId}/status`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'Completed' })
                }).catch(() => {});

                try {
                  await updateSupabaseApplicationStatus(uploadModalApp.appId, 'Completed');
                } catch {}

                setApplications(prev =>
                  prev.map(a =>
                    a.appId === uploadModalApp.appId || a.id === uploadModalApp.appId
                      ? { ...a, status: 'Completed', finalReceiptUrl: finalUrl, updatedAt: isoNow, statusUpdatedAt: isoNow }
                      : a
                  )
                );

                setActionSuccess(`Application ${uploadModalApp.appId} marked as Completed with receipt.`);
                setTimeout(() => setActionSuccess(null), 3500);

                setUploadModalApp(null);
                setReceiptDataUrl('');
                setSelectedReceiptFile(null);
                setUploadError(null);
              } catch (error: any) {
                const errMsg = error?.message || String(error);
                setUploadError(`Failed to upload: ${errMsg}`);
              } finally {
                setIsUploadingReceipt(false);
              }
            }}
            className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-bold text-[#111827]">
                Upload Processed Receipt &amp; Complete Application
              </h3>
              <button
                type="button"
                onClick={() => {
                  setUploadModalApp(null);
                  setReceiptDataUrl('');
                  setSelectedReceiptFile(null);
                  setUploadError(null);
                }}
                className="text-[#64748B] hover:text-[#111827]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[#DC2626] text-xs font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Attach the final processed certificate or acknowledgment receipt for{' '}
                <strong className="text-[#111827] font-mono">{uploadModalApp.appId}</strong> (
                {uploadModalApp.name || uploadModalApp.customerName}).
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827] block">
                  1. Select Receipt File (PDF or Image)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedReceiptFile(file);
                      setUploadError(null);
                      setIsUploadingReceipt(true);

                      try {
                        const appId = uploadModalApp?.appId || 'APP_RECEIPT';
                        const res = await uploadReceiptFileToSupabase(file, appId);
                        setReceiptDataUrl(res.url);
                      } catch {
                        setUploadError('Failed to process selected file.');
                      } finally {
                        setIsUploadingReceipt(false);
                      }
                    }
                  }}
                  className="w-full text-xs text-[#111827] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#2563EB] file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-[#111827] block">
                  2. Storage Document URL
                </label>
                <input
                  type="text"
                  placeholder="https://...supabase.co/storage/v1/object/public/documents/..."
                  value={receiptDataUrl}
                  onChange={(e) => {
                    setReceiptDataUrl(e.target.value);
                    setSelectedReceiptFile(null);
                    setUploadError(null);
                  }}
                  className="w-full px-3 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-[#111827] text-xs font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {receiptDataUrl && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[#16A34A] text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Receipt file ready to link with application.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                disabled={isUploadingReceipt}
                onClick={() => {
                  setUploadModalApp(null);
                  setReceiptDataUrl('');
                  setSelectedReceiptFile(null);
                  setUploadError(null);
                }}
                className="px-4 py-2 bg-[#F6F8FC] hover:bg-slate-200/70 text-[#111827] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploadingReceipt}
                className="px-5 py-2 bg-[#16A34A] hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploadingReceipt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Mark Completed</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUPABASE & BACKEND DIAGNOSTICS MODAL */}
      {/* ==================================================================== */}
      {showGetformModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-[60] flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-[#111C3D] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#2563EB]" />
                <div>
                  <h3 className="text-sm font-bold">Supabase &amp; Form Backend Diagnostics</h3>
                  <p className="text-[11px] text-slate-300">
                    Inspect live Supabase connectivity, storage health, and form integration endpoints
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGetformModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 bg-[#F6F8FC] text-xs">
              {/* Live Supabase Diagnostics Card */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#111C3D]">
                      Live Supabase Connection Status
                    </h4>
                    <p className="text-[11px] text-[#64748B] font-mono mt-0.5">
                      Project: https://yvxqyczeavhfwxxjxwgl.supabase.co
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={runSupabaseDiagnosticTest}
                    disabled={supabaseDiagnostic?.running}
                    className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${supabaseDiagnostic?.running ? 'animate-spin' : ''}`} />
                    <span>{supabaseDiagnostic?.running ? 'Testing...' : 'Run Diagnostic Test'}</span>
                  </button>
                </div>

                {supabaseDiagnostic?.result && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111827]">Table (public.applications)</span>
                        {supabaseDiagnostic.result.tableAccess.success ? (
                          <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected ({supabaseDiagnostic.result.tableAccess.rowsCount || 0} rows)
                          </span>
                        ) : (
                          <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Error
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B]">{supabaseDiagnostic.result.tableAccess.message}</p>
                    </div>

                    <div className="p-3.5 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111827]">Storage Bucket (documents)</span>
                        {supabaseDiagnostic.result.storageAccess.success ? (
                          <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="text-[#DC2626] font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Notice
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#64748B]">{supabaseDiagnostic.result.storageAccess.message}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Webhook Endpoint Configuration */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111C3D]">
                  Optional Webhook Endpoint (Getform.io / Formspree)
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={getformEndpointInput}
                    onChange={(e) => setGetformEndpointInput(e.target.value)}
                    placeholder="https://getform.io/f/YOUR_UNIQUE_ENDPOINT"
                    className="flex-1 px-3.5 py-2 bg-[#F6F8FC] border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#111827]"
                  />
                  <button
                    type="button"
                    onClick={handleTestGetformEndpoint}
                    className="px-4 py-2 bg-[#111C3D] text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Test &amp; Save
                  </button>
                </div>
                {getformTestResult.message && (
                  <p className={`text-xs font-medium ${getformTestResult.status === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                    {getformTestResult.message}
                  </p>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-white border-t border-[#E2E8F0] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowGetformModal(false)}
                className="px-4 py-2 bg-[#111C3D] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {/* ==================================================================== */}
      {selectedDocPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F6F8FC]">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-[#2563EB] shrink-0" />
                <h3 className="text-xs font-bold text-[#111827] truncate">
                  {selectedDocPreview.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedDocPreview.url}
                  download={selectedDocPreview.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {selectedDocPreview.type?.startsWith('image/') ||
              selectedDocPreview.url.startsWith('data:image/') ||
              /\.(jpg|jpeg|png|webp|gif)$/i.test(selectedDocPreview.name || '') ? (
                <img
                  src={selectedDocPreview.url}
                  alt={selectedDocPreview.name}
                  className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-sm"
                />
              ) : selectedDocPreview.type === 'application/pdf' ||
                selectedDocPreview.url.startsWith('data:application/pdf') ||
                /\.pdf$/i.test(selectedDocPreview.name || '') ? (
                <iframe
                  src={selectedDocPreview.url}
                  title={selectedDocPreview.name}
                  className="w-full h-[72vh] rounded-lg border border-[#E2E8F0] bg-white"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-10 h-10 text-[#2563EB] mx-auto" />
                  <p className="text-xs font-semibold text-[#111827]">
                    Document is ready for download.
                  </p>
                  <a
                    href={selectedDocPreview.url}
                    download={selectedDocPreview.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white font-semibold text-xs rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ({selectedDocPreview.name})</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
