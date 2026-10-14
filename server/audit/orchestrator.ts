import { safeFetchHtml, probeUrlStatus, FetchedPage } from './crawler.js';
import { runPageAudit } from './rules.js';
import { calculateSiteClarityScore, prioritizeFindings } from './scorer.js';
import { generateAuditExplanations } from './aiExplainer.js';
import type { AuditReport, AuditFinding, PageSummary } from '../../src/types/audit.js';

export async function executeAudit(
  rawUrl: string,
  mode: 'business' | 'freelancer' = 'business'
): Promise<AuditReport> {
  const primaryPage = await safeFetchHtml(rawUrl);
  const origin = new URL(primaryPage.url).origin;

  const pageSummaries: PageSummary[] = [];
  const allFindings: AuditFinding[] = [];
  const skippedReasons: string[] = [];

  // Inspect primary page
  const primaryResult = runPageAudit({
    pageUrl: primaryPage.url,
    html: primaryPage.html,
    statusCode: primaryPage.statusCode,
    loadTimeMs: primaryPage.loadTimeMs,
    origin,
  });

  pageSummaries.push(primaryResult.summary);
  allFindings.push(...primaryResult.findings);

  // Probe up to 2 internal links safely
  const linksToCrawl = primaryResult.internalLinks.slice(0, 2);
  let inspectedCount = 1;

  for (const nextUrl of linksToCrawl) {
    try {
      const secondaryPage = await safeFetchHtml(nextUrl);
      const secondaryResult = runPageAudit({
        pageUrl: secondaryPage.url,
        html: secondaryPage.html,
        statusCode: secondaryPage.statusCode,
        loadTimeMs: secondaryPage.loadTimeMs,
        origin,
      });

      pageSummaries.push(secondaryResult.summary);
      
      // Avoid duplicate rule alerts across identical page elements
      for (const finding of secondaryResult.findings) {
        const isDuplicate = allFindings.some(
          existing => existing.category === finding.category && existing.title === finding.title
        );
        if (!isDuplicate) {
          allFindings.push(finding);
        }
      }
      inspectedCount++;
    } catch (crawlErr: unknown) {
      const msg = crawlErr instanceof Error ? crawlErr.message : String(crawlErr);
      skippedReasons.push(`Skipped ${nextUrl}: ${msg}`);
    }
  }

  // Calculate deterministic score
  const scoreBreakdown = calculateSiteClarityScore(allFindings, {
    pagesInspected: inspectedCount,
    maxPagesAttempted: 1 + linksToCrawl.length,
    skippedReasons,
  });

  // Top prioritized actions
  const prioritizedActions = prioritizeFindings(allFindings);

  // AI or deterministic executive summary
  const aiSummary = await generateAuditExplanations(primaryPage.url, allFindings, mode);

  const report: AuditReport = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: primaryPage.url,
    scannedAt: new Date().toISOString(),
    score: scoreBreakdown,
    findings: allFindings,
    prioritizedActions,
    pageSummaries,
    aiExecutiveSummary: aiSummary,
    isDemo: false,
  };

  return report;
}
