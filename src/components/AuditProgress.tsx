import React from 'react';
import { Compass, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface AuditProgressProps {
  targetUrl: string;
}

export const AuditProgress: React.FC<AuditProgressProps> = ({ targetUrl }) => {
  return (
    <div className="py-16 max-w-xl mx-auto px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#18181B] text-white mx-auto flex items-center justify-center shadow-md animate-pulse">
        <Compass className="w-6 h-6 animate-spin" />
      </div>

      <h3 className="mt-6 text-xl font-semibold text-[#18181B] tracking-tight">
        Analyzing Website Usability & Content
      </h3>
      <p className="mt-2 text-xs font-mono text-[#52525B] truncate max-w-md mx-auto">
        Target: {targetUrl}
      </p>

      {/* Real Step Progression */}
      <div className="mt-8 p-5 bg-white border border-[#E5E1D8] rounded-2xl text-left space-y-3.5 shadow-xs">
        <div className="flex items-center gap-3 text-xs text-[#18181B]">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>Validating domain, protocol, and SSRF security restrictions</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#18181B]">
          <div className="w-4 h-4 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center animate-spin">
            <div className="w-2 h-2 rounded-full border border-[#4F46E5] border-t-transparent" />
          </div>
          <span className="font-medium text-[#4F46E5]">Safely fetching public HTML and checking redirects</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#71717A]">
          <div className="w-4 h-4 rounded-full bg-[#FAF8F5] border border-[#D4CEBF] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA]" />
          </div>
          <span>Executing 13 deterministic usability & clarity checks</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#71717A]">
          <div className="w-4 h-4 rounded-full bg-[#FAF8F5] border border-[#D4CEBF] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A1A1AA]" />
          </div>
          <span>Computing Site Clarity Score & prioritizing action plan</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-[#A1A1AA]">
        Requests enforce an 8.5s timeout and a 1.5MB response size limit.
      </p>
    </div>
  );
};
