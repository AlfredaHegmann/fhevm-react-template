import { createFhevmInstance, encryptData } from '@fhevm/sdk';

/**
 * Server-side FHE operations
 * Functions for use in API routes and server components
 */

/**
 * Initialize FHEVM on server
 */
export async function initializeFhevmServer(chainId: number = 8009) {
  try {
    const fhevm = await createFhevmInstance({ chainId });
    return {
      success: true,
      fhevm,
      publicKey: fhevm.publicKey,
    };
  } catch (error) {
    console.error('Server FHEVM initialization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Encrypt data on server
 */
export async function encryptOnServer(
  value: number | boolean,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' = 'euint64',
  chainId: number = 8009
) {
  try {
    const fhevm = await createFhevmInstance({ chainId });
    const encrypted = await encryptData(fhevm, value, { type });
    return {
      success: true,
      encrypted: encrypted.value,
      type,
    };
  } catch (error) {
    console.error('Server encryption failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Encryption failed',
    };
  }
}

/**
 * Batch encrypt on server
 */
export async function encryptBatchOnServer(
  values: Array<number | boolean>,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool' = 'euint64',
  chainId: number = 8009
) {
  try {
    const fhevm = await createFhevmInstance({ chainId });
    const encrypted = await Promise.all(
      values.map(value => encryptData(fhevm, value, { type }))
    );
    return {
      success: true,
      encrypted: encrypted.map(e => e.value),
      count: encrypted.length,
    };
  } catch (error) {
    console.error('Server batch encryption failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Batch encryption failed',
    };
  }
}
