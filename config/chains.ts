import type { Chain } from '@web3-onboard/common'

/**
 * Chain configurations for Web3-Onboard
 * 
 * TODO: Customize these for your application
 * - Add/remove chains as needed
 * - Update RPC URLs (consider using private endpoints for production)
 * - Chain IDs must be in hex format (use '0x' + chainId.toString(16))
 * 
 * Common Chain IDs:
 * - 1 = Ethereum Mainnet (0x1)
 * - 56 = BSC Mainnet (0x38)
 * - 97 = BSC Testnet (0x61)
 * - 137 = Polygon (0x89)
 * - 42161 = Arbitrum One (0xa4b1)
 * - 8453 = Base (0x2105)
 * - 11155111 = Sepolia (0xaa36a7)
 */

export const CHAINS: Chain[] = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com'
  },
  {
    id: '0x38',
    token: 'BNB',
    label: 'BSC Mainnet',
    rpcUrl: 'https://bsc-rpc.publicnode.com'
  },
  {
    id: '0x61',
    token: 'tBNB',
    label: 'BSC Testnet',
    rpcUrl: 'https://bsc-testnet-rpc.publicnode.com'
  },
  {
    id: '0x89',
    token: 'MATIC',
    label: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com'
  },
  {
    id: '0xa4b1',
    token: 'ETH',
    label: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  {
    id: '0x2105',
    token: 'ETH',
    label: 'Base',
    rpcUrl: 'https://mainnet.base.org'
  }
]

/**
 * Helper to get chain by ID
 */
export const getChainById = (chainId: string | number): Chain | undefined => {
  const id = typeof chainId === 'number' ? `0x${chainId.toString(16)}` : chainId
  return CHAINS.find(chain => chain.id === id)
}

/**
 * Helper to get RPC URL for chain
 */
export const getRpcUrl = (chainId: string | number): string | undefined => {
  return getChainById(chainId)?.rpcUrl
}
