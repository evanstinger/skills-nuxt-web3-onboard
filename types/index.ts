/**
 * Supported chain IDs for type safety
 */
export const ENABLED_CHAIN_IDS = [1, 56, 97, 137, 42161, 8453, 11155111] as const

export type ChainId = (typeof ENABLED_CHAIN_IDS)[number]

export interface ContractConfig {
  address: string
  abi: any[]
  chainId: ChainId | number
}
