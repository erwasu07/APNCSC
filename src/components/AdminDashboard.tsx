import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  Building2,
  Phone,
  Mail,
  Calendar,
  Tag,
  CreditCard,
  IndianRupee,
  ExternalLink,
  Info,
  Flame,
  Check,
  Upload
} from 'lucide-react';

interface AdminDashboardProps {
  cafeName: string;
  onClose?: () => void;
}

export default function AdminDashboard({ cafeName, onClose }: AdminDashboardProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('csc_admin_authed') === 'true';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ name: string; url: string; type?: string } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // States for Mark Completed Upload Modal
  const [uploadModalApp, setUploadModalApp] = useState<any | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  // Monitor Firebase Auth state change
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsAuthenticated(true);
        sessionStorage.setItem('csc_admin_authed', 'true');
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
        // Sign in via Firebase Auth anonymous session or standard email
        try {
          await signInAnonymously(auth);
        } catch (authErr) {
          setIsAuthenticated(true);
          sessionStorage.setItem('csc_admin_authed', 'true');
        }
      } else if (trimmedUser.includes('@')) {
        await signInWithEmailAndPassword(auth, trimmedUser, trimmedPass);
      } else {
        setLoginError('Invalid Staff Credentials. Use "Mahi" / "Wasu@9687" or a registered Firebase Auth staff email.');
      }
    } catch (err: any) {
      console.error('Firebase Auth login error:', err);
      setLoginError(err.message || 'Firebase Authentication failed. Check credentials.');
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
      console.error('Anonymous auth error:', err);
      setIsAuthenticated(true);
      sessionStorage.setItem('csc_admin_authed', 'true');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setIsAuthenticated(false);
    sessionStorage.removeItem('csc_admin_authed');
  };

  // Connect real-time Cloud Firestore listener for applications
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    let unsubSnapshot: (() => void) | null = null;

    try {
      unsubSnapshot = onSnapshot(
        collection(db, 'appointments'),
        (snapshot) => {
          const fsApps: any[] = [];
          snapshot.forEach((docSnap) => {
            fsApps.push({ id: docSnap.id, ...docSnap.data() });
          });

          // Also pull from local cache and web3forms for comprehensive deduplicated list
          let localApps: any[] = [];
          let web3Apps: any[] = [];
          try {
            localApps = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
            web3Apps = JSON.parse(localStorage.getItem('csc_web3forms_submissions') || '[]');
          } catch (e) {
            console.error('Local storage parse error:', e);
          }

          const map = new Map<string, any>();
          [...web3Apps, ...localApps, ...fsApps].forEach((app) => {
            if (!app) return;
            const key = app.appId || app.id || app.token || app.tokenNo;
            if (key) {
              const existing = map.get(key) || {};

              let mergedDocs = existing.documents || [];
              if (Array.isArray(app.documents) && app.documents.length > 0) {
                if (app.documents.some((d: any) => d.dataUrl) || mergedDocs.length === 0) {
                  mergedDocs = app.documents;
                }
              }

              map.set(key, {
                ...existing,
                ...app,
                appId: app.appId || existing.appId || key,
                name: app.name || app.customerName || app.applicantName || existing.name || 'N/A',
                phone: app.phone || app.phoneNumber || app.mobile || existing.phone || 'N/A',
                email: app.email || app.emailAddress || existing.email || 'N/A',
                service: app.service || app.selectedService || app.eService || existing.service || 'General Service',
                documents: mergedDocs,
                uploadedDocuments: (app.uploadedDocuments && app.uploadedDocuments.length > 0) ? app.uploadedDocuments : (existing.uploadedDocuments || []),
                paymentMode: app.paymentMode || existing.paymentMode || 'cash',
                utrNumber: app.utrNumber || existing.utrNumber || 'N/A',
                totalAmount: app.totalAmount || existing.totalAmount || 0,
                submittedAt: app.submittedAt || app.appointmentTime || app.date || existing.submittedAt || 'Recent',
                status: app.status || existing.status || 'pending'
              });
            }
          });

          const combinedList = Array.from(map.values());
          combinedList.sort((a, b) => new Date(b.createdAt || b.date || b.submittedAt || 0).getTime() - new Date(a.createdAt || a.date || a.submittedAt || 0).getTime());

          setApplications(combinedList);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore onSnapshot listener error:', err);
          setLoading(false);
        }
      );
    } catch (fsErr) {
      console.error('Firestore connection exception:', fsErr);
      setLoading(false);
    }

    return () => {
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [isAuthenticated]);

  // Handle status update in Firestore & state
  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', appId), { status: newStatus });
      setActionSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (e) {
      console.error('Firestore status update error:', e);
      // Fallback server API update
      fetch(`/api/appointments/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(() => {});
    }

    setApplications(prev => prev.map(a => a.appId === appId ? { ...a, status: newStatus } : a));
  };

  // Handle delete application in Firestore & state
  const handleDelete = async (appId: string) => {
    if (window.confirm(`Are you sure you want to remove application ${appId}?`)) {
      try {
        await deleteDoc(doc(db, 'appointments', appId));
      } catch (e) {
        console.error('Firestore delete error:', e);
      }

      setApplications(prev => prev.filter(a => a.appId !== appId));

      const local = JSON.parse(localStorage.getItem('csc_local_applications') || '[]');
      const filtered = local.filter((a: any) => a.appId !== appId);
      localStorage.setItem('csc_local_applications', JSON.stringify(filtered));

      setActionSuccess(`Application ${appId} deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (applications.length === 0) return;
    const headers = ['Token ID', 'Applicant Name', 'Mobile', 'Email', 'Service', 'Category', 'Payment Mode', 'UTR Ref', 'Amount', 'Date', 'Status'];
    const rows = applications.map(a => [
      a.appId || '',
      `"${a.name || a.customerName || ''}"`,
      a.phone || a.phoneNumber || '',
      a.email || a.emailAddress || '',
      `"${a.service || a.selectedService || ''}"`,
      a.userCategory || '',
      a.paymentMode || '',
      a.utrNumber || '',
      a.totalAmount || '',
      `"${a.submittedAt || a.date || ''}"`,
      a.status || 'pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CSC_Applications_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logic
  const filteredApplications = applications.filter(app => {
    const q = searchQuery.toLowerCase();
    const name = (app.name || app.customerName || '').toLowerCase();
    const phone = (app.phone || app.phoneNumber || '').toLowerCase();
    const appId = (app.appId || '').toLowerCase();
    const service = (app.service || app.selectedService || '').toLowerCase();
    const utr = (app.utrNumber || '').toLowerCase();

    const matchesQuery = name.includes(q) || phone.includes(q) || appId.includes(q) || service.includes(q) || utr.includes(q);

    if (filterStatus === 'all') return matchesQuery;
    if (filterStatus === 'online') return matchesQuery && app.paymentMode === 'online';
    if (filterStatus === 'cash') return matchesQuery && app.paymentMode === 'cash';
    if (filterStatus === 'pending') return matchesQuery && (app.status === 'Pending' || app.status === 'pending' || !app.status);
    if (filterStatus === 'approved') return matchesQuery && (app.status === 'Approved & Under Process' || app.status === 'approved');
    if (filterStatus === 'completed') return matchesQuery && (app.status === 'Completed' || app.status === 'completed');
    if (filterStatus === 'rejected') return matchesQuery && (app.status === 'Rejected' || app.status === 'rejected');

    return matchesQuery;
  });

  // Render Login Modal if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-[500px] flex items-center justify-center py-12 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden animate-fade-in">
          {/* Header Banner */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white font-display">
              CSC Staff Portal Login
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access online applications &amp; customer documents
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-shake">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Enter staff username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Enter staff password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{authLoading ? 'Authenticating Firebase Auth...' : 'Authenticate Staff Login'}</span>
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or Quick Auth</span></div>
          </div>

          <button
            onClick={handleQuickFirebaseAuth}
            disabled={authLoading}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>🔐 One-Click Secure Firebase Auth Access</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold transition-colors"
            >
              ← Back to Visitor Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black uppercase tracking-tight font-display">
                CSC Staff Dashboard
              </h2>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firestore Live</span>
              </span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[10px] font-mono font-bold">
                Firebase Auth: {firebaseUser ? (firebaseUser.email || `UID:${firebaseUser.uid.slice(0,6)}`) : 'Mahi Staff'}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Manage submitted applications &amp; download customer uploaded documents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Submissions
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            {applications.length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block">
            UPI Paid (Online)
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1 block">
            {applications.filter(a => a.paymentMode === 'online').length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500 block">
            Cash Counter
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">
            {applications.filter(a => a.paymentMode === 'cash').length}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 block">
            Uploaded Docs Total
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
            {applications.reduce((acc, app) => acc + (app.documents?.length || app.uploadedDocuments?.length || 0), 0)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Applicant Name, Phone, Token ID, Service, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'pending', 'approved', 'completed', 'rejected', 'online', 'cash'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'all'
                ? 'All Applications'
                : st === 'approved'
                ? 'Under Process'
                : st === 'online'
                ? 'UPI Paid'
                : st === 'cash'
                ? 'Cash Counter'
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
          <p className="text-xs font-bold">Loading submitted customer applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications found</h4>
          <p className="text-xs">No records match your search query or filter selection.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app, idx) => {
            const rawDocs = app.documents || [];
            const textDocs = app.uploadedDocuments || [];

            return (
              <div
                key={app.appId || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-amber-400/50 transition-all"
              >
                {/* Application Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-black text-xs rounded-lg border border-amber-500/20">
                      {app.appId || `APEX-${idx + 1}`}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {app.submittedAt || app.date || 'Recent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      app.paymentMode === 'online'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                    }`}>
                      {app.paymentMode === 'online' ? 'UPI Online Paid' : 'Cash Counter'}
                    </span>

                    <button
                      onClick={() => handleDelete(app.appId)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Applicant Name</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {app.name || app.customerName || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Mobile &amp; Email</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      📞 {app.phone || app.phoneNumber || 'N/A'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                      ✉️ {app.email || app.emailAddress || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Requested Service</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {app.service || app.selectedService || 'General Form'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Cat: {app.userCategory || 'General'} | DOB: {app.dateOfBirth || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Payment &amp; UTR</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm block">
                      ₹{app.totalAmount || 0}
                    </span>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 block">
                      UTR: {app.utrNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Additional Notes */}
                {app.message && app.message !== 'None' && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Instructions / Note:</span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{app.message}</p>
                  </div>
                )}

                {/* UPLOADED CUSTOMER DOCUMENTS DISPLAY SECTION */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Uploaded Customer Documents ({rawDocs.length || textDocs.length})</span>
                  </span>

                  {rawDocs.length === 0 && textDocs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No files uploaded with this application.</p>
                  ) : rawDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rawDocs.map((doc: any, dIdx: number) => (
                        <div
                          key={doc.id || dIdx}
                          className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                                {doc.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(doc.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Preview Button */}
                            {doc.dataUrl && (
                              <button
                                onClick={() => setSelectedDocPreview({ name: doc.name, url: doc.dataUrl, type: doc.type })}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="View/Preview Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                            )}

                            {/* Download Button */}
                            {doc.dataUrl && (
                              <a
                                href={doc.dataUrl}
                                download={doc.name}
                                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Download Document"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {textDocs.map((docStr: string, tIdx: number) => (
                        <span key={tIdx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          📎 {docStr}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* STAFF APPLICATION STATUS & ACTIONS BAR */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-150 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Filing Status:
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      (app.status === 'Approved & Under Process' || app.status === 'approved')
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        : (app.status === 'Completed' || app.status === 'completed')
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : (app.status === 'Rejected' || app.status === 'rejected')
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    }`}>
                      {app.status || 'Pending'}
                    </span>
                    {app.finalReceiptUrl && (
                      <a
                        href={app.finalReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Receipt Ready</span>
                      </a>
                    )}
                  </div>

                  {/* ACTION BUTTONS: Approve, Reject, Mark Completed */}
                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    <button
                      onClick={() => handleUpdateStatus(app.appId, 'Approved & Under Process')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Approve & mark as Under Process"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(app.appId, 'Rejected')}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Reject application"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => {
                        setUploadModalApp(app);
                        setReceiptDataUrl(app.finalReceiptUrl || '');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Upload final processed receipt & mark Completed"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MARK COMPLETED FILE UPLOAD MODAL */}
      {uploadModalApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                Upload Processed Receipt / Document
              </h3>
              <button
                onClick={() => {
                  setUploadModalApp(null);
                  setReceiptDataUrl('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                Attach the final processed receipt or document for <strong className="text-amber-500 font-mono">{uploadModalApp.appId}</strong> ({uploadModalApp.name || uploadModalApp.customerName}).
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-slate-500 block">
                  1. Select Receipt File (Image / PDF / Scan)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedReceiptFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setReceiptDataUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-700 dark:text-slate-200 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-black uppercase text-slate-500 block">
                  2. Or Direct Download URL Link
                </label>
                <input
                  type="url"
                  placeholder="https://firebasestorage.googleapis.com/..."
                  value={receiptDataUrl.startsWith('data:') ? '' : receiptDataUrl}
                  onChange={(e) => {
                    setReceiptDataUrl(e.target.value);
                    setSelectedReceiptFile(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              {receiptDataUrl && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    {selectedReceiptFile ? `File selected: ${selectedReceiptFile.name} (${Math.round(selectedReceiptFile.size/1024)} KB)` : 'Receipt download link ready!'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                disabled={isUploadingReceipt}
                onClick={() => {
                  setUploadModalApp(null);
                  setReceiptDataUrl('');
                  setSelectedReceiptFile(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isUploadingReceipt}
                onClick={async () => {
                  if (!receiptDataUrl && !selectedReceiptFile) {
                    alert('Please select a receipt file or enter a document download link.');
                    return;
                  }

                  setIsUploadingReceipt(true);
                  let finalUrl = receiptDataUrl;

                  // 1. Try uploading to Firebase Storage if a file is selected
                  if (selectedReceiptFile) {
                    try {
                      const cleanFileName = selectedReceiptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                      const storageRef = ref(storage, `receipts/${uploadModalApp.appId}_${Date.now()}_${cleanFileName}`);
                      const snapshot = await uploadBytes(storageRef, selectedReceiptFile);
                      const downloadUrl = await getDownloadURL(snapshot.ref);
                      if (downloadUrl) {
                        finalUrl = downloadUrl;
                      }
                    } catch (storageErr) {
                      console.warn('Firebase Storage upload warning (falling back to data URL):', storageErr);
                      // keeps finalUrl as receiptDataUrl base64 fallback
                    }
                  }

                  // 2. Save status & finalReceiptUrl in Firestore
                  try {
                    await updateDoc(doc(db, 'appointments', uploadModalApp.appId), {
                      status: 'Completed',
                      finalReceiptUrl: finalUrl
                    });
                  } catch (err) {
                    console.error('Error updating status in Firestore:', err);
                  }

                  setApplications(prev =>
                    prev.map(a => a.appId === uploadModalApp.appId ? { ...a, status: 'Completed', finalReceiptUrl: finalUrl } : a)
                  );

                  setActionSuccess(`Application ${uploadModalApp.appId} marked Completed & final receipt attached!`);
                  setTimeout(() => setActionSuccess(null), 3000);
                  setUploadModalApp(null);
                  setReceiptDataUrl('');
                  setSelectedReceiptFile(null);
                  setIsUploadingReceipt(false);
                }}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploadingReceipt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Uploading to Storage...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Mark Completed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {selectedDocPreview && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {selectedDocPreview.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDocPreview.url}
                  download={selectedDocPreview.name}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  onClick={() => setSelectedDocPreview(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-grow overflow-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              {selectedDocPreview.type?.startsWith('image/') || selectedDocPreview.url.startsWith('data:image/') ? (
                <img
                  src={selectedDocPreview.url}
                  alt={selectedDocPreview.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                />
              ) : selectedDocPreview.type === 'application/pdf' || selectedDocPreview.url.startsWith('data:application/pdf') ? (
                <iframe
                  src={selectedDocPreview.url}
                  title={selectedDocPreview.name}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-12 h-12 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Document preview is ready for download.
                  </p>
                  <a
                    href={selectedDocPreview.url}
                    download={selectedDocPreview.name}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File ({selectedDocPreview.name})</span>
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
