# 🚀 Quick Start Guide

Get started with @fhevm/sdk in less than 5 minutes!

---

## Installation

```bash
npm install @fhevm/sdk
# or
yarn add @fhevm/sdk
# or
pnpm add @fhevm/sdk
```

---

## Quick Start (< 5 Lines)

```typescript
import { quickStart } from '@fhevm/sdk';

const fhevm = await quickStart(8009);
const encrypted = await fhevm.encrypt64(1000);

console.log('Encrypted:', encrypted);
```

**That's it!** You're now encrypting data with FHEVM.

---

## Framework-Specific Examples

### React

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady } = useFhevm({ chainId: 8009 });
  const { encrypt } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    const encrypted = await encrypt(1000);
    console.log(encrypted);
  };

  return isReady ? <button onClick={handleEncrypt}>Encrypt</button> : <div>Loading...</div>;
}
```

### Next.js

```typescript
'use client';

import { quickStart } from '@fhevm/sdk';
import { useEffect, useState } from 'react';

export default function Page() {
  const [fhevm, setFhevm] = useState(null);

  useEffect(() => {
    quickStart(8009).then(setFhevm);
  }, []);

  return fhevm ? <EncryptionForm fhevm={fhevm} /> : <div>Loading...</div>;
}
```

### Node.js

```typescript
import { quickStart } from '@fhevm/sdk';

async function main() {
  const fhevm = await quickStart(8009);
  const encrypted = await fhevm.encrypt64(1000);
  console.log('Encrypted:', encrypted);
}

main();
```

---

## Complete Example: Encrypted Bidding

```typescript
import { quickStart } from '@fhevm/sdk';
import { ethers } from 'ethers';

// 1. Initialize FHEVM
const fhevm = await quickStart(8009);

// 2. Connect to contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// 3. Encrypt bid amount
const bidAmount = 12000; // $12,000
const encrypted = await fhevm.encrypt64(bidAmount);

// 4. Submit encrypted bid to blockchain
const tx = await contract.submitBid(jobId, encrypted);
await tx.wait();

console.log('Encrypted bid submitted!');
```

---

## Next Steps

1. **Explore Examples**: Check out [`examples/`](../examples/) for complete applications
2. **Read API Docs**: See [`docs/API.md`](API.md) for full API reference
3. **Watch Demo**: See [`demo.mp4`](../demo.mp4) for video demonstration
4. **Build Your App**: Use the SDK in your own project

---

## Need Help?

- **Documentation**: [README.md](../README.md)
- **API Reference**: [docs/API.md](API.md)
- **Examples**: [examples/](../examples/)
- **GitHub**: [fhevm-react-template](https://github.com/AlfredaHegmann/fhevm-react-template)

---

**Happy building with FHEVM!** 🔐✨
