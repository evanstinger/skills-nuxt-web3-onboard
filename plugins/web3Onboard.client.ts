/**
 * Web3-Onboard Plugin for Nuxt 4
 * 
 * This plugin initializes Web3-Onboard on the client side only.
 * It handles wallet connection, auto-reconnect, and state management.
 * 
 * Required environment variables:
 * - NUXT_PUBLIC_WALLETCONNECT_PROJECT_ID: Get from https://cloud.walletconnect.com
 * 
 * Optional environment variables:
 * - NUXT_PUBLIC_TREZOR_EMAIL: Required if using Trezor wallet
 */

import injectedModule from '@web3-onboard/injected-wallets'
import metamaskModule from '@web3-onboard/metamask'
import trezorModule from '@web3-onboard/trezor'
import walletconnectModule from '@web3-onboard/walletconnect'

import type { Pinia } from 'pinia'

import { CHAINS, DAPP_METADATA } from '~/config'
import { useWeb3Store } from '~/stores/web3'

export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const web3Store = useWeb3Store(nuxtApp.$pinia as Pinia)
  
  const config = useRuntimeConfig()

  const injectedWallets = injectedModule()
  const metamask = metamaskModule({ 
    options: { 
      extensionOnly: false, 
      dappMetadata: DAPP_METADATA 
    } 
  })
  
  const trezor = trezorModule({ 
    email: config.public.trezorEmail as string || 'support@example.com', 
    appUrl: DAPP_METADATA.url 
  })
  
  const walletconnect = walletconnectModule({
    projectId: config.public.walletConnectProjectId as string || '',
    requiredChains: [1, 56],
    optionalChains: [97, 8453],
    dappUrl: DAPP_METADATA.url,
  })

  web3Store.init({
    appMetadata: {
      name: DAPP_METADATA.name,
      icon: DAPP_METADATA.icon,
      logo: DAPP_METADATA.logo,
      description: DAPP_METADATA.description,
    },
    wallets: [
      injectedWallets, 
      metamask, 
      trezor, 
      walletconnect
    ],
    chains: CHAINS,
    theme: 'dark',
    connect: {
      autoConnectLastWallet: true
    }
  })

  // Auto-connect to previously connected wallets
  if (web3Store.alreadyConnectedWallets.length > 0) {
    const label = web3Store.alreadyConnectedWallets[0]
    if (label) {
      web3Store.connectWallet({
        autoSelect: { label, disableModals: true }
      }).catch((e) => {
        console.debug('Failed to auto-connect wallet', e)
      })
    }
  }
})
