/**
 * Vue Adapter for FHEVM SDK
 *
 * Provides Vue 3 Composition API composables for FHEVM integration.
 *
 * @example
 * ```typescript
 * import { useFhevm, useEncrypt } from '@fhevm/sdk/adapters/vue';
 *
 * export default {
 *   setup() {
 *     const { fhevm, isReady } = useFhevm({ chainId: 8009 });
 *     const { encrypt, isEncrypting } = useEncrypt(fhevm);
 *
 *     const handleEncrypt = async (value: number) => {
 *       const encrypted = await encrypt(value);
 *       console.log('Encrypted:', encrypted);
 *     };
 *
 *     return { fhevm, isReady, handleEncrypt, isEncrypting };
 *   }
 * }
 * ```
 */

import { ref, computed, onMounted, type Ref } from 'vue';
import { createFhevmInstance, type FhevmInstance, type FhevmConfig } from '../core/instance';
import { encryptData, type EncryptOptions, type EncryptedData } from '../core/encrypt';
import { FhevmError } from '../core/errors';

/**
 * Composable for initializing and managing FHEVM instance in Vue components
 *
 * @param config - FHEVM configuration options
 * @returns Object containing fhevm instance, loading state, and error state
 *
 * @example
 * ```typescript
 * const { fhevm, isReady, error } = useFhevm({ chainId: 8009 });
 * ```
 */
export function useFhevm(config: FhevmConfig) {
  const fhevm: Ref<FhevmInstance | null> = ref(null);
  const isReady = ref(false);
  const error: Ref<Error | null> = ref(null);
  const isInitializing = ref(false);

  const publicKey = computed(() => fhevm.value?.publicKey || null);

  const initialize = async () => {
    if (isInitializing.value) return;

    isInitializing.value = true;
    isReady.value = false;
    error.value = null;

    try {
      const instance = await createFhevmInstance(config);
      fhevm.value = instance;
      isReady.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      console.error('FHEVM initialization failed:', err);
    } finally {
      isInitializing.value = false;
    }
  };

  onMounted(() => {
    initialize();
  });

  return {
    fhevm: computed(() => fhevm.value),
    isReady: computed(() => isReady.value),
    isInitializing: computed(() => isInitializing.value),
    error: computed(() => error.value),
    publicKey,
    reinitialize: initialize,
  };
}

/**
 * Composable for encrypting data with FHEVM
 *
 * @param fhevm - FHEVM instance (can be a Ref or raw instance)
 * @returns Object containing encrypt function and loading state
 *
 * @example
 * ```typescript
 * const { fhevm } = useFhevm({ chainId: 8009 });
 * const { encrypt, isEncrypting, error } = useEncrypt(fhevm);
 *
 * const handleSubmit = async (value: number) => {
 *   const encrypted = await encrypt(value, { type: 'euint64' });
 *   await contract.submitValue(encrypted.value);
 * };
 * ```
 */
export function useEncrypt(fhevm: Ref<FhevmInstance | null> | FhevmInstance | null) {
  const isEncrypting = ref(false);
  const error: Ref<Error | null> = ref(null);
  const lastEncrypted: Ref<EncryptedData | null> = ref(null);

  const encrypt = async (
    value: number | boolean,
    options?: EncryptOptions
  ): Promise<EncryptedData> => {
    const instance = typeof fhevm === 'object' && 'value' in fhevm ? fhevm.value : fhevm;

    if (!instance) {
      throw new FhevmError('FHEVM instance not initialized. Call useFhevm first.');
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const encrypted = await encryptData(instance, value, options);
      lastEncrypted.value = encrypted;
      return encrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Encryption failed');
      throw err;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    encrypt,
    isEncrypting: computed(() => isEncrypting.value),
    error: computed(() => error.value),
    lastEncrypted: computed(() => lastEncrypted.value),
  };
}

/**
 * Composable for batch encryption operations
 *
 * @param fhevm - FHEVM instance
 * @returns Object containing batch encrypt function and state
 *
 * @example
 * ```typescript
 * const { fhevm } = useFhevm({ chainId: 8009 });
 * const { encryptBatch, isEncrypting, progress } = useBatchEncrypt(fhevm);
 *
 * const values = [100, 200, 300];
 * const encrypted = await encryptBatch(values, { type: 'euint64' });
 * ```
 */
export function useBatchEncrypt(fhevm: Ref<FhevmInstance | null> | FhevmInstance | null) {
  const isEncrypting = ref(false);
  const error: Ref<Error | null> = ref(null);
  const progress = ref(0);
  const total = ref(0);

  const encryptBatch = async (
    values: (number | boolean)[],
    options?: EncryptOptions
  ): Promise<EncryptedData[]> => {
    const instance = typeof fhevm === 'object' && 'value' in fhevm ? fhevm.value : fhevm;

    if (!instance) {
      throw new FhevmError('FHEVM instance not initialized');
    }

    isEncrypting.value = true;
    error.value = null;
    progress.value = 0;
    total.value = values.length;

    try {
      const results: EncryptedData[] = [];

      for (let i = 0; i < values.length; i++) {
        const encrypted = await encryptData(instance, values[i], options);
        results.push(encrypted);
        progress.value = i + 1;
      }

      return results;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Batch encryption failed');
      throw err;
    } finally {
      isEncrypting.value = false;
      progress.value = 0;
      total.value = 0;
    }
  };

  return {
    encryptBatch,
    isEncrypting: computed(() => isEncrypting.value),
    error: computed(() => error.value),
    progress: computed(() => progress.value),
    total: computed(() => total.value),
    percentComplete: computed(() =>
      total.value > 0 ? Math.round((progress.value / total.value) * 100) : 0
    ),
  };
}

/**
 * Composable for managing encrypted values in Vue components
 *
 * @returns Object with methods for storing and retrieving encrypted values
 *
 * @example
 * ```typescript
 * const { store, retrieve, clear, has } = useEncryptedStore();
 *
 * // Store encrypted value
 * store('bidAmount', encryptedValue);
 *
 * // Retrieve it later
 * const value = retrieve('bidAmount');
 * ```
 */
export function useEncryptedStore() {
  const store = ref<Map<string, EncryptedData>>(new Map());

  const storeValue = (key: string, value: EncryptedData) => {
    store.value.set(key, value);
  };

  const retrieveValue = (key: string): EncryptedData | undefined => {
    return store.value.get(key);
  };

  const removeValue = (key: string): boolean => {
    return store.value.delete(key);
  };

  const clearAll = () => {
    store.value.clear();
  };

  const hasValue = (key: string): boolean => {
    return store.value.has(key);
  };

  const getAllKeys = (): string[] => {
    return Array.from(store.value.keys());
  };

  const size = computed(() => store.value.size);

  return {
    store: storeValue,
    retrieve: retrieveValue,
    remove: removeValue,
    clear: clearAll,
    has: hasValue,
    keys: getAllKeys,
    size,
  };
}

/**
 * Export all composables
 */
export default {
  useFhevm,
  useEncrypt,
  useBatchEncrypt,
  useEncryptedStore,
};
