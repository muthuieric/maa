'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { LanguageCode, translations } from '../../lib/translations';
import { DownloadCloud, FileSpreadsheet, FileJson, Shield, CheckCircle } from 'lucide-react';

export default function ExportPage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (format: 'csv' | 'json') => {
    setDownloading(format);
    try {
      const response = await fetch(`/api/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harmful_practice_narratives_${format.toUpperCase()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download export. Ensure API is running.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <DownloadCloud className="w-6 h-6 text-savanna-800" />
            <span>{t.exportTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t.exportDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CSV Export Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Relational CSV Export
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tabular format containing pseudonymised narrative IDs, demographics, sub-county locations, ground truth labels, model predictions, and consent timestamps. Ideal for Excel, SPSS, and R statistical packages.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownload('csv')}
              disabled={downloading !== null}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-savanna-800 hover:bg-savanna-900 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{downloading === 'csv' ? 'Generating CSV...' : t.downloadCsv}</span>
            </button>
          </div>

          {/* JSON Export Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-earth-600 flex items-center justify-center">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Full Document JSON Export
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete NoSQL document export including full verbatim Swahili and Maa transcripts, token breakdown, class confidence distributions, matched dialect markers, and qualitative discourse notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDownload('json')}
              disabled={downloading !== null}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-earth-600 hover:bg-earth-800 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <FileJson className="w-4 h-4" />
              <span>{downloading === 'json' ? 'Generating JSON...' : t.downloadJson}</span>
            </button>
          </div>
        </div>

        {/* CBO Data Sovereignty Protocol Reminder */}
        <div className="bg-savanna-50 border border-savanna-200 rounded-xl p-6 text-sm text-savanna-900 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <span>Community Data Sovereignty & Agreement Compliance (Objective 3)</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Data exported from this tool is governed under collaborative research agreements with community-based organisations in Narok and Kajiado Counties (such as Tareto Africa Trust). Datasets must only be used for authorised academic validation, human rights advocacy, and policy formulation. Redistribution without consent violates the study’s ethical protocol.
          </p>
          <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-semibold pt-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>All records strictly pseudonymised prior to export.</span>
          </div>
        </div>
      </main>
    </>
  );
}

