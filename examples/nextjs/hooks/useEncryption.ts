'use client';

import { useState, useCallback } from 'react';
import { encryptData, type FhevmInstance } from '@fhevm/sdk';

type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

/**
 * Custom hook for encryption operations
 */
export function useEncryption(fhevm: FhevmInstance | null) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastEncrypted, setLastEncrypted] = useState<string | null>(null);

  const encrypt = useCallback(
    async (value: number | boolean, type: EncryptedType = 'euint64') => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await encryptData(fhevm, value, { type });
        setLastEncrypted(encrypted.value);
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm]
  );

  const encryptBatch = useCallback(
    async (values: Array<number | boolean>, type: EncryptedType = 'euint64') => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const encrypted = await Promise.all(
          values.map(value => encryptData(fhevm, value, { type }))
        );
        return encrypted;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch encryption failed');
        setError(error);
        throw error;
      } finally {
        setIsEncrypting(false);
      }
    },
    [fhevm]
  );

  const reset = useCallback(() => {
    setError(null);
    setLastEncrypted(null);
  }, []);

  return {
    encrypt,
    encryptBatch,
    isEncrypting,
    error,
    lastEncrypted,
    reset,
  };
}
