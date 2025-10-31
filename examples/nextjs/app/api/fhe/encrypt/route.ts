import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, encryptData } from '@fhevm/sdk';

/**
 * Encryption API Route
 * Handles data encryption using FHEVM
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, type = 'euint64', chainId = 8009 } = body;

    // Validate input
    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // Initialize FHEVM instance
    const fhevm = await createFhevmInstance({ chainId });

    // Encrypt the data
    const encrypted = await encryptData(fhevm, value, { type });

    return NextResponse.json({
      success: true,
      encrypted: encrypted.value,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json(
      {
        error: 'Encryption failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Batch encryption endpoint
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { values, type = 'euint64', chainId = 8009 } = body;

    if (!Array.isArray(values) || values.length === 0) {
      return NextResponse.json(
        { error: 'Values array is required' },
        { status: 400 }
      );
    }

    const fhevm = await createFhevmInstance({ chainId });

    // Encrypt all values
    const encrypted = await Promise.all(
      values.map(value => encryptData(fhevm, value, { type }))
    );

    return NextResponse.json({
      success: true,
      encrypted: encrypted.map(e => e.value),
      count: encrypted.length,
      type,
    });
  } catch (error) {
    console.error('Batch encryption error:', error);
    return NextResponse.json(
      {
        error: 'Batch encryption failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
