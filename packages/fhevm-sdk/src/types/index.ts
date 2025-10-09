/**
 * Encrypted data types
 */
export type Euint8 = string & { __brand: 'euint8' };
export type Euint16 = string & { __brand: 'euint16' };
export type Euint32 = string & { __brand: 'euint32' };
export type Euint64 = string & { __brand: 'euint64' };
export type Ebool = string & { __brand: 'ebool' };

export type EncryptedValue = Euint8 | Euint16 | Euint32 | Euint64 | Ebool;

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}
