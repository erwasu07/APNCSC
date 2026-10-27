import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Briefcase,
  FileCheck2,
  GraduationCap,
  Share,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getBrowserPermission,
  subscribeToWebPush,
  DEFAULT_PUSH_PREFERENCES
} from '../utils/webPushClient';

export default function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // 1. Manual trigger listener from bell icon or footer
    const handleManualOpen = () => {
      setErrorMessage(null);
      if (isIOS() && !isStandalone()) {
        setShowIOSModal(true);
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener('open-push-notification-prompt', handleManualOpen);

    // 2. Check previous visitor response
    const savedStatus = localStorage.getItem('csc_push_notification_status');
    const dismissedUntil = localStorage.getItem('csc_push_dismissed_until');

    // If already subscribed or blocked natively
    const currentPerm = getBrowserPermission();
    if (savedStatus === 'subscribed' || currentPerm === 'granted') {
      return () => window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    }
    if (savedStatus === 'denied' || currentPerm === 'denied') {
      return () => window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    }

    // Check cooldown if dismissed earlier
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return () => window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    }

    // 3. Polite visitor engagement timer (3.5 seconds after page load)
    const timer = setTimeout(() => {
      // If iOS non-standalone, don't spam popups unless visitor taps the bell
      if (!isIOS() || isStandalone()) {
        setIsVisible(true);
      }
    }, 3500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Dismiss cooldown: don't prompt again for 7 days unless user manually clicks the bell
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('csc_push_dismissed_until', String(Date.now() + oneWeekMs));
  };

  const handleEnableClick = async () => {
    setErrorMessage(null);

    // Check iOS special requirement
    if (isIOS() && !isStandalone()) {
      setIsVisible(false);
      setShowIOSModal(true);
      return;
    }

    if (!isPushSupported()) {
      setErrorMessage('Web Push is not supported in this browser. Please try Chrome, Edge, or Firefox.');
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await subscribeToWebPush(DEFAULT_PUSH_PREFERENCES, { sendWelcome: true });
      if (result.success) {
        setIsVisible(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5500);
      }
    } catch (err: any) {
      if (err?.message === 'IOS_HOMESCREEN_REQUIRED') {
        setIsVisible(false);
        setShowIOSModal(true);
      } else {
        setErrorMessage(err?.message || 'Failed to enable notifications. Please check site permissions.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. PREMIUM WHITE NOTIFICATION CARD (MATCHING USER REFERENCE DESIGN)  */}
      {/* ==================================================================== */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 pointer-events-none animate-in fade-in duration-300">
          {/* Subtle backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] pointer-events-auto transition-opacity"
            onClick={handleDismiss}
          />

          {/* Modal Card */}
          <div
            id="csc-push-notification-card"
            className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[22px] sm:rounded-[24px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(15,23,42,0.25)] border border-slate-100 dark:border-slate-800 pointer-events-auto transform transition-all animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-4 duration-300"
          >
            {/* Close Button Top-Right */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close notification prompt"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Modern Yellow Bell Icon */}
            <div className="flex items-start gap-3.5 mb-3">
              {/* Yellow notification bell icon in soft amber badge */}
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-700/50 flex items-center justify-center shrink-0 shadow-sm">
                <Bell className="w-6 h-6 text-amber-500 fill-amber-400 animate-bounce" />
              </div>

              <div className="pr-5">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  Get Instant Updates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Receive new job alerts, government scheme updates, exam notifications and important announcements directly on your device.
                </p>
              </div>
            </div>

            {/* 3 Compact Feature Rows */}
            <div className="my-4 py-3 px-3.5 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-2.5">
              {/* Feature 1: Recruitment Alerts (Blue Briefcase) */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Latest Recruitment Alerts
                </div>
              </div>

              {/* Feature 2: Government Schemes (Green Document) */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Government Scheme Updates
                </div>
              </div>

              {/* Feature 3: Exam Dates & Results (Pink Graduation Cap) */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Exam Dates &amp; Results
                </div>
              </div>
            </div>

            {/* Error Message if blocked */}
            {errorMessage && (
              <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons: Enable Notifications & Maybe Later */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-center"
              >
                Maybe Later
              </button>

              <button
                type="button"
                onClick={handleEnableClick}
                disabled={isSubscribing}
                className="flex-[1.4] py-2.5 px-4 bg-[#175CEE] hover:bg-[#124FD1] active:bg-[#0E3FA8] text-white text-xs font-bold rounded-xl shadow-[0_4px_12px_rgba(23,92,238,0.28)] transition-all cursor-pointer hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 fill-current" />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. IPHONE / IPAD STEP-BY-STEP ADD TO HOME SCREEN GUIDANCE MODAL       */}
      {/* ==================================================================== */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowIOSModal(false)}
          />

          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#175CEE] flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-[#175CEE]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enable Notifications on iPhone
                </h3>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Apple iOS Requirement
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              To receive CSC DOST alerts, add this website to your Home Screen and open it from there.
            </p>

            {/* Clean Step-by-Step Instructions */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#175CEE] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  Open <strong>cscdost.com</strong> in Safari.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#175CEE] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug flex items-center gap-1.5">
                  Tap <strong>Share</strong>
                  <Share className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  in the Safari toolbar.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#175CEE] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug flex items-center gap-1.5">
                  Select <strong>Add to Home Screen</strong>
                  <PlusSquare className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#175CEE] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  Open <strong>CSC DOST</strong> from your Home Screen.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#175CEE] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  5
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                  Tap <strong>Enable Notifications</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. CONFIRMED REAL PUSH ACTIVATION TOAST (SHOWN ONLY AFTER SUBSCRIPTION) */}
      {/* ==================================================================== */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5 pr-2">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              Web Push Activated!
            </p>
            <p className="text-xs text-slate-300 leading-snug">
              Your device is now securely subscribed. You will receive live alerts for latest government recruitments and Kashmir University updates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessToast(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-all ml-auto shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
