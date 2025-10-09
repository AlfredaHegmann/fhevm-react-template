# 📚 Examples Overview

Complete guide to all examples included in the FHEVM SDK submission.

---

## 🎯 Included Examples

### 1. **Next.js Basic Template** (`examples/nextjs/`)

**Type**: Quick start demonstration
**Purpose**: Show minimal SDK usage in Next.js
**Lines of Code**: < 100 lines total
**Setup Time**: < 5 minutes

**What it demonstrates**:
- ✅ Quick initialization with `useFhevm` hook
- ✅ Encryption with loading states
- ✅ Error handling
- ✅ Type-safe operations
- ✅ Wagmi-like API patterns

**Key Files**:
- `app/page.tsx` - Main demo (SDK usage in < 10 lines)
- `README.md` - Setup instructions

**Run it**:
```bash
cd examples/nextjs
npm install
npm run dev
# Visit http://localhost:3000
```

**Screenshot**: Interactive encryption demo with dark mode UI

---

### 2. **Private Freight Bidding Platform** (`examples/freight-bidding/`)

**Type**: Production-ready real-world application
**Purpose**: Complete confidential bidding system
**Lines of Code**: 2000+ lines
**Setup Time**: < 10 minutes

**What it demonstrates**:
- ✅ Full FHEVM integration in production
- ✅ Encrypted bidding workflow
- ✅ Gateway decryption callbacks
- ✅ Smart contract interaction
- ✅ Next.js 14 + TypeScript
- ✅ 54 comprehensive tests
- ✅ CI/CD pipeline
- ✅ Security & performance optimization

**Key Features**:
1. **Shippers** post freight jobs
2. **Carriers** submit encrypted bids (prices remain private)
3. **Gateway** decrypts winning bids
4. **Blockchain** stores all encrypted data

**Tech Stack**:
- Next.js 14 with App Router
- @fhevm/sdk for encryption
- ethers.js for blockchain
- RainbowKit for wallet connection
- Hardhat for smart contracts
- Sepolia testnet deployment

**Key Files**:
- `contracts/PrivateFreightBidding.sol` - Smart contract (basic)
- `contracts/PrivateFreightBiddingEnhanced.sol` - FHE version
- `app/` - Next.js frontend
- `test/` - 54 test cases
- `SDK_INTEGRATION.md` - How SDK is used

**Run it**:
```bash
cd examples/freight-bidding
npm install
npm run dev
# Visit http://localhost:3000
```

**Live Demo**: https://private-freight-bidding.vercel.app/

**Deployed Contract**: `0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576` (Sepolia)

---

## 📊 Comparison Table

| Feature | Next.js Basic | Freight Bidding |
|---------|---------------|-----------------|
| **Complexity** | Simple | Advanced |
| **Lines of Code** | ~100 | 2000+ |
| **Setup Time** | < 5 min | < 10 min |
| **Use Case** | Quick start | Real-world app |
| **SDK Integration** | Minimal | Full |
| **Smart Contract** | No | Yes |
| **Tests** | No | 54 tests |
| **Deployment** | Local only | Live on Vercel |
| **Purpose** | Learning | Production |

---

## 🎯 Which Example to Use?

### Choose **Next.js Basic** if you want to:
- ✅ Learn SDK basics quickly
- ✅ See minimal code example
- ✅ Understand hooks usage
- ✅ Get started in < 5 minutes
- ✅ Prototype an idea

### Choose **Freight Bidding** if you want to:
- ✅ See production-ready code
- ✅ Learn best practices
- ✅ Understand full workflow
- ✅ Deploy a real dApp
- ✅ Study testing patterns
- ✅ See CI/CD integration

---

## 🏗️ SDK Integration Patterns

### Pattern 1: Quick Start (Next.js Basic)

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function App() {
  const { fhevm, isReady } = useFhevm({ chainId: 8009 });
  const { encrypt } = useEncrypt(fhevm);

  // That's it! Ready to encrypt.
}
```

**Best for**: Simple demos, learning, prototypes

---

### Pattern 2: Production Integration (Freight Bidding)

```typescript
// 1. Centralized configuration
// lib/fhevm.ts
export const fhevmConfig = { chainId: 8009 };

// 2. Component usage
// components/BidForm.tsx
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function BidForm() {
  const { fhevm, isReady, error } = useFhevm(fhevmConfig);
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt(fhevm);

  // 3. Error handling
  if (error) return <ErrorDisplay error={error} />;
  if (!isReady) return <LoadingSpinner />;

  // 4. Encrypt and submit
  const handleSubmit = async (amount: number) => {
    const encrypted = await encrypt(amount, { type: 'euint64' });
    await contract.submitBid(jobId, encrypted.value);
  };

  // 5. UI with loading states
  return (
    <button onClick={() => handleSubmit(1000)} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit Bid'}
    </button>
  );
}
```

**Best for**: Production apps, complex workflows, error handling

---

## 🎬 Demo Flow

### Next.js Basic Example
1. Open http://localhost:3000
2. See SDK initialization (< 1 second)
3. Enter a number to encrypt
4. Click "Encrypt with FHEVM"
5. See encrypted output instantly
6. View code used (shown on page)

**Time**: 30 seconds to see encryption working

---

### Freight Bidding Example
1. Open https://private-freight-bidding.vercel.app/
2. Connect wallet (MetaMask)
3. Register as Shipper or Carrier
4. **As Shipper**:
   - Create freight job (LA → NY)
   - See job posted
5. **As Carrier**:
   - Browse available jobs
   - Submit encrypted bid ($12,000)
   - See bid encrypted on blockchain
6. **Back as Shipper**:
   - View encrypted bids
   - Request Gateway decryption
   - See revealed prices
   - Award job to winner

**Time**: 5 minutes for complete workflow

---

## 📝 Code Snippets from Examples

### Next.js Basic - Main Component

```typescript
const { fhevm, isReady } = useFhevm({ chainId: 8009 });
const { encrypt, isEncrypting } = useEncrypt(fhevm);

const handleEncrypt = async () => {
  const encrypted = await encrypt(Number(inputValue), { type: 'euint64' });
  setEncryptedValue(encrypted.value);
};
```

**Location**: `examples/nextjs/app/page.tsx:15-20`

---

### Freight Bidding - Bid Submission

```typescript
// 1. Initialize SDK
const { fhevm } = useFhevm({ chainId: 8009 });
const { encrypt } = useEncrypt(fhevm);

// 2. Encrypt bid
const encrypted = await encrypt(bidAmount, { type: 'euint64' });

// 3. Submit to contract
const tx = await contract.submitBid(jobId, encrypted.value);
await tx.wait();
```

**Location**: `examples/freight-bidding/SDK_INTEGRATION.md:150-160`

---

## 🔗 Resources

### Next.js Basic
- README: `examples/nextjs/README.md`
- Code: `examples/nextjs/app/page.tsx`
- Run: `cd examples/nextjs && npm run dev`

### Freight Bidding
- README: `examples/freight-bidding/EXAMPLE_README.md`
- SDK Integration: `examples/freight-bidding/SDK_INTEGRATION.md`
- Testing: `examples/freight-bidding/TESTING.md`
- Live Demo: https://private-freight-bidding.vercel.app/
- Contract: https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576

---

## 🎯 Learning Path

**Step 1**: Start with Next.js Basic
- Understand SDK initialization
- See encryption in action
- Learn hook patterns

**Step 2**: Explore Freight Bidding
- See production integration
- Study error handling
- Learn testing patterns

**Step 3**: Build Your Own
- Use SDK in your project
- Follow best practices from examples
- Deploy to production

---

## 📊 Metrics

### Next.js Basic
- **Files**: 7
- **Lines of Code**: ~100
- **Dependencies**: 4
- **Build Time**: < 10 seconds
- **Bundle Size**: ~500 KB

### Freight Bidding
- **Files**: 50+
- **Lines of Code**: 2000+
- **Dependencies**: 20+
- **Build Time**: ~30 seconds
- **Bundle Size**: ~2 MB
- **Test Coverage**: 80%
- **Tests**: 54

---

## ✅ Both Examples Demonstrate

1. **< 5 Lines Setup** - Quick initialization
2. **Wagmi-like API** - Familiar hooks
3. **Type Safety** - Full TypeScript
4. **Error Handling** - Built-in
5. **Loading States** - Automatic
6. **Production Ready** - Real deployments

---

**Choose your starting point and start building confidential dApps today!** 🚀🔐
