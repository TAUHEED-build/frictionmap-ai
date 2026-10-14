import React from 'react';
import { Zap, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AuditFinding } from '../types/audit.js';

interface FixTheseFirstProps {
  actions: AuditFinding[];
  onSelectFinding?: (id: string) => void;
}

const EFFORT_LABELS = {
  quick: 'Under 15 mins',
  moderate: '30–60 mins',
  substantial: 'Requires engineering/design review',
};

const SEVERITY_BADGES = {
  high: 'bg-rose-50 text-rose-800 border-rose-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  low: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const FixTheseFirst: React.FC<FixTheseFirstProps> = ({ actions, onSelectFinding }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-[#F0EBE1]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#18181B] text-white flex items-center justify-center">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
            <h3 className="text-base font-semibold text-[#18181B]">Fix These First</h3>
          </div>
          <p className="mt-1 text-xs text-[#71717A]">
            Prioritized by severity, detection confidence, and speed of implementation. Fixing these 3 eliminates your highest-friction stumbling blocks.
          </p>
        </div>
        <span className="text-xs font-mono text-[#A1A1AA] shrink-0">
          Ranked Top 3 of {actions.length}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((finding, idx) => {
          return (
            <div
              key={finding.id}
              onClick={() => onSelectFinding?.(finding.id)}
              className="flex flex-col justify-between p-5 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono text-[11px] text-[#71717A]">
                    #0{idx + 1} Priority
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${SEVERITY_BADGES[finding.severity]}`}>
                    {finding.severity}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-[#18181B] group-hover:text-[#4F46E5] transition-colors leading-snug">
                  {finding.title}
                </h4>

                <p className="mt-2 text-xs text-[#52525B] leading-relaxed line-clamp-3">
                  {finding.whyItMatters}
                </p>

                {finding.evidence && (
                  <div className="mt-3 p-2 bg-white border border-[#EAE6DF] rounded-md font-mono text-[11px] text-[#3F3F46] truncate">
                    {finding.evidence}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-[11px] text-[#71717A]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#A1A1AA]" />
                  <span>{EFFORT_LABELS[finding.estimatedEffort]}</span>
                </div>
                <span className="text-[#4F46E5] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                  Inspect <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
