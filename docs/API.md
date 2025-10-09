# 📚 API Reference

Complete API documentation for @fhevm/sdk

---

## Core Functions

### `quickStart(chainId)`

Fastest way to initialize FHEVM - perfect for getting started.

**Parameters:**
- `chainId` (number): The chain ID to connect to
  - `8009`: fhEVM Sepolia
  - `11155111`: Sepolia
  - `31337`: Local

**Returns:** `Promise<FhevmInstance>`

**Example:**
```typescript
import { quickStart } from '@fhevm/sdk';

const fhevm = await quickStart(8009);
```

---

### `createFhevmInstance(config)`

Create FHEVM instance with full configuration control.

**Parameters:**
- `config` (FhevmConfig):
  - `chainId` (number, required): Chain ID
  - `publicKey` (string, optional): Custom public key
  - `gatewayUrl` (string, optional): Custom Gateway URL
  - `aclAddress` (string, optional): ACL contract address
  - `network` ('sepolia' | 'mainnet' | 'local', optional): Network name

**Returns:** `Promise<FhevmInstance>`

**Example:**
```typescript
import { createFhevmInstance } from '@fhevm/sdk';

const fhevm = await createFhevmInstance({
  chainId: 8009,
  publicKey: 'custom-public-key',
  gatewayUrl: 'https://custom-gateway.com',
});
```

---

### `encryptData(instance, value, options)`

Encrypt data with automatic type detection.

**Parameters:**
- `instance` (FhevmInstance): FHEVM instance
- `value` (number | bigint | boolean): Value to encrypt
- `options` (EncryptOptions, optional):
  - `type` ('euint8' | 'euint16' | 'euint32' | 'euint64' | 'ebool'): Explicit type

**Returns:** `Promise<EncryptedData>`

**Example:**
```typescript
import { encryptData } from '@fhevm/sdk';

const encrypted = await encryptData(fhevm, 1000, { type: 'euint64' });
console.log(encrypted.value); // "0x8a7f3c2b..."
console.log(encrypted.type);  // "euint64"
```

---

## React Hooks

### `useFhevm(config)`

Initialize FHEVM in React components with loading states.

**Parameters:**
- `config` (FhevmConfig): Configuration object

**Returns:** Object with:
- `fhevm` (FhevmInstance | null): FHEVM instance
- `isReady` (boolean): Initialization status
- `error` (Error | null): Error if initialization failed

**Example:**
```typescript
import { useFhevm } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady, error } = useFhevm({ chainId: 8009 });

  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading FHEVM...</div>;

  return <EncryptionForm fhevm={fhevm} />;
}
```

---

### `useEncrypt(fhevm)`

Encrypt data with loading states and error handling.

**Parameters:**
- `fhevm` (FhevmInstance | null): FHEVM instance from useFhevm

**Returns:** Object with:
- `encrypt` (function): Encryption function
- `isEncrypting` (boolean): Encryption in progress
- `error` (Error | null): Encryption error

**Example:**
```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function BidForm() {
  const { fhevm } = useFhevm({ chainId: 8009 });
  const { encrypt, isEncrypting, error } = useEncrypt(fhevm);

  const handleSubmit = async (amount: number) => {
    const encrypted = await encrypt(amount, { type: 'euint64' });
    await contract.submitBid(jobId, encrypted.value);
  };

  return (
    <button onClick={() => handleSubmit(1000)} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit Bid'}
    </button>
  );
}
```

---

## Instance Methods

### `fhevm.encrypt8(value)`

Encrypt 8-bit unsigned integer (0-255).

**Parameters:**
- `value` (number): Value to encrypt

**Returns:** `Promise<string>` - Encrypted value

**Example:**
```typescript
const encrypted = await fhevm.encrypt8(100);
```

---

### `fhevm.encrypt16(value)`

Encrypt 16-bit unsigned integer (0-65535).

**Parameters:**
- `value` (number): Value to encrypt

**Returns:** `Promise<string>` - Encrypted value

**Example:**
```typescript
const encrypted = await fhevm.encrypt16(50000);
```

---

### `fhevm.encrypt32(value)`

Encrypt 32-bit unsigned integer (0-4294967295).

**Parameters:**
- `value` (number): Value to encrypt

**Returns:** `Promise<string>` - Encrypted value

**Example:**
```typescript
const encrypted = await fhevm.encrypt32(1000000);
```

---

### `fhevm.encrypt64(value)`

Encrypt 64-bit unsigned integer.

**Parameters:**
- `value` (number | bigint): Value to encrypt

**Returns:** `Promise<string>` - Encrypted value

**Example:**
```typescript
const encrypted = await fhevm.encrypt64(BigInt('9007199254740991'));
```

---

### `fhevm.encryptBool(value)`

Encrypt boolean value.

**Parameters:**
- `value` (boolean): Value to encrypt

**Returns:** `Promise<string>` - Encrypted value

**Example:**
```typescript
const encrypted = await fhevm.encryptBool(true);
```

---

### `fhevm.getPublicKey()`

Get the public key used for encryption.

**Returns:** `string` - Public key

**Example:**
```typescript
const publicKey = fhevm.getPublicKey();
console.log(publicKey);
```

---

## Utility Functions

### `validateEncryptedData(data)`

Validate encrypted data format.

**Parameters:**
- `data` (string): Encrypted data to validate

**Returns:** `boolean` - True if valid

**Example:**
```typescript
import { validateEncryptedData } from '@fhevm/sdk';

const isValid = validateEncryptedData('0x8a7f3c2b1d4e...');
```

---

### `isValidFhevmAddress(address)`

Check if address is valid Ethereum address.

**Parameters:**
- `address` (string): Address to validate

**Returns:** `boolean` - True if valid

**Example:**
```typescript
import { isValidFhevmAddress } from '@fhevm/sdk';

const isValid = isValidFhevmAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
```

---

### `formatEncryptedValue(value)`

Format encrypted value for display.

**Parameters:**
- `value` (string): Encrypted value

**Returns:** `string` - Formatted value (e.g., "0x8a7f...1d4e")

**Example:**
```typescript
import { formatEncryptedValue } from '@fhevm/sdk';

const formatted = formatEncryptedValue('0x8a7f3c2b1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a');
console.log(formatted); // "0x8a7f...7f8a"
```

---

### `parseEncryptedValue(value)`

Parse encrypted value from string.

**Parameters:**
- `value` (string): Value to parse

**Returns:** `string` - Parsed value with 0x prefix

**Example:**
```typescript
import { parseEncryptedValue } from '@fhevm/sdk';

const parsed = parseEncryptedValue('8a7f3c2b');
console.log(parsed); // "0x8a7f3c2b"
```

---

### `getFhevmNetworkConfig(chainId)`

Get network configuration for chain ID.

**Parameters:**
- `chainId` (number): Chain ID

**Returns:** `NetworkConfig | undefined` - Network configuration

**Example:**
```typescript
import { getFhevmNetworkConfig } from '@fhevm/sdk';

const network = getFhevmNetworkConfig(8009);
console.log(network);
// {
//   chainId: 8009,
//   name: 'fhEVM Sepolia',
//   rpcUrl: 'https://fhevm-sepolia.zama.ai',
//   gatewayUrl: 'https://gateway.zama.ai'
// }
```

---

## Constants

### `FHEVM_CHAIN_IDS`

Supported chain IDs.

```typescript
import { FHEVM_CHAIN_IDS } from '@fhevm/sdk';

console.log(FHEVM_CHAIN_IDS.FHEVM_SEPOLIA); // 8009
console.log(FHEVM_CHAIN_IDS.SEPOLIA);       // 11155111
console.log(FHEVM_CHAIN_IDS.MAINNET);       // 1
console.log(FHEVM_CHAIN_IDS.LOCAL);         // 31337
```

---

### `DEFAULT_GATEWAY_URL`

Default Gateway URL for decryption.

```typescript
import { DEFAULT_GATEWAY_URL } from '@fhevm/sdk';

console.log(DEFAULT_GATEWAY_URL); // "https://gateway.zama.ai"
```

---

### `ENCRYPTED_TYPES`

Supported encrypted types.

```typescript
import { ENCRYPTED_TYPES } from '@fhevm/sdk';

console.log(ENCRYPTED_TYPES.EUINT8);  // "euint8"
console.log(ENCRYPTED_TYPES.EUINT16); // "euint16"
console.log(ENCRYPTED_TYPES.EUINT32); // "euint32"
console.log(ENCRYPTED_TYPES.EUINT64); // "euint64"
console.log(ENCRYPTED_TYPES.EBOOL);   // "ebool"
```

---

### `SUPPORTED_NETWORKS`

Pre-configured network configurations.

```typescript
import { SUPPORTED_NETWORKS } from '@fhevm/sdk';

console.log(SUPPORTED_NETWORKS[8009]);
// {
//   chainId: 8009,
//   name: 'fhEVM Sepolia',
//   rpcUrl: 'https://fhevm-sepolia.zama.ai',
//   gatewayUrl: 'https://gateway.zama.ai'
// }
```

---

## Error Types

### `FhevmError`

Base error class for all FHEVM errors.

```typescript
import { FhevmError } from '@fhevm/sdk';

try {
  // ...
} catch (error) {
  if (error instanceof FhevmError) {
    console.error('FHEVM Error:', error.message);
  }
}
```

---

### `EncryptionError`

Encryption-specific errors.

```typescript
import { EncryptionError } from '@fhevm/sdk';

try {
  await fhevm.encrypt64(value);
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('Encryption failed:', error.message);
  }
}
```

---

### `DecryptionError`

Decryption-specific errors.

```typescript
import { DecryptionError } from '@fhevm/sdk';

try {
  await requestDecryption(...);
} catch (error) {
  if (error instanceof DecryptionError) {
    console.error('Decryption failed:', error.message);
  }
}
```

---

### `NetworkError`

Network-related errors.

```typescript
import { NetworkError } from '@fhevm/sdk';

try {
  const fhevm = await createFhevmInstance({ chainId: 8009 });
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  }
}
```

---

## TypeScript Types

### `FhevmConfig`

Configuration for FHEVM instance.

```typescript
interface FhevmConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
  network?: 'sepolia' | 'mainnet' | 'local';
}
```

---

### `FhevmInstance`

FHEVM instance interface.

```typescript
interface FhevmInstance {
  encrypt8: (value: number) => Promise<string>;
  encrypt16: (value: number) => Promise<string>;
  encrypt32: (value: number) => Promise<string>;
  encrypt64: (value: bigint | number) => Promise<string>;
  encryptBool: (value: boolean) => Promise<string>;
  getPublicKey: () => string;
  chainId: number;
  instance: any;
}
```

---

### `EncryptedData`

Encrypted data result.

```typescript
interface EncryptedData {
  value: string;
  type: string;
}
```

---

### `NetworkConfig`

Network configuration.

```typescript
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}
```

---

## Examples

See complete examples in:
- [`examples/nextjs/`](../examples/nextjs/) - Basic Next.js template
- [`examples/freight-bidding/`](../examples/freight-bidding/) - Real-world application

---

**For more information, visit**: [GitHub Repository](https://github.com/AlfredaHegmann/fhevm-react-template)
