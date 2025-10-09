import { ethers } from 'ethers';

export interface ContractConfig {
  address: string;
  abi: any[];
  signerOrProvider: ethers.Signer | ethers.Provider;
}

/**
 * Create a typed contract instance
 *
 * @example
 * ```typescript
 * const contract = useContract({
 *   address: '0x...',
 *   abi: ContractABI,
 *   signerOrProvider: signer,
 * });
 * ```
 */
export function useContract(config: ContractConfig): ethers.Contract {
  return new ethers.Contract(
    config.address,
    config.abi,
    config.signerOrProvider
  );
}
