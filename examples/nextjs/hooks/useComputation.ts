'use client';

import { useState, useCallback } from 'react';
import { encryptData, type FhevmInstance } from '@fhevm/sdk';

type Operation = 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'ge' | 'gt' | 'le' | 'lt';
type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

interface ComputationResult {
  operation: Operation;
  operands: string[];
  message: string;
}

/**
 * Custom hook for homomorphic computation operations
 */
export function useComputation(fhevm: FhevmInstance | null) {
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<ComputationResult | null>(null);

  const prepareComputation = useCallback(
    async (
      values: Array<number | boolean>,
      operation: Operation,
      type: EncryptedType = 'euint64'
    ): Promise<ComputationResult> => {
      if (!fhevm) {
        throw new Error('FHEVM instance not initialized');
      }

      if (values.length < 2) {
        throw new Error('At least 2 values required for computation');
      }

      setIsComputing(true);
      setError(null);

      try {
        // Encrypt all values
        const encrypted = await Promise.all(
          values.map(value => encryptData(fhevm, value, { type }))
        );

        const result: ComputationResult = {
          operation,
          operands: encrypted.map(e => e.value),
          message: 'Computation prepared. Submit to smart contract for execution.',
        };

        setLastResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Computation preparation failed');
        setError(error);
        throw error;
      } finally {
        setIsComputing(false);
      }
    },
    [fhevm]
  );

  const prepareBinaryOperation = useCallback(
    async (
      value1: number | boolean,
      value2: number | boolean,
      operation: Operation,
      type: EncryptedType = 'euint64'
    ) => {
      return prepareComputation([value1, value2], operation, type);
    },
    [prepareComputation]
  );

  const reset = useCallback(() => {
    setError(null);
    setLastResult(null);
  }, []);

  return {
    prepareComputation,
    prepareBinaryOperation,
    isComputing,
    error,
    lastResult,
    reset,
  };
}
