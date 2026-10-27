import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Briefcase,
  FileCheck2,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'post' | 'announcement';
  category: 'jobs' | 'schemes' | 'exams' | 'updates';
  title: string;
  description: string;
  date: string;
  url: string;
  badge?: string;
  thumbnailUrl?: string;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPreferences: () => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  onOpenPreferences
}: NotificationCenterModalProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'jobs' | 'schemes' | 'exams' | 'updates'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('csc_read_notifications');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Fetch live notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/center');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          setNotifications(data.items);
        }
      }
    } catch (err) {
      console.warn('[NotificationCenter] Fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('csc_read_notifications', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem('csc_read_notifications', JSON.stringify(Array.from(allIds)));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over / Dropdown Drawer */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-top-4 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-200/80 dark:border-amber-700/50 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#175CEE] text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official citizen announcements &amp; recruitment updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenPreferences}
              title="Notification Preferences"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filters Bar & Mark All As Read */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'jobs', label: 'Jobs' },
                { id: 'schemes', label: 'Schemes' },
                { id: 'exams', label: 'Exams' },
                { id: 'updates', label: 'Updates' }
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#175CEE] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#175CEE]" />
              <span className="text-xs font-medium">Loading updates...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No notifications in this category
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You are all caught up! New alerts will appear here as soon as they are announced.
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => {
              const isRead = readIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    if (item.url) {
                      window.location.hash = item.url.replace(/^#/, '');
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 relative ${
                    isRead ? 'opacity-85' : 'bg-blue-50/40 dark:bg-blue-950/20'
                  }`}
                >
                  {/* Category / Thumbnail Icon */}
                  <div className="shrink-0 mt-0.5">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt="Notification Thumbnail"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
                      />
                    ) : item.category === 'jobs' ? (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : item.category === 'schemes' ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                      </div>
                    ) : item.category === 'exams' ? (
                      <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-pink-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {item.date}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Unread blue dot */}
                  {!isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#175CEE] shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Always updated in real-time
          </span>

          <button
            type="button"
            onClick={onOpenPreferences}
            className="text-[11px] font-bold text-[#175CEE] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Notification Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
