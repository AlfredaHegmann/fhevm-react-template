import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance } from '@fhevm/sdk';

/**
 * Homomorphic Computation API Route
 * Handles computation operations on encrypted data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      operation,
      operands,
      contractAddress,
      chainId = 8009,
    } = body;

    // Validate inputs
    if (!operation || !operands || !Array.isArray(operands)) {
      return NextResponse.json(
        { error: 'Operation and operands array are required' },
        { status: 400 }
      );
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'Contract address is required' },
        { status: 400 }
      );
    }

    // Initialize FHEVM instance
    const fhevm = await createFhevmInstance({ chainId });

    // Prepare computation metadata
    const computationInfo = {
      operation,
      operandCount: operands.length,
      contractAddress,
      timestamp: new Date().toISOString(),
      supportedOperations: [
        'add',
        'sub',
        'mul',
        'div',
        'eq',
        'ne',
        'ge',
        'gt',
        'le',
        'lt',
      ],
    };

    return NextResponse.json({
      success: true,
      message: 'Computation prepared. Execute on smart contract.',
      computationInfo,
    });
  } catch (error) {
    console.error('Computation preparation error:', error);
    return NextResponse.json(
      {
        error: 'Computation preparation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get supported operations
 */
export async function GET() {
  return NextResponse.json({
    supportedOperations: {
      arithmetic: ['add', 'sub', 'mul', 'div'],
      comparison: ['eq', 'ne', 'ge', 'gt', 'le', 'lt'],
      logical: ['and', 'or', 'not', 'xor'],
      bitwise: ['shl', 'shr', 'rotl', 'rotr'],
    },
    types: ['euint8', 'euint16', 'euint32', 'euint64', 'ebool'],
    message: 'All operations are performed on-chain with encrypted data',
  });
}
