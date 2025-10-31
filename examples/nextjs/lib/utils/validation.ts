/**
 * Validation utility functions
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate encrypted data format
 */
export function validateEncryptedData(data: string): ValidationResult {
  if (!data || typeof data !== 'string') {
    return { isValid: false, error: 'Encrypted data must be a string' };
  }

  if (data.length === 0) {
    return { isValid: false, error: 'Encrypted data cannot be empty' };
  }

  return { isValid: true };
}

/**
 * Validate chain ID
 */
export function validateChainId(chainId: number): ValidationResult {
  if (!Number.isInteger(chainId)) {
    return { isValid: false, error: 'Chain ID must be an integer' };
  }

  if (chainId <= 0) {
    return { isValid: false, error: 'Chain ID must be positive' };
  }

  return { isValid: true };
}

/**
 * Validate encryption type
 */
export function validateEncryptionType(
  type: string
): ValidationResult {
  const validTypes = ['euint8', 'euint16', 'euint32', 'euint64', 'ebool'];

  if (!validTypes.includes(type)) {
    return {
      isValid: false,
      error: `Type must be one of: ${validTypes.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate operation type
 */
export function validateOperation(operation: string): ValidationResult {
  const validOps = ['add', 'sub', 'mul', 'div', 'eq', 'ne', 'ge', 'gt', 'le', 'lt'];

  if (!validOps.includes(operation)) {
    return {
      isValid: false,
      error: `Operation must be one of: ${validOps.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate value for encryption type
 */
export function validateValueForType(
  value: number,
  type: 'euint8' | 'euint16' | 'euint32' | 'euint64'
): ValidationResult {
  const ranges = {
    euint8: { min: 0, max: 255 },
    euint16: { min: 0, max: 65535 },
    euint32: { min: 0, max: 4294967295 },
    euint64: { min: 0, max: Number.MAX_SAFE_INTEGER },
  };

  const range = ranges[type];

  if (value < range.min || value > range.max) {
    return {
      isValid: false,
      error: `Value must be between ${range.min} and ${range.max} for ${type}`,
    };
  }

  return { isValid: true };
}
