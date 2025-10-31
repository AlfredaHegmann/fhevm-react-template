/**
 * Type definitions for FHE operations in the Next.js example
 */

export type EncryptedType = 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';

export interface EncryptionResult {
  value: string;
  type: EncryptedType;
  timestamp?: string;
}

export interface DecryptionRequest {
  encryptedData: string;
  contractAddress: string;
  userAddress: string;
  signature?: string;
}

export interface ComputationOperation {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'ge' | 'gt' | 'le' | 'lt';
  operands: string[];
  type: EncryptedType;
}

export interface FHEConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
}

export interface TransactionData {
  encryptedValue: string;
  recipient?: string;
  timestamp: string;
  status: 'pending' | 'prepared' | 'submitted' | 'confirmed' | 'failed';
}

export interface MedicalRecord {
  patientId: string;
  encryptedData: Record<string, string>;
  timestamp: string;
  status: 'encrypted' | 'submitted' | 'verified';
}
