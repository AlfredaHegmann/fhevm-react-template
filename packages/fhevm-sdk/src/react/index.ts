/**
 * React integration for @fhevm/sdk
 *
 * Wagmi-like hooks for FHEVM operations
 */

import { useState, useEffect, useCallback } from 'react';
import { createFhevmInstance, type FhevmInstance, type FhevmConfig } from '../core/instance';
import { encryptData, type EncryptOptions } from '../core/encrypt';

/**
 * useFhevm Hook - Initialize FHEVM instance
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { fhevm, isReady, error } = useFhevm({ chainId: 8009 });
 *
 *   if (!isReady) return <div>Loading FHEVM...</div>;
 *
 *   return <EncryptionForm fhevm={fhevm} />;
 * }
 * ```
 */
export function useFhevm(config: FhevmConfig) {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const instance = await createFhevmInstance(config);
        if (!cancelled) {
          setFhevm(instance);
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [config.chainId]);

  return { fhevm, isReady, error };
}

/**
 * useEncrypt Hook - Encrypt data with loading states
 *
 * @example
 * ```typescript
 * function BidForm() {
 *   const { fhevm } = useFhevm({ chainId: 8009 });
 *   const { encrypt, isEncrypting, error } = useEncrypt(fhevm);
 *
 *   const handleSubmit = async (bidAmount: number) => {
 *     const encrypted = await encrypt(bidAmount, { type: 'euint64' });
 *     await contract.submitBid(jobId, encrypted.value);
 *   };
 * }
 * ```
 */
export function useEncrypt(fhevm: FhevmInstance | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (value: number | bigint | boolean, options?: EncryptOptions) => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await encryptData(fhevm, value, options);
        return encrypted;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm]
  );

  return { encrypt, isEncrypting, error };
}

// Re-export core types for convenience
export type { FhevmInstance, FhevmConfig } from '../core/instance';
export type { EncryptedData, EncryptOptions } from '../core/encrypt';
