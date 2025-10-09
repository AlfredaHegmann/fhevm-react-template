/**
 * Format encrypted value for display
 */
export function formatEncryptedValue(value: string): string {
  if (!value || value.length < 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

/**
 * Parse encrypted value from string
 */
export function parseEncryptedValue(value: string): string {
  // Remove any whitespace and ensure 0x prefix
  const cleaned = value.trim();
  return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
}
