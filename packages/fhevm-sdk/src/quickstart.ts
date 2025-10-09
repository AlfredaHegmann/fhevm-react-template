import { createFhevmInstance, type FhevmInstance } from './core/instance';

/**
 * Quick start - Initialize FHEVM with minimal configuration
 *
 * Perfect for getting started in < 5 lines of code!
 *
 * @example
 * ```typescript
 * // That's it! One line to start encrypting
 * const fhevm = await quickStart(8009);
 *
 * // Now you can encrypt data
 * const encrypted = await fhevm.encrypt64(1000);
 * ```
 *
 * @param chainId - The chain ID (8009 for fhEVM Sepolia, 11155111 for Sepolia)
 * @returns Fully configured FHEVM instance
 */
export async function quickStart(chainId: number = 8009): Promise<FhevmInstance> {
  return createFhevmInstance({ chainId });
}
