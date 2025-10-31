import { createFhevmInstance, encryptData, type FhevmInstance } from '@fhevm/sdk';

/**
 * Client-side FHE operations
 * Provides utility functions for FHEVM operations in the browser
 */

let fhevmInstance: FhevmInstance | null = null;

/**
 * Get or create FHEVM instance
 */
export async function getFhevmInstance(chainId: number = 8009): Promise<FhevmInstance> {
  if (!fhevmInstance) {
    fhevmInstance = await createFhevmInstance({ chainId });
  }
  return fhevmInstance;
}

/**
 * Encrypt a single value
 */
export async function encryptValue(
  value: number | boolean,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' = 'euint64',
  chainId?: number
) {
  const fhevm = await getFhevmInstance(chainId);
  return await encryptData(fhevm, value, { type });
}

/**
 * Encrypt multiple values
 */
export async function encryptBatch(
  values: Array<number | boolean>,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' = 'euint64',
  chainId?: number
) {
  const fhevm = await getFhevmInstance(chainId);
  return await Promise.all(
    values.map(value => encryptData(fhevm, value, { type }))
  );
}

/**
 * Get public key from current FHEVM instance
 */
export async function getPublicKey(chainId?: number): Promise<string> {
  const fhevm = await getFhevmInstance(chainId);
  return fhevm.publicKey || '';
}

/**
 * Reset FHEVM instance (useful for chain switching)
 */
export function resetFhevmInstance() {
  fhevmInstance = null;
}
