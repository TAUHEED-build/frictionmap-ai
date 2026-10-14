import { validateTargetUrl, SafetyValidationError } from './safety.js';

export interface FetchedPage {
  url: string;
  statusCode: number;
  html: string;
  loadTimeMs: number;
  contentType: string;
}

const MAX_RESPONSE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
const REQUEST_TIMEOUT_MS = 8500;
const MAX_REDIRECTS = 3;

/**
 * Safely fetches a single webpage while strictly verifying redirects and preventing SSRF.
 */
export async function safeFetchHtml(rawTargetUrl: string): Promise<FetchedPage> {
  let currentUrl = rawTargetUrl;
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const validated = await validateTargetUrl(currentUrl);
    const targetUrlObj = validated.url;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const startTime = Date.now();

    try {
      const response = await fetch(targetUrlObj.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FrictionMapAI-Auditor/1.0; +https://frictionmap.ai/bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        redirect: 'manual', // Handle manually to re-validate destination IP
        signal: controller.signal,
      });

      const elapsed = Date.now() - startTime;

      // Check redirect
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error(`Received redirect status ${response.status} without Location header.`);
        }

        const nextUrl = new URL(location, targetUrlObj).toString();
        currentUrl = nextUrl;
        redirects++;
        if (redirects > MAX_REDIRECTS) {
          throw new Error('Too many redirects encountered (maximum 3 redirects allowed).');
        }
        continue;
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`URL returned unsupported content type: '${contentType}'. Audit requires an HTML document.`);
      }

      // Check Content-Length if present
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_RESPONSE_BYTES) {
        throw new Error(`Page size exceeds safety limit of 1.5MB (${contentLengthHeader} bytes).`);
      }

      // Read response body safely with byte counter
      const reader = response.body?.getReader();
      if (!reader) {
        const text = await response.text();
        return {
          url: targetUrlObj.toString(),
          statusCode: response.status,
          html: text,
          loadTimeMs: elapsed,
          contentType,
        };
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_RESPONSE_BYTES) {
            controller.abort();
            throw new Error(`Page response exceeded size limit of 1.5MB during stream read.`);
          }
          chunks.push(value);
        }
      }

      const decoder = new TextDecoder('utf-8');
      const html = chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('') + decoder.decode();

      return {
        url: targetUrlObj.toString(),
        statusCode: response.status,
        html,
        loadTimeMs: elapsed,
        contentType,
      };

    } catch (err: unknown) {
      if (err instanceof SafetyValidationError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s while attempting to reach ${currentUrl}.`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Maximum redirect limit reached.');
}

/**
 * Safely probes a link (HEAD or GET) to verify if it is broken.
 */
export async function probeUrlStatus(rawUrl: string): Promise<{ isBroken: boolean; statusCode?: number; error?: string }> {
  try {
    const validated = await validateTargetUrl(rawUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(validated.url.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FrictionMapAI-Auditor/1.0)',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 404 || res.status === 410) {
      return { isBroken: true, statusCode: res.status };
    }
    return { isBroken: false, statusCode: res.status };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { isBroken: true, error: msg };
  }
}
