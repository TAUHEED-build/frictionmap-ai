import React from 'react';
import { X, Trash2, ArrowRight, FolderArchive, ExternalLink, Calendar } from 'lucide-react';
import type { AuditReport } from '../types/audit.js';

interface SavedAuditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAudits: AuditReport[];
  onSelectAudit: (report: AuditReport) => void;
  onDeleteAudit: (id: string) => void;
}

export const SavedAuditsModal: React.FC<SavedAuditsModalProps> = ({
  isOpen,
  onClose,
  savedAudits,
  onSelectAudit,
  onDeleteAudit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E1D8] rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#F0EBE1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-[#4F46E5]" />
            <h3 className="text-sm font-semibold text-[#18181B]">
              Locally Saved Audits ({savedAudits.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717A] hover:text-[#18181B] rounded-lg hover:bg-[#FAF8F5] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-xs text-[#71717A] leading-relaxed mb-4">
            Audits are securely cached in your local browser storage. They do not sync across devices or external servers.
          </div>

          {savedAudits.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717A]">
              <FolderArchive className="w-8 h-8 text-[#D4CEBF] mx-auto mb-2" />
              <p className="font-medium text-[#18181B]">No saved audits yet</p>
              <p className="mt-1 text-[#A1A1AA]">Run an audit or view a sample report to automatically save it here.</p>
            </div>
          ) : (
            savedAudits.map((report) => {
              const domain = new URL(report.url).hostname;
              const dateStr = new Date(report.scannedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={report.id}
                  className="p-4 border border-[#EAE6DF] rounded-xl bg-white hover:bg-[#FAF8F5] transition-colors flex items-center justify-between gap-4 group"
                >
                  <div
                    onClick={() => {
                      onSelectAudit(report);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#18181B] group-hover:text-[#4F46E5] transition-colors">
                        {domain}
                      </span>
                      {report.isDemo && (
                        <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200 px-1.5 rounded">
                          Demo
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#71717A]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A1A1AA]" />
                        <span>{dateStr}</span>
                      </span>
                      <span>·</span>
                      <span>{report.findings.length} findings</span>
                      <span>·</span>
                      <span className="font-mono font-medium text-[#18181B]">
                        Score: {report.score.totalScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectAudit(report);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-medium text-[#18181B] bg-white border border-[#D4CEBF] rounded-lg hover:bg-[#FAF8F5] transition-colors flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteAudit(report.id)}
                      className="p-1.5 text-[#A1A1AA] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete saved audit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#F0EBE1] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D4CEBF] rounded-lg hover:bg-[#FAF8F5] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
