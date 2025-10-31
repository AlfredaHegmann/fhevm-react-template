/**
 * FHE-related type definitions
 */

export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

export type Operation =
  | 'add'
  | 'sub'
  | 'mul'
  | 'div'
  | 'eq'
  | 'ne'
  | 'ge'
  | 'gt'
  | 'le'
  | 'lt'
  | 'and'
  | 'or'
  | 'xor'
  | 'not';

export interface EncryptedValue {
  value: string;
  type: EncryptedType;
}

export interface FhevmConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
}

export interface EncryptionOptions {
  type?: EncryptedType;
}

export interface DecryptionRequest {
  encryptedData: string;
  contractAddress: string;
  userAddress: string;
  chainId?: number;
}

export interface ComputationRequest {
  operation: Operation;
  operands: string[];
  type: EncryptedType;
  contractAddress?: string;
}
