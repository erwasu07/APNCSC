import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileCheck2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Loader2,
  BellOff
} from 'lucide-react';
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getBrowserPermission,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  DEFAULT_PUSH_PREFERENCES,
  PushPreferences
} from '../utils/webPushClient';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIOSGuide?: () => void;
}

export default function NotificationPreferencesModal({
  isOpen,
  onClose,
  onOpenIOSGuide
}: NotificationPreferencesModalProps) {
  const [preferences, setPreferences] = useState<PushPreferences>(() => {
    try {
      const saved = localStorage.getItem('csc_push_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PUSH_PREFERENCES;
    } catch {
      return DEFAULT_PUSH_PREFERENCES;
    }
  });

  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStatusMsg(null);
    const perm = getBrowserPermission();
    setPermission(perm);
    const status = localStorage.getItem('csc_push_notification_status');
    setIsSubscribed(status === 'subscribed' && perm === 'granted');
  }, [isOpen]);

  const handleTogglePreference = (key: keyof PushPreferences) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('csc_push_preferences', JSON.stringify(next));
      return next;
    });
  };

  const handleEnable = async () => {
    if (isIOS() && !isStandalone()) {
      onClose();
      if (onOpenIOSGuide) onOpenIOSGuide();
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await subscribeToWebPush(preferences);
      if (res.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setStatusMsg({ type: 'success', text: 'Web push notifications are now active on your device!' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to enable notifications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const success = await unsubscribeFromWebPush();
      if (success) {
        setIsSubscribed(false);
        setStatusMsg({ type: 'success', text: 'Notifications disabled. You will no longer receive push alerts.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to disable notifications.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setStatusMsg(null);
    localStorage.setItem('csc_push_preferences', JSON.stringify(preferences));

    // If subscribed, re-sync preferences to backend
    if (isSubscribed) {
      setLoading(true);
      try {
        await subscribeToWebPush(preferences, { sendWelcome: false });
        setStatusMsg({ type: 'success', text: 'Notification preferences saved successfully!' });
      } catch (e: any) {
        setStatusMsg({ type: 'error', text: e?.message || 'Failed to sync preferences.' });
      } finally {
        setLoading(false);
      }
    } else {
      setStatusMsg({ type: 'success', text: 'Preferences saved.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#175CEE] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-[#175CEE]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the categories of alerts you wish to receive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Push Status Banner */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSubscribed
                  ? 'bg-emerald-500 animate-pulse'
                  : permission === 'denied'
                  ? 'bg-red-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isSubscribed
                ? 'Device Push: Active'
                : permission === 'denied'
                ? 'Browser Push: Blocked'
                : 'Device Push: Not Enabled'}
            </span>
          </div>

          {isSubscribed ? (
            <button
              type="button"
              onClick={handleDisable}
              disabled={loading}
              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              <BellOff className="w-3 h-3" />
              <span>Disable</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnable}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-[#175CEE] text-white text-[11px] font-bold hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            >
              Enable Push
            </button>
          )}
        </div>

        {/* Feedback message */}
        {statusMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Categories Toggle List */}
        <div className="space-y-3 mb-5">
          {/* 1. Job Alerts */}
          <div
            onClick={() => handleTogglePreference('jobs')}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Job &amp; Recruitment Alerts
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  JKSSB, Indian Army rallies, SSC, RRB &amp; bank openings
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                preferences.jobs ? 'bg-[#175CEE]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  preferences.jobs ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 2. Government Schemes */}
          <div
            onClick={() => handleTogglePreference('schemes')}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Government Welfare Schemes
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  PM Kisan KYC, Ayushman Bharat, Ladli Beti &amp; subsidies
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                preferences.schemes ? 'bg-[#16A34A]' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  preferences.schemes ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 3. Education & Exams */}
          <div
            onClick={() => handleTogglePreference('exams')}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-pink-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Education &amp; Exam Updates
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kashmir University date sheets, IGNOU &amp; entrance results
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                preferences.exams ? 'bg-pink-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  preferences.exams ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 4. Important Announcements */}
          <div
            onClick={() => handleTogglePreference('updates')}
            className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Important CSC Announcements
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Last date extensions, holiday notices &amp; center timings
                </p>
              </div>
            </div>

            <div
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                preferences.updates ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                  preferences.updates ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-[#175CEE] hover:bg-[#124FD1] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
}
