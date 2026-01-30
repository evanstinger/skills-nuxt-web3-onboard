# Web3-Onboard Skill Reference

> **For AI Agents**: Complete reference for integrating Web3-Onboard into Nuxt 4 applications

## Skill Overview

This skill provides Web3 wallet integration for Nuxt 4 using:
- **@web3-onboard/core**: Wallet connection management
- **ethers v6**: Contract interactions and utilities
- **@pinia/nuxt**: State management with persistence

## Quick Implementation

When a user asks to "add Web3 wallet support" or "integrate Web3-Onboard":

1. **Read manifest.json** - Verify skill version and requirements
2. **Install dependencies** (DEPENDENCIES.md)
3. **Copy skill files** to project
4. **Configure** (SETUP.md)
5. **Test** with ConnectButton component

## File Inventory

### Core Files (Required)
```
plugins/web3Onboard.client.ts    - Plugin initialization
stores/web3.ts                   - Pinia store
composables/useContract.ts       - Contract interactions
config/chains.ts                 - Chain configs
config/metadata.ts               - DApp metadata
config/index.ts                  - Config exports
types/index.ts                   - TypeScript types
utils/rpc-provider.ts            - RPC with fallback
utils/string.ts                  - String utilities
```

### Optional Files
```
components/ConnectButton.vue     - UI component (generic button)
```

## Key Implementation Details

### Store Architecture

```typescript
// stores/web3.ts
const useWeb3Store = defineStore('Web3', () => {
  // State
  const onboard = shallowRef<OnboardAPI | null>(null)
  const alreadyConnectedWallets = ref<string[]>([])
  
  // Getters
  const isConnected = computed(() => !!connectedWallet.value)
  const chainId = computed(() => Number(connectedChain.value?.id))
  const address = computed(() => connectedWallet.value?.accounts[0]?.address)
  
  // Persistence
  if (import.meta.client) {
    const stored = localStorage.getItem('alreadyConnectedWallets')
    // ... parse and set
  }
})
```

**Key patterns:**
- `shallowRef` for large objects (performance)
- localStorage for wallet label persistence
- Auto-connect on plugin init

### Contract Composable

```typescript
// composables/useContract.ts
const useContract = (config: { address, abi, chainId }) => {
  // Read: Uses wallet provider when connected, else RPC fallback
  const read = async (method, args) => { ... }
  
  // Write: Validates chain, uses wallet signer
  const write = async (method, args) => {
    // Preflight validation with staticCall
    // Error decoding with Interface.parseError
  }
  
  // Race condition handling with fetch IDs
  // Type conversion helpers: asBigInt, asBoolean, asNumber, asString
}
```

### RPC Provider Utility

```typescript
// utils/rpc-provider.ts
const getRpcProvider = async (chainId) => {
  // Caches working providers
  // Tries multiple endpoints per chain
  // Returns JsonRpcProvider
}
```

## Configuration Requirements

### Environment Variables
```env
NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=required
NUXT_PUBLIC_TREZOR_EMAIL=optional
```

### Nuxt Config
```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      walletConnectProjectId: process.env.NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    }
  }
})
```

## Common Usage Patterns

### Basic Connection
```vue
<template>
  <ClientOnly>
    <button @click="web3Store.connectWallet()">
      {{ web3Store.isConnected ? 'Connected' : 'Connect' }}
    </button>
    <p v-if="web3Store.isConnected">
      {{ shortenAddress(web3Store.address) }}
    </p>
  </ClientOnly>
</template>

<script setup>
import { useWeb3Store } from '~/stores/web3'
import { shortenAddress } from '~/utils/string'
const web3Store = useWeb3Store()
</script>
```

### Contract Read
```typescript
const contract = useContract({
  address: '0x...',
  abi: ERC20_ABI,
  chainId: 1
})

const balance = await contract.read('balanceOf', [userAddress])
```

### Contract Write
```typescript
const tx = await contract.write('transfer', [toAddress, amountWei])
await tx.wait() // Wait for confirmation
```

## Important Considerations

### Client-Side Only
- Plugin uses `.client.ts` suffix
- Wrap UI in `<ClientOnly>`
- Use `import.meta.client` checks

### Error Handling
- Contract composable decodes revert errors
- RPC provider has fallback endpoints
- Store handles connection failures gracefully

### Type Safety
- ChainId type for supported networks
- ContractConfig interface
- Full TypeScript support

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSR hydration mismatch | Wrap in `<ClientOnly>` |
| Module not found | Install dependencies |
| Type errors | Add types to tsconfig.json |
| Wallet not auto-connecting | Check localStorage persistence |

## File Dependencies

```
web3Onboard.client.ts
  -> stores/web3.ts
  -> config/chains.ts
  -> config/metadata.ts

useContract.ts
  -> stores/web3.ts
  -> utils/rpc-provider.ts

stores/web3.ts
  -> types/index.ts
```

## Version Requirements
- Nuxt: >=4.0.0
- Vue: >=3.0.0
- Node: >=18.0.0
