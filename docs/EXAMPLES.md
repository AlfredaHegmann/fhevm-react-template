# FHEVM SDK Examples

Complete examples demonstrating the Universal FHEVM SDK across different frameworks and use cases.

---

## 📁 Available Examples

### 1. Next.js Production Template

**Location**: [`examples/nextjs/`](../examples/nextjs/)

A production-ready Next.js 14 template with complete FHEVM integration following the App Router pattern.

**Features**:
- ✅ Complete App Router structure
- ✅ API routes for FHE operations (encrypt, decrypt, compute)
- ✅ FHE Provider with React Context
- ✅ Custom hooks (useFHE, useEncryption, useComputation)
- ✅ Comprehensive component library
- ✅ Real-world use cases (Banking, Medical)
- ✅ Full TypeScript support

**Quick Start**:
```bash
cd examples/nextjs
npm install
npm run dev
# Visit http://localhost:3000
```

**What You'll Learn**:
- Setting up FHEVM in Next.js 14
- Creating API routes for server-side encryption
- Building reusable FHE components
- Managing encrypted state with React Context
- Implementing custom hooks for FHE operations

---

### 2. Private Freight Bidding Platform

**Location**: [`examples/freight-bidding/`](../examples/freight-bidding/)

A complete real-world application demonstrating privacy-preserving bidding using FHEVM.

**Features**:
- ✅ Encrypted bid submission (euint64)
- ✅ Anonymous competition between carriers
- ✅ Gateway decryption callbacks
- ✅ Role-based access control
- ✅ Smart contract integration
- ✅ Web3 wallet connection

**Quick Start**:
```bash
cd examples/freight-bidding
npm install
npm run dev
# Connect MetaMask to Sepolia testnet
```

**What You'll Learn**:
- Real-world FHEVM application architecture
- Encrypting sensitive business data
- Smart contract interaction with encrypted values
- Gateway callback implementation
- Privacy-preserving auction mechanisms

**Live Demo**: [https://private-freight-bidding.vercel.app/](https://private-freight-bidding.vercel.app/)

---

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js 18+ or 20+
node --version

# Install dependencies
npm install

# Get Sepolia ETH for testing
# https://sepoliafaucet.com/
```

### Environment Setup

All examples require basic environment configuration:

```env
# .env.local
NEXT_PUBLIC_CHAIN_ID=8009  # fhEVM Sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
```

---

## 💡 Example Patterns

### Pattern 1: Quick Start (< 5 Lines)

**Use Case**: Fastest way to start encrypting data

```typescript
import { quickStart } from '@fhevm/sdk';

// One line initialization
const fhevm = await quickStart(8009);

// Encrypt immediately
const encrypted = await fhevm.encrypt64(1000);
```

**Best For**:
- Prototyping
- Simple scripts
- Testing FHEVM functionality

---

### Pattern 2: React Integration

**Use Case**: React components with FHEVM

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function BidForm() {
  const { fhevm, isReady } = useFhevm({ chainId: 8009 });
  const { encrypt, isEncrypting } = useEncrypt(fhevm);

  const handleSubmit = async (amount: number) => {
    const encrypted = await encrypt(amount);
    await contract.submitBid(jobId, encrypted.value);
  };

  if (!isReady) return <div>Loading...</div>;
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Best For**:
- React applications
- Client-side encryption
- Interactive UIs

**Example**: `examples/nextjs/components/fhe/EncryptionDemo.tsx`

---

### Pattern 3: Next.js API Routes

**Use Case**: Server-side encryption endpoints

```typescript
// app/api/encrypt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, encryptData } from '@fhevm/sdk';

export async function POST(request: NextRequest) {
  const { value, type = 'euint64' } = await request.json();

  const fhevm = await createFhevmInstance({ chainId: 8009 });
  const encrypted = await encryptData(fhevm, value, { type });

  return NextResponse.json({ encrypted: encrypted.value });
}
```

**Best For**:
- Server-side operations
- API services
- Backend encryption

**Example**: `examples/nextjs/app/api/fhe/encrypt/route.ts`

---

### Pattern 4: Context Provider

**Use Case**: Global FHEVM instance management

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { createFhevmInstance, type FhevmInstance } from '@fhevm/sdk';

const FHEContext = createContext<{
  fhevm: FhevmInstance | null;
  isReady: boolean;
}>(null);

export function FHEProvider({ children, chainId = 8009 }) {
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    createFhevmInstance({ chainId })
      .then(instance => {
        setFhevm(instance);
        setIsReady(true);
      });
  }, [chainId]);

  return (
    <FHEContext.Provider value={{ fhevm, isReady }}>
      {children}
    </FHEContext.Provider>
  );
}
```

**Best For**:
- Application-wide FHEVM access
- Shared state management
- Multiple components using FHE

**Example**: `examples/nextjs/components/fhe/FHEProvider.tsx`

---

### Pattern 5: Smart Contract Integration

**Use Case**: Interacting with FHEVM contracts

```typescript
import { createFhevmInstance } from '@fhevm/sdk';
import { ethers } from 'ethers';

// Initialize
const fhevm = await createFhevmInstance({ chainId: 8009 });
const contract = new ethers.Contract(address, abi, signer);

// Encrypt input
const encryptedBid = await fhevm.encrypt64(bidAmount);

// Submit to contract
const tx = await contract.submitBid(jobId, encryptedBid);
await tx.wait();

// Request decryption (Gateway callback)
await contract.requestDecryption(bidId);
```

**Best For**:
- DApp development
- Smart contract interaction
- On-chain privacy

**Example**: `examples/freight-bidding/app.js`

---

## 📖 Example Use Cases

### Banking Example

**File**: `examples/nextjs/components/examples/BankingExample.tsx`

**Demonstrates**:
- Private transaction amounts
- Encrypted account balances
- Confidential transfers

```typescript
const encryptedAmount = await fhevm.encrypt64(transferAmount);
await bankContract.transfer(recipient, encryptedAmount);
```

---

### Medical Example

**File**: `examples/nextjs/components/examples/MedicalExample.tsx`

**Demonstrates**:
- Encrypted health records
- Privacy-preserving data access
- Confidential patient information

```typescript
const encryptedRecord = await fhevm.encrypt64(bloodPressure);
await medicalContract.storeRecord(patientId, encryptedRecord);
```

---

### Freight Bidding Example

**File**: `examples/freight-bidding/`

**Demonstrates**:
- Sealed-bid auctions
- Anonymous competition
- Privacy-preserving price discovery
- Gateway decryption callbacks

```typescript
const encryptedPrice = await fhevm.encrypt64(bidPrice);
await biddingContract.submitBid(jobId, encryptedPrice);
```

---

## 🧪 Running Examples

### Local Development

```bash
# Clone repository
git clone https://github.com/AlfredaHegmann/fhevm-react-template
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK package
cd packages/fhevm-sdk
npm run build
cd ../..

# Run Next.js example
cd examples/nextjs
npm install
npm run dev

# Or run freight bidding example
cd examples/freight-bidding
npm install
npm run dev
```

---

### Testing Examples

```bash
# Run tests for freight bidding
cd examples/freight-bidding
npm test

# Run tests with coverage
npm run test:coverage
```

---

## 🎯 Learning Path

### Beginner

1. **Start with Quick Start pattern**
   - `quickStart()` function
   - Basic encryption
   - Simple Node.js scripts

2. **Explore Next.js template**
   - Browse component structure
   - Read API route implementations
   - Test in browser

### Intermediate

3. **Study React Integration**
   - Custom hooks
   - Context providers
   - State management

4. **Examine Banking/Medical examples**
   - Real-world use cases
   - Component patterns
   - Error handling

### Advanced

5. **Deep dive into Freight Bidding**
   - Smart contract integration
   - Gateway callbacks
   - Multi-user workflows

6. **Build Your Own Application**
   - Use SDK in your project
   - Implement custom features
   - Deploy to production

---

## 📚 Additional Resources

### Documentation

- [Quick Start Guide](./QUICKSTART.md) - Get started in < 5 minutes
- [API Reference](./API.md) - Complete API documentation
- [Main README](../README.md) - Project overview

### Example Documentation

- [Next.js Template README](../examples/nextjs/README.md)
- [Freight Bidding README](../examples/freight-bidding/README.md)
- [SDK Integration Guide](../examples/freight-bidding/SDK_INTEGRATION.md)

### External Resources

- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [fhevmjs Documentation](https://docs.zama.ai/fhevm/guides/frontend)
- [Gateway SDK Guide](https://docs.zama.ai/fhevm/guides/gateway)

---

## 🤝 Contributing Examples

Want to add your own example? Great!

### Guidelines

1. **Create a new directory** in `examples/`
2. **Include a README.md** with setup instructions
3. **Add package.json** with dependencies
4. **Document SDK usage** clearly
5. **Provide working code** that can be tested
6. **Submit a Pull Request**

### Example Structure

```
examples/your-example/
├── README.md           # Setup and usage
├── package.json        # Dependencies
├── src/                # Source code
├── components/         # React components (if applicable)
└── contracts/          # Smart contracts (if applicable)
```

---

## 🔗 Quick Links

- **SDK Package**: [`packages/fhevm-sdk/`](../packages/fhevm-sdk/)
- **Templates**: [`templates/`](../templates/)
- **Main README**: [`README.md`](../README.md)
- **API Docs**: [`docs/API.md`](./API.md)
- **Quick Start**: [`docs/QUICKSTART.md`](./QUICKSTART.md)

---

**Making FHEVM development simple through practical examples** 🚀🔐
