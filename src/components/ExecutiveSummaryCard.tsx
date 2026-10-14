import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, MessageSquareQuote, CheckCircle2 } from 'lucide-react';
import type { AIExecutiveSummary, AppMode } from '../types/audit.js';

interface ExecutiveSummaryCardProps {
  summary: AIExecutiveSummary;
  mode: AppMode;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  summary,
  mode,
  onRegenerate,
  isRegenerating,
}) => {
  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#18181B]">
              Executive Summary & Practical Guidance
            </h3>
            <span className="text-xs text-[#71717A]">
              {mode === 'freelancer' ? 'Consultant consulting overview' : 'Plain-language review for business owners'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {summary.isAiGenerated ? (
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              AI Verified Summary
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
              Deterministic Engine Summary
            </span>
          )}

          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-2.5 py-1 text-xs font-medium text-[#18181B] bg-[#FAF8F5] border border-[#D4CEBF] rounded-lg hover:bg-[#F2EFE9] transition-colors disabled:opacity-50"
            >
              {isRegenerating ? 'Refreshing...' : 'Refresh Summary'}
            </button>
          )}
        </div>
      </div>

      {/* Main Narrative Summary */}
      <div className="mt-5 text-sm sm:text-base text-[#27272A] leading-relaxed">
        <p>{summary.summary}</p>
      </div>

      {/* Key Takeaways */}
      {summary.topTakeaways && summary.topTakeaways.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs uppercase tracking-wider text-[#71717A] font-semibold mb-3">
            Core Observations
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-[#3F3F46]">
            {summary.topTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] shrink-0 mt-2" />
                <span className="leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concrete Copy Alternatives */}
      {summary.copySuggestions && summary.copySuggestions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#F0EBE1]">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs uppercase tracking-wider text-[#18181B] font-semibold">
              Actionable Copy Alternatives
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.copySuggestions.map((item, idx) => (
              <div key={idx} className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-xs">
                <div className="mb-2">
                  <span className="text-[#A1A1AA] uppercase tracking-wider text-[10px] block">Observed Copy</span>
                  <span className="font-mono text-[#71717A] line-through block mt-0.5">
                    "{item.original}"
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[#4F46E5] uppercase tracking-wider text-[10px] font-semibold block">Suggested Upgrade</span>
                  <span className="font-semibold text-[#18181B] block mt-0.5">
                    "{item.suggestion}"
                  </span>
                </div>

                <p className="text-[#71717A] text-[11px] leading-relaxed mt-2 pt-2 border-t border-[#EAE6DF]">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Practical Strategic Advice */}
      {summary.businessContextAdvice && (
        <div className="mt-6 p-4 bg-[#F5F3EF] border border-[#E5E1D8] rounded-xl text-xs sm:text-sm text-[#27272A] flex items-start gap-3">
          <MessageSquareQuote className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#18181B] block mb-0.5">
              {mode === 'freelancer' ? 'Consultant Recommendation' : 'Next Step Recommendation'}
            </span>
            <p className="text-[#52525B] leading-relaxed">{summary.businessContextAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
};
