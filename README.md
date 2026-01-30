# Web3-Onboard Skill for Nuxt 4

> **AI Agent Skill**: Complete Web3 wallet integration for Nuxt 4 applications using @web3-onboard, Ethers.js v6, and Pinia.

## Overview

Production-ready Web3 integration providing:
- **Multi-Wallet Support**: MetaMask, WalletConnect, Trezor, Coinbase, and more
- **State Management**: Pinia store with localStorage persistence and auto-reconnect
- **Contract Interactions**: Type-safe composables with RPC fallback, error decoding, and race condition handling
- **SSR-Safe**: Client-only initialization with proper hydration handling

## Quick Start

```bash
# 1. Install dependencies
npm install @web3-onboard/core @web3-onboard/injected-wallets @web3-onboard/metamask @web3-onboard/walletconnect ethers @pinia/nuxt

# 2. Copy skill files to your project
cp -r /path/to/skill/{components,composables,config,plugins,stores,types,utils} ./

# 3. Configure environment
echo "NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id" > .env

# 4. Update nuxt.config.ts - see SETUP.md for details
```

See [INSTALL.md](./INSTALL.md) for detailed installation instructions.

## What's Included

### Core Components
- **`components/ConnectButton.vue`** - Generic wallet connect button (no UI library dependency)
- **`composables/useContract.ts`** - Contract interaction with read/write methods, error handling, type helpers
- **`stores/web3.ts`** - Pinia store with auto-connection, localStorage persistence
- **`plugins/web3Onboard.client.ts`** - Web3-Onboard initialization

### Configuration
- **`config/chains.ts`** - Chain configurations (Ethereum, BSC, Polygon, etc.)
- **`config/metadata.ts`** - DApp metadata (name, icons, recommended wallets)

### Utilities
- **`utils/rpc-provider.ts`** - RPC provider with automatic failover and caching
- **`utils/string.ts`** - Address shortening and formatting utilities
- **`types/index.ts`** - TypeScript definitions for ChainId and ContractConfig

## Installation Methods

### Global Installation (For AI Agents)
```bash
# Install once, use across all projects
git clone https://github.com/evanstinger/skills-nuxt-web3-onboard.git ~/.config/opencode/skills/nuxt-web3-onboard
```

### Local Installation (Per Project)
```bash
# Copy to specific project
cp -r /path/to/skill/{components,composables,config,plugins,stores,types,utils} ./
```

See [INSTALL.md](./INSTALL.md) for complete installation guide with all methods.

## Documentation

| Document | Purpose |
|----------|---------|
| [INSTALL.md](./INSTALL.md) | Installation methods (global, local, manual) |
| [SETUP.md](./SETUP.md) | Configuration guide (env vars, Nuxt config, customization) |
| [DEPENDENCIES.md](./DEPENDENCIES.md) | Required and optional packages |
| [SKILL.md](./SKILL.md) | **AI Agent reference** - implementation details, patterns |
| [BEST_PRACTICES.md](./BEST_PRACTICES.md) | Dos and Don'ts |
| [EXAMPLES.md](./EXAMPLES.md) | Usage examples (ERC20, staking, components) |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |
| [ADVANCED.md](./ADVANCED.md) | Advanced patterns (queues, caching, batch operations) |

## Basic Usage

### Wallet Connection
```vue
<template>
  <ClientOnly>
    <button @click="handleConnect">
      {{ web3Store.isConnected ? shortenAddress(web3Store.address) : 'Connect Wallet' }}
    </button>
  </ClientOnly>
</template>

<script setup>
import { useWeb3Store } from '~/stores/web3'
import { shortenAddress } from '~/utils/string'

const web3Store = useWeb3Store()

const handleConnect = () => {
  if (web3Store.isConnected) {
    web3Store.openAccountCenter()  // Opens Web3-Onboard account modal
  } else {
    web3Store.connectWallet()       // Shows wallet selection
  }
}
</script>
```

### Contract Interaction
```typescript
import { useContract } from '~/composables/useContract'

const contract = useContract({
  address: '0x...',
  abi: ERC20_ABI,
  chainId: 1
})

// Read operation (uses RPC fallback if wallet not connected)
const balance = await contract.read('balanceOf', [userAddress])

// Write operation (requires connected wallet on correct chain)
const tx = await contract.write('transfer', [toAddress, amountWei])
await tx.wait()  // Wait for confirmation
```

See [EXAMPLES.md](./EXAMPLES.md) for complete examples including ERC20 composable and staking contracts.

## Requirements

- **Nuxt**: 4.x or higher
- **Vue**: 3.x
- **TypeScript**: 5.x
- **Node.js**: 18.x or higher

## File Structure

```
skill/
├── components/
│   └── ConnectButton.vue       # Wallet button with styles
├── composables/
│   └── useContract.ts          # Contract interaction composable
├── config/
│   ├── chains.ts               # Chain configurations
│   ├── metadata.ts             # DApp metadata
│   └── index.ts                # Config exports
├── plugins/
│   └── web3Onboard.client.ts   # Plugin initialization
├── stores/
│   └── web3.ts                 # Pinia store
├── types/
│   └── index.ts                # TypeScript types
└── utils/
    ├── rpc-provider.ts         # RPC provider with fallback
    └── string.ts               # String utilities
```

## For AI Agents

When integrating this skill:

1. **Read manifest.json** - Check version and requirements
2. **Read DEPENDENCIES.md** - Install required packages
3. **Copy skill files** - Use directories listed in manifest.json
4. **Configure** - Follow SETUP.md for environment and config
5. **Test** - Use ConnectButton component to verify

See [SKILL.md](./SKILL.md) for complete AI agent reference with implementation patterns and file dependencies.

## License

MIT License

Copyright (c) 2024 Evan Stinger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
