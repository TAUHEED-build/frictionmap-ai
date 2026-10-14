import React from 'react';
import { Compass, Sparkles, FolderArchive, ArrowRight, Briefcase, Building2 } from 'lucide-react';
import type { AppMode } from '../types/audit.js';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenSaved: () => void;
  savedCount: number;
  onNewAudit: () => void;
  hasActiveReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenSaved,
  savedCount,
  onNewAudit,
  hasActiveReport,
}) => {
  return (
    <header className="border-b border-[#EAE6DF] bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewAudit}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-[#18181B] text-white flex items-center justify-center shadow-xs group-hover:bg-[#27272A] transition-colors">
              <Compass className="w-4 h-4 text-[#FAF8F5]" />
            </div>
            <div>
              <span className="font-semibold text-[17px] tracking-tight text-[#18181B] block leading-none">
                FrictionMap AI
              </span>
              <span className="text-[11px] text-[#71717A] tracking-normal leading-none mt-1 block">
                Find friction. Fix what matters.
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links & Mode Selector */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#71717A]">
          <div className="flex items-center bg-[#F2EFE9] p-0.5 rounded-lg border border-[#E5E1D8]">
            <button
              onClick={() => onModeChange('business')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                mode === 'business'
                  ? 'bg-white text-[#18181B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Business</span>
            </button>
            <button
              onClick={() => onModeChange('freelancer')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                mode === 'freelancer'
                  ? 'bg-white text-[#18181B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Freelancer & Agency</span>
            </button>
          </div>

          <button
            onClick={onOpenSaved}
            className="hover:text-[#18181B] transition-colors whitespace-nowrap flex items-center gap-1.5 text-xs text-[#52525B]"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Saved Audits</span>
            {savedCount > 0 && (
              <span className="font-mono text-[10px] px-1.5 py-0.2 bg-[#EAE6DF] text-[#18181B] rounded-full">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasActiveReport && (
            <button
              onClick={onNewAudit}
              className="px-3.5 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D4CEBF] rounded-lg hover:bg-[#F4F1EA] transition-colors whitespace-nowrap"
            >
              Start New Audit
            </button>
          )}
          <button
            onClick={onOpenSaved}
            className="md:hidden p-2 text-[#52525B] hover:text-[#18181B] border border-[#E5E1D8] rounded-lg bg-white"
            aria-label="View saved audits"
          >
            <FolderArchive className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
