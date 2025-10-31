'use client';

import React, { useState, useEffect } from 'react';
import { useFHEContext } from './FHEProvider';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Key Manager Component
 * Displays and manages FHEVM public keys
 */
export const KeyManager: React.FC = () => {
  const { fhevm, isReady, chainId } = useFHEContext();
  const [publicKey, setPublicKey] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (fhevm && isReady) {
      setPublicKey(fhevm.publicKey || '');
    }
  }, [fhevm, isReady]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // In a real scenario, you might want to fetch fresh keys from the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (fhevm) {
        setPublicKey(fhevm.publicKey || '');
      }
    } catch (error) {
      console.error('Failed to refresh keys:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicKey);
  };

  if (!isReady) {
    return (
      <Card title="Key Manager">
        <div className="animate-pulse text-gray-400">
          Loading keys...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="🔑 Key Manager"
      description="Manage FHEVM public keys"
    >
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Public Key
            </label>
            <span className="text-xs text-gray-500">
              Chain ID: {chainId}
            </span>
          </div>
          <div className="relative">
            <div className="bg-gray-900 p-3 rounded-lg font-mono text-xs text-gray-300 break-all max-h-32 overflow-y-auto">
              {publicKey || 'No public key available'}
            </div>
            {publicKey && (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-xs"
                title="Copy to clipboard"
              >
                📋
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Keys'}
          </Button>
          {publicKey && (
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              Copy Key
            </Button>
          )}
        </div>

        <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 This public key is used to encrypt data before sending it to the blockchain.
            The private key remains secure on the FHEVM network.
          </p>
        </div>
      </div>
    </Card>
  );
};
