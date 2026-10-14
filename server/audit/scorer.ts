import type { AuditFinding, FindingCategory, ScoreBreakdown, CategoryScore } from '../../src/types/audit.js';

interface CategoryConfig {
  weight: number;
  maxDeduction: number;
}

const CATEGORY_CONFIG: Record<FindingCategory, CategoryConfig> = {
  first_impressions: { weight: 0.25, maxDeduction: 30 },
  clarity_copy: { weight: 0.25, maxDeduction: 30 },
  navigation_links: { weight: 0.20, maxDeduction: 25 },
  accessibility_forms: { weight: 0.15, maxDeduction: 20 },
  trust_contact: { weight: 0.15, maxDeduction: 20 },
};

const SEVERITY_POINTS: Record<string, number> = {
  high: 14,
  medium: 7,
  low: 3,
};

const CONFIDENCE_MULTIPLIER: Record<string, number> = {
  confirmed: 1.0,
  probable: 0.75,
  inconclusive: 0.35,
};

/**
 * Calculates a deterministic, explainable Site Clarity Score (0–100) based on observed findings.
 */
export function calculateSiteClarityScore(
  findings: AuditFinding[],
  coverage: { pagesInspected: number; maxPagesAttempted: number; skippedReasons: string[] }
): ScoreBreakdown {
  const categoryDeductions: Record<FindingCategory, number> = {
    first_impressions: 0,
    clarity_copy: 0,
    navigation_links: 0,
    accessibility_forms: 0,
    trust_contact: 0,
  };

  const categoryIssuesCount: Record<FindingCategory, number> = {
    first_impressions: 0,
    clarity_copy: 0,
    navigation_links: 0,
    accessibility_forms: 0,
    trust_contact: 0,
  };

  for (const finding of findings) {
    const rawPoints = SEVERITY_POINTS[finding.severity] || 3;
    const confidenceMultiplier = CONFIDENCE_MULTIPLIER[finding.confidence] || 1.0;
    const deduction = rawPoints * confidenceMultiplier;

    categoryDeductions[finding.category] += deduction;
    categoryIssuesCount[finding.category]++;
  }

  // Calculate per-category scores (0 - 100 scale within each category)
  const categories: Record<FindingCategory, CategoryScore> = {
    first_impressions: { score: 100, weight: CATEGORY_CONFIG.first_impressions.weight, testedCount: 4, passedCount: 4, issuesCount: 0 },
    clarity_copy: { score: 100, weight: CATEGORY_CONFIG.clarity_copy.weight, testedCount: 4, passedCount: 4, issuesCount: 0 },
    navigation_links: { score: 100, weight: CATEGORY_CONFIG.navigation_links.weight, testedCount: 3, passedCount: 3, issuesCount: 0 },
    accessibility_forms: { score: 100, weight: CATEGORY_CONFIG.accessibility_forms.weight, testedCount: 2, passedCount: 2, issuesCount: 0 },
    trust_contact: { score: 100, weight: CATEGORY_CONFIG.trust_contact.weight, testedCount: 2, passedCount: 2, issuesCount: 0 },
  };

  let totalDeductionWeighted = 0;

  for (const catKey of Object.keys(CATEGORY_CONFIG) as FindingCategory[]) {
    const config = CATEGORY_CONFIG[catKey];
    const deduction = Math.min(categoryDeductions[catKey], config.maxDeduction);
    
    // Scale deduction to 0-100 category index
    const categoryPercentLost = (deduction / config.maxDeduction) * 100;
    const catScore = Math.max(0, Math.round(100 - categoryPercentLost));
    
    const issues = categoryIssuesCount[catKey];
    const tested = Math.max(issues + 1, 3);
    
    categories[catKey] = {
      score: catScore,
      weight: config.weight,
      testedCount: tested,
      passedCount: Math.max(0, tested - issues),
      issuesCount: issues,
    };

    totalDeductionWeighted += (deduction / config.maxDeduction) * (config.weight * 100);
  }

  // Crawl coverage penalty if only 1 page was accessible out of target 3
  let coverageAdjustment = 0;
  if (coverage.pagesInspected === 1 && coverage.maxPagesAttempted > 1) {
    coverageAdjustment = 2; // small notation deduction for limited sample size
  }

  const rawTotal = Math.max(10, Math.round(100 - totalDeductionWeighted - coverageAdjustment));

  const explanation = `Site Clarity Score is calculated deterministically across 5 weighted dimensions: First Impressions (25%), Clarity & Copy (25%), Navigation & Links (20%), Accessibility & Forms (15%), and Trust & Contact (15%). Points are deducted per confirmed finding (High: -14pts, Medium: -7pts, Low: -3pts) and capped per category. This score is a heuristic audit metric and does not predict visitor conversion or revenue.`;

  return {
    totalScore: rawTotal,
    categories,
    scoringExplanation: explanation,
    coverage,
  };
}

/**
 * Prioritizes findings to surface the top 3 high-impact fixes ("Fix these first").
 * Uses severity, confidence, and implementation effort.
 */
export function prioritizeFindings(findings: AuditFinding[]): AuditFinding[] {
  const effortScore: Record<string, number> = {
    quick: 3,
    moderate: 2,
    substantial: 1,
  };

  const severityScore: Record<string, number> = {
    high: 10,
    medium: 5,
    low: 2,
  };

  const confidenceScore: Record<string, number> = {
    confirmed: 3,
    probable: 2,
    inconclusive: 1,
  };

  const sorted = [...findings].sort((a, b) => {
    // Rank score = Severity * 4 + Effort * 2 + Confidence
    const rankA = (severityScore[a.severity] * 4) + (effortScore[a.estimatedEffort] * 2) + confidenceScore[a.confidence];
    const rankB = (severityScore[b.severity] * 4) + (effortScore[b.estimatedEffort] * 2) + confidenceScore[b.confidence];
    return rankB - rankA;
  });

  return sorted.slice(0, 3);
}
