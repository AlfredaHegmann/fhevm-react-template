'use client';

import { useState, useEffect } from 'react';
import { createFhevmInstance, type FhevmInstance } from '@fhevm/sdk';

/**
 * Custom hook for FHEVM operations
 */
export function useFHE(chainId: number = 8009) {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        const instance = await createFhevmInstance({ chainId });

        if (mounted) {
          setFhevm(instance);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error('FHEVM initialization failed');
          setError(error);
          console.error('FHEVM initialization error:', error);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [chainId]);

  const reinitialize = async () => {
    setIsReady(false);
    setError(null);
    setIsInitializing(true);

    try {
      const instance = await createFhevmInstance({ chainId });
      setFhevm(instance);
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('FHEVM reinitialization failed');
      setError(error);
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    fhevm,
    isReady,
    error,
    isInitializing,
    reinitialize,
    publicKey: fhevm?.publicKey || null,
  };
}
