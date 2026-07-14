import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, LayoutDashboard, Send, Calendar, Megaphone, Image as ImageIcon, 
  Settings as SettingsIcon, LogOut, Download, Upload, CheckCircle2, RefreshCw, Trash2, Edit2, Plus, Save
} from 'lucide-react';
import { ContactRequest, Appointment, Announcement, GalleryItem, WebsiteSettings, AnalyticsStats } from '../types';

interface AdminDashboardProps {
  onSettingsUpdate: () => void;
  cafeName: string;
}

export default function AdminDashboard({ onSettingsUpdate, cafeName }: AdminDashboardProps) {
  // Login State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'appointments' | 'announcements' | 'gallery' | 'settings' | 'backup'>('overview');

  // Server Data
  const [dashboardData, setDashboardData] = useState<{
    settings: WebsiteSettings;
    announcements: Announcement[];
    gallery: GalleryItem[];
    contactRequests: ContactRequest[];
    appointments: Appointment[];
    stats: AnalyticsStats;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for creating/editing
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'info' as Announcement['type'], active: true });
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [newGal, setNewGal] = useState({ title: '', category: 'interior' as GalleryItem['category'], url: '', description: '' });
  const [configSettings, setConfigSettings] = useState<WebsiteSettings | null>(null);

  // Load Admin Data
  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
        setConfigSettings(data.settings);
        setLoginError('');
      } else {
        // Token might have expired or been revoked
        handleLogout();
        setLoginError('Session expired. Please log in again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
      } else {
        setLoginError(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      setLoginError('Unable to reach auth server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setDashboardData(null);
  };

  const triggerFeedback = (type: 'success' | 'error', text: string) => {
    setActionFeedback({ type, text });
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Status updates for Contact Requests
  const handleUpdateQueryStatus = async (id: string, status: ContactRequest['status']) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerFeedback('success', 'Contact request status updated.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to update query.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Request
  const handleDeleteQuery = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this contact request?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerFeedback('success', 'Contact query removed.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to delete query.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Status updates for Appointments
  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerFeedback('success', 'Appointment status updated.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to update appointment.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this appointment?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerFeedback('success', 'Appointment deleted.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to delete appointment.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save Settings Config
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configSettings) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configSettings)
      });
      if (res.ok) {
        triggerFeedback('success', 'Kiosk parameters updated on live server!');
        onSettingsUpdate();
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to save parameters.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Announcement
  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAnn)
      });
      if (res.ok) {
        triggerFeedback('success', 'Announcement created successfully!');
        setNewAnn({ title: '', content: '', type: 'info', active: true });
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to create announcement.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle/Update Announcement Active state
  const handleToggleAnnouncementActive = async (id: string, currentActive: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        triggerFeedback('success', 'Announcement state toggled.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to toggle.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerFeedback('success', 'Announcement deleted.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to delete.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Gallery photo
  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGal)
      });
      if (res.ok) {
        triggerFeedback('success', 'Gallery item added.');
        setNewGal({ title: '', category: 'interior', url: '', description: '' });
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to upload gallery.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Gallery photo
  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerFeedback('success', 'Gallery item deleted.');
        fetchDashboardData();
      } else {
        triggerFeedback('error', 'Failed to delete photo.');
      }
    } catch (err) {
      triggerFeedback('error', 'Connection error.');
    } finally {
      setActionLoading(false);
    }
  };

  // Backup downloader
  const handleBackup = () => {
    window.open(`/api/admin/backup?token=${token}`, '_blank');
  };

  // Restore DB
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        setActionLoading(true);
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(parsed)
        });
        if (res.ok) {
          triggerFeedback('success', 'JSON database successfully restored!');
          onSettingsUpdate();
          fetchDashboardData();
        } else {
          triggerFeedback('error', 'Invalid database structure.');
        }
      } catch (err) {
        triggerFeedback('error', 'Failed to read JSON backup.');
      } finally {
        setActionLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Loading indicator for main screen
  if (loading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <h3 className="font-bold text-slate-700 dark:text-slate-300">Synchronizing database files...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching records securely from cyber-cafe server.</p>
      </div>
    );
  }

  // Login view if unauthenticated
  if (!token || !dashboardData) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-blue-950 dark:text-white tracking-tight font-display">Administrator Desk Login</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Authorized access only. Use your security credentials.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-semibold mb-4 text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="Enter admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:border-blue-500 focus:bg-white text-slate-850 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-400 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm outline-none focus:border-blue-500 focus:bg-white text-slate-850 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-blue-100 dark:shadow-none"
            >
              Sign In to Desk
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-6">
            💡 Tip: Default server username is <b>admin</b> and password is <b>admin123</b>.
          </p>
        </div>
      </div>
    );
  }

  // Render variables
  const { stats, contactRequests, appointments, announcements, gallery } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      
      {/* Admin Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-blue-950 dark:text-white font-display">Administrator Desk Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Logged in as Administrator | Managing live database files.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/35 dark:text-rose-450 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Lock Desk
          </button>
        </div>
      </div>

      {/* Live action feedback indicator */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold mb-6 animate-fade-in ${
          actionFeedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400'
        }`}>
          {actionFeedback.text}
        </div>
      )}

      {/* Main Admin layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Sidebar */}
        <div className="lg:col-span-3 space-y-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 block mb-2">Management Tools</span>
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Analytics Dashboard
          </button>

          <button
            onClick={() => setActiveTab('queries')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition-all ${
              activeTab === 'queries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Send className="w-4 h-4" />
              Contact Requests
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
              {contactRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-2.5 transition-all ${
              activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              Appointments
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'announcements' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Live Announcements
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Kiosk Photo Gallery
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Portal Web Settings
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`w-full p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'backup' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 hover:bg-slate-50'
            }`}
          >
            <Download className="w-4 h-4" />
            DB Backup &amp; Restore
          </button>
        </div>

        {/* Right Column Content Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm min-h-[500px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Kiosk Performance Overview</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Total Page Views</span>
                  <span className="block text-2xl font-extrabold text-blue-600 mt-1">{stats.views}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Total Enquiries</span>
                  <span className="block text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.contactRequestsCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Pending Appointments</span>
                  <span className="block text-2xl font-extrabold text-orange-500 mt-1">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/50">
                  <span className="text-slate-400 text-[10px] font-extrabold uppercase">Completed Tasks</span>
                  <span className="block text-2xl font-extrabold text-emerald-600 mt-1">{stats.completedRequestsCount}</span>
                </div>
              </div>

              {/* Service distribution bento panel */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Service Distribution Demand Tracker</h4>
                {Object.keys(stats.serviceDistribution).length > 0 ? (
                  <div className="space-y-2.5">
                    {Object.entries(stats.serviceDistribution).map(([serviceName, count]) => (
                      <div key={serviceName} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-800/20 border border-slate-100 rounded-xl">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{serviceName}</span>
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-extrabold rounded-full">
                          {count} queries
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No request data has been logged to generate metric distribution.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QUERIES */}
          {activeTab === 'queries' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Contact Enquiry Submissions</h3>
              {contactRequests.length > 0 ? (
                <div className="space-y-4">
                  {contactRequests.map((req) => (
                    <div key={req.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">{req.email} | {req.phone}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {req.status}
                          </span>
                          <span className="text-[9px] text-slate-450">{new Date(req.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl">
                        <span className="text-[9px] font-extrabold text-blue-600 uppercase">Queried: {req.service}</span>
                        <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 leading-relaxed">{req.message}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            onClick={() => handleUpdateQueryStatus(req.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white text-[10px] font-extrabold rounded-lg transition-all"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => handleUpdateQueryStatus(req.id, 'in_progress')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white text-[10px] font-extrabold rounded-lg transition-all"
                          >
                            Work On
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteQuery(req.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete enquiry record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-450 italic">No general queries filed in database yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Desk Slot Reservations</h3>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{apt.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-0.5">{apt.phone} | {apt.email}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            apt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                            apt.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                            apt.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>

                      {/* Date details row */}
                      <div className="flex gap-4 p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs font-semibold text-blue-950 dark:text-blue-300">
                        <span>📅 Slot Date: {apt.appointmentDate}</span>
                        <span>⏰ Hour window: {apt.appointmentTime}</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl">
                        <span className="text-[9px] font-extrabold text-blue-600 uppercase">Assistance: {apt.service}</span>
                        {apt.message && <p className="text-xs text-slate-600 dark:text-slate-350 mt-1 italic font-medium leading-relaxed">"{apt.message}"</p>}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-150">
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'approved')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-[10px] font-extrabold rounded-lg transition-all"
                          >
                            Approve Slot
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'completed')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white text-[10px] font-extrabold rounded-lg transition-all"
                          >
                            Mark Visited
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[10px] font-extrabold rounded-lg transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                        <button
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-450 italic">No desk reservations present in databases.</p>
              )}
            </div>
          )}

          {/* TAB 4: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Live Bulletins Editor</h3>
              
              {/* Form creation */}
              <form onSubmit={handleAddAnnouncement} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Create New Notice</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Notice Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., PAN Card biometric open"
                      value={newAnn.title}
                      onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Severity Type</label>
                    <select
                      value={newAnn.type}
                      onChange={e => setNewAnn({ ...newAnn, type: e.target.value as Announcement['type'] })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white font-semibold"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Orange)</option>
                      <option value="error">Error (Red)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Content Explanation</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter short description details of the announcement..."
                    value={newAnn.content}
                    onChange={e => setNewAnn({ ...newAnn, content: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Publish Bulletin
                </button>
              </form>

              {/* Announcements list */}
              <div className="pt-4 border-t space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">Current Active Bulletins</span>
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 border rounded-xl flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          ann.type === 'warning' ? 'bg-orange-500' :
                          ann.type === 'success' ? 'bg-emerald-500' :
                          ann.type === 'error' ? 'bg-rose-500' :
                          'bg-blue-500'
                        }`} />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-905 dark:text-white">{ann.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ann.content}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAnnouncementActive(ann.id, ann.active)}
                        className={`px-2 py-1 text-[9px] font-extrabold rounded-md uppercase ${
                          ann.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {ann.active ? 'Live' : 'Hidden'}
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Kiosk Photo Album CRUD</h3>
              
              {/* Form creation */}
              <form onSubmit={handleAddGallery} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Add Photo Item</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Photo Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Printing Desk Setup"
                      value={newGal.title}
                      onChange={e => setNewGal({ ...newGal, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Album Category</label>
                    <select
                      value={newGal.category}
                      onChange={e => setNewGal({ ...newGal, category: e.target.value as GalleryItem['category'] })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white font-semibold"
                    >
                      <option value="interior">Cyber Cafe Interior</option>
                      <option value="banking">SBI CSP Banking Counter</option>
                      <option value="printing">Color Printing &amp; Scanning Area</option>
                      <option value="services">Customer Desk / Helpdesk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-xxx"
                    value={newGal.url}
                    onChange={e => setNewGal({ ...newGal, url: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1.5">Short Captions / Description</label>
                  <input
                    type="text"
                    placeholder="Enter short description explaining the hardware or service..."
                    value={newGal.description}
                    onChange={e => setNewGal({ ...newGal, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Save Photo
                </button>
              </form>

              {/* Photo grid list */}
              <div className="pt-4 border-t">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">Live Album Photos</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map(item => (
                    <div key={item.id} className="border rounded-xl overflow-hidden relative group bg-slate-50">
                      <img src={item.url} alt={item.title} className="w-full h-24 object-cover" />
                      <div className="p-2 bg-white dark:bg-slate-900">
                        <h4 className="font-bold text-xs truncate">{item.title}</h4>
                        <span className="text-[8px] text-slate-450 uppercase font-bold">{item.category}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && configSettings && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Portal Parameters Configuration</h3>
              
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Cyber Cafe Brand Name</label>
                    <input
                      type="text"
                      required
                      value={configSettings.cafeName}
                      onChange={e => setConfigSettings({ ...configSettings, cafeName: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Support Telephone Number</label>
                    <input
                      type="text"
                      required
                      value={configSettings.phone}
                      onChange={e => setConfigSettings({ ...configSettings, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">WhatsApp Chat Support Number</label>
                    <input
                      type="text"
                      required
                      value={configSettings.whatsapp}
                      onChange={e => setConfigSettings({ ...configSettings, whatsapp: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Official Kiosk Email</label>
                    <input
                      type="email"
                      required
                      value={configSettings.email}
                      onChange={e => setConfigSettings({ ...configSettings, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Kiosk Physical Address</label>
                  <input
                    type="text"
                    required
                    value={configSettings.address}
                    onChange={e => setConfigSettings({ ...configSettings, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Office Operational Timings</label>
                    <input
                      type="text"
                      required
                      value={configSettings.officeHours}
                      onChange={e => setConfigSettings({ ...configSettings, officeHours: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Google Maps Embed link (iframe src)</label>
                    <input
                      type="text"
                      required
                      value={configSettings.googleMapsEmbed}
                      onChange={e => setConfigSettings({ ...configSettings, googleMapsEmbed: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs text-slate-850 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">SEO &amp; Metadata Parameters</span>
                  
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">SEO Title Tag</label>
                    <input
                      type="text"
                      required
                      value={configSettings.seoTitle}
                      onChange={e => setConfigSettings({ ...configSettings, seoTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">SEO Description Meta</label>
                    <textarea
                      rows={2}
                      required
                      value={configSettings.seoDescription}
                      onChange={e => setConfigSettings({ ...configSettings, seoDescription: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs sm:text-sm text-slate-850 dark:text-white"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-100 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Apply Parameters Live
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">System Backup &amp; Recovery Management</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Backup */}
                <div className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Export JSON Database Backup</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                      Download a full copy of settings, announcements, gallery, contact queries, and appointments to your local system as a `.json` file.
                    </p>
                  </div>
                  <button
                    onClick={handleBackup}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Backup File
                  </button>
                </div>

                {/* Restore */}
                <div className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Import / Restore JSON Database</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                      Upload a previously exported `.json` backup file to overwrite current database configurations instantly.
                    </p>
                  </div>
                  <label className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center select-none">
                    <Upload className="w-4 h-4" />
                    Upload Backup JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
