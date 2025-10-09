/**
 * @fhevm/sdk - Universal FHEVM SDK
 *
 * Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption.
 * Works with Node.js, Next.js, React, Vue, or any JavaScript environment.
 *
 * @example
 * ```typescript
 * import { createFhevmInstance, encryptData, requestDecryption } from '@fhevm/sdk';
 *
 * // Initialize FHEVM instance (< 5 lines)
 * const fhevm = await createFhevmInstance({
 *   chainId: 8009,
 *   publicKey: CONTRACT_PUBLIC_KEY,
 * });
 *
 * // Encrypt data
 * const encrypted = await fhevm.encrypt64(bidAmount);
 *
 * // Submit to contract
 * await contract.submitBid(jobId, encrypted);
 * ```
 */

export { createFhevmInstance, type FhevmInstance, type FhevmConfig } from './core/instance';
export { encryptData, type EncryptOptions, type EncryptedData } from './core/encrypt';
export { requestDecryption, type DecryptionRequest, type DecryptionCallback } from './core/decrypt';
export { useContract, type ContractConfig } from './core/contract';
export { FhevmError, EncryptionError, DecryptionError, NetworkError } from './core/errors';

// Re-export commonly used types
export type {
  Euint8,
  Euint16,
  Euint32,
  Euint64,
  Ebool,
  EncryptedValue
} from './types';

// Utilities
export { getFhevmNetworkConfig, SUPPORTED_NETWORKS } from './utils/networks';
export { validateEncryptedData, isValidFhevmAddress } from './utils/validation';
export { formatEncryptedValue, parseEncryptedValue } from './utils/formatting';

// Constants
export { FHEVM_CHAIN_IDS, DEFAULT_GATEWAY_URL } from './constants';

/**
 * Quick start function - Initialize FHEVM with minimal configuration
 *
 * @example
 * ```typescript
 * const fhevm = await quickStart(8009); // That's it!
 * ```
 */
export { quickStart } from './quickstart';
