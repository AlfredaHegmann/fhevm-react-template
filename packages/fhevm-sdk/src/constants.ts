/**
 * Supported FHEVM Chain IDs
 */
export const FHEVM_CHAIN_IDS = {
  FHEVM_SEPOLIA: 8009,
  SEPOLIA: 11155111,
  MAINNET: 1,
  LOCAL: 31337,
} as const;

/**
 * Default Gateway URL for decryption callbacks
 */
export const DEFAULT_GATEWAY_URL = 'https://gateway.zama.ai';

/**
 * Supported encrypted data types
 */
export const ENCRYPTED_TYPES = {
  EUINT8: 'euint8',
  EUINT16: 'euint16',
  EUINT32: 'euint32',
  EUINT64: 'euint64',
  EBOOL: 'ebool',
} as const;
