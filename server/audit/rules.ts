import * as cheerio from 'cheerio';
import type { AuditFinding, PageSummary, FindingCategory } from '../../src/types/audit.js';

export interface InspectionContext {
  pageUrl: string;
  html: string;
  statusCode: number;
  loadTimeMs: number;
  origin: string;
}

/**
 * Runs deterministic audit rules across the fetched page HTML using Cheerio.
 */
export function runPageAudit(ctx: InspectionContext): {
  findings: AuditFinding[];
  summary: PageSummary;
  internalLinks: string[];
} {
  const { pageUrl, html, statusCode, loadTimeMs, origin } = ctx;
  const $ = cheerio.load(html);
  const findings: AuditFinding[] = [];

  // Extract page metadata
  const titleText = $('title').text().trim();
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || '';
  const viewportContent = $('meta[name="viewport" i]').attr('content') || '';
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const primaryH1Text = h1Elements.first().text().trim();

  // Word count heuristic
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = bodyText.split(' ').filter(w => w.length > 0);
  const wordCount = words.length;

  // Track images
  const allImages = $('img');
  const imagesCount = allImages.length;
  let imagesWithoutAlt = 0;

  // --- CHECK 1: Page Title ---
  if (!titleText) {
    findings.push({
      id: `title-missing-${Date.now()}-1`,
      title: 'Missing Page Title Tag',
      severity: 'high',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: '<title>',
      evidence: 'No <title> tag found in HTML <head>.',
      whyItMatters: 'The page title is the first thing users see in browser tabs, bookmarks, and search results. A missing title creates mistrust and makes tabs unrecognizable.',
      recommendedFix: 'Add a distinct, informative <title> tag (50–60 characters) describing the page purpose and brand.',
      estimatedEffort: 'quick',
    });
  } else if (titleText.length < 10) {
    findings.push({
      id: `title-short-${Date.now()}-2`,
      title: 'Vague or Excessively Brief Page Title',
      severity: 'medium',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: `<title>${titleText}</title>`,
      evidence: `Page title is only ${titleText.length} characters: "${titleText}".`,
      whyItMatters: 'Very short titles (like "Home" or "Index") fail to communicate value to visitors scanning multiple open browser tabs or search listings.',
      recommendedFix: `Expand the title to state what you offer and your brand name (e.g. "${titleText} | Specialty Coffee Roasters in Seattle").`,
      estimatedEffort: 'quick',
    });
  } else if (titleText.length > 75) {
    findings.push({
      id: `title-long-${Date.now()}-3`,
      title: 'Page Title Exceeds Recommended Length',
      severity: 'low',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: `<title>${titleText.substring(0, 50)}...</title>`,
      evidence: `Page title is ${titleText.length} characters (recommended: 40–65 characters).`,
      whyItMatters: 'Overly long titles get truncated with ellipsis (...) in browser tabs and search snippets, cutting off key information.',
      recommendedFix: 'Refine the title to under 65 characters while keeping the unique offering and company name at the beginning.',
      estimatedEffort: 'quick',
    });
  }

  // --- CHECK 2: Meta Description ---
  if (!metaDescription) {
    findings.push({
      id: `meta-desc-missing-${Date.now()}-4`,
      title: 'Missing Meta Description',
      severity: 'medium',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: '<head>',
      evidence: 'No <meta name="description"> tag detected in the page head.',
      whyItMatters: 'When shared on social channels, messaging apps, or search engines, visitors rely on this summary snippet before deciding to click.',
      recommendedFix: 'Include a crisp 120–155 character meta description highlighting your core value proposition and a gentle call to action.',
      estimatedEffort: 'quick',
    });
  } else if (metaDescription.length < 40) {
    findings.push({
      id: `meta-desc-short-${Date.now()}-5`,
      title: 'Meta Description Is Too Abbreviated',
      severity: 'low',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: `<meta name="description" content="${metaDescription}">`,
      evidence: `Current meta description is only ${metaDescription.length} characters: "${metaDescription}".`,
      whyItMatters: 'Search engines and preview cards may replace sparse descriptions with arbitrary scraped navigation snippets.',
      recommendedFix: 'Flesh out the description to 120–150 characters with benefits relevant to your target customer.',
      estimatedEffort: 'quick',
    });
  }

  // --- CHECK 3: Primary H1 Heading ---
  if (h1Count === 0) {
    findings.push({
      id: `h1-missing-${Date.now()}-6`,
      title: 'No Primary H1 Heading Found',
      severity: 'high',
      confidence: 'confirmed',
      category: 'clarity_copy',
      affectedUrl: pageUrl,
      affectedElement: '<body>',
      evidence: 'Zero <h1> elements exist on this page.',
      whyItMatters: 'Visitors decide within 3 seconds whether they are in the right place. Without a clear top-level H1 heading, the page lacks an immediate focal point.',
      recommendedFix: 'Add one clear, benefit-driven <h1> heading near the top of the page articulating what your business does.',
      estimatedEffort: 'quick',
    });
  } else if (h1Count > 1) {
    findings.push({
      id: `h1-multiple-${Date.now()}-7`,
      title: 'Multiple H1 Headings Creating Hierarchy Conflict',
      severity: 'medium',
      confidence: 'confirmed',
      category: 'clarity_copy',
      affectedUrl: pageUrl,
      affectedElement: `${h1Count} x <h1> elements`,
      evidence: `Detected ${h1Count} separate <h1> tags: "${primaryH1Text.substring(0, 40)}..." and others.`,
      whyItMatters: 'Multiple H1 headings confuse assistive screen readers and divide visual hierarchy, leaving visitors unsure of the main topic.',
      recommendedFix: 'Reserve <h1> strictly for the primary headline of the page. Convert secondary section headers to <h2> or <h3> tags.',
      estimatedEffort: 'quick',
    });
  }

  // --- CHECK 4: Heading Hierarchy Skips ---
  const headingTags = $('h1, h2, h3, h4, h5, h6');
  let prevLevel = 0;
  let hierarchySkipped = false;
  let skippedEvidence = '';

  headingTags.each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const currentLevel = parseInt(tagName.replace('h', ''), 10);
    if (prevLevel > 0 && currentLevel > prevLevel + 1) {
      hierarchySkipped = true;
      skippedEvidence = `Found <${tagName}> directly after <h${prevLevel}> without intermediate level.`;
      return false; // break
    }
    prevLevel = currentLevel;
  });

  if (hierarchySkipped) {
    findings.push({
      id: `heading-hierarchy-skip-${Date.now()}-8`,
      title: 'Broken Heading Level Progression',
      severity: 'low',
      confidence: 'confirmed',
      category: 'clarity_copy',
      affectedUrl: pageUrl,
      evidence: skippedEvidence,
      whyItMatters: 'Skipping heading levels (e.g. jumping from H1 directly to H3 or H4) breaks the document outline, degrading accessibility and visual scanning.',
      recommendedFix: 'Structure sections logically: use H2 for major themes, and nest H3 sub-topics underneath H2.',
      estimatedEffort: 'moderate',
    });
  }

  // --- CHECK 5: Images Missing Alt Text ---
  const genericAltTerms = ['image', 'photo', 'banner', 'untitled', 'picture', 'icon', 'logo'];
  const problematicImages: string[] = [];

  allImages.each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || 'unknown';
    if (alt === undefined || alt === null || alt.trim() === '') {
      imagesWithoutAlt++;
      if (problematicImages.length < 3) {
        problematicImages.push(`<img src="${src.substring(0, 45)}...">`);
      }
    } else {
      const lower = alt.trim().toLowerCase();
      if (genericAltTerms.includes(lower)) {
        imagesWithoutAlt++;
        if (problematicImages.length < 3) {
          problematicImages.push(`<img alt="${alt}" src="${src.substring(0, 30)}...">`);
        }
      }
    }
  });

  if (imagesWithoutAlt > 0) {
    const severity = imagesWithoutAlt > 3 ? 'medium' : 'low';
    findings.push({
      id: `img-missing-alt-${Date.now()}-9`,
      title: `${imagesWithoutAlt} Image${imagesWithoutAlt > 1 ? 's' : ''} Missing Descriptive Alt Text`,
      severity,
      confidence: 'confirmed',
      category: 'accessibility_forms',
      affectedUrl: pageUrl,
      affectedElement: problematicImages.join(', '),
      evidence: `${imagesWithoutAlt} of ${imagesCount} images either lack the alt attribute or contain generic placeholder text.`,
      whyItMatters: 'Visitors on slow networks, screen reader users, and search crawlers cannot understand image context when alt attributes are missing.',
      recommendedFix: 'Add descriptive alt text explaining what each visual displays, or mark purely decorative icons with alt="" and role="presentation".',
      estimatedEffort: 'moderate',
    });
  }

  // --- CHECK 6: Form Inputs Without Associated Labels ---
  const formInputs = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
  let unlabelledInputs = 0;
  const unlabelledSamples: string[] = [];

  formInputs.each((_, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledBy = $(el).attr('aria-labelledby');
    const name = $(el).attr('name') || $(el).attr('placeholder') || el.tagName.toLowerCase();

    let hasLabel = false;
    if (ariaLabel && ariaLabel.trim().length > 0) hasLabel = true;
    if (ariaLabelledBy) hasLabel = true;
    if (id && $(`label[for="${id}"]`).length > 0) hasLabel = true;
    if ($(el).closest('label').length > 0) hasLabel = true;

    if (!hasLabel) {
      unlabelledInputs++;
      if (unlabelledSamples.length < 3) {
        unlabelledSamples.push(`<${el.tagName.toLowerCase()} name="${name}">`);
      }
    }
  });

  if (unlabelledInputs > 0) {
    findings.push({
      id: `form-unlabelled-${Date.now()}-10`,
      title: `${unlabelledInputs} Form Field${unlabelledInputs > 1 ? 's' : ''} Lack Explicit Labels`,
      severity: 'high',
      confidence: 'confirmed',
      category: 'accessibility_forms',
      affectedUrl: pageUrl,
      affectedElement: unlabelledSamples.join(', '),
      evidence: `Found ${unlabelledInputs} interactive form fields without matching <label for="..."> or aria-label.`,
      whyItMatters: 'Relying exclusively on placeholder text leads to errors; placeholders vanish upon typing, causing visitors to lose track of what information was requested.',
      recommendedFix: 'Pair every input with a persistent visible <label for="field-id"> tag.',
      estimatedEffort: 'moderate',
    });
  }

  // --- CHECK 7: Call to Action (CTA) Clarity ---
  const ctaLinks = $('a, button');
  const vagueCtaPatterns = [
    /^click here$/i,
    /^read more$/i,
    /^learn more$/i,
    /^more$/i,
    /^submit$/i,
    /^go$/i,
    /^continue$/i,
    /^here$/i,
    /^link$/i,
    /^details$/i,
  ];
  let vagueCtasCount = 0;
  const vagueCtaSamples: string[] = [];

  ctaLinks.each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      if (vagueCtaPatterns.some(pattern => pattern.test(text))) {
        vagueCtasCount++;
        if (vagueCtaSamples.length < 3) {
          const href = $(el).attr('href') || '';
          vagueCtaSamples.push(`"${text}" (target: ${href.substring(0, 30)})`);
        }
      }
    }
  });

  if (vagueCtasCount > 0) {
    findings.push({
      id: `vague-cta-${Date.now()}-11`,
      title: 'Ambiguous Call-to-Action Phrasing',
      severity: 'medium',
      confidence: 'confirmed',
      category: 'navigation_links',
      affectedUrl: pageUrl,
      affectedElement: vagueCtaSamples.join(', '),
      evidence: `Found ${vagueCtasCount} button/link instances using non-descriptive labels like ${vagueCtaSamples.slice(0, 2).join(' and ')}.`,
      whyItMatters: 'Vague labels create cognitive friction. Visitors hesitate when they cannot predict where a button will take them or what commitment it entails.',
      recommendedFix: 'Replace ambiguous copy with action-and-outcome text: e.g. change "Click Here" to "Explore Wholesale Roasts" or "Request Consultation".',
      estimatedEffort: 'quick',
    });
  }

  // --- CHECK 8: Mobile Viewport Meta ---
  if (!viewportContent || !viewportContent.includes('width=device-width')) {
    findings.push({
      id: `viewport-missing-${Date.now()}-12`,
      title: 'Missing or Invalid Mobile Viewport Configuration',
      severity: 'high',
      confidence: 'confirmed',
      category: 'first_impressions',
      affectedUrl: pageUrl,
      affectedElement: '<meta name="viewport">',
      evidence: viewportContent ? `Found viewport: "${viewportContent}" missing width=device-width.` : 'No viewport meta tag found in document head.',
      whyItMatters: 'Without a responsive viewport, mobile browsers render desktop-width layouts that require awkward pinch-zooming and horizontal scrolling.',
      recommendedFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to your HTML <head>.',
      estimatedEffort: 'quick',
    });
  }

  // --- CHECK 9: Title & H1 Alignment ---
  if (titleText && primaryH1Text) {
    const normalizeWords = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    
    const titleWords = new Set(normalizeWords(titleText));
    const h1Words = normalizeWords(primaryH1Text);
    const overlap = h1Words.filter(w => titleWords.has(w));

    if (titleWords.size > 2 && h1Words.length > 2 && overlap.length === 0) {
      findings.push({
        id: `title-h1-mismatch-${Date.now()}-13`,
        title: 'Title Tag and Main Heading Divergence',
        severity: 'medium',
        confidence: 'probable',
        category: 'clarity_copy',
        affectedUrl: pageUrl,
        affectedElement: `<title> vs <h1>`,
        evidence: `Title: "${titleText}" | H1: "${primaryH1Text}" share zero meaningful keywords.`,
        whyItMatters: 'Visitors who click a search link expecting one premise may bounce if the top heading speaks about an unrelated topic.',
        recommendedFix: 'Ensure your main <h1> heading reinforces the key benefit promised in your page <title>.',
        estimatedEffort: 'quick',
        detectionLimitation: 'Evaluated using lexical keyword intersection heuristic; brand slogans may differ by creative intent.',
      });
    }
  }

  // --- CHECK 10: Missing Contact Information Indicators ---
  const hasMailto = $('a[href^="mailto:"]').length > 0;
  const hasTel = $('a[href^="tel:"]').length > 0;
  const hasContactLink = $('a').filter((_, el) => {
    const href = ($(el).attr('href') || '').toLowerCase();
    const text = $(el).text().toLowerCase();
    return href.includes('contact') || href.includes('reach-us') || text.includes('contact') || text.includes('get in touch');
  }).length > 0;
  const phoneRegex = /(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?/;
  const hasPhoneInBody = phoneRegex.test(bodyText);

  if (!hasMailto && !hasTel && !hasContactLink && !hasPhoneInBody) {
    findings.push({
      id: `contact-buried-${Date.now()}-14`,
      title: 'No Direct Contact Channels Found in Extracted HTML',
      severity: 'medium',
      confidence: 'probable',
      category: 'trust_contact',
      affectedUrl: pageUrl,
      evidence: 'No mailto:, tel:, contact page links, or standardized phone patterns detected on the inspected page.',
      whyItMatters: 'Prospective clients or customers unable to quickly find how to reach someone often abandon the site in favor of a competitor.',
      recommendedFix: 'Add a clear "Contact" navigation link in the header and direct email/phone details in the footer.',
      estimatedEffort: 'quick',
      detectionLimitation: 'Contact details loaded via third-party JavaScript widgets (e.g. dynamic chat widgets) are not visible to static server parsers.',
    });
  }

  // --- CHECK 12: Long Copy / Readability Wall of Text ---
  const longParagraphs: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    const pWords = text.split(/\s+/).filter(Boolean);
    if (pWords.length > 85) {
      longParagraphs.push(`Paragraph with ${pWords.length} words: "${text.substring(0, 60)}..."`);
    }
  });

  if (longParagraphs.length > 0) {
    findings.push({
      id: `copy-wall-${Date.now()}-15`,
      title: 'Dense Walls of Text Without Visual Breakpoints',
      severity: 'low',
      confidence: 'confirmed',
      category: 'clarity_copy',
      affectedUrl: pageUrl,
      evidence: `${longParagraphs.length} paragraph(s) exceed 85 continuous words (${longParagraphs[0]}).`,
      whyItMatters: 'Web users scan in F-shaped patterns. Dense blocks of prose without bullet points, bold lead-ins, or whitespace cause high cognitive fatigue.',
      recommendedFix: 'Split paragraphs exceeding 70 words into 2–3 sentence chunks, and extract key features into bulleted highlights.',
      estimatedEffort: 'moderate',
    });
  }

  // --- CHECK 13: Trust Gaps (Suggestions / Probable) ---
  const hasPrivacyLink = $('a[href*="privacy" i], a:contains("Privacy")').length > 0;
  const hasTermsLink = $('a[href*="terms" i], a:contains("Terms")').length > 0;

  if (!hasPrivacyLink || !hasTermsLink) {
    findings.push({
      id: `trust-gap-policy-${Date.now()}-16`,
      title: 'Missing Visible Legal & Privacy Links in Page Footer',
      severity: 'low',
      confidence: 'probable',
      category: 'trust_contact',
      affectedUrl: pageUrl,
      evidence: `Missing ${!hasPrivacyLink ? 'Privacy Policy' : ''} ${!hasPrivacyLink && !hasTermsLink ? 'and ' : ''}${!hasTermsLink ? 'Terms of Service' : ''} links.`,
      whyItMatters: 'Modern web visitors and commercial buyers look for privacy documentation to confirm the legitimacy of a company handling their inquiries.',
      recommendedFix: 'Link your Privacy Policy and Terms in the footer navigation to establish trust and comply with data guidelines.',
      estimatedEffort: 'quick',
      detectionLimitation: 'Heuristic suggestion based on anchor text and href matching; policies may reside on an external portal.',
    });
  }

  // Gather internal links for multi-page crawl
  const internalLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.origin === origin && resolved.pathname !== new URL(pageUrl).pathname) {
        // Exclude anchors, files, queries
        if (!resolved.pathname.match(/\.(jpg|jpeg|png|gif|svg|pdf|zip|mp4|css|js)$/i)) {
          const cleanUrl = resolved.origin + resolved.pathname;
          if (!internalLinks.includes(cleanUrl) && internalLinks.length < 8) {
            internalLinks.push(cleanUrl);
          }
        }
      }
    } catch {
      // ignore invalid relative urls
    }
  });

  const summary: PageSummary = {
    url: pageUrl,
    title: titleText || 'Untitled Page',
    statusCode,
    wordCount,
    loadTimeMs,
    hasViewport: Boolean(viewportContent),
    h1Count,
    imagesCount,
    imagesWithoutAlt,
  };

  return { findings, summary, internalLinks };
}
