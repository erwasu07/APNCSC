import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BellOff,
  Share,
  PlusSquare
} from 'lucide-react';
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getBrowserPermission,
  getExistingPushSubscription,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  DEFAULT_PUSH_PREFERENCES
} from '../utils/webPushClient';

const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const PAGE_VIEWS_STORAGE_KEY = 'csc_session_page_views';
const LAST_COUNTED_URL_KEY = 'csc_session_last_url';

function isExcludedPolicyOrAdminPath(pathname: string): boolean {
  const lower = (pathname || '/').toLowerCase();
  return /^\/(privacy|privacy-policy|terms|terms-of-service|disclaimer|contact|contact-us|refund|refund-policy|admin|staff)(\/|$)/.test(
    lower
  );
}

export default function PushNotificationPrompt() {
  const [bannerMode, setBannerMode] = useState<
    'hidden' | 'prompt' | 'subscribed' | 'denied' | 'ios' | 'unsupported'
  >('hidden');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const engagementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAutoEligibilityAndSchedule = useCallback(async () => {
    if (engagementTimerRef.current) {
      clearTimeout(engagementTimerRef.current);
      engagementTimerRef.current = null;
    }

    const currentPath = window.location.pathname || '/';

    // 1. Exclude policy, contact, refund & admin pages
    if (isExcludedPolicyOrAdminPath(currentPath)) {
      setBannerMode((prev) => (prev === 'subscribed' ? prev : 'hidden'));
      return;
    }

    // 2. Check session page view count (>= 2nd page view required for auto-show)
    let pageViews = 1;
    try {
      const fullLoc = `${currentPath}${window.location.search || ''}`;
      const lastUrl = sessionStorage.getItem(LAST_COUNTED_URL_KEY);
      const prevCount = Number(sessionStorage.getItem(PAGE_VIEWS_STORAGE_KEY) || '0');
      if (lastUrl !== fullLoc) {
        pageViews = prevCount + 1;
        sessionStorage.setItem(PAGE_VIEWS_STORAGE_KEY, String(pageViews));
        sessionStorage.setItem(LAST_COUNTED_URL_KEY, fullLoc);
      } else {
        pageViews = prevCount || 1;
      }
    } catch {
      pageViews = 1;
    }

    if (pageViews < 2) {
      return;
    }

    // 3. Do not show if dismissed in last 14 days
    try {
      const dismissedUntil = Number(localStorage.getItem('csc_push_dismissed_until') || '0');
      if (dismissedUntil > Date.now()) {
        return;
      }
      if (localStorage.getItem('csc_push_notification_status') === 'subscribed') {
        return;
      }
    } catch {}

    // 4. iOS Safari non-standalone: only show short iOS hint gently (unsupported PushManager otherwise)
    const iosNeedsA2HS = isIOS() && !isStandalone();
    if (!iosNeedsA2HS) {
      if (!isPushSupported()) return;

      // Never auto-show when permission is already 'granted' or 'denied'
      const perm = getBrowserPermission();
      if (perm === 'granted' || perm === 'denied') {
        return;
      }

      const existingSub = await getExistingPushSubscription();
      if (existingSub) {
        try {
          localStorage.setItem('csc_push_notification_status', 'subscribed');
        } catch {}
        return;
      }
    }

    const triggerBanner = () => {
      if (isExcludedPolicyOrAdminPath(window.location.pathname || '/')) return;
      try {
        const dismissed = Number(localStorage.getItem('csc_push_dismissed_until') || '0');
        if (dismissed > Date.now()) return;
        if (localStorage.getItem('csc_push_notification_status') === 'subscribed') return;
      } catch {}

      if (isIOS() && !isStandalone()) {
        setBannerMode('ios');
        return;
      }
      if (getBrowserPermission() !== 'default') return;
      setBannerMode('prompt');
    };

    // 5. Show after 30 seconds OR after 50% scroll depth
    let triggered = false;
    const triggerOnce = () => {
      if (triggered) return;
      triggered = true;
      if (engagementTimerRef.current) {
        clearTimeout(engagementTimerRef.current);
        engagementTimerRef.current = null;
      }
      window.removeEventListener('scroll', onScroll);
      triggerBanner();
    };

    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      if (docHeight <= 0) return;
      const scrollRatio = (window.scrollY + window.innerHeight) / docHeight;
      if (scrollRatio >= 0.5) {
        triggerOnce();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    engagementTimerRef.current = setTimeout(triggerOnce, 30000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (engagementTimerRef.current) {
        clearTimeout(engagementTimerRef.current);
        engagementTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cleanupScrollTimer: (() => void) | undefined;

    const runCheck = async () => {
      if (cleanupScrollTimer) cleanupScrollTimer();
      cleanupScrollTimer = (await checkAutoEligibilityAndSchedule()) as (() => void) | undefined;
    };

    runCheck();

    // Listen for SPA navigation changes
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      runCheck();
    };
    const onPopState = () => runCheck();
    window.addEventListener('popstate', onPopState);

    // Manual open trigger (user gesture from bell or UI button)
    const handleManualOpen = async () => {
      setErrorMessage(null);

      if (isIOS() && !isStandalone()) {
        setBannerMode('ios');
        return;
      }

      if (!isPushSupported()) {
        setBannerMode('unsupported');
        return;
      }

      const perm = getBrowserPermission();
      if (perm === 'denied') {
        setBannerMode('denied');
        return;
      }

      const existingSub = await getExistingPushSubscription();
      if (existingSub && perm === 'granted') {
        setBannerMode('subscribed');
        return;
      }

      setBannerMode('prompt');
    };

    window.addEventListener('open-push-notification-prompt', handleManualOpen);

    return () => {
      if (cleanupScrollTimer) cleanupScrollTimer();
      if (engagementTimerRef.current) clearTimeout(engagementTimerRef.current);
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    };
  }, [checkAutoEligibilityAndSchedule]);

  const handleDismissFor14Days = () => {
    setBannerMode('hidden');
    try {
      localStorage.setItem('csc_push_dismissed_until', String(Date.now() + DISMISS_COOLDOWN_MS));
    } catch {}
  };

  const handleEnableClick = async () => {
    setErrorMessage(null);

    if (isIOS() && !isStandalone()) {
      setBannerMode('ios');
      return;
    }

    if (!isPushSupported()) {
      setBannerMode('unsupported');
      return;
    }

    const perm = getBrowserPermission();
    if (perm === 'denied') {
      setBannerMode('denied');
      return;
    }

    setIsSubscribing(true);
    try {
      const result = await subscribeToWebPush(DEFAULT_PUSH_PREFERENCES, {
        sendWelcome: true,
        subscribedFrom: `${window.location.pathname || '/'}${window.location.search || ''}`
      });
      if (result.success) {
        setBannerMode('subscribed');
      }
    } catch (err: any) {
      if (err?.message === 'IOS_HOMESCREEN_REQUIRED') {
        setBannerMode('ios');
      } else if (err?.message === 'PERMISSION_DENIED') {
        setBannerMode('denied');
      } else if (err?.message === 'PERMISSION_DISMISSED') {
        handleDismissFor14Days();
      } else {
        setErrorMessage(err?.message || 'Could not enable notifications.');
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true);
    setErrorMessage(null);
    try {
      await unsubscribeFromWebPush();
      setBannerMode('hidden');
    } catch {
      setErrorMessage('Could not unsubscribe right now.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (bannerMode === 'hidden') {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Notification alerts banner"
      id="csc-push-bottom-banner"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:w-[390px] z-40 pointer-events-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg px-4 py-3 text-slate-900 dark:text-white">
        {bannerMode === 'prompt' && (
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <div className="flex-1 min-w-0 pr-5">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  Get instant J&amp;K job &amp; exam alerts
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  JKSSB openings, Kashmir University date sheets, and CSC scheme deadlines.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismissFor14Days}
                aria-label="Close notification banner"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMessage && (
              <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDismissFor14Days}
                className="px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                Maybe later
              </button>
              <button
                type="button"
                onClick={handleEnableClick}
                disabled={isSubscribing}
                className="px-3.5 py-1.5 bg-[#175CEE] hover:bg-[#124FD1] text-white text-[11px] font-bold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3" />
                    <span>Enable Notifications</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {bannerMode === 'subscribed' && (
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                You're subscribed
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Alerts will appear when new notices are published.
              </p>
            </div>
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <BellOff className="w-3 h-3" />
              <span>{isUnsubscribing ? 'Removing...' : 'Unsubscribe'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBannerMode('hidden')}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {bannerMode === 'denied' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed flex-1">
                Notifications are blocked for this site. Click the lock icon next to the address bar, set Notifications to Allow, then reload.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBannerMode('hidden')}
                className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {bannerMode === 'ios' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Share className="w-4 h-4 text-[#175CEE] shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed flex-1">
                On iPhone (iOS 16.4+), push notifications work when you tap{' '}
                <strong className="font-semibold">Share</strong> and choose{' '}
                <PlusSquare className="w-3 h-3 inline -mt-0.5" />{' '}
                <strong className="font-semibold">Add to Home Screen</strong>, then open CSC DOST from your Home Screen.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleDismissFor14Days}
                className="px-3 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {bannerMode === 'unsupported' && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Browser notifications are not supported on this browser. Try Chrome, Edge, or Firefox.
            </p>
            <button
              type="button"
              onClick={() => setBannerMode('hidden')}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
