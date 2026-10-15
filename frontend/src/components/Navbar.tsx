'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { LanguageCode, translations } from '../lib/translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useRole } from '../lib/role';
import { Menu, X } from 'lucide-react';

interface Props {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSyncComplete?: () => void;
}

export const Navbar: React.FC<Props> = ({ currentLang, onLanguageChange, onSyncComplete }) => {
  const t = translations[currentLang];

  const { role } = useRole();

  const roleLabel = role === 'collect' ? 'Collect' : role === 'translate' ? 'Translate' : role === 'review' ? 'Review' : '';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Brand / Home */}

          <Link
            href="/"
            className="flex items-center gap-3 min-w-0 shrink-0 group"
            aria-label={`${t.appTitle} — ${t.navEntry}`}
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-savanna-800 group-hover:bg-savanna-900 flex items-center justify-center text-white font-bold text-sm shadow-md transition-colors">
              NG
            </div>
            <div className="hidden sm:block min-w-0">
              <span className="block font-bold text-slate-900 text-lg leading-tight group-hover:text-savanna-800 transition-colors">
                {t.appTitle}
              </span>
              <span className="block text-xs text-slate-500 leading-tight truncate max-w-[14rem]">
                {t.subtitle}
              </span>
            </div>
          </Link>

          {/* Utilities: role badge + sync status + language */}
          <div className="flex items-center gap-2 shrink-0">
            {role && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-savanna-800 text-white">
                {roleLabel}
              </span>
            )}
            <SyncStatusBadge currentLang={currentLang} onSyncComplete={onSyncComplete} />
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
