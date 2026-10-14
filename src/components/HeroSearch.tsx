import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, Briefcase, Building2 } from 'lucide-react';
import type { AppMode } from '../types/audit.js';

interface HeroSearchProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onAnalyze: (url: string) => void;
  onLoadSample: (sampleType: 'roastery' | 'legal') => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  mode,
  onModeChange,
  onAnalyze,
  onLoadSample,
  isLoading,
  errorMessage,
}) => {
  const [urlInput, setUrlInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onAnalyze(urlInput.trim());
  };

  return (
    <section className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Mode Switcher Banner */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1 bg-[#F2EFE9] border border-[#E5E1D8] rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => onModeChange('business')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              mode === 'business'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#4F46E5]" />
            <span>Business Mode</span>
            <span className="text-[11px] text-[#A1A1AA] hidden sm:inline">· For site owners</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('freelancer')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              mode === 'freelancer'
                ? 'bg-white text-[#18181B] shadow-xs'
                : 'text-[#71717A] hover:text-[#18181B]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#4F46E5]" />
            <span>Freelancer Mode</span>
            <span className="text-[11px] text-[#A1A1AA] hidden sm:inline">· Client-ready reports</span>
          </button>
        </div>
      </div>

      {/* Main Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#18181B] leading-[1.15] text-balance">
          Where might your website be losing people?
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#52525B] leading-relaxed max-w-2xl mx-auto">
          Discover confusing website experiences, unclear calls to action and overlooked issues—with evidence and practical fixes.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="max-w-2xl mx-auto mb-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-white border border-[#DCD6C9] rounded-2xl shadow-sm focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/10 transition-all">
            <div className="flex items-center gap-3 px-3.5 py-2.5 flex-1">
              <Search className="w-5 h-5 text-[#A1A1AA] shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter website URL (e.g. yourbusiness.com)"
                className="w-full text-sm sm:text-base bg-transparent text-[#18181B] placeholder-[#A1A1AA] focus:outline-none"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !urlInput.trim()}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#18181B] hover:bg-[#27272A] disabled:bg-[#A1A1AA] disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze website</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-medium">Audit Error</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Quick Sample Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-[#71717A]">
          <span>Or explore verified sample audits:</span>
          <button
            type="button"
            onClick={() => onLoadSample('roastery')}
            className="font-medium text-[#18181B] underline hover:text-[#4F46E5] transition-colors"
          >
            Artisan Roastery (E-Commerce)
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => onLoadSample('legal')}
            className="font-medium text-[#18181B] underline hover:text-[#4F46E5] transition-colors"
          >
            Vellum Legal (B2B Advisory)
          </button>
        </div>
      </div>

      {/* Understated Live Finding Preview */}
      <div className="mt-14 max-w-3xl mx-auto bg-white border border-[#E5E1D8] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#F2EFE9] text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18181B]">Sample Verified Finding</span>
            <span>·</span>
            <span className="text-[#B45309] font-medium">Medium Severity</span>
            <span>·</span>
            <span>Confirmed Heuristic</span>
          </div>
          <span className="text-[11px] font-mono text-[#A1A1AA]">Heuristic #07</span>
        </div>

        <div className="mt-4">
          <h2 className="text-base font-semibold text-[#18181B]">
            Ambiguous Call-to-Action Label: "Click here"
          </h2>
          <p className="mt-1.5 text-sm text-[#52525B] leading-relaxed">
            Button label does not state destination or action value. Visitors scanning quickly hesitate when next steps lack clarity.
          </p>

          <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl font-mono text-xs text-[#3F3F46]">
            <span className="text-[#71717A] block mb-1 font-sans text-[11px] uppercase tracking-wider">Observed Evidence</span>
            <code>&lt;a class="hero-cta" href="/roasts"&gt;Click here&lt;/a&gt;</code>
          </div>

          <div className="mt-3 text-xs text-[#27272A] flex items-center gap-2">
            <span className="font-semibold text-[#18181B]">Recommended Fix:</span>
            <span>Replace with outcome-focused copy like "Explore Single-Origin Roasts"</span>
          </div>
        </div>
      </div>

      {/* 3-Step Plain Language Explanation */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="p-5 rounded-xl border border-[#EAE6DF] bg-white/70">
          <span className="font-mono text-xs text-[#71717A]">01 / INSPECT</span>
          <h3 className="mt-2 text-base font-semibold text-[#18181B]">Safely crawl public HTML</h3>
          <p className="mt-1.5 text-xs text-[#71717A] leading-relaxed">
            Our server engine safely accesses your public homepage and key navigation links without executing unverified third-party scripts.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#EAE6DF] bg-white/70">
          <span className="font-mono text-xs text-[#71717A]">02 / UNCOVER</span>
          <h3 className="mt-2 text-base font-semibold text-[#18181B]">Identify real friction</h3>
          <p className="mt-1.5 text-xs text-[#71717A] leading-relaxed">
            Runs 13 deterministic usability checks for title clarity, heading hierarchy, vague CTAs, form accessibility, and missing contact channels.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-[#EAE6DF] bg-white/70">
          <span className="font-mono text-xs text-[#71717A]">03 / RESOLVE</span>
          <h3 className="mt-2 text-base font-semibold text-[#18181B]">Prioritize what to fix</h3>
          <p className="mt-1.5 text-xs text-[#71717A] leading-relaxed">
            Receive an explainable Site Clarity Score, a "Fix these first" action plan, copy rewrites, and client-ready export options.
          </p>
        </div>
      </div>
    </section>
  );
};
