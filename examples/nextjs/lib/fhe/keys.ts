import { getFhevmNetworkConfig } from '@fhevm/sdk';

/**
 * Key management utilities
 */

/**
 * Get network configuration for a given chain
 */
export function getNetworkConfig(chainId: number) {
  try {
    return getFhevmNetworkConfig(chainId);
  } catch (error) {
    console.error('Failed to get network config:', error);
    return null;
  }
}

/**
 * Validate a public key format
 */
export function validatePublicKey(publicKey: string): boolean {
  if (!publicKey || typeof publicKey !== 'string') {
    return false;
  }
  // Basic validation - adjust based on actual key format requirements
  return publicKey.length > 0;
}

/**
 * Format public key for display
 */
export function formatPublicKey(publicKey: string, maxLength: number = 50): string {
  if (!publicKey) return '';
  if (publicKey.length <= maxLength) return publicKey;

  const start = publicKey.slice(0, maxLength / 2);
  const end = publicKey.slice(-maxLength / 2);
  return `${start}...${end}`;
}

/**
 * Store public key in session storage
 */
export function storePublicKey(chainId: number, publicKey: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`fhevm_public_key_${chainId}`, publicKey);
  }
}

/**
 * Retrieve public key from session storage
 */
export function retrievePublicKey(chainId: number): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(`fhevm_public_key_${chainId}`);
  }
  return null;
}

/**
 * Clear stored keys
 */
export function clearStoredKeys() {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('fhevm_public_key_')) {
        sessionStorage.removeItem(key);
      }
    });
  }
}
