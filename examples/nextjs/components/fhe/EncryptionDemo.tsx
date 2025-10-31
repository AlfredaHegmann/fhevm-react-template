'use client';

import React, { useState } from 'react';
import { useFHEContext } from './FHEProvider';
import { encryptData } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Encryption Demo Component
 * Demonstrates encryption functionality using the SDK
 */
export const EncryptionDemo: React.FC = () => {
  const { fhevm, isReady } = useFHEContext();
  const [inputValue, setInputValue] = useState('1000');
  const [encryptedValue, setEncryptedValue] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState('');

  const handleEncrypt = async () => {
    if (!fhevm) return;

    try {
      setIsEncrypting(true);
      setError('');

      const encrypted = await encryptData(fhevm, Number(inputValue), {
        type: 'euint64',
      });

      setEncryptedValue(encrypted.value);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMsg);
      console.error('Encryption error:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  if (!isReady) {
    return (
      <Card title="Encryption Demo">
        <div className="animate-pulse text-gray-400">
          Initializing encryption...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="🔐 Encryption Demo"
      description="Encrypt your data using homomorphic encryption"
    >
      <div className="space-y-4">
        <Input
          label="Value to Encrypt"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a number"
          error={error}
        />

        <Button
          onClick={handleEncrypt}
          disabled={isEncrypting || !inputValue}
          className="w-full"
        >
          {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

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
    </Card>
  );
};
