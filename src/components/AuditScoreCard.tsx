import React from 'react';
import { Info, CheckCircle2, AlertTriangle, Layers, HelpCircle } from 'lucide-react';
import type { ScoreBreakdown, FindingCategory } from '../types/audit.js';

interface AuditScoreCardProps {
  score: ScoreBreakdown;
  url: string;
  isDemo?: boolean;
}

const CATEGORY_LABELS: Record<FindingCategory, string> = {
  first_impressions: 'First Impressions & Meta',
  clarity_copy: 'Clarity & Copy Hierarchy',
  navigation_links: 'Navigation & CTA Clarity',
  accessibility_forms: 'Accessibility & Forms',
  trust_contact: 'Trust & Contact Signals',
};

export const AuditScoreCard: React.FC<AuditScoreCardProps> = ({ score, url, isDemo }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 65) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-rose-800 bg-rose-50 border-rose-200';
  };

  const getScoreBarBg = (val: number) => {
    if (val >= 85) return 'bg-emerald-600';
    if (val >= 65) return 'bg-amber-600';
    return 'bg-rose-600';
  };

  const domain = new URL(url).hostname;

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Demo watermark if applicable */}
      {isDemo && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-medium text-amber-800">
          <span>DEMO DATA — Pre-computed verified sample report</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Score Ring / Block */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full pr-0 lg:pr-6 lg:border-r border-[#F0EBE1]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#71717A] mb-1">
              <span>Site Clarity Score</span>
              <span>·</span>
              <span className="font-mono">{domain}</span>
            </div>
            
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-6xl sm:text-7xl font-bold font-mono tracking-tight text-[#18181B] tabular-nums">
                {score.totalScore}
              </span>
              <span className="text-xl text-[#A1A1AA] font-mono">/ 100</span>
            </div>

            <div className="inline-block mt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${getScoreColor(score.totalScore)}`}>
                {score.totalScore >= 85
                  ? 'Strong Clarity'
                  : score.totalScore >= 65
                  ? 'Moderate Friction Detected'
                  : 'High Friction / Action Urgently Recommended'}
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F2EFE9] text-xs text-[#71717A] leading-relaxed">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#A1A1AA] shrink-0 mt-0.5" />
              <p>
                Product-specific heuristic calculated across 13 deterministic usability rules. It does not predict revenue or traffic.
              </p>
            </div>
          </div>
        </div>

        {/* 5-Category Breakdown */}
        <div className="lg:col-span-7">
          <h4 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-4">
            Category Breakdown & Weights
          </h4>

          <div className="space-y-4">
            {(Object.entries(score.categories) as [FindingCategory, typeof score.categories[FindingCategory]][]).map(
              ([catKey, data]) => {
                return (
                  <div key={catKey} className="text-xs">
                    <div className="flex items-center justify-between text-[#18181B] mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{CATEGORY_LABELS[catKey]}</span>
                        <span className="text-[#A1A1AA] font-mono">
                          ({Math.round(data.weight * 100)}% weight)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#71717A]">
                          {data.issuesCount === 0 ? 'No issues' : `${data.issuesCount} issue${data.issuesCount > 1 ? 's' : ''}`}
                        </span>
                        <span className="font-mono font-semibold tabular-nums text-[#18181B]">
                          {data.score}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#F2EFE9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreBarBg(data.score)}`}
                        style={{ width: `${Math.max(5, data.score)}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Coverage Note */}
          <div className="mt-6 pt-4 border-t border-[#F2EFE9] flex items-center justify-between text-xs text-[#71717A]">
            <span>
              Crawl Coverage: {score.coverage.pagesInspected} of {score.coverage.maxPagesAttempted} target pages inspected
            </span>
            {score.coverage.skippedReasons.length > 0 && (
              <span className="text-amber-700">
                {score.coverage.skippedReasons.length} link(s) skipped
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
