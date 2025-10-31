/**
 * Security utility functions
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate numeric input
 */
export function isValidNumeric(value: string): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Validate amount is positive
 */
export function isPositiveAmount(amount: number): boolean {
  return amount > 0;
}

/**
 * Check if value is within range for encrypted type
 */
export function isWithinTypeRange(
  value: number,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64'
): boolean {
  const ranges = {
    euint8: { min: 0, max: 255 },
    euint16: { min: 0, max: 65535 },
    euint32: { min: 0, max: 4294967295 },
    euint64: { min: 0, max: Number.MAX_SAFE_INTEGER },
  };

  const range = ranges[type];
  return value >= range.min && value <= range.max;
}

/**
 * Rate limiting helper (client-side)
 */
const requestTimestamps: Map<string, number[]> = new Map();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(key) || [];

  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

  if (validTimestamps.length >= maxRequests) {
    return false;
  }

  validTimestamps.push(now);
  requestTimestamps.set(key, validTimestamps);
  return true;
}
