/**
 * Base FHEVM Error
 */
export class FhevmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FhevmError';
  }
}

/**
 * Encryption-specific errors
 */
export class EncryptionError extends FhevmError {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Decryption-specific errors
 */
export class DecryptionError extends FhevmError {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends FhevmError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}
