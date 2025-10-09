'use client';

import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
import { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('1000');
  const [encryptedValue, setEncryptedValue] = useState('');

  // Initialize FHEVM with the SDK hook
  const { fhevm, isReady, error } = useFhevm({ chainId: 8009 });

  // Use encryption hook with loading states
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(Number(inputValue), { type: 'euint64' });
      setEncryptedValue(encrypted.value);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  if (error) {
    return (
      <main className="min-h-screen p-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-red-500">{error.message}</p>
        </div>
      </main>
    );
  }

  if (!isReady) {
    return (
      <main className="min-h-screen p-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Loading FHEVM SDK...</h1>
          <div className="animate-pulse">Initializing encryption...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-24 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-white">
          🔐 FHEVM SDK Example
        </h1>
        <p className="text-gray-400 mb-8">
          Encrypt data with just a few lines of code using @fhevm/sdk
        </p>

        <div className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Quick Start Demo
          </h2>

          <div className="space-y-4">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Value to Encrypt
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a number"
              />
            </div>

            {/* Encrypt Button */}
            <button
              onClick={handleEncrypt}
              disabled={isEncrypting}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isEncrypting ? 'Encrypting...' : 'Encrypt with FHEVM'}
            </button>

            {/* Error Display */}
            {encryptError && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300">Error: {encryptError.message}</p>
              </div>
            )}

            {/* Result Display */}
            {encryptedValue && (
              <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg">
                <p className="text-sm font-medium text-green-300 mb-2">
                  ✅ Encrypted Successfully
                </p>
                <div className="bg-gray-900 p-3 rounded font-mono text-xs text-gray-300 break-all">
                  {encryptedValue}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">
            📝 Code Used
          </h2>
          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-300">
{`import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady } = useFhevm({ chainId: 8009 });
  const { encrypt, isEncrypting } = useEncrypt(fhevm);

  const handleEncrypt = async () => {
    const encrypted = await encrypt(1000, { type: 'euint64' });
    console.log(encrypted.value);
  };

  return isReady && <button onClick={handleEncrypt}>Encrypt</button>;
}`}
            </code>
          </pre>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-2">🚀 Quick Setup</h3>
            <p className="text-sm text-gray-400">
              Less than 5 lines of code to start encrypting
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-2">🎨 Framework-Agnostic</h3>
            <p className="text-sm text-gray-400">
              Works with React, Vue, Next.js, and Node.js
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-2">🔐 Full FHEVM Support</h3>
            <p className="text-sm text-gray-400">
              All encryption types: euint8-64, ebool
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-2">✨ Wagmi-like API</h3>
            <p className="text-sm text-gray-400">
              Familiar hooks and patterns for web3 developers
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
