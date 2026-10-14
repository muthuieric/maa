'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { LanguageCode, translations } from '../../lib/translations';
import { Archive, Search, Filter, ShieldCheck, Eye, X, BookOpen, Tag } from 'lucide-react';

export default function ArchivePage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  const [narratives, setNarratives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedSubCounty, setSelectedSubCounty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchNarratives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLanguage) params.append('language', selectedLanguage);
      if (selectedSubCounty) params.append('sub_county', selectedSubCounty);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/narratives?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setNarratives(data);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNarratives();
  }, [selectedLanguage, selectedSubCounty, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNarratives();
  };

  const getBadgeColor = (label: string) => {
    switch (label) {
      case 'FGM':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Child marriage':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Other':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span>{t.navArchive}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and audit pseudonymised field narratives collected across Narok and Kajiado Counties
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transcripts by keyword (e.g., ngariba, esiankiki, tohara)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-savanna-800"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-savanna-800 hover:bg-savanna-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              Search Corpus
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <option value="">All Languages</option>
              <option value="Swahili">Swahili</option>
              <option value="Maa">Maa</option>
            </select>

            <select
              value={selectedSubCounty}
              onChange={(e) => setSelectedSubCounty(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <option value="">All Sub-Counties</option>
              <option value="Narok North">Narok North</option>
              <option value="Narok South">Narok South</option>
              <option value="Narok East">Narok East</option>
              <option value="Narok West">Narok West</option>
              <option value="Kajiado Central">Kajiado Central</option>
              <option value="Kajiado North">Kajiado North</option>
              <option value="Kajiado South">Kajiado South</option>
              <option value="Kajiado East">Kajiado East</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700"
            >
              <option value="">All Categories</option>
              <option value="FGM">FGM</option>
              <option value="Child marriage">Child Marriage</option>
              <option value="Other">Other</option>
              <option value="None">None</option>
            </select>

            {(selectedLanguage || selectedSubCounty || selectedCategory || searchTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('');
                  setSelectedSubCounty('');
                  setSelectedCategory('');
                  setSearchTerm('');
                }}
                className="text-xs text-earth-700 hover:text-earth-900 font-semibold underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Narrative Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">ID & Timestamp</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Narrative Excerpt</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Language</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Sub-County</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Ground Truth</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">NLP Prediction</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Consent Trail</th>
                  <th className="px-5 py-3 text-right font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {narratives.length > 0 ? (
                  narratives.map((item) => (
                    <tr key={item.narrative_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-500">
                        <div>{item.narrative_id.slice(0, 8)}...</div>
                        <div className="text-[10px] text-slate-400">{item.date_collected?.slice(0, 10)}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs truncate text-slate-800">
                        {item.narrative}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700">{item.language}</td>
                      <td className="px-5 py-3.5 text-slate-600">{item.sub_county}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(item.label)}`}>
                          {item.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeColor(item.prediction_label)}`}>
                          {item.prediction_label} ({(item.prediction_score * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                          <span>Audited</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(item)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-400 italic">
                      No matching narratives found in the archive. Submit new narratives or adjust filter settings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Drawer for Record Details */}
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Narrative Transcript Inspection</h3>
                  <p className="text-[11px] font-mono text-slate-400">UUID: {selectedRecord.narrative_id}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  type="button"
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verbatim Transcript */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verbatim Community Text:</span>
                <p className="text-sm text-slate-900 font-serif leading-relaxed italic">
                  "{selectedRecord.narrative}"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Language:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.language}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Sub-County:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.sub_county}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Age & Gender:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.age_band} ({selectedRecord.gender})</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Source CBO:</span>
                  <span className="font-bold text-slate-800">{selectedRecord.source_org}</span>
                </div>
              </div>

              {/* Dialect Markers */}
              {selectedRecord.detected_markers && selectedRecord.detected_markers.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-earth-600" />
                    <span>Linguistic Markers Identified:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.detected_markers.map((m: any, i: number) => (
                      <div key={i} className="px-2.5 py-1 bg-earth-50 border border-earth-200 rounded text-xs text-earth-800">
                        <strong>{m.term}</strong>: {m.meaning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Context Note */}
              {selectedRecord.cultural_context_notes && (
                <div className="p-3 bg-savanna-50 border border-savanna-200 rounded text-xs text-savanna-900 space-y-1">
                  <span className="font-bold flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-savanna-800" />
                    <span>Cultural Context:</span>
                  </span>
                  <p>{selectedRecord.cultural_context_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

