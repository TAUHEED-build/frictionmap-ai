import type { AuditReport } from '../types/audit.js';

const STORAGE_KEY = 'frictionmap_saved_audits_v1';

export function getSavedAudits(): AuditReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load saved audits from localStorage:', err);
    return [];
  }
}

export function saveAuditReport(report: AuditReport): void {
  try {
    const existing = getSavedAudits();
    // Prepend or update if already existing
    const filtered = existing.filter(item => item.id !== report.id);
    const updated = [report, ...filtered].slice(0, 20); // keep up to 20 audits locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save audit to localStorage:', err);
  }
}

export function deleteSavedAudit(id: string): AuditReport[] {
  try {
    const existing = getSavedAudits();
    const updated = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete saved audit from localStorage:', err);
    return [];
  }
}
