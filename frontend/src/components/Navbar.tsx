'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // One consistent label set used for BOTH desktop and mobile views.
  const navLinks = [
    { href: '/', label: t.navEntryShort },
    { href: '/map', label: t.navMapShort },
    { href: '/validation', label: t.navValidationShort },
    { href: '/archive', label: t.navArchiveShort },
    { href: '/export', label: t.navExportShort },
  ];

  const linkClasses = (isActive: boolean, isMobile = false) =>
    `${isMobile ? 'w-full px-4 py-3 text-base' : 'px-3 py-2 text-sm'} block rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-savanna-500 ${
      isActive
        ? 'bg-savanna-50 text-savanna-900'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

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

          {/* Desktop navigation — text-only links, consistent labels */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={linkClasses(isActive)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Utilities: sync status + language + mobile menu toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <SyncStatusBadge currentLang={currentLang} onSyncComplete={onSyncComplete} />
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-menu"
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-savanna-500 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer — same labels as desktop */}
      {mobileOpen && (
        <div id="mobile-nav-menu" className="md:hidden border-t border-slate-100 bg-white">
          <nav className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto" aria-label="Mobile navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={linkClasses(isActive, true)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
