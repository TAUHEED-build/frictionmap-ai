import React from 'react';
import { Compass, Calendar, Globe, CheckCircle2, AlertTriangle, Layers, ExternalLink } from 'lucide-react';
import type { AuditReport, FreelancerMeta } from '../types/audit.js';

interface ClientReadyReportProps {
  report: AuditReport;
  meta: FreelancerMeta;
}

export const ClientReadyReport: React.FC<ClientReadyReportProps> = ({ report, meta }) => {
  const domain = new URL(report.url).hostname;
  const formattedDate = new Date(report.scannedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-8 sm:p-12 shadow-sm text-[#18181B] print:border-none print:p-0 print:shadow-none">
      {/* Consultant Header */}
      <div className="border-b-2 border-[#18181B] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#71717A] block mb-1">
            Usability Audit & Action Roadmap
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
            {meta.reportTitle || 'Website Usability Audit'}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#52525B]">
            <span>Prepared for: <strong>{meta.clientName || domain}</strong></span>
            <span>·</span>
            <span>Prepared by: <strong>{meta.freelancerName || 'UX Consultant'}</strong></span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs text-[#71717A]">Target Property</div>
          <div className="font-mono text-sm font-semibold text-[#18181B]">{domain}</div>
        </div>
      </div>

      {/* Executive Intro Letter */}
      {meta.customIntro && (
        <div className="mb-8 p-5 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-xs sm:text-sm text-[#3F3F46] leading-relaxed print:bg-white print:border-slate-300">
          <span className="font-semibold text-[#18181B] block mb-1">Consultant Note to Client:</span>
          <p>{meta.customIntro}</p>
        </div>
      )}

      {/* Audit Methodology Transparency */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 border border-[#EAE6DF] rounded-xl">
          <span className="text-[#71717A] block">Site Clarity Score</span>
          <span className="text-2xl font-bold font-mono text-[#18181B] block mt-1">
            {report.score.totalScore} / 100
          </span>
          <span className="text-[11px] text-[#A1A1AA] block mt-1">Deterministic heuristic benchmark</span>
        </div>

        <div className="p-4 border border-[#EAE6DF] rounded-xl">
          <span className="text-[#71717A] block">Pages Inspected</span>
          <span className="text-2xl font-bold font-mono text-[#18181B] block mt-1">
            {report.pageSummaries.length} Page{report.pageSummaries.length > 1 ? 's' : ''}
          </span>
          <span className="text-[11px] text-[#A1A1AA] block mt-1">Direct HTML safe crawl</span>
        </div>

        <div className="p-4 border border-[#EAE6DF] rounded-xl">
          <span className="text-[#71717A] block">Total Findings</span>
          <span className="text-2xl font-bold font-mono text-[#18181B] block mt-1">
            {report.findings.length} Items
          </span>
          <span className="text-[11px] text-[#A1A1AA] block mt-1">Evidence-backed friction points</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-10">
        <h3 className="text-base font-bold text-[#18181B] pb-2 border-b border-[#EAE6DF] mb-3">
          1. Executive Summary & Observations
        </h3>
        <p className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed mb-4">
          {report.aiExecutiveSummary.summary}
        </p>

        {report.aiExecutiveSummary.topTakeaways.length > 0 && (
          <ul className="space-y-2 text-xs sm:text-sm text-[#27272A]">
            {report.aiExecutiveSummary.topTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#4F46E5] font-bold">·</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Section 2: Top Priority Fixes */}
      <div className="mb-10 print-break-inside-avoid">
        <h3 className="text-base font-bold text-[#18181B] pb-2 border-b border-[#EAE6DF] mb-4">
          2. Recommended Priority Action Plan ("Fix These First")
        </h3>
        
        <div className="space-y-4">
          {report.prioritizedActions.map((action, idx) => (
            <div key={action.id} className="p-4 border border-[#EAE6DF] rounded-xl bg-[#FAF8F5]/50 print:bg-white">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#18181B]">
                  #{idx + 1}. {action.title}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#71717A]">
                  {action.severity} Severity · {action.estimatedEffort} effort
                </span>
              </div>
              
              <p className="text-xs text-[#52525B] leading-relaxed mb-2">
                <strong>Why it matters:</strong> {action.whyItMatters}
              </p>

              <div className="p-2 bg-white border border-[#EAE6DF] rounded font-mono text-[11px] text-[#27272A] mb-2 truncate">
                Evidence: {action.evidence}
              </div>

              <p className="text-xs text-[#18181B] font-medium">
                <strong>Recommended solution:</strong> {action.recommendedFix}
              </p>

              {action.userCustomNote && (
                <div className="mt-2 pt-2 border-t border-[#EAE6DF] text-xs text-[#4F46E5]">
                  <strong>Consultant note:</strong> {action.userCustomNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Proposed Next Step & Implementation Package */}
      {meta.serviceOffering && (
        <div className="mt-10 p-6 bg-[#FAF8F5] border-2 border-[#18181B] rounded-2xl print:bg-white print-break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-[#71717A] block mb-1">
                Implementation Partnership
              </span>
              <h4 className="text-base sm:text-lg font-bold text-[#18181B]">
                {meta.serviceOffering}
              </h4>
              <p className="mt-1 text-xs text-[#52525B] max-w-xl">
                Ready to resolve these friction points without burdening your internal team? Let's implement the priority fixes directly.
              </p>
            </div>

            {meta.contactUrl && (
              <a
                href={meta.contactUrl}
                target="_blank"
                rel="noreferrer"
                className="no-print inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-xl transition-all shadow-xs shrink-0"
              >
                <span>Book Implementation Call</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {meta.contactUrl && (
            <div className="print-only mt-3 text-xs text-[#52525B]">
              Booking link: {meta.contactUrl}
            </div>
          )}
        </div>
      )}

      {/* Report Footer */}
      <div className="mt-12 pt-6 border-t border-[#EAE6DF] text-center text-[11px] text-[#A1A1AA] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Generated by FrictionMap AI Engine · Documented Heuristic Audit</span>
        <span>Confidential & Proprietary Report for {meta.clientName || domain}</span>
      </div>
    </div>
  );
};
