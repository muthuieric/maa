'use client';

import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: t.navEntry }, 
    { href: '/map', label: t.navMap },
    { href: '/validation', label: t.navValidation },
    { href: '/archive', label: t.navArchive },
    { href: '/export', label: t.navExport },
  ];

  return (
    <>
      {/* Spacer updated to perfectly match the combined height of main + mini navbars */}
      <div className="h-24 w-full" />
      
      <header className="fixed top-0 left-0 right-0 w-full z-50 flex flex-col shadow-sm">
        
        {/* Main Navbar */}
        <div className="bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 w-full">
              
              {/* 1. Logo & Brand (Left Aligned - flex-1 bumper) */}
              <div className="flex flex-1 items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-savanna-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  NG
                </div>
                <div className="hidden sm:block truncate">
                  <Link href="/" className="block font-bold text-slate-900 text-lg leading-tight hover:text-savanna-800 transition-colors">
                    {t.appTitle}
                  </Link>
                </div>
              </div>

              {/* 2. Desktop Navigation (Centered - protected from squishing) */}
              <nav className="hidden md:flex flex-none items-center justify-center gap-4 lg:gap-8 px-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'text-savanna-900 border-b-2 border-savanna-800 pb-1'
                          : 'text-slate-500 hover:text-slate-900 pb-1'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* 3. Desktop Utilities (Right Aligned - Language Switcher Only) */}
              <div className="hidden md:flex flex-1 items-center justify-end shrink-0">
                <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
              </div>

              {/* Mobile Utilities & Hamburger */}
              <div className="flex md:hidden flex-1 items-center justify-end gap-3 shrink-0">
                <LanguageSwitcher currentLang={currentLang} onLanguageChange={onLanguageChange} />
                <button
                  type="button"
                  onClick={() => setMobileOpen((open) => !open)}
                  aria-label="Toggle navigation menu"
                  className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mini-Navbar / Status Bar (Discreet strip for the Sync Status) */}
        <div className="bg-slate-50/95 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-8">
              <SyncStatusBadge currentLang={currentLang} onSyncComplete={onSyncComplete} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <nav className="flex flex-col px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-savanna-50 text-savanna-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};