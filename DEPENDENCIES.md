# Dependencies

> Required and optional packages for Web3-Onboard integration

## Core Dependencies (Required)

```bash
npm install @web3-onboard/core @web3-onboard/injected-wallets @web3-onboard/metamask @web3-onboard/walletconnect ethers @pinia/nuxt
```

| Package | Purpose |
|---------|---------|
| `@web3-onboard/core` | Core wallet connection functionality |
| `@web3-onboard/injected-wallets` | Browser extension wallets (MetaMask, etc.) |
| `@web3-onboard/metamask` | MetaMask specific integration |
| `@web3-onboard/walletconnect` | WalletConnect v2 integration |
| `ethers` | Ethereum library for contract interactions |
| `@pinia/nuxt` | State management for Nuxt |

## Optional Wallet Modules

```bash
npm install @web3-onboard/trezor @web3-onboard/coinbase @web3-onboard/ledger
```

| Package | Purpose |
|---------|---------|
| `@web3-onboard/trezor` | Trezor hardware wallet support |
| `@web3-onboard/coinbase` | Coinbase Wallet integration |
| `@web3-onboard/ledger` | Ledger hardware wallet support |

## Environment Setup

Create `.env` file:

```env
# Required - Get from https://cloud.walletconnect.com
NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional - For better RPC reliability
NUXT_PUBLIC_INFURA_KEY=your_infura_key
NUXT_PUBLIC_ALCHEMY_KEY=your_alchemy_key

# Optional - Required for Trezor wallet
NUXT_PUBLIC_TREZOR_EMAIL=your_support_email
```

## TypeScript Types

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@web3-onboard/core", "ethers"]
  }
}
```