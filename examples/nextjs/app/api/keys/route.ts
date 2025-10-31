import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, getFhevmNetworkConfig } from '@fhevm/sdk';

/**
 * Key Management API Route
 * Handles FHEVM public key retrieval and management
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainId = parseInt(searchParams.get('chainId') || '8009');

    // Get network configuration
    const networkConfig = getFhevmNetworkConfig(chainId);

    // Initialize FHEVM instance
    const fhevm = await createFhevmInstance({ chainId });

    return NextResponse.json({
      success: true,
      chainId,
      publicKey: fhevm.publicKey,
      network: networkConfig,
    });
  } catch (error) {
    console.error('Key retrieval error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve keys',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Refresh or validate keys
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chainId = 8009, action = 'refresh' } = body;

    const fhevm = await createFhevmInstance({ chainId });

    let result;

    switch (action) {
      case 'refresh':
        // Re-initialize to get fresh keys
        result = {
          success: true,
          publicKey: fhevm.publicKey,
          message: 'Keys refreshed successfully',
        };
        break;

      case 'validate':
        // Validate current keys
        const isValid = fhevm.publicKey && fhevm.publicKey.length > 0;
        result = {
          success: isValid,
          valid: isValid,
          message: isValid ? 'Keys are valid' : 'Keys are invalid',
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Key management error:', error);
    return NextResponse.json(
      {
        error: 'Key management operation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
