import React, { useState, useEffect } from 'react';
import { SARKARI_DATA, SarkariItem } from '../data/sarkariData';
import {
  MessageCircle,
  Send,
  Copy,
  Check,
  RefreshCw,
  Search,
  Sparkles,
  Radio,
  Settings,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity
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
  const [gatewayProvider, setGatewayProvider] = useState<string>(() => {
    return localStorage.getItem('csc_whatsapp_gateway_provider') || 'generic';
  });

  // Specific Provider Helpers
  const [ultraMsgInstance, setUltraMsgInstance] = useState(() => localStorage.getItem('csc_ultramsg_instance') || '');
  const [ultraMsgToken, setUltraMsgToken] = useState(() => localStorage.getItem('csc_ultramsg_token') || '');
  const [greenApiInstance, setGreenApiInstance] = useState(() => localStorage.getItem('csc_greenapi_instance') || '');
  const [greenApiToken, setGreenApiToken] = useState(() => localStorage.getItem('csc_greenapi_token') || '');

  const [showConfig, setShowConfig] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);

  // Status & Feedback states
  const [copied, setCopied] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [broadcastStatus, setBroadcastStatus] = useState<{ 
    type: 'success' | 'error'; 
    message: string; 
    dispatchedVia?: string;
    details?: any;
  } | null>(null);

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
    
    // Format last date nicely
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

  // Initialize on mount with first notification
  useEffect(() => {
    if (SARKARI_DATA.length > 0) {
      loadNotificationData(SARKARI_DATA[0]);
    }
  }, []);

  // Compute effective webhook URL based on selected provider
  const getEffectiveWebhookUrl = () => {
    if (gatewayProvider === 'ultramsg' && ultraMsgInstance && ultraMsgToken) {
      return `https://api.ultramsg.com/${ultraMsgInstance.trim()}/messages/chat?token=${ultraMsgToken.trim()}`;
    }
    if (gatewayProvider === 'greenapi' && greenApiInstance && greenApiToken) {
      return `https://api.green-api.com/waInstance${greenApiInstance.trim()}/sendMessage/${greenApiToken.trim()}`;
    }
    return webhookUrl.trim();
  };

  // Save config changes to localStorage
  const handleSaveConfig = () => {
    const computedWebhook = getEffectiveWebhookUrl();
    localStorage.setItem('csc_whatsapp_target_group', targetGroupLink.trim());
    localStorage.setItem('csc_whatsapp_webhook_url', computedWebhook);
    localStorage.setItem('csc_whatsapp_gateway_provider', gatewayProvider);
    localStorage.setItem('csc_ultramsg_instance', ultraMsgInstance.trim());
    localStorage.setItem('csc_ultramsg_token', ultraMsgToken.trim());
    localStorage.setItem('csc_greenapi_instance', greenApiInstance.trim());
    localStorage.setItem('csc_greenapi_token', greenApiToken.trim());

    setShowConfig(false);
    setBroadcastStatus({
      type: 'success',
      message: 'WhatsApp Webhook Gateway & Group settings saved successfully!'
    });
    setTimeout(() => setBroadcastStatus(null), 4000);
  };

  // Test Webhook Connection
  const handleTestWebhookConnection = async () => {
    const activeWebhook = getEffectiveWebhookUrl();
    if (!activeWebhook) {
      setTestResult({
        success: false,
        message: 'Please provide a Webhook URL or configure UltraMsg/GreenAPI credentials first.'
      });
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: activeWebhook,
          targetGroup: targetGroupLink,
          gatewayProvider
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || `Webhook responded successfully (${data.durationMs}ms)!`,
          details: data.response
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Webhook failed to respond.',
          details: data.response
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Failed to contact webhook: ' + (err?.message || String(err))
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Build the Exact WhatsApp Formatted Message (matching verified template)
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

  // 🚀 MAIN ACTION: Fully Automated 1-Click Server & Webhook Broadcast (ZERO-CLICK: Does NOT open WhatsApp browser!)
  const handleAutoBroadcastNow = async () => {
    setIsBroadcasting(true);
    setBroadcastStatus(null);

    const activeWebhook = getEffectiveWebhookUrl();

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
          webhookUrl: activeWebhook,
          gatewayProvider
        })
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastStatus({
          type: 'success',
          message: activeWebhook 
            ? `🚀 Message successfully auto-posted via ${data.dispatchedVia || 'Webhook Gateway'}! Status: ${data.webhookStatus}`
            : '✅ Broadcast message formatted and queued on server! (To send automatically without opening WhatsApp, configure your Webhook Gateway in Setup above).',
          dispatchedVia: data.dispatchedVia,
          details: data.webhookResponse
        });
        recordBroadcastHistory(`Auto-Post (${data.webhookStatus || 'Dispatched'})`);
      } else {
        setBroadcastStatus({
          type: 'error',
          message: data.error || 'Failed to dispatch automated broadcast.'
        });
      }
    } catch (err: any) {
      setBroadcastStatus({
        type: 'error',
        message: 'Network error communicating with broadcast API: ' + (err?.message || String(err))
      });
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setBroadcastStatus(null), 8000);
    }
  };

  // Manual Fallback Link Handler (Only opens if user clicks manual fallback)
  const handleManualOpenWhatsApp = (mode: 'group' | 'channel') => {
    const encoded = encodeURIComponent(currentFormattedMessage);
    recordBroadcastHistory(`Manual Browser (${mode === 'group' ? 'Group' : 'Channel'})`);
    if (mode === 'channel') {
      window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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

  const hasConfiguredWebhook = Boolean(getEffectiveWebhookUrl() || targetGroupLink);

  return (
    <div className="space-y-6 animate-fade-in" id="whatsapp-broadcaster-panel">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-200">
              <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
              AUTOMATED 1-CLICK DISPATCH &amp; WEBHOOK ENGINE
            </span>
            {hasConfiguredWebhook && (
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold tracking-wider text-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Zero-Click Webhook Active
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
            WhatsApp Channel &amp; Group Auto-Broadcaster
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl">
            Broadcast latest KU Exam Notices, Job Updates, and Admissions directly to your WhatsApp Community Group &amp; Channel via automated Webhook gateway — without having to manually open or send in WhatsApp!
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Settings className="w-4 h-4 text-amber-300" />
            <span>{showConfig ? 'Close Setup' : 'Group & Webhook Setup'}</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mb-16" />
      </div>

      {/* Group & Webhook Configuration Drawer */}
      {showConfig && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-500" />
                Automated WhatsApp Gateway &amp; Group Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your WhatsApp Group JID/Link and Webhook Gateway (UltraMsg, GreenAPI, Evolution, Baileys or Make/Zapier) for zero-click automatic posting.
              </p>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              Saved in Browser
            </span>
          </div>

          {/* Gateway Provider Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Your Webhook Gateway Provider:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'generic', label: 'Custom Webhook / Baileys' },
                { id: 'ultramsg', label: 'UltraMsg Gateway' },
                { id: 'greenapi', label: 'Green API Gateway' },
                { id: 'evolution', label: 'Evolution API' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setGatewayProvider(p.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    gatewayProvider === p.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Group Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target WhatsApp Group ID / JID or Link:
              </label>
              <input
                type="text"
                value={targetGroupLink}
                onChange={(e) => setTargetGroupLink(e.target.value)}
                placeholder="e.g. 120363123456789@g.us or https://chat.whatsapp.com/..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400">
                The WhatsApp Group JID (e.g. <code>120363xxx@g.us</code>) or Group Invite URL.
              </p>
            </div>

            {/* Provider specific inputs */}
            {gatewayProvider === 'ultramsg' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      UltraMsg Instance ID:
                    </label>
                    <input
                      type="text"
                      value={ultraMsgInstance}
                      onChange={(e) => setUltraMsgInstance(e.target.value)}
                      placeholder="instance12345"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      UltraMsg Token:
                    </label>
                    <input
                      type="password"
                      value={ultraMsgToken}
                      onChange={(e) => setUltraMsgToken(e.target.value)}
                      placeholder="Token"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  UltraMsg automatically sends zero-click broadcasts to your group!
                </p>
              </div>
            ) : gatewayProvider === 'greenapi' ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Green API Instance ID:
                    </label>
                    <input
                      type="text"
                      value={greenApiInstance}
                      onChange={(e) => setGreenApiInstance(e.target.value)}
                      placeholder="110182xxxx"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Green API Token:
                    </label>
                    <input
                      type="password"
                      value={greenApiToken}
                      onChange={(e) => setGreenApiToken(e.target.value)}
                      placeholder="API Token"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Green API automatically dispatches messages straight to your group.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Webhook / Gateway Endpoint URL:
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.ultramsg.com/... or https://your-baileys-bot/send"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400">
                  Endpoint for your Baileys bot, Zapier, Make, n8n, or WhatsApp Gateway.
                </p>
              </div>
            )}
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-fade-in ${
              testResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/70 border border-red-300 text-red-800 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isTestingWebhook}
              onClick={handleTestWebhookConnection}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isTestingWebhook ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span>Test Webhook Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Broadcast Status Alert */}
      {broadcastStatus && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-3 animate-fade-in shadow-md ${
          broadcastStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-200'
        }`}>
          {broadcastStatus.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-extrabold text-sm">{broadcastStatus.message}</p>
            {broadcastStatus.dispatchedVia && (
              <p className="text-[11px] font-mono opacity-80">
                Routed via: {broadcastStatus.dispatchedVia} • No manual browser clicks needed!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Notification Selector & Form Editor (7 Cols) */}
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
                  placeholder="Search notification title (e.g. B.Ed, BG 4th Sem, Army, JKSSB)..."
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

            {/* Scrollable list */}
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800/80 rounded-xl p-1.5 bg-slate-50/50 dark:bg-slate-950/40">
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
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
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
                2. Customize Announcement Content
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBannerHeader}
                  onChange={(e) => setIncludeBannerHeader(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Include Portal Header</span>
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
                    Last Date (⏰)
                  </label>
                  <input
                    type="text"
                    value={customLastDate}
                    onChange={(e) => setCustomLastDate(e.target.value)}
                    placeholder="e.g. 03/09/2026"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                    Vacancies / Seats (👥)
                  </label>
                  <input
                    type="text"
                    value={customSeats}
                    onChange={(e) => setCustomSeats(e.target.value)}
                    placeholder="e.g. B.Ed Examination Desk"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Concise Description
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
                  Direct Post URL (👉)
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

        {/* Right Column: Live WhatsApp Bubble Preview & Zero-Click Action Controls (5 Cols) */}
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

            {/* Simulated WhatsApp Chat Bubble matching verified screenshot */}
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

            {/* ACTION CONTROLS */}
            <div className="space-y-2.5 pt-2">
              
              {/* 🌟 PRIMARY HERO BUTTON: AUTO-POST DIRECTLY (ZERO-CLICK, NO WHATSAPP TAB POPUP) */}
              <button
                type="button"
                disabled={isBroadcasting}
                onClick={handleAutoBroadcastNow}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                    <span>Auto-Posting to Group &amp; Channel...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 text-amber-300" />
                    <span>⚡ Auto-Post to Group &amp; Channel (Instant Zero-Click)</span>
                  </>
                )}
              </button>

              {/* Copy Markdown Button */}
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

              {/* Collapsible Manual Fallback Section */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white/60 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => setShowManualFallback(!showManualFallback)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                    Manual WhatsApp Web / App Links (Fallback)
                  </span>
                  {showManualFallback ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showManualFallback && (
                  <div className="grid grid-cols-2 gap-2 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => handleManualOpenWhatsApp('group')}
                      className="py-2 px-2.5 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-300 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer"
                    >
                      Open in WhatsApp Group
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualOpenWhatsApp('channel')}
                      className="py-2 px-2.5 bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 text-blue-900 dark:text-blue-300 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer"
                    >
                      Open in WhatsApp Web
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Broadcast History Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Automated Broadcast Log
              </span>
              {broadcastHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {broadcastHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-3">
                No broadcasts dispatched yet.
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
