import React from 'react';
import { Layers, Globe, Clock, Check, AlertCircle } from 'lucide-react';
import type { PageSummary } from '../types/audit.js';

interface PagesTableProps {
  pages: PageSummary[];
}

export const PagesTable: React.FC<PagesTableProps> = ({ pages }) => {
  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-[#F0EBE1]">
        <div>
          <h3 className="text-base font-semibold text-[#18181B]">
            Inspected Pages & Crawl Scope
          </h3>
          <p className="mt-0.5 text-xs text-[#71717A]">
            Server crawler limits: depth 2, max 3 pages, strict 1.5MB response limit.
          </p>
        </div>
        <span className="font-mono text-xs text-[#71717A]">
          {pages.length} Page{pages.length > 1 ? 's' : ''} Analyzed
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#F0EBE1] text-[#71717A] font-semibold">
              <th className="pb-3 pr-4">Page URL & Title</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Load Time</th>
              <th className="pb-3 px-3">Word Count</th>
              <th className="pb-3 px-3">Headings</th>
              <th className="pb-3 pl-3 text-right">Images w/o Alt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9] text-[#27272A]">
            {pages.map((p, idx) => (
              <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="py-3 pr-4">
                  <div className="font-medium text-[#18181B] truncate max-w-[280px]">
                    {p.title || 'Untitled'}
                  </div>
                  <div className="font-mono text-[11px] text-[#71717A] truncate max-w-[320px]">
                    {p.url}
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Check className="w-3 h-3 text-emerald-600" />
                    {p.statusCode}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-[#52525B]">
                  {p.loadTimeMs}ms
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-[#52525B]">
                  {p.wordCount} words
                </td>
                <td className="py-3 px-3 font-mono tabular-nums text-[#52525B]">
                  {p.h1Count} x H1
                </td>
                <td className="py-3 pl-3 text-right font-mono tabular-nums">
                  {p.imagesWithoutAlt > 0 ? (
                    <span className="text-amber-700 font-semibold">
                      {p.imagesWithoutAlt} / {p.imagesCount}
                    </span>
                  ) : (
                    <span className="text-emerald-700">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
