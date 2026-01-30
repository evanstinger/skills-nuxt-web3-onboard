# Installation Guide

> How to install and configure the Web3-Onboard skill for Nuxt 4

## Prerequisites

- Nuxt 4 project initialized
- Node.js 18+ or 20+
- TypeScript enabled

## Method 1: Global Installation (For AI Agents)

Install once, use across all projects.

### Step 1: Clone to Global Skills Directory

```bash
# Create skills directory
mkdir -p ~/.opencodes/skills

# Clone the skill repository
git clone https://github.com/evanstinger/skills-nuxt-web3-onboard.git ~/.opencodes/skills/nuxt-web3-onboard
```

### Step 2: Reference in AI Prompts

When working with an AI agent, reference the skill:

```
Install Web3 wallet integration using the nuxt-web3-onboard skill from ~/.opencodes/skills/nuxt-web3-onboard
```

The AI will:
1. Read `manifest.json` for metadata
2. Install dependencies from `DEPENDENCIES.md`
3. Copy files to your project
4. Guide configuration

## Method 2: Local Installation (Per Project)

Install directly into a specific project.

### Step 1: Download Skill Files

```bash
# Clone to temporary location
git clone https://github.com/evanstinger/skills-nuxt-web3-onboard.git /tmp/nuxt-web3-onboard

# Copy directories to your project
cp -r /tmp/nuxt-web3-onboard/components/* ./components/
cp -r /tmp/nuxt-web3-onboard/composables/* ./composables/
cp -r /tmp/nuxt-web3-onboard/config/* ./config/
cp -r /tmp/nuxt-web3-onboard/plugins/* ./plugins/
cp -r /tmp/nuxt-web3-onboard/stores/* ./stores/
cp -r /tmp/nuxt-web3-onboard/types/* ./types/
cp -r /tmp/nuxt-web3-onboard/utils/* ./utils/

# Clean up
rm -rf /tmp/nuxt-web3-onboard
```

### Step 2: Install Dependencies

```bash
npm install @web3-onboard/core @web3-onboard/injected-wallets @web3-onboard/metamask @web3-onboard/walletconnect ethers @pinia/nuxt
```

Optional wallets:
```bash
npm install @web3-onboard/trezor @web3-onboard/coinbase @web3-onboard/ledger
```

## Method 3: Manual File Copy

Copy individual files as needed.

### Essential Files (Required)

```bash
# Core functionality
mkdir -p plugins stores composables utils types config

curl -o plugins/web3Onboard.client.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/plugins/web3Onboard.client.ts
curl -o stores/web3.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/stores/web3.ts
curl -o composables/useContract.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/composables/useContract.ts
curl -o utils/rpc-provider.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/utils/rpc-provider.ts
curl -o utils/string.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/utils/string.ts
curl -o types/index.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/types/index.ts

# Config (customize these)
curl -o config/chains.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/config/chains.ts
curl -o config/metadata.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/config/metadata.ts
curl -o config/index.ts https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/config/index.ts
```

### Optional Files

```bash
# UI Component (or create your own)
mkdir -p components
curl -o components/ConnectButton.vue https://raw.githubusercontent.com/evanstinger/skills-nuxt-web3-onboard/main/components/ConnectButton.vue
```

## Post-Installation Configuration

### 1. Environment Variables

Create `.env` in project root:

```env
# Required
NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional - for better RPC reliability
NUXT_PUBLIC_INFURA_KEY=your_infura_key
NUXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key
```

Get WalletConnect Project ID: https://cloud.walletconnect.com

### 2. Nuxt Config

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  
  runtimeConfig: {
    public: {
      walletConnectProjectId: process.env.NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      infuraKey: process.env.NUXT_PUBLIC_INFURA_KEY,
      alchemyKey: process.env.NUXT_PUBLIC_ALCHEMY_KEY,
    }
  },
  
  // Optional: TypeScript types
  typescript: {
    tsConfig: {
      compilerOptions: {
        types: ['@web3-onboard/core', 'ethers']
      }
    }
  }
})
```

### 3. Customize Config Files

#### Edit `config/metadata.ts`:

```typescript
export const DAPP_METADATA = {
  name: 'Your App Name',
  description: 'Your app description',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icon: '/icon.png',
  logo: '/logo.png',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Rabby', url: 'https://rabby.io' },
  ],
}
```

#### Edit `config/chains.ts`:

Add/remove chains as needed:

```typescript
export const CHAINS = [
  {
    id: '0x1', // Ethereum
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com'
  },
  // Add your supported chains
]
```

### 4. TypeScript Types

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@web3-onboard/core", "ethers"]
  }
}
```

## Verification

Test the installation:

```vue
<template>
  <div>
    <ClientOnly>
      <button @click="web3Store.connectWallet()">
        {{ web3Store.isConnected ? 'Connected' : 'Connect Wallet' }}
      </button>
      <p v-if="web3Store.isConnected">
        Address: {{ web3Store.address }}
      </p>
    </ClientOnly>
  </div>
</template>

<script setup>
import { useWeb3Store } from '~/stores/web3'
const web3Store = useWeb3Store()
</script>
```

## Troubleshooting Installation

### Issue: Module not found errors

**Solution**: Install missing dependencies
```bash
npm install @web3-onboard/core @pinia/nuxt ethers
```

### Issue: TypeScript errors

**Solution**: Add types to tsconfig.json
```json
{
  "compilerOptions": {
    "types": ["@web3-onboard/core", "ethers"]
  }
}
```

### Issue: SSR hydration mismatch

**Solution**: Wrap components in `<ClientOnly>`
```vue
<ClientOnly>
  <ConnectButton />
</ClientOnly>
```

## Next Steps

1. Read [SETUP.md](./SETUP.md) for detailed configuration
2. Read [BEST_PRACTICES.md](./BEST_PRACTICES.md) for patterns
3. Read [EXAMPLES.md](./EXAMPLES.md) for usage examples
