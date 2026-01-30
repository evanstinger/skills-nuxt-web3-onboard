/**
 * DApp metadata for Web3-Onboard
 * 
 * TODO: Update these values for your application
 * - name: Your app name
 * - description: Short description of your app
 * - icon/logo: Paths to your app icons (place in public/ directory)
 * - recommendedInjectedWallets: Suggest wallets to users
 */
export const DAPP_METADATA = {
  name: 'My Nuxt DApp',
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  icon: '/icon.png',
  logo: '/logo.png',
  description: 'Web3-enabled Nuxt application',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Rabby', url: 'https://rabby.io' },
  ],
}