import dns from 'dns/promises';
import { isIP } from 'net';

export class SafetyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyValidationError';
  }
}

/**
 * Checks if an IPv4 or IPv6 string falls into a private, loopback, or reserved range.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  // IPv4 check
  if (ip.includes('.')) {
    const parts = ip.split('.').map(p => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return true; // malformed IP is rejected
    }

    const [a, b] = parts;

    // 0.0.0.0/8 Current network
    if (a === 0) return true;
    // 10.0.0.0/8 Private network
    if (a === 10) return true;
    // 127.0.0.0/8 Loopback
    if (a === 127) return true;
    // 169.254.0.0/16 Link-local / Cloud Metadata (e.g. 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 172.16.0.0/12 Private network
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 Private network
    if (a === 192 && b === 168) return true;
    // 100.64.0.0/10 Shared address space / CGNAT
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 198.18.0.0/15 Network benchmark tests
    if (a === 198 && (b === 18 || b === 19)) return true;
    // 224.0.0.0/4 Multicast
    if (a >= 224 && a <= 239) return true;
    // 240.0.0.0/4 Reserved for future use
    if (a >= 240) return true;

    return false;
  }

  // IPv6 check
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::' || lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) {
    return true;
  }

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (lower.startsWith('::ffff:')) {
    const mappedV4 = lower.substring(7);
    if (isIP(mappedV4) === 4) {
      return isPrivateOrReservedIP(mappedV4);
    }
  }

  return false;
}

export interface ValidatedTarget {
  url: URL;
  resolvedIp: string;
}

/**
 * Validates a user-supplied target URL against SSRF and network isolation rules.
 */
export async function validateTargetUrl(rawUrl: string): Promise<ValidatedTarget> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new SafetyValidationError('Please enter a website URL.');
  }

  let formatted = rawUrl.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = 'https://' + formatted;
  }

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
    throw new SafetyValidationError('The provided URL is not valid. Please provide a standard address such as https://example.com');
  }

  // Protocol check
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SafetyValidationError('Only HTTP and HTTPS protocols are supported for website audits.');
  }

  // Embedded credentials check
  if (parsed.username || parsed.password) {
    throw new SafetyValidationError('URLs containing embedded credentials (username/password) are blocked for security.');
  }

  // Host check
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new SafetyValidationError('Auditing localhost or internal private domains is prohibited.');
  }

  // Port check
  const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
  const allowedPorts = [80, 443, 8080, 8443];
  if (!allowedPorts.includes(port)) {
    throw new SafetyValidationError(`Port ${port} is not permitted. Only standard web ports (80, 443, 8080, 8443) are allowed.`);
  }

  // DNS lookup to verify destination IP
  let resolvedIp = '';
  try {
    // If hostname is already an IP
    if (isIP(hostname)) {
      resolvedIp = hostname;
    } else {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        throw new SafetyValidationError(`Could not resolve domain '${hostname}'. Please check spelling and domain validity.`);
      }
      resolvedIp = records[0].address;
    }
  } catch (err: unknown) {
    if (err instanceof SafetyValidationError) throw err;
    throw new SafetyValidationError(`Unable to resolve host '${hostname}'. Please verify that the domain exists and is publicly accessible.`);
  }

  if (isPrivateOrReservedIP(resolvedIp)) {
    throw new SafetyValidationError(`Target resolves to a restricted private or internal IP address (${resolvedIp}). Crawl blocked.`);
  }

  return {
    url: parsed,
    resolvedIp,
  };
}
