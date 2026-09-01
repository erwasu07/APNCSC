import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'classic-navy' | 'tricolor' | 'emerald-csc' | 'dark-slate';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  headerGradient: string;
  accentColor: string;
  previewBg: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic-navy',
    name: 'Classic Navy (Official)',
    shortName: 'Navy',
    description: 'Crisp government blue portal with golden accents',
    badgeColor: 'bg-blue-600 text-white',
    headerGradient: 'from-[#18204e] via-[#1c2661] to-[#171e4a]',
    accentColor: '#1d4ed8',
    previewBg: '#1c2661'
  },
  {
    id: 'tricolor',
    name: 'National Tricolor (Digital India)',
    shortName: 'Tricolor',
    description: 'Saffron, navy, and deep green Digital India theme',
    badgeColor: 'bg-amber-600 text-white',
    headerGradient: 'from-[#c2410c] via-[#0f172a] to-[#047857]',
    accentColor: '#ea580c',
    previewBg: '#c2410c'
  },
  {
    id: 'emerald-csc',
    name: 'Emerald CSC Seva',
    shortName: 'Emerald',
    description: 'CSC Digital Seva green and clean gold theme',
    badgeColor: 'bg-emerald-600 text-white',
    headerGradient: 'from-[#064e3b] via-[#065f46] to-[#0f172a]',
    accentColor: '#059669',
    previewBg: '#065f46'
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate Pro',
    shortName: 'Dark',
    description: 'Eye-friendly high-contrast dark theme',
    badgeColor: 'bg-slate-800 text-amber-400',
    headerGradient: 'from-[#020617] via-[#0f172a] to-[#1e1b4b]',
    accentColor: '#f59e0b',
    previewBg: '#0f172a'
  }
];

interface ThemeContextType {
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentThemeState] = useState<ThemeMode>('tricolor');

  const setTheme = (newTheme: ThemeMode) => {
    setCurrentThemeState('tricolor');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cscdost_site_theme', 'tricolor');
      applyThemeToDom('tricolor');
    }
  };

  useEffect(() => {
    applyThemeToDom('tricolor');
  }, []);

  const activeThemeConfig = THEMES.find(t => t.id === 'tricolor') || THEMES[1];

  return (
    <ThemeContext.Provider value={{ currentTheme: 'tricolor', setTheme, activeThemeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyThemeToDom(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  
  if (theme === 'dark-slate') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
