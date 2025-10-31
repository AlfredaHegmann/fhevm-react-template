/**
 * API-related type definitions
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptApiRequest {
  value: number | boolean;
  type?: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';
  chainId?: number;
}

export interface EncryptApiResponse {
  success: boolean;
  encrypted: string;
  type: string;
  timestamp: string;
}

export interface DecryptApiRequest {
  encryptedData: string;
  contractAddress: string;
  userAddress: string;
  chainId?: number;
}

export interface DecryptApiResponse {
  success: boolean;
  decryptionRequest: any;
  message: string;
}

export interface ComputeApiRequest {
  operation: string;
  operands: string[];
  contractAddress: string;
  chainId?: number;
}

export interface ComputeApiResponse {
  success: boolean;
  message: string;
  computationInfo: {
    operation: string;
    operandCount: number;
    contractAddress: string;
    timestamp: string;
    supportedOperations: string[];
  };
}

export interface KeysApiResponse {
  success: boolean;
  chainId: number;
  publicKey: string;
  network: any;
}
