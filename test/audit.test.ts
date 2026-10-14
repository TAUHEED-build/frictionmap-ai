import { isPrivateOrReservedIP, validateTargetUrl, SafetyValidationError } from '../server/audit/safety.js';
import { runPageAudit } from '../server/audit/rules.js';
import { calculateSiteClarityScore, prioritizeFindings } from '../server/audit/scorer.js';
import type { AuditFinding } from '../src/types/audit.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}${detail ? ` - ${detail}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n--- 1. Testing SSRF & IP Validation Safety ---');

  assert(isPrivateOrReservedIP('127.0.0.1'), 'Blocks 127.0.0.1 (loopback)');
  assert(isPrivateOrReservedIP('127.0.1.5'), 'Blocks 127.0.1.5 (loopback range)');
  assert(isPrivateOrReservedIP('10.0.1.25'), 'Blocks 10.0.0.0/8 (private)');
  assert(isPrivateOrReservedIP('172.16.5.1'), 'Blocks 172.16.0.0/12 (private)');
  assert(isPrivateOrReservedIP('192.168.1.1'), 'Blocks 192.168.0.0/16 (private)');
  assert(isPrivateOrReservedIP('169.254.169.254'), 'Blocks 169.254.169.254 (cloud metadata)');
  assert(isPrivateOrReservedIP('::1'), 'Blocks IPv6 ::1 (loopback)');
  assert(!isPrivateOrReservedIP('8.8.8.8'), 'Allows public IP 8.8.8.8');
  assert(!isPrivateOrReservedIP('104.21.5.10'), 'Allows public Cloudflare IP');

  console.log('\n--- 2. Testing URL Safety & Target Filtering ---');

  try {
    await validateTargetUrl('http://localhost:3000');
    assert(false, 'Should block localhost URL');
  } catch (err) {
    assert(err instanceof SafetyValidationError, 'Blocks localhost URL with SafetyValidationError');
  }

  try {
    await validateTargetUrl('ftp://example.com');
    assert(false, 'Should block ftp protocol');
  } catch (err) {
    assert(err instanceof SafetyValidationError, 'Blocks non-HTTP protocol');
  }

  try {
    await validateTargetUrl('https://admin:secret@example.com');
    assert(false, 'Should block embedded credentials');
  } catch (err) {
    assert(err instanceof SafetyValidationError, 'Blocks embedded credentials');
  }

  try {
    await validateTargetUrl('http://example.com:22');
    assert(false, 'Should block port 22');
  } catch (err) {
    assert(err instanceof SafetyValidationError, 'Blocks non-standard port 22');
  }

  console.log('\n--- 3. Testing Audit Rules Engine on Synthetic HTML ---');

  const testHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <!-- Missing title deliberately -->
      <!-- Missing meta description deliberately -->
    </head>
    <body>
      <!-- No H1 heading -->
      <h2>Secondary Section</h2>
      <img src="test.jpg"> <!-- Missing alt -->
      <a href="/shop">Click here</a> <!-- Vague CTA -->
      <form>
        <input type="text" name="email" placeholder="Your email"> <!-- Missing label -->
      </form>
    </body>
    </html>
  `;

  const auditResult = runPageAudit({
    pageUrl: 'https://example.com',
    html: testHtml,
    statusCode: 200,
    loadTimeMs: 150,
    origin: 'https://example.com',
  });

  const findingTitles = auditResult.findings.map(f => f.title);

  assert(
    findingTitles.some(t => t.includes('Missing Page Title')),
    'Detects missing page title'
  );
  assert(
    findingTitles.some(t => t.includes('Missing Meta Description')),
    'Detects missing meta description'
  );
  assert(
    findingTitles.some(t => t.includes('No Primary H1 Heading')),
    'Detects missing primary H1'
  );
  assert(
    findingTitles.some(t => t.includes('Missing Descriptive Alt Text')),
    'Detects images missing alt text'
  );
  assert(
    findingTitles.some(t => t.includes('Ambiguous Call-to-Action')),
    'Detects vague "Click here" CTA'
  );
  assert(
    findingTitles.some(t => t.includes('Lack Explicit Labels')),
    'Detects unlabelled form input'
  );

  console.log('\n--- 4. Testing Scoring & Prioritization ---');

  const scoreResult = calculateSiteClarityScore(auditResult.findings, {
    pagesInspected: 1,
    maxPagesAttempted: 1,
    skippedReasons: [],
  });

  assert(
    scoreResult.totalScore >= 0 && scoreResult.totalScore <= 100,
    `Score is bounded (0-100): ${scoreResult.totalScore}`
  );

  const scoreResult2 = calculateSiteClarityScore(auditResult.findings, {
    pagesInspected: 1,
    maxPagesAttempted: 1,
    skippedReasons: [],
  });

  assert(
    scoreResult.totalScore === scoreResult2.totalScore,
    'Scoring algorithm is strictly deterministic and reproducible'
  );

  const prioritized = prioritizeFindings(auditResult.findings);
  assert(
    prioritized.length <= 3 && prioritized.length > 0,
    `Surfaces top 3 prioritized actions (count: ${prioritized.length})`
  );
  assert(
    prioritized[0].severity === 'high',
    `Top prioritized action is High severity: "${prioritized[0].title}"`
  );

  console.log(`\n=============================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`=============================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
