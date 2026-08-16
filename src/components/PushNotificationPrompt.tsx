import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle, X, ShieldCheck } from 'lucide-react';

export default function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'default' | 'granted' | 'denied'>('default');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Listen for manual trigger from bell icon in navbar or footer
    const handleManualOpen = () => {
      setIsVisible(true);
    };
    window.addEventListener('open-push-notification-prompt', handleManualOpen);

    // Check previous choice from localStorage
    const savedChoice = localStorage.getItem('csc_push_notification_status');
    
    // Also check native browser Notification permission if available
    let browserPermission = 'default';
    if (typeof window !== 'undefined' && 'Notification' in window) {
      browserPermission = Notification.permission;
    }

    if (savedChoice === 'allowed' || browserPermission === 'granted') {
      setPermissionStatus('granted');
      return () => window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    }

    if (savedChoice === 'blocked' || browserPermission === 'denied') {
      setPermissionStatus('denied');
      return () => window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    }

    // Trigger prompt 2.2 seconds after page load for visitor engagement
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('open-push-notification-prompt', handleManualOpen);
    };
  }, []);

  const handleAllow = async () => {
    setIsVisible(false);
    localStorage.setItem('csc_push_notification_status', 'allowed');
    setPermissionStatus('granted');

    // Trigger native browser notification permission request if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          // Show a sample welcome notification
          try {
            new Notification('CSC DOST - Notifications Active 🔔', {
              body: 'You will now receive instant alerts for new JKSSB recruitments, Army rallies, RRB/SSC jobs & KU exam forms.',
              icon: '/favicon.png',
              badge: '/favicon.png'
            });
          } catch (e) {
            console.log('Browser notification dispatched in standard mode');
          }
        }
      } catch (err) {
        console.warn('Native notification request not available in current frame context:', err);
      }
    }

    // Show in-app confirmation toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  const handleBlock = () => {
    setIsVisible(false);
    localStorage.setItem('csc_push_notification_status', 'blocked');
    setPermissionStatus('denied');
  };

  return (
    <>
      {/* Browser-style Push Notification Permission Prompt (Matching the screenshot) */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pointer-events-none animate-fade-in">
          {/* Backdrop (light click-through) */}
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] pointer-events-auto transition-opacity" onClick={handleBlock} />

          {/* Modal Container */}
          <div
            id="notification-permission-dialog"
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pointer-events-auto transform transition-all duration-300 translate-y-4 sm:translate-y-8 animate-in slide-in-from-top-6"
            style={{
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)'
            }}
          >
            {/* Top row with Bell Icon and Title */}
            <div className="flex items-start gap-4 mb-4">
              {/* Distinctive Dark Maroon / Deep Navy Bell Icon as shown in user image */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#3E1A17] dark:bg-amber-950/80 text-amber-200 flex items-center justify-center shrink-0 shadow-md">
                <BellRing className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>

              <div className="space-y-1">
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  <strong className="font-bold text-slate-900 dark:text-white">cscdost.com</strong> wants to send you notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Get instant daily alerts for new JKSSB recruitments, Indian Army rallies, SSC/RRB vacancies, and Kashmir University exam date sheets.
                </p>
              </div>
            </div>

            {/* Action Buttons: Block & Allow */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="notification-block-btn"
                onClick={handleBlock}
                className="px-5 py-2 text-xs sm:text-sm font-bold text-[#8C3A35] hover:text-[#5E1E1A] dark:text-red-400 dark:hover:text-red-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                Block
              </button>

              <button
                id="notification-allow-btn"
                onClick={handleAllow}
                className="px-6 py-2 bg-[#8C3A35] hover:bg-[#722A26] active:bg-[#5E1E1A] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg transform active:scale-95 flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Allow</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast when User clicks 'Allow' */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5 pr-2">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              Notifications Enabled!
            </p>
            <p className="text-xs text-slate-300 leading-snug">
              You will now receive instant live alerts for latest government jobs, admit cards, and university updates.
            </p>
          </div>
          <button
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
