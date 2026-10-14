import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { HeroSearch } from './components/HeroSearch.js';
import { AuditProgress } from './components/AuditProgress.js';
import { AuditScoreCard } from './components/AuditScoreCard.js';
import { FixTheseFirst } from './components/FixTheseFirst.js';
import { ExecutiveSummaryCard } from './components/ExecutiveSummaryCard.js';
import { FindingsExplorer } from './components/FindingsExplorer.js';
import { FreelancerCustomizer } from './components/FreelancerCustomizer.js';
import { ClientReadyReport } from './components/ClientReadyReport.js';
import { PagesTable } from './components/PagesTable.js';
import { SavedAuditsModal } from './components/SavedAuditsModal.js';
import { DEMO_ROASTERY_AUDIT, DEMO_LEGAL_AUDIT } from './data/demoAudits.js';
import { getSavedAudits, saveAuditReport, deleteSavedAudit } from './utils/storage.js';
import type { AuditReport, AppMode, FreelancerMeta, AuditFinding } from './types/audit.js';
import { ArrowLeft, RefreshCw, Printer, Download, Copy, Check, Sparkles, Building2, Briefcase } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>('business');
  const [activeReport, setActiveReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedAudits, setSavedAudits] = useState<AuditReport[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  // Load saved audits from localStorage on mount
  useEffect(() => {
    const list = getSavedAudits();
    setSavedAudits(list);
  }, []);

  const handleAnalyze = async (rawUrl: string) => {
    setIsLoading(true);
    setLoadingUrl(rawUrl);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl, mode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete website audit.');
      }

      const report: AuditReport = data.report;
      // Default freelancer metadata if missing
      if (!report.freelancerMeta) {
        report.freelancerMeta = {
          freelancerName: 'Independent UX Consultant',
          clientName: new URL(report.url).hostname,
          reportTitle: 'Website Usability & Friction Audit',
          customIntro: `Diagnostic review prepared for the team at ${new URL(report.url).hostname} identifying high-leverage friction points.`,
          serviceOffering: 'Usability Fixes & Design Retainer ($1,200 Sprint)',
          contactUrl: '',
        };
      }

      setActiveReport(report);
      saveAuditReport(report);
      setSavedAudits(getSavedAudits());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during the audit.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sampleType: 'roastery' | 'legal') => {
    const sample = sampleType === 'roastery' ? DEMO_ROASTERY_AUDIT : DEMO_LEGAL_AUDIT;
    setActiveReport(sample);
    saveAuditReport(sample);
    setSavedAudits(getSavedAudits());
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateMeta = (meta: FreelancerMeta) => {
    if (!activeReport) return;
    const updated: AuditReport = { ...activeReport, freelancerMeta: meta };
    setActiveReport(updated);
    saveAuditReport(updated);
    setSavedAudits(getSavedAudits());
  };

  const handleUpdateFinding = (updatedFinding: AuditFinding) => {
    if (!activeReport) return;
    const updatedFindings = activeReport.findings.map(f =>
      f.id === updatedFinding.id ? updatedFinding : f
    );
    const updatedPrioritized = activeReport.prioritizedActions.map(f =>
      f.id === updatedFinding.id ? updatedFinding : f
    );
    const updated: AuditReport = {
      ...activeReport,
      findings: updatedFindings,
      prioritizedActions: updatedPrioritized,
    };
    setActiveReport(updated);
    saveAuditReport(updated);
    setSavedAudits(getSavedAudits());
  };

  const handleRegenerateSummary = async () => {
    if (!activeReport) return;
    setIsRegeneratingSummary(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeReport.url,
          findings: activeReport.findings,
          mode,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary) {
        const updated: AuditReport = {
          ...activeReport,
          aiExecutiveSummary: data.summary,
        };
        setActiveReport(updated);
        saveAuditReport(updated);
      }
    } catch (err) {
      console.error('Failed to regenerate summary:', err);
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!activeReport) return;
    const jsonStr = JSON.stringify(activeReport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frictionmap-${new URL(activeReport.url).hostname}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    if (!activeReport) return;
    const domain = new URL(activeReport.url).hostname;
    const text = `
# FrictionMap AI Usability Audit: ${domain}
Site Clarity Score: ${activeReport.score.totalScore}/100
Date: ${new Date(activeReport.scannedAt).toLocaleDateString()}

## Executive Summary
${activeReport.aiExecutiveSummary.summary}

## Top 3 Priority Actions ("Fix These First"):
${activeReport.prioritizedActions.map((a, i) => `${i + 1}. [${a.severity.toUpperCase()}] ${a.title}\n   Why it matters: ${a.whyItMatters}\n   Fix: ${a.recommendedFix}`).join('\n\n')}

## Findings Summary
Total issues observed: ${activeReport.findings.length}
High severity: ${activeReport.findings.filter(f => f.severity === 'high').length}
Medium severity: ${activeReport.findings.filter(f => f.severity === 'medium').length}
Low severity: ${activeReport.findings.filter(f => f.severity === 'low').length}

Audit by FrictionMap AI — https://frictionmap.ai
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDeleteSavedAudit = (id: string) => {
    const updated = deleteSavedAudit(id);
    setSavedAudits(updated);
    if (activeReport && activeReport.id === id) {
      setActiveReport(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] flex flex-col font-sans selection:bg-[#E0E7FF] selection:text-[#3730A3]">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        savedCount={savedAudits.length}
        onNewAudit={() => {
          setActiveReport(null);
          setErrorMessage(null);
        }}
        hasActiveReport={Boolean(activeReport)}
      />

      <main className="flex-1">
        {/* Loading state */}
        {isLoading && <AuditProgress targetUrl={loadingUrl} />}

        {/* Hero & Input View when no report is active */}
        {!isLoading && !activeReport && (
          <HeroSearch
            mode={mode}
            onModeChange={setMode}
            onAnalyze={handleAnalyze}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {/* Report View when report is active */}
        {!isLoading && activeReport && (
          <div className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            {/* Top Report Toolbar */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE6DF]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveReport(null)}
                  className="p-1.5 rounded-lg border border-[#D4CEBF] bg-white hover:bg-[#FAF8F5] text-[#52525B] transition-colors"
                  title="Return to new audit"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-[#18181B]">
                      {new URL(activeReport.url).hostname}
                    </span>
                    {activeReport.isDemo && (
                      <span className="font-mono text-[10px] uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                        DEMO DATA
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#71717A]">
                    Audited {new Date(activeReport.scannedAt).toLocaleDateString()} at{' '}
                    {new Date(activeReport.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D4CEBF] rounded-lg hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 text-xs font-medium text-[#18181B] bg-white border border-[#D4CEBF] rounded-lg hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#71717A]" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#18181B] hover:bg-[#27272A] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* In Freelancer Mode: Show Dedicated Customizer */}
            {mode === 'freelancer' && activeReport.freelancerMeta && (
              <FreelancerCustomizer
                meta={activeReport.freelancerMeta}
                onUpdateMeta={handleUpdateMeta}
                report={activeReport}
                onPrintReport={handlePrint}
                onExportJson={handleExportJson}
                onCopySummary={handleCopySummary}
                copied={copiedSummary}
              />
            )}

            {/* In Freelancer Mode: Client-Ready Presentation Component */}
            {mode === 'freelancer' && activeReport.freelancerMeta ? (
              <ClientReadyReport
                report={activeReport}
                meta={activeReport.freelancerMeta}
              />
            ) : null}

            {/* Standard Dashboard Sections (Rendered for Business mode or detailed review) */}
            <div className={mode === 'freelancer' ? 'no-print space-y-8 pt-6 border-t border-[#EAE6DF]' : 'space-y-8'}>
              {mode === 'freelancer' && (
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#71717A] font-semibold">
                  <span>Detailed Technical Audit Diagnostics (Consultant View)</span>
                </div>
              )}

              {/* Site Clarity Score Card */}
              <AuditScoreCard
                score={activeReport.score}
                url={activeReport.url}
                isDemo={activeReport.isDemo}
              />

              {/* Fix These First Top 3 Actions */}
              <FixTheseFirst
                actions={activeReport.prioritizedActions}
                onSelectFinding={(id) => {
                  setSelectedFindingId(id);
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              />

              {/* Executive Summary & Copy Alternatives */}
              <ExecutiveSummaryCard
                summary={activeReport.aiExecutiveSummary}
                mode={mode}
                onRegenerate={handleRegenerateSummary}
                isRegenerating={isRegeneratingSummary}
              />

              {/* All Findings Explorer */}
              <FindingsExplorer
                findings={activeReport.findings}
                mode={mode}
                onUpdateFinding={handleUpdateFinding}
                selectedFindingId={selectedFindingId}
              />

              {/* Inspected Pages Table */}
              <PagesTable pages={activeReport.pageSummaries} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer border-t border-[#EAE6DF] bg-[#FAF8F5] py-8 text-xs text-[#71717A] no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#18181B]">FrictionMap AI</span>
            <span>·</span>
            <span>Find friction. Fix what matters.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Deterministic 13-Point Heuristic Engine</span>
            <span>·</span>
            <span>SSRF & Isolated Network Security</span>
          </div>
        </div>
      </footer>

      {/* Saved Audits Modal */}
      <SavedAuditsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedAudits={savedAudits}
        onSelectAudit={(report) => {
          setActiveReport(report);
          setErrorMessage(null);
        }}
        onDeleteAudit={handleDeleteSavedAudit}
      />
    </div>
  );
}
