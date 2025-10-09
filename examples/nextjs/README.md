# 🚀 FHEVM SDK - Next.js Example

Basic Next.js 14 template demonstrating **@fhevm/sdk** usage with minimal boilerplate.

---

## ✨ What This Shows

- **Quick setup** (< 10 lines of code)
- **React hooks** (`useFhevm`, `useEncrypt`)
- **Loading states** (built-in)
- **Error handling** (automatic)
- **Type safety** (full TypeScript)

---

## 🎯 Code Highlights

### Initialize FHEVM (3 lines)

```typescript
import { useFhevm } from '@fhevm/sdk/react';

const { fhevm, isReady } = useFhevm({ chainId: 8009 });
```

### Encrypt Data (2 lines)

```typescript
const { encrypt } = useEncrypt(fhevm);
const encrypted = await encrypt(1000, { type: 'euint64' });
```

**Total: 5 lines to encrypt data!**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

---

## 📂 Project Structure

```
nextjs/
├── app/
│   ├── page.tsx           # Main demo page (SDK usage)
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🔧 Key Features

### 1. Wagmi-like Hooks

```typescript
const { fhevm, isReady, error } = useFhevm({ chainId: 8009 });
const { encrypt, isEncrypting, error: encryptError } = useEncrypt(fhevm);
```

### 2. Automatic Loading States

```typescript
if (!isReady) return <Loading />;
if (isEncrypting) return <Encrypting />;
```

### 3. Built-in Error Handling

```typescript
if (error) return <Error message={error.message} />;
```

### 4. Type-Safe Encryption

```typescript
const encrypted = await encrypt(value, {
  type: 'euint64' // Full TypeScript support
});
```

---

## 📊 Comparison

| Traditional Approach | @fhevm/sdk |
|---------------------|------------|
| 50+ lines setup | < 5 lines |
| Manual state management | Built-in hooks |
| Manual error handling | Automatic |
| Complex types | Simple & clear |

---

## 🎨 UI Features

- Dark mode design
- Responsive layout
- Real-time encryption
- Animated loading states
- Error notifications
- Code examples shown

---

## 🔗 Links

- **Main SDK**: `../../packages/fhevm-sdk/`
- **Documentation**: `../../docs/`
- **Real-world Example**: `../freight-bidding/`

---

## 📝 Next Steps

1. Explore the code in `app/page.tsx`
2. Try encrypting different values
3. Check console for encrypted outputs
4. Build your own confidential dApp!

---

**Built with @fhevm/sdk** - Making FHEVM development simple 🔐✨
