'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createFhevmInstance, type FhevmInstance } from '@fhevm/sdk';

interface FHEContextValue {
  fhevm: FhevmInstance | null;
  isReady: boolean;
  error: Error | null;
  chainId: number;
}

const FHEContext = createContext<FHEContextValue | undefined>(undefined);

interface FHEProviderProps {
  children: React.ReactNode;
  chainId?: number;
}

/**
 * FHE Provider Component
 * Initializes and provides FHEVM instance to all child components
 */
export const FHEProvider: React.FC<FHEProviderProps> = ({
  children,
  chainId = 8009,
}) => {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeFhevm = async () => {
      try {
        setIsReady(false);
        setError(null);

        const instance = await createFhevmInstance({ chainId });
        setFhevm(instance);
        setIsReady(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
        setError(error);
        console.error('FHEVM initialization error:', error);
      }
    };

    initializeFhevm();
  }, [chainId]);

  return (
    <FHEContext.Provider value={{ fhevm, isReady, error, chainId }}>
      {children}
    </FHEContext.Provider>
  );
};

/**
 * Hook to use FHE context
 */
export const useFHEContext = () => {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHEContext must be used within FHEProvider');
  }
  return context;
};
