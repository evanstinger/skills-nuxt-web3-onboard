# Setup Guide

> Configure Web3-Onboard for your Nuxt 4 application

## 1. Nuxt Configuration

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  runtimeConfig: {
    public: {
      // Required - Get from https://cloud.walletconnect.com
      walletConnectProjectId: process.env.NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      
      // Optional - For Trezor wallet support
      trezorEmail: process.env.NUXT_PUBLIC_TREZOR_EMAIL,
      
      // Optional - For custom RPC endpoints
      infuraKey: process.env.NUXT_PUBLIC_INFURA_KEY,
      alchemyKey: process.env.NUXT_PUBLIC_ALCHEMY_KEY,
    }
  },
  
  // Optional but recommended
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['@web3-onboard/core', 'ethers']
      }
    }
  }
})
```

## 2. Environment Variables

Create `.env` in project root:

```env
# Required - Get from https://cloud.walletconnect.com
NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional - For Trezor hardware wallet support
NUXT_PUBLIC_TREZOR_EMAIL=your_support_email@example.com

# Optional - For better RPC reliability (recommended for production)
NUXT_PUBLIC_INFURA_KEY=your_infura_key_here
NUXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key_here
```

## 3. Plugin Registration

The plugin at `plugins/web3Onboard.client.ts` will be auto-discovered by Nuxt due to the `.client.ts` suffix. No additional registration needed.

## 4. Store Registration

The Pinia store at `stores/web3.ts` will be auto-registered by `@pinia/nuxt`. Available as `useWeb3Store()` composable.

## 5. Component Usage

Use the included component or create your own:

```vue
<template>
  <div>
    <!-- Option 1: Use included component -->
    <ConnectButton />
    
    <!-- Option 2: Custom button -->
    <ClientOnly>
      <button @click="handleConnect">
        {{ web3Store.isConnected ? shortenAddress(web3Store.address) : 'Connect Wallet' }}
      </button>
    </ClientOnly>
  </div>
</template>

<script setup>
import { useWeb3Store } from '~/stores/web3'
import { shortenAddress } from '~/utils/string'

const web3Store = useWeb3Store()

const handleConnect = () => {
  if (web3Store.isConnected) {
    web3Store.openAccountCenter()
  } else {
    web3Store.connectWallet()
  }
}
</script>
```

## 6. TypeScript Configuration

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@web3-onboard/core", "ethers"]
  }
}
```

## 7. Chain Configuration

Edit `config/chains.ts`:

```typescript
export const CHAINS = [
  {
    id: '0x1', // Ethereum Mainnet
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com'
  },
  // Add your supported chains
]
```

## 8. DApp Metadata

Edit `config/metadata.ts`:

```typescript
export const DAPP_METADATA = {
  name: 'Your App Name',
  description: 'Your app description',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icon: '/icon.png',    // Place in public/ directory
  logo: '/logo.png',    // Place in public/ directory
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Rabby', url: 'https://rabby.io' },
  ],
}
```

## 9. Contract Interaction

Use the `useContract` composable:

```typescript
import { useContract } from '~/composables/useContract'

const contract = useContract({
  address: '0x...',
  abi: CONTRACT_ABI,
  chainId: 1
})

// Read data
const balance = await contract.read('balanceOf', [address])

// Write data
const tx = await contract.write('transfer', [toAddress, amount])
await tx.wait()
```

## Next Steps

- Read [BEST_PRACTICES.md](./BEST_PRACTICES.md) for recommended patterns
- Read [EXAMPLES.md](./EXAMPLES.md) for usage examples
- Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
