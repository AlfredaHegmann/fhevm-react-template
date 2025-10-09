import type { NetworkConfig } from '../types';
import { FHEVM_CHAIN_IDS } from '../constants';

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  [FHEVM_CHAIN_IDS.FHEVM_SEPOLIA]: {
    chainId: 8009,
    name: 'fhEVM Sepolia',
    rpcUrl: 'https://fhevm-sepolia.zama.ai',
    gatewayUrl: 'https://gateway.zama.ai',
  },
  [FHEVM_CHAIN_IDS.SEPOLIA]: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
  },
  [FHEVM_CHAIN_IDS.LOCAL]: {
    chainId: 31337,
    name: 'Local',
    rpcUrl: 'http://localhost:8545',
  },
};

export function getFhevmNetworkConfig(chainId: number): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS[chainId];
}
