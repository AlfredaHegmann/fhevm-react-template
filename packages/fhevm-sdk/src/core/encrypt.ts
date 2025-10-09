import type { FhevmInstance } from './instance';
import { EncryptionError } from './errors';

export interface EncryptOptions {
  type?: 'euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool';
}

export interface EncryptedData {
  value: string;
  type: string;
}

/**
 * Encrypt data using FHEVM instance
 *
 * @example
 * ```typescript
 * const encrypted = await encryptData(fhevm, 1000, { type: 'euint64' });
 * ```
 */
export async function encryptData(
  instance: FhevmInstance,
  value: number | bigint | boolean,
  options?: EncryptOptions
): Promise<EncryptedData> {
  try {
    const type = options?.type || autoDetectType(value);
    let encryptedValue: string;

    switch (type) {
      case 'euint8':
        encryptedValue = await instance.encrypt8(Number(value));
        break;
      case 'euint16':
        encryptedValue = await instance.encrypt16(Number(value));
        break;
      case 'euint32':
        encryptedValue = await instance.encrypt32(Number(value));
        break;
      case 'euint64':
        encryptedValue = await instance.encrypt64(value as number | bigint);
        break;
      case 'ebool':
        encryptedValue = await instance.encryptBool(Boolean(value));
        break;
      default:
        throw new EncryptionError(`Unsupported encryption type: ${type}`);
    }

    return {
      value: encryptedValue,
      type,
    };
  } catch (error) {
    throw new EncryptionError(
      `Failed to encrypt data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function autoDetectType(value: number | bigint | boolean): string {
  if (typeof value === 'boolean') return 'ebool';
  if (typeof value === 'bigint') return 'euint64';
  if (value <= 255) return 'euint8';
  if (value <= 65535) return 'euint16';
  if (value <= 4294967295) return 'euint32';
  return 'euint64';
}
