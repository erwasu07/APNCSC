import React from 'react';
import { Home, Briefcase, LayoutGrid, Wrench, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export type BottomNavTab = 'home' | 'jobs' | 'services' | 'tools' | 'track';

interface MobileBottomNavProps {
  activeTab: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
}

export default function MobileBottomNav({ activeTab, onNavigate }: MobileBottomNavProps) {
  const { t } = useLanguage();

  const navItems: { id: BottomNavTab; label: string; href: string; Icon: React.ElementType }[] = [
    { id: 'home', label: t.navHome, href: '/', Icon: Home },
    { id: 'jobs', label: t.navJobs, href: '/jobs', Icon: Briefcase },
    { id: 'services', label: t.navServices, href: '/services', Icon: LayoutGrid },
    { id: 'tools', label: t.navTools, href: '/tools', Icon: Wrench },
    { id: 'track', label: t.navTrack, href: '/track', Icon: MapPin },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#DCE3EE] px-1.5 py-1 md:hidden pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(16,26,54,0.06)] flex items-center justify-around select-none"
    >
      {navItems.map((item) => {
        const IconComponent = item.Icon;
        const isActive = activeTab === item.id;

        return (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
            aria-current={isActive ? 'page' : undefined}
            className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center transition-colors cursor-pointer rounded-lg no-underline ${
              isActive
                ? 'bg-[#101A36] text-white px-2.5 py-1'
                : 'text-[#101A36] hover:bg-[#F6F8FC] px-2 py-1'
            }`}
          >
            <IconComponent
              className={`w-[18px] h-[18px] ${
                isActive ? 'text-[#F5A623] stroke-[2.2]' : 'text-[#526075] stroke-[1.8]'
              }`}
              aria-hidden="true"
            />
            <span className={`text-[11px] mt-0.5 leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
