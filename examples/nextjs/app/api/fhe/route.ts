import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance } from '@fhevm/sdk';

/**
 * FHE Operations API Route
 * Handles general FHEVM operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, chainId = 8009, data } = body;

    // Initialize FHEVM instance
    const fhevm = await createFhevmInstance({
      chainId,
    });

    let result;

    switch (operation) {
      case 'initialize':
        result = {
          success: true,
          message: 'FHEVM instance initialized successfully',
          chainId,
        };
        break;

      case 'getPublicKey':
        result = {
          success: true,
          publicKey: fhevm.publicKey,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('FHE operation error:', error);
    return NextResponse.json(
      {
        error: 'Operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'FHE API is running',
    endpoints: ['/api/fhe', '/api/fhe/encrypt', '/api/fhe/decrypt', '/api/fhe/compute'],
  });
}
