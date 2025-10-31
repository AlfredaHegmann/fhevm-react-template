'use client';

import React, { useState } from 'react';
import { useFHEContext } from '../fhe/FHEProvider';
import { encryptData } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Medical Example Component
 * Demonstrates secure healthcare data handling using FHE
 */
export const MedicalExample: React.FC = () => {
  const { fhevm, isReady } = useFHEContext();
  const [patientId, setPatientId] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmitRecord = async () => {
    if (!fhevm) return;

    try {
      setIsProcessing(true);
      setError('');

      // Encrypt medical data
      const encryptedBP = await encryptData(fhevm, Number(bloodPressure), {
        type: 'euint32',
      });
      const encryptedHR = await encryptData(fhevm, Number(heartRate), {
        type: 'euint32',
      });

      // Create encrypted medical record
      const medicalRecord = {
        patientId,
        encryptedBloodPressure: encryptedBP.value,
        encryptedHeartRate: encryptedHR.value,
        timestamp: new Date().toISOString(),
        status: 'encrypted',
      };

      setRecord(medicalRecord);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to encrypt medical data';
      setError(errorMsg);
      console.error('Medical record error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isReady) {
    return (
      <Card title="Private Medical Records">
        <div className="animate-pulse text-gray-400">Loading medical system...</div>
      </Card>
    );
  }

  return (
    <Card
      title="🏥 Private Medical Records"
      description="Secure healthcare data with end-to-end encryption"
    >
      <div className="space-y-4">
        <Input
          label="Patient ID"
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter patient identifier"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Blood Pressure (mmHg)"
            type="number"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="120"
            helperText="Will be encrypted"
          />

          <Input
            label="Heart Rate (bpm)"
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="75"
            helperText="Will be encrypted"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmitRecord}
          disabled={isProcessing || !patientId || !bloodPressure || !heartRate}
          className="w-full"
        >
          {isProcessing ? 'Encrypting...' : 'Submit Encrypted Record'}
        </Button>

        {record && (
          <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-3">
              ✅ Medical Record Encrypted
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Patient ID:</span>
                <span className="text-white font-mono">{record.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-300">{record.status}</span>
              </div>
              <div className="mt-3">
                <span className="text-gray-400 block mb-1">Encrypted Vitals:</span>
                <div className="bg-gray-900 p-2 rounded space-y-1">
                  <div className="text-xs text-gray-500">Blood Pressure:</div>
                  <div className="font-mono text-xs text-gray-300 break-all">
                    {record.encryptedBloodPressure.slice(0, 50)}...
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Heart Rate:</div>
                  <div className="font-mono text-xs text-gray-300 break-all">
                    {record.encryptedHeartRate.slice(0, 50)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <p className="text-xs text-blue-300">
            🏥 Medical data remains encrypted on-chain. Only authorized healthcare providers with proper credentials can decrypt it.
          </p>
        </div>
      </div>
    </Card>
  );
};
