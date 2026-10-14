import React, { useState } from 'react';
import { Briefcase, Building2, User, FileText, Link, DollarSign, Check, X, Printer, Copy, Download } from 'lucide-react';
import type { FreelancerMeta, AuditReport } from '../types/audit.js';

interface FreelancerCustomizerProps {
  meta: FreelancerMeta;
  onUpdateMeta: (meta: FreelancerMeta) => void;
  report: AuditReport;
  onPrintReport: () => void;
  onExportJson: () => void;
  onCopySummary: () => void;
  copied: boolean;
}

export const FreelancerCustomizer: React.FC<FreelancerCustomizerProps> = ({
  meta,
  onUpdateMeta,
  report,
  onPrintReport,
  onExportJson,
  onCopySummary,
  copied,
}) => {
  const [formData, setFormData] = useState<FreelancerMeta>(meta);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (key: keyof FreelancerMeta, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMeta(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE1]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base font-semibold text-[#18181B]">
              Freelancer Client-Report Customizer
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#71717A]">
            Personalize branding, client names, introductory letters, and your proposed implementation offering.
          </p>
        </div>

        {/* Quick Report Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopySummary}
            className="px-3 py-1.5 text-xs font-medium text-[#18181B] bg-[#FAF8F5] border border-[#D4CEBF] rounded-lg hover:bg-[#F2EFE9] transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExportJson}
            className="px-3 py-1.5 text-xs font-medium text-[#18181B] bg-[#FAF8F5] border border-[#D4CEBF] rounded-lg hover:bg-[#F2EFE9] transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onPrintReport}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#3F3F46] mb-1">
              Your Name / Agency Studio
            </label>
            <input
              type="text"
              value={formData.freelancerName}
              onChange={(e) => handleChange('freelancerName', e.target.value)}
              placeholder="e.g. Studio North UX"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F3F46] mb-1">
              Client / Business Name
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              placeholder="e.g. Acme Health Products"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#3F3F46] mb-1">
              Report Title
            </label>
            <input
              type="text"
              value={formData.reportTitle}
              onChange={(e) => handleChange('reportTitle', e.target.value)}
              placeholder="e.g. Website Usability & Conversion Diagnostic"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#3F3F46] mb-1">
              Consultant Booking / Contact URL
            </label>
            <input
              type="text"
              value={formData.contactUrl || ''}
              onChange={(e) => handleChange('contactUrl', e.target.value)}
              placeholder="e.g. https://cal.com/your-name/usability-review"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#3F3F46] mb-1">
            Personalized Executive Introduction Letter
          </label>
          <textarea
            value={formData.customIntro || ''}
            onChange={(e) => handleChange('customIntro', e.target.value)}
            rows={2}
            placeholder="e.g. Prepared for the leadership team at Acme to highlight key usability findings ahead of your Q4 campaigns..."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#3F3F46] mb-1">
            Proposed Implementation Service Package
          </label>
          <input
            type="text"
            value={formData.serviceOffering || ''}
            onChange={(e) => handleChange('serviceOffering', e.target.value)}
            placeholder="e.g. 5-Day Usability Sprint & Copy Polish ($1,400 one-time)"
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-[#71717A]">
            Changes automatically reflect in the client-ready preview below and print view.
          </span>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>{isSaved ? 'Report Updated' : 'Apply to Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
