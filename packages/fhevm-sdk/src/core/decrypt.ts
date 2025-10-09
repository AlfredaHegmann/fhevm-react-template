import { DecryptionError } from './errors';

export interface DecryptionRequest {
  ciphertext: string;
  contractAddress: string;
  userAddress: string;
}

export type DecryptionCallback = (decryptedValue: bigint) => void;

/**
 * Request decryption via Gateway callback
 *
 * @example
 * ```typescript
 * await requestDecryption(
 *   { ciphertext: encrypted, contractAddress, userAddress },
 *   (decrypted) => console.log('Decrypted:', decrypted)
 * );
 * ```
 */
export async function requestDecryption(
  request: DecryptionRequest,
  callback: DecryptionCallback
): Promise<void> {
  try {
    // This would integrate with the Gateway service
    // For now, this is a placeholder for the actual implementation
    throw new DecryptionError(
      'Decryption requires Gateway integration - see documentation for setup'
    );
  } catch (error) {
    throw new DecryptionError(
      `Failed to request decryption: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
