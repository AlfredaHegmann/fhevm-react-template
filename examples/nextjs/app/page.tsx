'use client';

import React from 'react';
import { FHEProvider } from '../components/fhe/FHEProvider';
import { EncryptionDemo } from '../components/fhe/EncryptionDemo';
import { ComputationDemo } from '../components/fhe/ComputationDemo';
import { KeyManager } from '../components/fhe/KeyManager';
import { BankingExample } from '../components/examples/BankingExample';
import { MedicalExample } from '../components/examples/MedicalExample';

export default function Home() {
  return (
    <FHEProvider chainId={8009}>
      <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white">
              🔐 FHEVM SDK Complete Example
            </h1>
            <p className="text-xl text-gray-400 mb-2">
              Framework-agnostic toolkit for building confidential dApps
            </p>
            <p className="text-sm text-gray-500">
              Fully integrated with Fully Homomorphic Encryption on Next.js
            </p>
          </div>

          {/* Quick Start Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EncryptionDemo />
              <KeyManager />
            </div>
          </div>

          {/* Computation Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Homomorphic Computation
            </h2>
            <ComputationDemo />
          </div>

          {/* Real-World Examples */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Real-World Use Cases
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BankingExample />
              <MedicalExample />
            </div>
          </div>

          {/* Code Example */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Integration Code
            </h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-300">
{`import { createFhevmInstance, encryptData } from '@fhevm/sdk';

// Initialize FHEVM (< 5 lines)
const fhevm = await createFhevmInstance({ chainId: 8009 });

// Encrypt data
const encrypted = await encryptData(fhevm, 1000, { type: 'euint64' });

// Use in your contract
await contract.submitValue(encrypted.value);`}
                </code>
              </pre>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-2">🚀 Quick Setup</h3>
                <p className="text-sm text-gray-400">
                  Less than 5 lines of code to start encrypting
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-2">
                  🎨 Framework-Agnostic
                </h3>
                <p className="text-sm text-gray-400">
                  Works with React, Vue, Next.js, and Node.js
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-2">
                  🔐 Full FHEVM Support
                </h3>
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

          {/* API Routes Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Available API Routes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-900 p-3 rounded">
                <span className="text-blue-400 font-mono">/api/fhe</span>
                <p className="text-gray-400 text-xs mt-1">
                  General FHE operations
                </p>
              </div>
              <div className="bg-gray-900 p-3 rounded">
                <span className="text-blue-400 font-mono">/api/fhe/encrypt</span>
                <p className="text-gray-400 text-xs mt-1">Encryption endpoint</p>
              </div>
              <div className="bg-gray-900 p-3 rounded">
                <span className="text-blue-400 font-mono">/api/fhe/decrypt</span>
                <p className="text-gray-400 text-xs mt-1">Decryption endpoint</p>
              </div>
              <div className="bg-gray-900 p-3 rounded">
                <span className="text-blue-400 font-mono">/api/fhe/compute</span>
                <p className="text-gray-400 text-xs mt-1">
                  Computation operations
                </p>
              </div>
              <div className="bg-gray-900 p-3 rounded">
                <span className="text-blue-400 font-mono">/api/keys</span>
                <p className="text-gray-400 text-xs mt-1">Key management</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </FHEProvider>
  );
}
