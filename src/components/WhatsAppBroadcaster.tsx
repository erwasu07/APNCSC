import React, { useState, useEffect } from 'react';
import { SARKARI_DATA, SarkariItem, SARKARI_CATEGORIES } from '../data/sarkariData';
import {
  MessageCircle,
  Send,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Share2,
  Radio,
  Settings,
  ShieldCheck,
  AlertCircle,
  FileText,
  Clock,
  Users,
  Link as LinkIcon,
  Trash2
} from 'lucide-react';

interface WhatsAppBroadcasterProps {
  cafeName: string;
}

export default function WhatsAppBroadcaster({ cafeName }: WhatsAppBroadcasterProps) {
  // Select notification from sarkari data
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>(
    SARKARI_DATA[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form Fields for Message Construction
  const [customTitle, setCustomTitle] = useState('');
  const [customLastDate, setCustomLastDate] = useState('');
  const [customSeats, setCustomSeats] = useState('');
  const [customSummary, setCustomSummary] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [customCategory, setCustomCategory] = useState('exam_forms');
  const [includeBannerHeader, setIncludeBannerHeader] = useState(true);

  // Group & Webhook Configuration
  const [targetGroupLink, setTargetGroupLink] = useState<string>(() => {
    return localStorage.getItem('csc_whatsapp_target_group') || '';
  });
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('csc_whatsapp_webhook_url') || '';
  });
  const [showConfig, setShowConfig] = useState(false);

  // Status & Feedback states
  const [copied, setCopied] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('csc_broadcast_history') || '[]');
    } catch {
      return [];
    }
  });

  // Load selected notification details into form
  const loadNotificationData = (item: SarkariItem) => {
    setSelectedNotificationId(item.id);
    setCustomTitle(item.title);
    setCustomCategory(item.category);
    
    // Format last date nicely with late fee if present
    const lastDateFormatted = item.lastDate
      ? `${item.lastDate}${item.feePerSubject ? ` (${item.feePerSubject})` : ''}`
      : 'Check Official Notification';
    setCustomLastDate(lastDateFormatted);

    // Format vacancies / seats
    const seatsFormatted = item.totalPosts
      ? String(item.totalPosts)
      : (item.eligibility ? item.eligibility.slice(0, 45) + '...' : 'Open for eligible candidates');
    setCustomSeats(seatsFormatted);

    setCustomSummary(item.shortInfo);
    setCustomLink(`https://www.cscdost.online/#post/${item.id}`);
  };

  // Initialize on mount with the first notification
  useEffect(() => {
    if (SARKARI_DATA.length > 0) {
      loadNotificationData(SARKARI_DATA[0]);
    }
  }, []);

  // Save config changes to localStorage
  const handleSaveConfig = () => {
    localStorage.setItem('csc_whatsapp_target_group', targetGroupLink.trim());
    localStorage.setItem('csc_whatsapp_webhook_url', webhookUrl.trim());
    setShowConfig(false);
    setBroadcastStatus({
      type: 'success',
      message: 'WhatsApp Group & Gateway settings updated successfully.'
    });
    setTimeout(() => setBroadcastStatus(null), 3000);
  };

  // Build the Exact WhatsApp Formatted Message (matching user screenshot)
  const generateFormattedMessage = (): string => {
    const postUrl = customLink.trim() || 'https://www.cscdost.online';
    
    const bannerPart = includeBannerHeader 
      ? `*CSC DOST - Independent Digital Service Portal*\nCSC DOST (cscdost.com / cscdost.online) is an independent private digital assistance portal for online form filling, exam results, and scheme updates.\nwww.cscdost.online\n\n`
      : '';

    const message = 
`${bannerPart}📢 *${customTitle.trim()}*
⏰ *Last Date:* ${customLastDate.trim() || 'Check Official Notification'}
👥 *Vacancies/Seats:* ${customSeats.trim() || 'Eligible Candidates'}

${customSummary.trim()}

👉 *Read full notification & apply at CSC DOST:*
${postUrl}
${postUrl}`;

    return message;
  };

  const currentFormattedMessage = generateFormattedMessage();

  // Copy to clipboard handler
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(currentFormattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = currentFormattedMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 1-Click Send to WhatsApp Group
  const handleOpenWhatsAppGroup = () => {
    const encoded = encodeURIComponent(currentFormattedMessage);
    
    // Save to history
    recordBroadcastHistory('WhatsApp Group (Manual/Direct)');

    // If a specific group chat link was set, navigate or open share
    if (targetGroupLink.includes('chat.whatsapp.com/')) {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  // 1-Click Send to WhatsApp Channel
  const handleOpenWhatsAppChannel = () => {
    const encoded = encodeURIComponent(currentFormattedMessage);
    recordBroadcastHistory('WhatsApp Channel Broadcast');
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Automated API / Webhook Broadcast Execution
  const handleTriggerApiBroadcast = async () => {
    setIsBroadcasting(true);
    setBroadcastStatus(null);

    try {
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle,
          category: customCategory,
          messageText: currentFormattedMessage,
          postUrl: customLink,
          targetGroup: targetGroupLink,
          webhookUrl: webhookUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastStatus({
          type: 'success',
          message: 'Broadcast triggered successfully! Logged to server and prepared for group synchronization.'
        });
        recordBroadcastHistory(`Automated API (${data.webhookStatus || 'Dispatched'})`);
      } else {
        setBroadcastStatus({
          type: 'error',
          message: data.error || 'Failed to dispatch broadcast via API.'
        });
      }
    } catch (err: any) {
      setBroadcastStatus({
        type: 'error',
        message: 'Network error communicating with broadcast API: ' + (err?.message || String(err))
      });
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setBroadcastStatus(null), 5000);
    }
  };

  // Save entry in broadcast history log
  const recordBroadcastHistory = (method: string) => {
    const newEntry = {
      id: `bc-${Date.now()}`,
      title: customTitle,
      category: customCategory,
      method,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: new Date().toLocaleDateString('en-GB')
    };
    const updated = [newEntry, ...broadcastHistory.slice(0, 19)];
    setBroadcastHistory(updated);
    try {
      localStorage.setItem('csc_broadcast_history', JSON.stringify(updated));
    } catch {}
  };

  const handleClearHistory = () => {
    setBroadcastHistory([]);
    try {
      localStorage.removeItem('csc_broadcast_history');
    } catch {}
  };

  // Filtered notifications list
  const filteredList = SARKARI_DATA.filter((item) => {
    const matchesSearch = 
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="whatsapp-broadcaster-panel">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
              1-CLICK CHANNEL &amp; GROUP BROADCAST ENGINE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
            WhatsApp Channel &amp; Community Group Sync
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
            Instantly format and broadcast new Job Openings, KU Exam Forms, and Admissions to your WhatsApp Channel and Discussion Groups simultaneously with authentic markdown formatting.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>{showConfig ? 'Hide Config' : 'Group & Webhook Setup'}</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mb-16" />
      </div>

      {/* Configuration Drawer */}
      {showConfig && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-500" />
              WhatsApp Group &amp; Webhook Gateway Settings
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Saved locally in browser</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target WhatsApp Group Link / JID:
              </label>
              <input
                type="text"
                value={targetGroupLink}
                onChange={(e) => setTargetGroupLink(e.target.value)}
                placeholder="e.g. https://chat.whatsapp.com/L123456789... or 120363...g.us"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                Your community group invite link or group JID for direct dispatch.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Optional Automated Webhook / Gateway Endpoint:
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="e.g. https://api.ultramsg.com/... or https://your-baileys-bot/send"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                If you run a local Baileys bot, UltraMsg, or Green API gateway for zero-click auto-forwarding.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Status Alert */}
      {broadcastStatus && (
        <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
          broadcastStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          {broadcastStatus.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{broadcastStatus.message}</span>
        </div>
      )}

      {/* Main 2-Column Workflow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Notification Selector & Content Customizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Selector Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1. Select Live Notification or Exam Notice
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredList.length} items available
              </span>
            </div>

            {/* Search and Category Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notification title (e.g. Kashmir University, BG 4th Sem, Army, JKSSB)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="exam_forms">KU Exam Forms</option>
                <option value="admissions">KU Admissions</option>
                <option value="jkssb">JKSSB Jobs</option>
                <option value="army_jobs">Indian Army</option>
                <option value="ssc_jobs">SSC Jobs</option>
                <option value="rrb_jobs">RRB Jobs</option>
                <option value="cluster_univ">Cluster Univ</option>
              </select>
            </div>

            {/* Scrollable list of notifications */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800/80 rounded-xl p-1.5 bg-slate-50/50 dark:bg-slate-950/40">
              {filteredList.map((item) => {
                const isSelected = item.id === selectedNotificationId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => loadNotificationData(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                        : 'hover:bg-white dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-[9px] font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                          {item.category.replace('_', ' ')}
                        </span>
                        {item.lastDate && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                            Last Date: {item.lastDate}
                          </span>
                        )}
                      </div>
                      <p className="truncate font-semibold">{item.title}</p>
                    </div>
                    {isSelected && (
                      <span className="p-1 bg-emerald-500 text-white rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Editor */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                2. Customize Broadcast Content
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBannerHeader}
                  onChange={(e) => setIncludeBannerHeader(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include CSC DOST Portal Header</span>
              </label>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Notification Title (📢)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Last Date &amp; Late Fee (⏰)
                  </label>
                  <input
                    type="text"
                    value={customLastDate}
                    onChange={(e) => setCustomLastDate(e.target.value)}
                    placeholder="e.g. 22/08/2026 (Without Late Fee) / 28/08/2026..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Vacancies / Seats / Eligibility (👥)
                  </label>
                  <input
                    type="text"
                    value={customSeats}
                    onChange={(e) => setCustomSeats(e.target.value)}
                    placeholder="e.g. 42,000+ Enrolled Students or 500 Posts"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Concise Description / Notification Summary
                </label>
                <textarea
                  rows={3}
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Direct CSC DOST Portal Link (👉)
                </label>
                <input
                  type="text"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-blue-600 dark:text-blue-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live WhatsApp Bubble Preview & Action Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Live WhatsApp Bubble Preview */}
          <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                Live WhatsApp Message Preview
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                Exact Verified Format
              </span>
            </div>

            {/* Simulated WhatsApp Chat Bubble matching user screenshot */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#E8F8F0] dark:bg-[#005c4b]/30 text-slate-900 dark:text-slate-100 text-xs sm:text-[13px] border border-emerald-300/40 dark:border-emerald-500/20 shadow-xs relative space-y-3 font-sans leading-relaxed">
              
              {/* Header card preview */}
              {includeBannerHeader && (
                <div className="p-2.5 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>CSC DOST - Independent Digital Service Portal</span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-tight">
                    CSC DOST (cscdost.com / cscdost.online) is an independent private digital assistance portal for online form filling, exam results, and scheme updates.
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 underline font-mono">
                    www.cscdost.online
                  </p>
                </div>
              )}

              {/* Title with Emoji */}
              <div className="font-extrabold text-slate-900 dark:text-white leading-snug">
                📢 {customTitle}
              </div>

              {/* Highlight Details */}
              <div className="space-y-1 text-slate-800 dark:text-slate-200">
                <p>
                  ⏰ <strong>Last Date:</strong> {customLastDate}
                </p>
                <p>
                  👥 <strong>Vacancies/Seats:</strong> {customSeats}
                </p>
              </div>

              {/* Summary Paragraph */}
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {customSummary}
              </div>

              {/* Direct Clickable Links */}
              <div className="space-y-0.5 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  👉 <span>Read full notification &amp; apply at CSC DOST:</span>
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 underline break-all font-mono text-[11px]">
                  {customLink}
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 underline break-all font-mono text-[11px]">
                  {customLink}
                </p>
              </div>

              <div className="text-right text-[10px] text-slate-400 font-mono pt-1">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2 pt-2">
              
              {/* Button 1: Copy Formatted Markdown */}
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied Formatted Markdown!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-300" />
                    <span>Copy Formatted WhatsApp Text</span>
                  </>
                )}
              </button>

              {/* Button 2: Direct 1-Click Send to WhatsApp Group */}
              <button
                type="button"
                onClick={handleOpenWhatsAppGroup}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4 text-white" />
                <span>1-Click Post to WhatsApp Community Group</span>
              </button>

              {/* Button 3: Direct 1-Click Send to WhatsApp Channel */}
              <button
                type="button"
                onClick={handleOpenWhatsAppChannel}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Radio className="w-4 h-4 text-amber-300" />
                <span>1-Click Broadcast to WhatsApp Channel</span>
              </button>

              {/* Button 4: Automated API / Webhook trigger */}
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={handleTriggerApiBroadcast}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-slate-950 animate-spin" />
                    <span>Dispatching API Broadcast...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Trigger Automated Server Broadcast API</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Broadcast History Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Broadcast Activity Log
              </span>
              {broadcastHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {broadcastHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-3">
                No recent broadcasts logged yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {broadcastHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.method} • {item.date} at {item.time}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[9px] font-bold uppercase shrink-0">
                      Dispatched
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
