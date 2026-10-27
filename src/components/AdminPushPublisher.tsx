import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Sliders,
  ShieldCheck,
  ExternalLink,
  History,
  Radio,
  Loader2,
  Check,
  X,
  FileText
} from 'lucide-react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import { getExistingPushSubscription, subscribeToWebPush } from '../utils/webPushClient';

export default function AdminPushPublisher() {
  const [posts, setPosts] = useState<SarkariItem[]>(() => [...SARKARI_DATA]);
  const [selectedPostId, setSelectedPostId] = useState<string>(SARKARI_DATA[0]?.id || '');
  const [postSearch, setPostSearch] = useState('');

  // Form fields
  const [notificationTitle, setNotificationTitle] = useState('CSC DOST | New Job Alert 🔔');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationCategory, setNotificationCategory] = useState<'all' | 'jobs' | 'schemes' | 'exams' | 'updates'>('jobs');
  const [notificationUrl, setNotificationUrl] = useState('https://www.cscdost.com');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Server stats & settings
  const [subscriberStats, setSubscriberStats] = useState<{
    activeSubscribers: number;
    categories: { all: number; jobs: number; schemes: number; exams: number; updates: number };
    settings: { autoPublishPush: boolean; welcomePushEnabled: boolean };
    recentCount: number;
  } | null>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    type: 'success' | 'error';
    message: string;
    stats?: { totalTargeted: number; accepted: number; failed: number; expiredCleaned: number };
  } | null>(null);

  // Self subscription for testing
  const [adminEndpoint, setAdminEndpoint] = useState<string | null>(null);
  const [subscribingAdmin, setSubscribingAdmin] = useState(false);

  // Load server push status and history
  const loadPushData = async () => {
    setLoadingStats(true);
    try {
      const [statusRes, histRes, customPostsRes] = await Promise.all([
        fetch('/api/push/status'),
        fetch('/api/push/history'),
        fetch('/api/thumbnails/map')
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        if (sData.success) {
          setSubscriberStats(sData);
        }
      }

      if (histRes.ok) {
        const hData = await histRes.json();
        if (hData.success && Array.isArray(hData.history)) {
          setHistory(hData.history);
        }
      }

      if (customPostsRes.ok) {
        const cData = await customPostsRes.json();
        if (cData.success && Array.isArray(cData.customPosts)) {
          // Merge custom posts
          const map = new Map<string, SarkariItem>();
          SARKARI_DATA.forEach(p => map.set(p.id, p));
          cData.customPosts.forEach((p: SarkariItem) => map.set(p.id, p));
          setPosts(Array.from(map.values()));
        }
      }
    } catch (e) {
      console.warn('[AdminPush] Failed to load server status:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Check if admin browser already has an active push subscription
  const checkAdminSubscription = async () => {
    try {
      const sub = await getExistingPushSubscription();
      if (sub) {
        setAdminEndpoint(sub.endpoint);
      }
    } catch {}
  };

  useEffect(() => {
    loadPushData();
    checkAdminSubscription();
  }, []);

  // Update form when a post is selected
  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isJob = post.category !== 'exam_forms' && post.category !== 'admissions';
    const categoryType = post.category === 'exam_forms' ? 'exams' : post.category === 'admissions' ? 'exams' : 'jobs';

    setNotificationTitle(`CSC DOST | ${isJob ? 'New Job Alert' : 'New Update'} 🔔`);
    setNotificationCategory(categoryType);
    setNotificationUrl(`https://www.cscdost.com/#post/${post.id}`);
    setThumbnailUrl(post.thumbnailUrl || `/api/thumbnails/post/${post.id}.png`);

    const vacancies = post.totalPosts ? `👥 ${post.totalPosts}` : '';
    const lastDate = post.lastDate ? `📅 Last Date: ${post.lastDate}` : '';
    const eligibility = post.eligibility ? `🎓 ${post.eligibility.slice(0, 35)}` : '';

    const summaryParts = [post.title, [vacancies, eligibility, lastDate].filter(Boolean).join(' | '), 'Tap to view full notification.'].filter(Boolean);
    setNotificationBody(summaryParts.join('\n'));
  };

  // Auto-populate with first post on mount
  useEffect(() => {
    if (posts.length > 0 && !notificationBody) {
      handleSelectPost(posts[0].id);
    }
  }, [posts]);

  // Toggle auto-publish setting
  const handleToggleAutoPublish = async () => {
    if (!subscriberStats) return;
    const current = subscriberStats.settings.autoPublishPush;
    try {
      const res = await fetch('/api/push/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoPublishPush: !current })
      });
      const data = await res.json();
      if (data.success) {
        setSubscriberStats(prev => prev ? {
          ...prev,
          settings: { ...prev.settings, autoPublishPush: !current }
        } : null);
      }
    } catch (e: any) {
      alert('Failed to update push setting: ' + e.message);
    }
  };

  // Subscribe admin browser for testing
  const handleSubscribeAdminDevice = async () => {
    setSubscribingAdmin(true);
    try {
      const res = await subscribeToWebPush({ jobs: true, schemes: true, exams: true, updates: true }, { sendWelcome: true });
      if (res.success) {
        setAdminEndpoint(res.subscription.endpoint);
        loadPushData();
        alert('This device is now subscribed for test notifications!');
      }
    } catch (e: any) {
      alert('Could not subscribe this device: ' + e.message);
    } finally {
      setSubscribingAdmin(false);
    }
  };

  // Send single test notification
  const handleSendTestPush = async () => {
    if (!adminEndpoint) {
      alert('Please click "Subscribe This Device as Test Receiver" first so the server knows where to deliver your test alert.');
      return;
    }

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: adminEndpoint,
          title: notificationTitle,
          body: notificationBody,
          url: notificationUrl,
          postId: selectedPostId,
          image: thumbnailUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          type: 'success',
          message: 'Test notification accepted by push service! Your browser/device will display the alert shortly.',
          stats: data.stats
        });
        loadPushData();
      } else {
        setSendResult({
          type: 'error',
          message: data.error || 'Failed to send test push notification.'
        });
      }
    } catch (e: any) {
      setSendResult({
        type: 'error',
        message: e?.message || 'Network error while dispatching test push.'
      });
    } finally {
      setSending(false);
    }
  };

  // Broadcast to all active subscribers
  const handleBroadcastPush = async () => {
    const totalTarget = subscriberStats?.categories[notificationCategory] || subscriberStats?.activeSubscribers || 0;

    if (totalTarget === 0) {
      if (!confirm('No active subscribers found in this category. Send anyway to register the notification?')) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to broadcast this Web Push Notification to ${totalTarget} active subscriber(s)?`)) {
        return;
      }
    }

    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationBody,
          category: notificationCategory,
          url: notificationUrl,
          postId: selectedPostId,
          image: thumbnailUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          type: 'success',
          message: `Broadcast complete: ${data.stats.accepted} accepted by push services.`,
          stats: data.stats
        });
        loadPushData();
      } else {
        setSendResult({
          type: 'error',
          message: data.error || 'Failed to dispatch broadcast.'
        });
      }
    } catch (e: any) {
      setSendResult({
        type: 'error',
        message: e?.message || 'Network error during broadcast.'
      });
    } finally {
      setSending(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (!postSearch.trim()) return true;
    const q = postSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER & LIVE SUBSCRIBER METRICS                              */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#175CEE] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#102A43]">
                  Web Push Notification Console
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-50 text-[#175CEE] border border-blue-200">
                  VAPID Active
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  End-to-End Delivery
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Send real browser notifications to Android, Desktop, and installed iPhone web app subscribers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPushData}
              disabled={loadingStats}
              className="px-3 py-1.5 rounded-xl bg-[#F6F8FC] hover:bg-slate-100 text-[#102A43] text-xs font-semibold border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E2E8F0]">
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Total Subscribers</span>
            </div>
            <div className="text-xl font-black text-[#102A43] mt-1">
              {subscriberStats?.activeSubscribers || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active push endpoints</div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Jobs Category</span>
            </div>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {subscriberStats?.categories?.jobs || 0}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Recruitment subscribers</div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-600" />
              <span>Broadcasts Sent</span>
            </div>
            <div className="text-xl font-black text-purple-600 mt-1">
              {history.length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Logged notifications</div>
          </div>

          {/* Auto-publish toggle card */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#175CEE]">Auto-Publish on Save</span>
              <button
                type="button"
                onClick={handleToggleAutoPublish}
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  subscriberStats?.settings?.autoPublishPush ? 'bg-[#175CEE]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                    subscriberStats?.settings?.autoPublishPush ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-[10.5px] text-[#475569] mt-1">
              Status: <strong className="font-bold">{subscriberStats?.settings?.autoPublishPush ? 'ACTIVE (Sends automatically)' : 'OFF (Manual send only)'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {sendResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in ${
            sendResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {sendResult.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-bold">{sendResult.message}</p>
            {sendResult.stats && (
              <p className="mt-1 text-[11px] opacity-80">
                Push Service Acceptance: {sendResult.stats.accepted} accepted • {sendResult.stats.failed} failed • {sendResult.stats.expiredCleaned} cleaned
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSendResult(null)}
            className="p-1 hover:bg-black/5 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. NOTIFICATION COMPOSER (LEFT) + REALTIME DEVICE PREVIEW (RIGHT)     */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COMPOSER FORM (7 COLS) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#175CEE]" />
              <span>Compose Web Push Notification</span>
            </h3>
            <span className="text-[11px] text-[#64748B]">Payload format: Web Push VAPID</span>
          </div>

          {/* Quick Select from Published Posts */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#102A43]">
              1. Choose Published Post to Auto-Fill
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={postSearch}
                  onChange={e => setPostSearch(e.target.value)}
                  placeholder="Filter published posts by title..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#102A43] focus:outline-none focus:border-[#175CEE]"
                />
              </div>
            </div>
            <select
              value={selectedPostId}
              onChange={e => handleSelectPost(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#175CEE] cursor-pointer"
            >
              {filteredPosts.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.category.toUpperCase()}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Notification Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#102A43]">
              2. Notification Title *
            </label>
            <input
              type="text"
              value={notificationTitle}
              onChange={e => setNotificationTitle(e.target.value)}
              placeholder="e.g. CSC DOST | New Job Alert 🔔"
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#102A43] focus:outline-none focus:border-[#175CEE]"
            />
          </div>

          {/* Target Category */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#102A43]">
              3. Subscriber Audience Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'jobs', label: 'Jobs' },
                { id: 'schemes', label: 'Schemes' },
                { id: 'exams', label: 'Exams' },
                { id: 'updates', label: 'Updates' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNotificationCategory(cat.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                    notificationCategory === cat.id
                      ? 'bg-[#175CEE] text-white border-[#175CEE]'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Body / Message */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#102A43]">
              4. Notification Message Body (Multi-line supported) *
            </label>
            <textarea
              rows={4}
              value={notificationBody}
              onChange={e => setNotificationBody(e.target.value)}
              placeholder="Notification summary, vacancies, qualifications, and deadlines..."
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#102A43] focus:outline-none focus:border-[#175CEE] font-sans"
            />
          </div>

          {/* Target URL */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#102A43]">
              5. Click Destination Link (URL opened when tapped)
            </label>
            <input
              type="text"
              value={notificationUrl}
              onChange={e => setNotificationUrl(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#175CEE]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {/* Test Send Button */}
            <button
              type="button"
              onClick={handleSendTestPush}
              disabled={sending}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5 text-blue-600" />}
              <span>Send Test to This Device</span>
            </button>

            {/* Broadcast Button */}
            <button
              type="button"
              onClick={handleBroadcastPush}
              disabled={sending}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-[#175CEE] hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Broadcasting Web Push...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast to {subscriberStats?.categories[notificationCategory] || 0} Subscribers</span>
                </>
              )}
            </button>
          </div>

          {/* Admin Device Test Helper */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
            <span>
              Device Test Endpoint: {adminEndpoint ? '✅ Connected' : '⚠️ Not Subscribed Yet'}
            </span>
            {!adminEndpoint && (
              <button
                type="button"
                onClick={handleSubscribeAdminDevice}
                disabled={subscribingAdmin}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {subscribingAdmin ? 'Subscribing...' : 'Subscribe This Device'}
              </button>
            )}
          </div>
        </div>

        {/* REALTIME DEVICE PREVIEW CARD (5 COLS) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Subscriber Screen Preview</span>
            </h3>
            <span className="text-[10.5px] font-mono text-slate-400">Android / Chrome / iOS PWA</span>
          </div>

          {/* Mock Mobile Notification Card */}
          <div className="w-full max-w-sm mx-auto bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-700/60 font-sans space-y-2">
            {/* Header row */}
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <img
                  src="/csc-dost-header-logo.png"
                  alt="App Icon"
                  className="w-4 h-4 rounded-full object-contain bg-white"
                />
                <span className="font-semibold text-white">CSC DOST</span>
                <span className="text-slate-400">• now</span>
              </div>
              <span className="text-[10px] text-blue-400 font-bold uppercase">
                {notificationCategory}
              </span>
            </div>

            {/* Notification Title & Body */}
            <div>
              <h4 className="text-xs font-bold text-white leading-snug">
                {notificationTitle || 'CSC DOST | New Alert 🔔'}
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap line-clamp-4">
                {notificationBody || 'Notification details will appear here as you type...'}
              </p>
            </div>

            {/* Optional Thumbnail Banner */}
            {thumbnailUrl && (
              <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 mt-2" style={{ aspectRatio: '2048 / 677' }}>
                <img
                  src={thumbnailUrl}
                  alt="Notification Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tap Action Helper */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Tap to open post</span>
              <span className="text-blue-400 font-mono">cscdost.com</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
            <strong>Important Web Push Rule:</strong> Push services (Google FCM, Mozilla Autopush, Apple WebPush) accept the message asynchronously. The recipient device wakes up and executes <code>/sw.js</code> to render this exact notification.
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. BROADCAST HISTORY TABLE                                           */}
      {/* ==================================================================== */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Recent Push Delivery Log ({history.length})</span>
          </h3>
          <span className="text-[11px] text-[#64748B]">Real-time acceptance statistics</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No push notifications sent yet. Use the composer above to dispatch your first test or live alert.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Title &amp; Message</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Targeted</th>
                  <th className="py-2.5 px-3">Accepted</th>
                  <th className="py-2.5 px-3">Failed/Expired</th>
                  <th className="py-2.5 px-3">Sent Time</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.body}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {item.category || 'all'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.stats?.totalTargeted || 0}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">
                      {item.stats?.accepted || 0}
                    </td>
                    <td className="py-2.5 px-3 text-red-600">
                      {item.stats?.failed || 0}
                      {item.stats?.expiredCleaned ? ` (${item.stats.expiredCleaned} cleaned)` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[10.5px]">
                      {new Date(item.sentAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      {item.isTest ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Targeted Test
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Broadcast
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
