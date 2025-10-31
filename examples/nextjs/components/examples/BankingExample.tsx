'use client';

import React, { useState } from 'react';
import { useFHEContext } from '../fhe/FHEProvider';
import { encryptData } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Banking Example Component
 * Demonstrates secure financial transactions using FHE
 */
export const BankingExample: React.FC = () => {
  const { fhevm, isReady } = useFHEContext();
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTransaction = async () => {
    if (!fhevm) return;

    try {
      setIsProcessing(true);
      setError('');

      // Encrypt the transaction amount
      const encryptedAmount = await encryptData(fhevm, Number(amount), {
        type: 'euint64',
      });

      // Create transaction object (would be sent to smart contract)
      const txData = {
        encryptedAmount: encryptedAmount.value,
        accountNumber,
        timestamp: new Date().toISOString(),
        status: 'prepared',
        type: 'transfer',
      };

      setTransaction(txData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      console.error('Transaction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isReady) {
    return (
      <Card title="Private Banking">
        <div className="animate-pulse text-gray-400">Loading banking system...</div>
      </Card>
    );
  }

  return (
    <Card
      title="🏦 Private Banking"
      description="Secure financial transactions with encrypted amounts"
    >
      <div className="space-y-4">
        <Input
          label="Transaction Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          helperText="Amount will be encrypted before transmission"
        />

        <Input
          label="Account Number"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter destination account"
        />

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleTransaction}
          disabled={isProcessing || !amount || !accountNumber}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Create Encrypted Transaction'}
        </Button>

        {transaction && (
          <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-3">
              ✅ Transaction Prepared
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Account:</span>
                <span className="text-white font-mono">{transaction.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-300">{transaction.status}</span>
              </div>
              <div className="mt-3">
                <span className="text-gray-400 block mb-1">Encrypted Amount:</span>
                <div className="bg-gray-900 p-2 rounded font-mono text-xs text-gray-300 break-all">
                  {transaction.encryptedAmount.slice(0, 100)}...
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <p className="text-xs text-blue-300">
            🔒 Your transaction amount is fully encrypted. Only authorized parties can decrypt it on-chain.
          </p>
        </div>
      </div>
    </Card>
  );
};
