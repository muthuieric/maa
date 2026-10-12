'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, DownloadCloud, CheckCircle2, Archive, MapPin } from 'lucide-react';
import { LanguageCode, translations } from '../lib/translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SyncStatusBadge } from './SyncStatusBadge';

interface Props {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSyncComplete?: () => void;
}

export const Navbar: React.FC<Props> = ({ currentLang, onLanguageChange, onSyncComplete }) => {
  const pathname = usePathname();
  const t = translations[currentLang];

  const navLinks = [
    { href: '/', label: t.navEntry, icon: FileText },
    { href: '/map', label: t.navMap, icon: MapPin },
    { href: '/validation', label: t.navValidation, icon: CheckCircle2 },
    { href: '/archive', label: t.navArchive, icon: Archive },
    { href: '/export', label: t.navExport, icon: DownloadCloud },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-savanna-800 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              OUK
            </div>
            <div>
              <Link href="/" className="font-bold text-slate-900 text-sm sm:text-base leading-tight hover:text-savanna-800 transition-colors">
                {t.appTitle}
              </Link>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Narok & Kajiado Counties • MSc AI Thesis Project
              </p>
            </div>
          </div>

          {/* Navigation links & Utilities */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-savanna-100 text-savanna-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Offline/Online badge */}
            <SyncStatusBadge currentLang={currentLang} onSyncComplete={onSyncComplete} />

            {/* Language Switcher */}
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>
    </header>
  );
};

