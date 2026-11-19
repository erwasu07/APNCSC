import React from 'react';

export type BottomNavTab = 'home' | 'jobs' | 'results' | 'services' | 'alerts';

interface MobileBottomNavProps {
  activeTab: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
  unreadAlertsCount?: number;
}

export default function MobileBottomNav({
  activeTab,
  onNavigate,
  unreadAlertsCount = 0,
}: MobileBottomNavProps) {
  const navItems: {
    id: BottomNavTab;
    label: string;
    href?: string;
    emoji: string;
  }[] = [
    { id: 'home', label: 'Home', href: '/', emoji: '🏠' },
    { id: 'jobs', label: 'Jobs', href: '/jobs', emoji: '💼' },
    { id: 'results', label: 'Results', href: '/jobs?tab=results', emoji: '📊' },
    { id: 'services', label: 'Services', href: '/services', emoji: '🏛️' },
    { id: 'alerts', label: 'Alerts', emoji: '🔔' },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 max-w-[480px] sm:max-w-[720px] mx-auto z-40 bg-white dark:bg-[#111A2E] border-t border-[#E3E8F2] dark:border-[#283757] px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(16,26,54,0.08)] grid lg:hidden grid-cols-5 select-none"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const commonClasses = `min-h-[44px] flex flex-col items-center justify-center rounded-[10px] px-1 py-1 transition-colors cursor-pointer no-underline relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2455E6] focus-visible:ring-inset ${
          isActive
            ? 'text-[#2455E6] dark:text-[#60A5FA] bg-[#EEF2FF]/70 dark:bg-[#1E2C4A]'
            : 'text-[#5B6478] dark:text-[#94A3B8] hover:text-[#101A36] dark:hover:text-white'
        }`;

        const content = (
          <>
            <span className="text-[19px] leading-none relative" aria-hidden="true">
              {item.emoji}
              {item.id === 'alerts' && unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -end-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-[#E5484D] text-white text-[9px] font-extrabold flex items-center justify-center leading-none tabular-nums">
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-bold mt-1 leading-none truncate max-w-full">
              {item.label}
            </span>
          </>
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={commonClasses}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={commonClasses}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
