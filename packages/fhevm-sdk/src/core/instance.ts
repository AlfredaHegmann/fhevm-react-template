import { createInstance as createFhevmjsInstance } from 'fhevmjs';

export interface FhevmConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
  network?: 'sepolia' | 'mainnet' | 'local';
}

export interface FhevmInstance {
  encrypt8: (value: number) => Promise<string>;
  encrypt16: (value: number) => Promise<string>;
  encrypt32: (value: number) => Promise<string>;
  encrypt64: (value: bigint | number) => Promise<string>;
  encryptBool: (value: boolean) => Promise<string>;
  getPublicKey: () => string;
  chainId: number;
  instance: any;
}

const NETWORK_PUBLIC_KEYS: Record<string, string> = {
  '8009': 'SEPOLIA_FHEVM_PUBLIC_KEY', // fhEVM Sepolia
  '11155111': 'SEPOLIA_PUBLIC_KEY',    // Sepolia
  '1': 'MAINNET_PUBLIC_KEY',           // Mainnet
};

/**
 * Create FHEVM instance - The main entry point for encryption operations
 *
 * @example
 * ```typescript
 * const fhevm = await createFhevmInstance({ chainId: 8009 });
 * const encrypted = await fhevm.encrypt64(1000);
 * ```
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmInstance> {
  const { chainId, publicKey, gatewayUrl, aclAddress } = config;

  // Auto-fetch public key if not provided
  const resolvedPublicKey = publicKey || NETWORK_PUBLIC_KEYS[chainId.toString()];

  if (!resolvedPublicKey) {
    throw new Error(
      `No public key found for chain ID ${chainId}. Please provide publicKey in config.`
    );
  }

  // Create fhevmjs instance
  const instance = await createFhevmjsInstance({
    chainId,
    publicKey: resolvedPublicKey,
    gatewayUrl,
    aclAddress,
  });

  return {
    encrypt8: async (value: number) => {
      return instance.encrypt8(value);
    },
    encrypt16: async (value: number) => {
      return instance.encrypt16(value);
    },
    encrypt32: async (value: number) => {
      return instance.encrypt32(value);
    },
    encrypt64: async (value: bigint | number) => {
      const bigintValue = typeof value === 'bigint' ? value : BigInt(value);
      return instance.encrypt64(bigintValue);
    },
    encryptBool: async (value: boolean) => {
      return instance.encryptBool(value);
    },
    getPublicKey: () => resolvedPublicKey,
    chainId,
    instance,
  };
}
