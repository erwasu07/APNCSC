import React from 'react';
import { Home, Briefcase, LayoutGrid, Wrench, MapPin } from 'lucide-react';

export type BottomNavTab = 'home' | 'jobs' | 'services' | 'tools' | 'track';

interface MobileBottomNavProps {
  activeTab: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
}

export default function MobileBottomNav({ activeTab, onNavigate }: MobileBottomNavProps) {
  const navItems: { id: BottomNavTab; label: string; Icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'jobs', label: 'Jobs', Icon: Briefcase },
    { id: 'services', label: 'Services', Icon: LayoutGrid },
    { id: 'tools', label: 'Tools', Icon: Wrench },
    { id: 'track', label: 'Track', Icon: MapPin },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] px-1.5 py-1 md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center justify-around select-none"
    >
      {navItems.map((item) => {
        const IconComponent = item.Icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`min-h-[44px] min-w-[58px] flex flex-col items-center justify-center transition-all cursor-pointer rounded-xl ${
              isActive
                ? 'bg-[#EEF4FF] text-[#1E56C8] px-2.5 py-1'
                : 'text-[#334155] hover:text-[#1E56C8] hover:bg-slate-50 px-2 py-1'
            }`}
          >
            <IconComponent
              className={`w-[19px] h-[19px] transition-transform ${
                isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-[10.5px] mt-0.5 leading-none tracking-tight ${
                isActive ? 'font-bold' : 'font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
