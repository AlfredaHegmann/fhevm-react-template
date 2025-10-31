'use client';

import React, { useState } from 'react';
import { useFHEContext } from './FHEProvider';
import { encryptData } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Computation Demo Component
 * Demonstrates homomorphic computation on encrypted data
 */
export const ComputationDemo: React.FC = () => {
  const { fhevm, isReady } = useFHEContext();
  const [value1, setValue1] = useState('10');
  const [value2, setValue2] = useState('20');
  const [operation, setOperation] = useState<'add' | 'mul' | 'sub'>('add');
  const [result, setResult] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState('');

  const handleCompute = async () => {
    if (!fhevm) return;

    try {
      setIsComputing(true);
      setError('');

      // Encrypt both values
      const encrypted1 = await encryptData(fhevm, Number(value1), {
        type: 'euint32',
      });
      const encrypted2 = await encryptData(fhevm, Number(value2), {
        type: 'euint32',
      });

      // In a real scenario, this would be sent to a smart contract
      // that performs the computation on-chain
      const computationInfo = {
        operation,
        operand1: encrypted1.value,
        operand2: encrypted2.value,
        message: 'Encrypted values prepared for on-chain computation',
      };

      setResult(JSON.stringify(computationInfo, null, 2));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Computation failed';
      setError(errorMsg);
      console.error('Computation error:', err);
    } finally {
      setIsComputing(false);
    }
  };

  if (!isReady) {
    return (
      <Card title="Computation Demo">
        <div className="animate-pulse text-gray-400">
          Initializing computation engine...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="🧮 Homomorphic Computation"
      description="Perform operations on encrypted data"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Value"
            type="number"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            placeholder="Enter first number"
          />
          <Input
            label="Second Value"
            type="number"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
            placeholder="Enter second number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="add">Addition (+)</option>
            <option value="sub">Subtraction (-)</option>
            <option value="mul">Multiplication (×)</option>
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleCompute}
          disabled={isComputing || !value1 || !value2}
          className="w-full"
        >
          {isComputing ? 'Computing...' : 'Prepare Computation'}
        </Button>

        {result && (
          <div className="p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
            <p className="text-sm font-medium text-blue-300 mb-2">
              ✅ Computation Prepared
            </p>
            <pre className="bg-gray-900 p-3 rounded font-mono text-xs text-gray-300 overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
};
