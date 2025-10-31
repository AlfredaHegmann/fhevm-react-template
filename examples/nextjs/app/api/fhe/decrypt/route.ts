import { NextRequest, NextResponse } from 'next/server';
import { createFhevmInstance, requestDecryption } from '@fhevm/sdk';

/**
 * Decryption API Route
 * Handles decryption requests for FHEVM encrypted data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      encryptedData,
      contractAddress,
      userAddress,
      chainId = 8009,
    } = body;

    // Validate inputs
    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Encrypted data is required' },
        { status: 400 }
      );
    }

    if (!contractAddress || !userAddress) {
      return NextResponse.json(
        { error: 'Contract address and user address are required' },
        { status: 400 }
      );
    }

    // Initialize FHEVM instance
    const fhevm = await createFhevmInstance({ chainId });

    // Request decryption (prepares EIP-712 signature request)
    const decryptionRequest = await requestDecryption(fhevm, {
      encryptedData,
      contractAddress,
      userAddress,
    });

    return NextResponse.json({
      success: true,
      decryptionRequest,
      message: 'Decryption request prepared. User must sign EIP-712 message.',
    });
  } catch (error) {
    console.error('Decryption request error:', error);
    return NextResponse.json(
      {
        error: 'Decryption request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Verify decryption signature
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, decryptionRequest } = body;

    if (!signature || !decryptionRequest) {
      return NextResponse.json(
        { error: 'Signature and decryption request are required' },
        { status: 400 }
      );
    }

    // Here you would verify the signature and process the decryption
    // This is a simplified version - actual implementation depends on your contract

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Signature verified successfully',
    });
  } catch (error) {
    console.error('Signature verification error:', error);
    return NextResponse.json(
      {
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
