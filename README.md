# FrictionMap AI

> **Tagline:** Find friction. Fix what matters.

FrictionMap AI is a website usability and content auditing web application. Small business owners can immediately diagnose where their websites confuse or lose prospective visitors, while freelancers and agency consultants can run comprehensive audits and generate branded, client-ready proposals.

---

## Key Features

### 1. Functional Website Audit Engine
- **Safe Server-Side Crawling:** Safely fetches target HTML with strict SSRF protection, IP range filtering (blocks loopback, private RFC1918, cloud metadata 169.254.169.254), redirect limits, response size limits (1.5MB), and polite timeouts (8.5s).
- **13 Usability, Clarity & Accessibility Heuristics:**
  1. Missing, short, or excessively long `<title>` tags
  2. Missing or sparse `<meta name="description">`
  3. Missing or multiple conflicting primary `<h1>` headings
  4. Heading hierarchy skips (e.g. jumping H1 to H3)
  5. Images missing useful alternative text or with placeholder `alt` tags
  6. Form inputs lacking explicit `<label for="...">` or `aria-label`
  7. Ambiguous call-to-actions ("Click here", "Learn more", "Submit")
  8. Missing or broken mobile `<meta name="viewport">`
  9. Semantic divergence between `<title>` and `<h1>`
  10. Missing or buried direct contact channels (`mailto:`, `tel:`, `/contact`)
  11. Broken internal links
  12. Readability friction and text walls (>85 words without breaks)
  13. Trust information gaps (privacy policy, terms, physical indicators)

### 2. Explainable Site Clarity Score (0–100)
- Calculated deterministically across 5 weighted categories:
  - First Impressions & Meta (25%)
  - Clarity & Copy Hierarchy (25%)
  - Navigation & CTA Clarity (20%)
  - Accessibility & Forms (15%)
  - Trust & Contact Signals (15%)
- Transparent scoring explanation that explicitly avoids unsubstantiated conversion or revenue claims.

### 3. "Fix These First" Prioritized Action Plan
- Algorithms rank verified findings by severity, detection confidence, and estimated implementation effort (under 15 mins vs. substantial review).

### 4. AI-Powered Plain-Language Explanations & Rewrites
- Powered by Google Gemini (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK.
- Delivers an executive summary, core takeaways, and concrete copy replacements for vague buttons and titles.
- Includes an automatic, deterministic offline fallback ensuring 100% uptime when external AI APIs are unreachable.

### 5. Freelancer Mode & Client-Ready Report
- White-label customization: consultant name, client name, custom report title, executive intro letter, implementation service package, and booking link.
- Ability to annotate individual findings with custom notes.
- One-click copy summary (formatted Markdown for email/Slack).
- JSON report export.
- Dedicated print stylesheet (`window.print()`) formatted for direct PDF export.

### 6. Local Storage Persistence
- Audits are stored in browser local storage (`frictionmap_saved_audits_v1`) with quick-reopen and deletion capabilities.

---

## Security Architecture

- **SSRF Prevention:** Every user-supplied URL and subsequent redirect destination is resolved via DNS and checked against private, loopback, multicast, carrier-grade NAT, and cloud metadata IP ranges (`server/audit/safety.ts`).
- **Response Caps:** Inbound streaming data is aborted if the HTML payload exceeds 1.5MB.
- **Untrusted Input Handling:** Crawled HTML is parsed strictly as untrusted data. No third-party JavaScript from the target site is ever executed.
- **Server-Side API Keys:** The `GEMINI_API_KEY` is accessed only within server-side API routes and is never bundled or exposed to client-side code.

---

## Development & Testing

```bash
# Run unit and safety tests
npm test

# Check TypeScript linting
npm run lint

# Compile and build production bundle
npm run build

# Start full-stack development server
npm run dev
```
