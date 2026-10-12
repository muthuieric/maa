'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { LanguageCode, translations } from '../../lib/translations';
import { MapPin, AlertCircle, ShieldAlert, HeartHandshake, Layers, Compass } from 'lucide-react';

interface HeatmapPoint {
  sub_county: string;
  county: string;
  lat: number;
  lng: number;
  narrative_count: number;
  fgm_prevalence_pct: number;
  child_marriage_prevalence_pct: number;
  advocacy_prevalence_pct: number;
  dominant_practice: string;
  risk_index: number;
}

export default function MapPage() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const t = translations[currentLang];

  const [mapData, setMapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubCounty, setSelectedSubCounty] = useState<HeatmapPoint | null>(null);
  const [viewMetric, setViewMetric] = useState<'risk' | 'fgm' | 'child_marriage' | 'advocacy'>('risk');

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/narratives/geographic-heatmap');
      if (res.ok) {
        const data = await res.json();
        setMapData(data.data_points);
        if (data.data_points.length > 0) {
          setSelectedSubCounty(data.data_points[0]);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  const getMetricValue = (pt: HeatmapPoint) => {
    if (viewMetric === 'fgm') return `${pt.fgm_prevalence_pct}%`;
    if (viewMetric === 'child_marriage') return `${pt.child_marriage_prevalence_pct}%`;
    if (viewMetric === 'advocacy') return `${pt.advocacy_prevalence_pct}%`;
    return (pt.risk_index * 100).toFixed(0) + '/100';
  };

  const getCardRiskColor = (risk: number) => {
    if (risk >= 0.7) return 'border-rose-400 bg-rose-50/50';
    if (risk >= 0.4) return 'border-amber-400 bg-amber-50/50';
    return 'border-emerald-300 bg-emerald-50/30';
  };

  return (
    <>
      <Navbar currentLang={currentLang} onLanguageChange={setCurrentLang} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
              <Compass className="w-6 h-6 text-savanna-800" />
              <span>{t.navMap}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sub-county GIS spatial mapping of harmful practice discourse & community resistance hubs (Narok & Kajiado)
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white border border-slate-200 p-1 rounded-lg text-xs">
            <span className="text-slate-400 font-semibold px-2">Metric:</span>
            <button
              onClick={() => setViewMetric('risk')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMetric === 'risk' ? 'bg-savanna-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overall Risk Index
            </button>
            <button
              onClick={() => setViewMetric('fgm')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMetric === 'fgm' ? 'bg-rose-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FGM Rate
            </button>
            <button
              onClick={() => setViewMetric('child_marriage')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMetric === 'child_marriage' ? 'bg-amber-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Child Marriage
            </button>
            <button
              onClick={() => setViewMetric('advocacy')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                viewMetric === 'advocacy' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resistance / Advocacy
            </button>
          </div>
        </div>

        {/* Spatial Grid Map Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spatial Cards Grid representing Narok & Kajiado Sub-Counties */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-savanna-800" />
                <span>Sub-County Territorial Units ({mapData.length})</span>
              </span>
              <span className="text-[11px] text-slate-500">Click any sub-county for granular CBO intel</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {mapData.map((pt) => {
                const isSelected = selectedSubCounty?.sub_county === pt.sub_county;
                return (
                  <button
                    key={pt.sub_county}
                    type="button"
                    onClick={() => setSelectedSubCounty(pt)}
                    className={`text-left p-3.5 rounded-lg border transition-all ${getCardRiskColor(pt.risk_index)} ${
                      isSelected ? 'ring-2 ring-savanna-800 shadow-md font-bold' : 'hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{pt.sub_county}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">{pt.county}</span>
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-600 font-medium capitalize">
                        {viewMetric.replace('_', ' ')}:
                      </span>
                      <span className="text-sm font-extrabold text-slate-900 font-mono">
                        {getMetricValue(pt)}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-200/50 pt-1.5">
                      <span>{pt.narrative_count} narratives</span>
                      <span className="font-semibold text-slate-700">{pt.dominant_practice}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Sub-County Intel Drawer */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            {selectedSubCounty ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{selectedSubCounty.sub_county}</h3>
                    <p className="text-xs text-slate-500">{selectedSubCounty.county} County • Lat {selectedSubCounty.lat}, Lng {selectedSubCounty.lng}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-800">
                    Risk: {(selectedSubCounty.risk_index * 100).toFixed(0)}/100
                  </span>
                </div>

                {/* Prevalence Bars */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center space-x-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        <span>FGM Discourse Rate</span>
                      </span>
                      <span className="font-mono">{selectedSubCounty.fgm_prevalence_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-rose-600 h-2 rounded-full" style={{ width: `${selectedSubCounty.fgm_prevalence_pct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Child Marriage Rate</span>
                      </span>
                      <span className="font-mono">{selectedSubCounty.child_marriage_prevalence_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${selectedSubCounty.child_marriage_prevalence_pct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center space-x-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Community Resistance Rate</span>
                      </span>
                      <span className="font-mono">{selectedSubCounty.advocacy_prevalence_pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${selectedSubCounty.advocacy_prevalence_pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Qualitative Intervention Notes */}
                <div className="p-4 bg-savanna-50 border border-savanna-200 rounded-lg text-xs space-y-2 text-savanna-900">
                  <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-savanna-800" />
                    <span>CBO Intervention Focus:</span>
                  </div>
                  <p className="leading-relaxed">
                    {selectedSubCounty.dominant_practice === 'FGM' ? (
                      `High incidence of female initiation ceremonies detected. Recommend coordinating with Tareto Africa Trust rescue units and community chiefs during traditional holiday cut seasons.`
                    ) : selectedSubCounty.dominant_practice === 'Child marriage' ? (
                      `Early dowry transactions and betrothals observed. Priority action: cross-checking school attendance lists with local primary boards to prevent school dropouts.`
                    ) : (
                      `Strong active community resistance discourse. Excellent location for community educator workshops and youth leadership mentorship.`
                    )}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic">Select a sub-county to view spatial prevalence metrics.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

