import { JsonRpcProvider } from 'ethers'
import type { ChainId } from '~/types'

// RPC endpoints with fallback pattern
const RPC_ENDPOINTS: Record<number, string[]> = {
  56: [
    'https://bsc-rpc.publicnode.com',
    'https://bsc.blockrazor.xyz',
    'https://bsc.drpc.org'
  ],
  97: [
    'https://bsc-testnet-rpc.publicnode.com',
    'https://bsc-testnet.public.blastapi.io',
    'https://bsc-testnet.drpc.org'
  ],
  1: [
    'https://ethereum-rpc.publicnode.com',
    'https://0xrpc.io/eth',
    'https://eth.drpc.org'
  ],
  137: [
    'https://polygon-rpc.com',
    'https://polygon.drpc.org',
    'https://rpc.ankr.com/polygon'
  ],
  42161: [
    'https://arb1.arbitrum.io/rpc',
    'https://arbitrum.drpc.org',
    'https://rpc.ankr.com/arbitrum'
  ],
  8453: [
    'https://mainnet.base.org',
    'https://base-rpc.publicnode.com',
    'https://base.drpc.org'
  ]
}

// Cache for providers to avoid creating multiple instances
const providerCache = new Map<number, JsonRpcProvider>()

/**
 * Get a read-only RPC provider for the specified chain with fallback support
 * @param chainId - The chain ID
 * @returns JsonRpcProvider instance
 */
export const getRpcProvider = async (chainId: number): Promise<JsonRpcProvider> => {
  // Return cached provider if available
  if (providerCache.has(chainId)) {
    const cachedProvider = providerCache.get(chainId)!
    try {
      // Test if provider is still working
      await cachedProvider.getBlockNumber()
      return cachedProvider
    } catch {
      // Remove failed provider from cache
      providerCache.delete(chainId)
    }
  }

  const endpoints = RPC_ENDPOINTS[chainId]
  if (!endpoints || endpoints.length === 0) {
    throw new Error(`No RPC endpoints configured for chain ID ${chainId}`)
  }

  // Try each endpoint until one works
  for (const endpoint of endpoints) {
    try {
      const provider = new JsonRpcProvider(endpoint)
      // Test the connection
      await provider.getBlockNumber()
      
      // Cache the working provider
      providerCache.set(chainId, provider)
      return provider
    } catch (error) {
      console.warn(`RPC endpoint ${endpoint} failed:`, error)
      continue
    }
  }

  throw new Error(`All RPC endpoints failed for chain ID ${chainId}`)
}

/**
 * Clear the provider cache (useful for testing or when switching networks)
 */
export const clearProviderCache = (): void => {
  providerCache.clear()
}

/**
 * Get available RPC endpoints for a chain
 * @param chainId - The chain ID
 * @returns Array of RPC endpoint URLs
 */
export const getRpcEndpoints = (chainId: number): string[] => {
  return RPC_ENDPOINTS[chainId] || []
}