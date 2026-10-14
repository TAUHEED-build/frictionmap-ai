export type Severity = 'high' | 'medium' | 'low';
export type Confidence = 'confirmed' | 'probable' | 'inconclusive';

export type FindingCategory =
  | 'first_impressions'
  | 'navigation_links'
  | 'clarity_copy'
  | 'trust_contact'
  | 'accessibility_forms';

export interface AuditFinding {
  id: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  category: FindingCategory;
  affectedUrl: string;
  affectedElement?: string;
  evidence: string;
  whyItMatters: string;
  recommendedFix: string;
  estimatedEffort: 'quick' | 'moderate' | 'substantial';
  detectionLimitation?: string;
  userCustomNote?: string;
}

export interface CategoryScore {
  score: number;
  weight: number;
  testedCount: number;
  passedCount: number;
  issuesCount: number;
}

export interface ScoreBreakdown {
  totalScore: number;
  categories: Record<FindingCategory, CategoryScore>;
  scoringExplanation: string;
  coverage: {
    pagesInspected: number;
    maxPagesAttempted: number;
    skippedReasons: string[];
  };
}

export interface PageSummary {
  url: string;
  title: string;
  statusCode: number;
  wordCount: number;
  loadTimeMs: number;
  hasViewport: boolean;
  h1Count: number;
  imagesCount: number;
  imagesWithoutAlt: number;
}

export interface AICopySuggestion {
  original: string;
  suggestion: string;
  reason: string;
}

export interface AIExecutiveSummary {
  summary: string;
  topTakeaways: string[];
  copySuggestions: AICopySuggestion[];
  businessContextAdvice: string;
  isAiGenerated: boolean;
}

export interface FreelancerMeta {
  freelancerName: string;
  clientName: string;
  reportTitle: string;
  logoUrl?: string;
  customIntro?: string;
  serviceOffering?: string;
  contactUrl?: string;
  customActionOrder?: string[];
}

export interface AuditReport {
  id: string;
  url: string;
  scannedAt: string;
  score: ScoreBreakdown;
  findings: AuditFinding[];
  prioritizedActions: AuditFinding[];
  pageSummaries: PageSummary[];
  aiExecutiveSummary: AIExecutiveSummary;
  freelancerMeta?: FreelancerMeta;
  isDemo?: boolean;
}

export type AppMode = 'business' | 'freelancer';
