import React, { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Edit3,
  Check,
  ExternalLink,
} from 'lucide-react';
import type { AuditFinding, FindingCategory, Severity, AppMode } from '../types/audit.js';

interface FindingsExplorerProps {
  findings: AuditFinding[];
  mode: AppMode;
  onUpdateFinding?: (updated: AuditFinding) => void;
  selectedFindingId?: string | null;
}

const CATEGORY_NAMES: Record<FindingCategory, string> = {
  first_impressions: 'First Impressions',
  clarity_copy: 'Clarity & Copy',
  navigation_links: 'Navigation & CTAs',
  accessibility_forms: 'Accessibility & Forms',
  trust_contact: 'Trust & Contact',
};

export const FindingsExplorer: React.FC<FindingsExplorerProps> = ({
  findings,
  mode,
  onUpdateFinding,
  selectedFindingId,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<FindingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(selectedFindingId ? [selectedFindingId] : findings.slice(0, 2).map(f => f.id))
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const handleStartEdit = (f: AuditFinding) => {
    setEditingId(f.id);
    setEditNote(f.userCustomNote || f.recommendedFix);
  };

  const handleSaveEdit = (f: AuditFinding) => {
    if (onUpdateFinding) {
      onUpdateFinding({
        ...f,
        userCustomNote: editNote.trim(),
      });
    }
    setEditingId(null);
  };

  // Filter findings
  const filtered = findings.filter(f => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        f.title.toLowerCase().includes(q) ||
        f.evidence.toLowerCase().includes(q) ||
        f.whyItMatters.toLowerCase().includes(q) ||
        f.recommendedFix.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const severityCounts = {
    all: findings.length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  return (
    <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F0EBE1]">
        <div>
          <h3 className="text-base font-semibold text-[#18181B]">
            All Verified Audit Findings
          </h3>
          <p className="mt-0.5 text-xs text-[#71717A]">
            Inspected elements backed by extracted HTML code and transparent usability heuristics.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings or evidence..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E5E1D8] rounded-lg text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
      </div>

      {/* Filter Tabs: Severity */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg">
          {(['all', 'high', 'medium', 'low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap capitalize ${
                selectedSeverity === sev
                  ? 'bg-white text-[#18181B] shadow-xs'
                  : 'text-[#71717A] hover:text-[#18181B]'
              }`}
            >
              {sev} ({severityCounts[sev]})
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717A] hidden sm:inline">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-[#18181B] focus:outline-none"
          >
            <option value="all">All Categories ({findings.length})</option>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => {
              const count = findings.filter(f => f.category === key).length;
              return (
                <option key={key} value={key}>
                  {name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#71717A]">
            No findings match your selected filters.
          </div>
        ) : (
          filtered.map(finding => {
            const isExpanded = expandedIds.has(finding.id);
            const isEditing = editingId === finding.id;

            const sevBadge =
              finding.severity === 'high'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : finding.severity === 'medium'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <div
                key={finding.id}
                id={finding.id}
                className={`border rounded-xl transition-all ${
                  isExpanded ? 'border-[#D4CEBF] bg-[#FAF8F5]/30' : 'border-[#EAE6DF] bg-white'
                }`}
              >
                {/* Collapsed Bar */}
                <div
                  onClick={() => toggleExpand(finding.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5]/60 transition-colors select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${sevBadge}`}>
                      {finding.severity}
                    </span>

                    <div>
                      <h4 className="text-sm font-semibold text-[#18181B]">
                        {finding.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
                        <span>{CATEGORY_NAMES[finding.category]}</span>
                        <span>·</span>
                        <span className="capitalize">{finding.confidence} Confidence</span>
                        {finding.affectedElement && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[11px] text-[#52525B] truncate max-w-[280px]">
                              {finding.affectedElement}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[#71717A]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-2 border-t border-[#F0EBE1] text-xs space-y-4">
                    {/* Evidence Snippet */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] block mb-1">
                        Supporting Evidence
                      </span>
                      <div className="p-3 bg-white border border-[#E5E1D8] rounded-lg font-mono text-[11px] text-[#27272A] whitespace-pre-wrap break-all">
                        {finding.evidence}
                      </div>
                    </div>

                    {/* Why It Matters */}
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A] block mb-1">
                        Why It Matters to a Visitor
                      </span>
                      <p className="text-[#3F3F46] leading-relaxed">
                        {finding.whyItMatters}
                      </p>
                    </div>

                    {/* Recommended Fix */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#18181B]">
                          Recommended Fix
                        </span>
                        {mode === 'freelancer' && !isEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(finding);
                            }}
                            className="text-[#4F46E5] hover:underline flex items-center gap-1 text-[11px] font-medium"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Add Consultant Note</span>
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 bg-white border border-[#4F46E5] rounded-lg text-xs text-[#18181B] focus:outline-none"
                            placeholder="Add your personalized consulting recommendation or scope notes for the client..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1 text-xs text-[#71717A] bg-white border border-[#E5E1D8] rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(finding)}
                              className="px-3 py-1 text-xs text-white bg-[#18181B] rounded-md flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-[#18181B] leading-relaxed">
                          <p>{finding.recommendedFix}</p>
                          {finding.userCustomNote && (
                            <div className="mt-2 pt-2 border-t border-[#EAE6DF] text-[#4F46E5]">
                              <span className="font-semibold block text-[10px] uppercase tracking-wider">
                                Consultant Note:
                              </span>
                              <p className="mt-0.5">{finding.userCustomNote}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meta info & limitations */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#71717A] border-t border-[#F2EFE9]">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#A1A1AA]" />
                          <span>Effort: {finding.estimatedEffort}</span>
                        </span>
                        <span>·</span>
                        <span className="truncate max-w-[260px]">
                          URL: {finding.affectedUrl}
                        </span>
                      </div>

                      {finding.detectionLimitation && (
                        <span className="text-[#A1A1AA] italic">
                          Limitation: {finding.detectionLimitation}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
