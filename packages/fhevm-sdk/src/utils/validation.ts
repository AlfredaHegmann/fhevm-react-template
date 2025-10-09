/**
 * Validate encrypted data format
 */
export function validateEncryptedData(data: string): boolean {
  // Basic validation - encrypted data should be a hex string
  return /^0x[0-9a-fA-F]+$/.test(data);
}

/**
 * Check if address is valid Ethereum address
 */
export function isValidFhevmAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
