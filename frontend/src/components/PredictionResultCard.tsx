'use client';

import React, { useState } from 'react';
import { Sparkles, Tag, BookOpen, Eye, HelpCircle } from 'lucide-react';
import { LanguageCode, translations } from '../lib/translations';

export interface AnalysisData {
  prediction_label: string;
  prediction_score: number;
  confidence_breakdown: Record<string, number>;
  detected_markers: Array<{
    term: string;
    matched_text?: string;
    start_pos?: number;
    end_pos?: number;
    language: string;
    category: string;
    meaning: string;
    weight?: number;
  }>;
  discourse_stance: string;
  cultural_context_notes: string;
}

interface Props {
  analysis: AnalysisData | null;
  narrativeText?: string;
  currentLang: LanguageCode;
}

export const PredictionResultCard: React.FC<Props> = ({ analysis, narrativeText, currentLang }) => {
  if (!analysis) return null;
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'overview' | 'xai'>('overview');
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  const getLabelBadgeColor = (label: string) => {
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

  const getStanceColor = (stance: string) => {
    if (stance.includes('Challenging') || stance.includes('Resisting')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (stance.includes('Perpetuating')) {
      return 'bg-rose-50 text-rose-800 border-rose-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const getMarkerBadgeColor = (category: string) => {
    if (category === 'FGM') return 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200';
    if (category === 'Child marriage') return 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200';
    return 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-savanna-800" />
          <h3 className="font-semibold text-slate-900 text-base">{t.analysisTitle}</h3>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Classification Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('xai')}
            className={`px-3 py-1 rounded-md transition-all flex items-center space-x-1 ${
              activeTab === 'xai' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-earth-600" />
            <span>Explainable AI (XAI)</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Predicted Class */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.predictedCategory}
              </span>
              <div className="flex items-center space-x-2 pt-1">
                <span className={`px-3 py-1 rounded-md text-sm font-bold border ${getLabelBadgeColor(analysis.prediction_label)}`}>
                  {analysis.prediction_label}
                </span>
                <span className="text-xs text-slate-500">
                  ({(analysis.prediction_score * 100).toFixed(1)}% match)
                </span>
              </div>
            </div>

            {/* Discourse Stance */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.discourseStance}
              </span>
              <div className="pt-1">
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium border ${getStanceColor(analysis.discourse_stance)}`}>
                  {analysis.discourse_stance}
                </span>
              </div>
            </div>
          </div>

          {/* Confidence Breakdown Bars */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>{t.confidenceScore} Breakdown</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(analysis.confidence_breakdown || {}).map(([cat, score]) => (
                <div key={cat} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>{cat}</span>
                    <span>{(score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        cat === 'FGM' ? 'bg-rose-500' :
                        cat === 'Child marriage' ? 'bg-amber-500' :
                        cat === 'None' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(2, score * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Cultural Markers */}
          {analysis.detected_markers && analysis.detected_markers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-earth-600" />
                <span>{t.markersDetected} ({analysis.detected_markers.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.detected_markers.map((marker, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedToken(marker)}
                    className="inline-flex flex-col text-left px-2.5 py-1.5 bg-earth-50 border border-earth-200 hover:border-earth-400 rounded-md text-xs text-earth-800 transition-colors"
                  >
                    <div className="font-semibold flex items-center space-x-1">
                      <span>{marker.term}</span>
                      <span className="text-[10px] text-earth-600 font-normal">[{marker.category}]</span>
                    </div>
                    <span className="text-[10px] text-slate-600">{marker.meaning}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* XAI Explainability Tab */
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-earth-600" />
                <span>{t.xaiTitle}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Click any highlighted marker for linguistic meaning</span>
            </div>
            <p className="text-xs text-slate-600">{t.xaiExplanation}</p>

            {/* Display highlighted tokens */}
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.detected_markers.map((m, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedToken(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${getMarkerBadgeColor(m.category)}`}
                >
                  <span className="font-bold">{m.term}</span>
                  <span className="ml-1 opacity-75">({m.category} • {m.language})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected token inspector */}
          {selectedToken && (
            <div className="p-4 bg-earth-50 border border-earth-200 rounded-lg text-xs space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between font-bold text-earth-900">
                <span>Selected Marker: "{selectedToken.term}"</span>
                <span className="text-[11px] bg-earth-200 text-earth-900 px-2 py-0.5 rounded">
                  Weight: {selectedToken.weight || 0.9}
                </span>
              </div>
              <div className="text-slate-700"><strong>Category:</strong> {selectedToken.category} ({selectedToken.language})</div>
              <div className="text-slate-700"><strong>Qualitative Meaning:</strong> {selectedToken.meaning}</div>
              <p className="text-[11px] text-earth-700 italic pt-1">
                This term contributed directly to the model's prediction of <strong>{analysis.prediction_label}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cultural Context Notes */}
      {analysis.cultural_context_notes && (
        <div className="pt-2 border-t border-slate-100 space-y-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-savanna-800" />
            <span>{t.culturalNotes}</span>
          </div>
          <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
            "{analysis.cultural_context_notes}"
          </p>
        </div>
      )}
    </div>
  );
};
