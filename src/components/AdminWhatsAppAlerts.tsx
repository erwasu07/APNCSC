import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Moon,
  ShieldCheck,
  Clock,
  Loader2,
  X
} from 'lucide-react';

function getStaffAuthHeaders(includeJson = false): Record<string, string> {
  let token = '';
  try {
    token = sessionStorage.getItem('csc_admin_token') || '';
  } catch {}
  if (!token) {
    token = '';
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'x-admin-token': token
  };
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

interface AlertSettings {
  enabled: boolean;
  dailySummary: boolean;
  urgentAlerts: boolean;
  failureAlerts: boolean;
  quietHoursEnabled: boolean;
  quietStartIst: string;
  quietEndIst: string;
}

interface AlertLogItem {
  id: string;
  timestamp: string;
  type: 'summary' | 'urgent' | 'failure' | 'test' | 'rate_limit';
  provider: 'cloud_api' | 'twilio' | 'callmebot';
  recipientsMasked: string[];
  status: 'sent' | 'failed' | 'queued_quiet_hours' | 'suppressed_rate_limit';
  attempts: number;
  messagePreview: string;
  error?: string;
  responseSummary?: string;
}

interface AlertsStatusResponse {
  success: boolean;
  providerStatus: {
    provider: 'cloud_api' | 'twilio' | 'callmebot';
    configured: boolean;
    ownerPhonesCount: number;
    ownerPhonesMasked: string[];
    missingVars: string[];
  };
  settings: AlertSettings;
  dailySentCount: number;
  dailyLimit: number;
  quietHoursActive: boolean;
  queuedDuringQuietHours: {
    newDrafts: number;
    updateProposals: number;
    carefulReview: number;
    sourcesFailing: number;
    queuedAt: string;
  } | null;
  lastFailureWarning: {
    message: string;
    at: string;
    provider: string;
  } | null;
  logs: AlertLogItem[];
}

export default function AdminWhatsAppAlerts() {
  const [statusData, setStatusData] = useState<AlertsStatusResponse | null>(null);
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    dailySummary: true,
    urgentAlerts: true,
    failureAlerts: true,
    quietHoursEnabled: true,
    quietStartIst: '22:00',
    quietEndIst: '06:30'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAlertStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff/alerts/status', {
        headers: getStaffAuthHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusData(data);
        setSettings(data.settings);
      }
    } catch (e: any) {
      console.warn('[AdminWhatsAppAlerts] Load failed:', e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlertStatus();
  }, []);

  const handleSaveSettings = async (override?: AlertSettings) => {
    const nextSettings = override || settings;
    setSaving(true);
    setSaveFeedback(null);
    try {
      const res = await fetch('/api/staff/alerts/settings', {
        method: 'POST',
        headers: getStaffAuthHeaders(true),
        body: JSON.stringify(nextSettings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        setSaveFeedback({ type: 'success', text: 'WhatsApp alert settings saved.' });
        loadAlertStatus();
      } else {
        setSaveFeedback({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (e: any) {
      setSaveFeedback({ type: 'error', text: e?.message || 'Network error while saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/staff/alerts/test', {
        method: 'POST',
        headers: getStaffAuthHeaders(true)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          type: 'success',
          text: `Sent "CSC DOST alert test" via ${data.provider} (${data.responseSummary || 'delivered'}).`
        });
      } else {
        setTestResult({
          type: 'error',
          text: data.error || 'Failed to send test WhatsApp message.'
        });
      }
      loadAlertStatus();
    } catch (e: any) {
      setTestResult({
        type: 'error',
        text: e?.message || 'Request error while sending test alert.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDismissWarning = async () => {
    try {
      await fetch('/api/staff/alerts/dismiss-warning', {
        method: 'POST',
        headers: getStaffAuthHeaders(true)
      });
      loadAlertStatus();
    } catch {}
  };

  const providerLabel =
    statusData?.providerStatus.provider === 'twilio'
      ? 'Twilio WhatsApp API'
      : statusData?.providerStatus.provider === 'callmebot'
      ? 'CallMeBot WhatsApp API'
      : 'Meta WhatsApp Cloud API';

  return (
    <div className="space-y-5">
      {/* Failure Warning Banner (non-blocking) */}
      {statusData?.lastFailureWarning && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs space-y-1">
            <p className="font-bold">WhatsApp Alert Delivery Warning</p>
            <p className="text-amber-900">{statusData.lastFailureWarning.message}</p>
            <p className="text-[11px] text-amber-700">
              Monitor runs continue uninterrupted. Check your server-side provider secrets and use Send test message to verify.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissWarning}
            aria-label="Dismiss warning banner"
            className="p-1 rounded-lg hover:bg-amber-200/50 text-amber-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Overview Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#102A43]">Owner WhatsApp Alerts</h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {providerLabel}
                </span>
                {statusData?.providerStatus.configured ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Secrets Configured
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Secrets Missing ({statusData?.providerStatus.missingVars.join(', ') || 'Check env'})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Monitor summaries (7:00 AM &amp; 6:00 PM IST), urgent review alerts, and failure alerts sent strictly to owner staff numbers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAlertStatus}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#F6F8FC] hover:bg-slate-100 text-[#102A43] text-xs font-semibold border border-[#E2E8F0] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Owner Numbers</div>
            <div className="text-sm font-bold text-[#102A43] mt-1 truncate">
              {statusData?.providerStatus.ownerPhonesCount
                ? statusData.providerStatus.ownerPhonesMasked.join(', ')
                : 'Not configured'}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Daily Cap (IST)</div>
            <div className="text-lg font-black text-[#102A43] mt-0.5">
              {statusData?.dailySentCount ?? 0} / {statusData?.dailyLimit ?? 20}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Quiet Hours (IST)</div>
            <div className="text-sm font-bold text-[#102A43] mt-1">
              {settings.quietHoursEnabled
                ? statusData?.quietHoursActive
                  ? 'Active now (Holding summaries)'
                  : `${settings.quietStartIst} - ${settings.quietEndIst}`
                : 'Off'}
            </div>
          </div>

          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Held Summaries</div>
            <div className="text-sm font-bold text-[#102A43] mt-1">
              {statusData?.queuedDuringQuietHours
                ? `${statusData.queuedDuringQuietHours.newDrafts} drafts, ${statusData.queuedDuringQuietHours.updateProposals} updates queued`
                : 'None queued'}
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Test Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Alert Controls */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#175CEE]" />
              <span>Alert Preferences &amp; Quiet Hours</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-[#102A43]">
                {settings.enabled ? 'Alerts On' : 'Alerts Off'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.enabled}
                onClick={() => {
                  const updated = { ...settings, enabled: !settings.enabled };
                  setSettings(updated);
                  handleSaveSettings(updated);
                }}
                className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  settings.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailySummary}
                onChange={(e) => setSettings((s) => ({ ...s, dailySummary: e.target.checked }))}
                className="mt-0.5 accent-[#175CEE]"
              />
              <div className="text-xs">
                <div className="font-bold text-[#102A43]">Daily Monitor Summaries (7:00 AM &amp; 6:00 PM IST)</div>
                <div className="text-[11px] text-[#64748B]">
                  Sends one summary message after scheduled runs only if new drafts, updates, or issues exist.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.urgentAlerts}
                onChange={(e) => setSettings((s) => ({ ...s, urgentAlerts: e.target.checked }))}
                className="mt-0.5 accent-[#175CEE]"
              />
              <div className="text-xs">
                <div className="font-bold text-[#102A43]">Urgent Alerts (max once per hour)</div>
                <div className="text-[11px] text-[#64748B]">
                  Immediate alert when validation confidence is under 90% or a published post&apos;s official page changed.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.failureAlerts}
                onChange={(e) => setSettings((s) => ({ ...s, failureAlerts: e.target.checked }))}
                className="mt-0.5 accent-[#175CEE]"
              />
              <div className="text-xs">
                <div className="font-bold text-[#102A43]">Source &amp; Monitor Failure Alerts (max once per hour)</div>
                <div className="text-[11px] text-[#64748B]">
                  Immediate alert when an official portal fails 3 times in a row or the monitor encounters a crash.
                </div>
              </div>
            </label>
          </div>

          {/* Quiet Hours Controls */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#102A43]">
                <Moon className="w-4 h-4 text-indigo-600" />
                <span>Quiet Hours (Hold Non-Urgent Summaries)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={(e) => setSettings((s) => ({ ...s, quietHoursEnabled: e.target.checked }))}
                className="accent-[#175CEE]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Start (IST)</label>
                <input
                  type="time"
                  value={settings.quietStartIst}
                  onChange={(e) => setSettings((s) => ({ ...s, quietStartIst: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">End (IST)</label>
                <input
                  type="time"
                  value={settings.quietEndIst}
                  onChange={(e) => setSettings((s) => ({ ...s, quietEndIst: e.target.value }))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {saveFeedback && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                saveFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {saveFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{saveFeedback.text}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              disabled={saving}
              className="px-4 py-2 bg-[#175CEE] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Save Alert Settings</span>
            </button>
          </div>
        </div>

        {/* Send Test Message Box */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-[#E2E8F0]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verify Owner Delivery</span>
            </h3>
          </div>

          <p className="text-xs text-[#475569] leading-relaxed">
            Sends the plain-text verification message{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-slate-800">
              CSC DOST alert test
            </code>{' '}
            to the configured owner numbers via <strong>{providerLabel}</strong>.
          </p>

          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending test message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send test message</span>
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {testResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="break-words">{testResult.text}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong>Security Policy:</strong> Owner phone numbers, tokens, and API keys are loaded solely from server environment secrets. No applicant personal data or login details are ever included in WhatsApp alerts.
          </div>
        </div>
      </div>

      {/* Last 20 Alerts Sent Log */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span>Last 20 Alerts Sent ({statusData?.logs?.length || 0})</span>
          </h3>
          <span className="text-[11px] text-[#64748B]">Phone numbers masked in logs</span>
        </div>

        {!statusData?.logs || statusData.logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No WhatsApp alerts logged yet. Click &ldquo;Send test message&rdquo; above to test your configuration.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-2 px-3">Time (IST)</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Provider</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Recipients</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statusData.logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold uppercase">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{log.provider}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'sent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.status === 'queued_quiet_hours'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : log.status === 'suppressed_rate_limit'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-[10.5px] text-slate-500">
                      {log.recipientsMasked.length > 0 ? log.recipientsMasked.join(', ') : '-'}
                    </td>
                    <td className="py-2 px-3 max-w-xs">
                      <div className="truncate text-slate-800">{log.messagePreview}</div>
                      {log.error && <div className="text-[10.5px] text-red-600 truncate">{log.error}</div>}
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
