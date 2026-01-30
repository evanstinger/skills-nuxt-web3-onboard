import { defineStore } from 'pinia'
import type { InitOptions, OnboardAPI, AppState, WalletState, ConnectOptions } from '@web3-onboard/core'
import Onboard from '@web3-onboard/core'
import type { ChainId } from '~/types'

export const useWeb3Store = defineStore('Web3', () => {
  const onboard = shallowRef<OnboardAPI | null>(null)
  const onboardState = shallowRef<AppState | null>(null)
  const isConnecting = ref(false)
  const alreadyConnectedWallets = ref<string[]>([])

  // Initialize storage for persistence
  if (import.meta.client) {
    const stored = localStorage.getItem('alreadyConnectedWallets')
    if (stored) {
      try {
        alreadyConnectedWallets.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse alreadyConnectedWallets', e)
      }
    }
  }

  // Getters
  const wallets = computed(() => onboardState.value?.wallets ?? [])
  const connectedWallet = computed<WalletState | null>(() => wallets.value[0] ?? null)

  const connectedChain = computed(() => connectedWallet.value?.chains[0] ?? null)
  const chainId = computed(() => connectedChain.value ? Number(connectedChain.value.id) as ChainId : null)
  
  const address = computed(() => connectedWallet.value?.accounts[0]?.address ?? null)
  
  const isConnected = computed(() => !!connectedWallet.value)

  // Actions
  const updateAlreadyConnectedWallets = () => {
    if (!onboardState.value) return
    const labels = onboardState.value.wallets.map((w) => w.label)
    alreadyConnectedWallets.value = labels
    if (import.meta.client) {
      localStorage.setItem('alreadyConnectedWallets', JSON.stringify(labels))
    }
  }

  const init = (options: InitOptions) => {
    if (onboard.value) {
      console.warn('Web3Onboard already initialized')
      return onboard.value
    }
    
    const instance = Onboard(options)
    onboard.value = instance
    onboardState.value = instance.state.get()
    
    // Subscribe to state updates
    // We don't need to store the subscription to unsubscribe because this store lives as long as the app
    instance.state.select().subscribe((update) => {
      onboardState.value = update
      updateAlreadyConnectedWallets()
    })
    
    return instance
  }

  const connectWallet = async (options?: ConnectOptions) => {
    if (!onboard.value) throw new Error('Onboard not initialized')
    isConnecting.value = true
    try {
      const wallets = await onboard.value.connectWallet(options)
      return wallets
    } catch (e) {
      console.error('Failed to connect wallet:', e)
      throw e
    } finally {
      isConnecting.value = false
    }
  }

  const disconnectWallet = async (wallet?: WalletState) => {
    if (!onboard.value) throw new Error('Onboard not initialized')
    const w = wallet || connectedWallet.value
    if (w) {
      await onboard.value.disconnectWallet({ label: w.label })
      updateAlreadyConnectedWallets()
    }
  }

  const openAccountCenter = async () => {
    if (!onboard.value) throw new Error('Onboard not initialized')

    if (import.meta.client) {
      // Wait for any pending state updates or renders
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const onboardEl = document.querySelector('onboard-v2')
      if (!onboardEl || !onboardEl.shadowRoot) {
         return
      }
      
      const root = onboardEl.shadowRoot
      
      // Check if already expanded to avoid closing it
      const expandedContainer = root.querySelector('.maximized-ac-container')
      if (expandedContainer) {
        return
      }

      const triggers = root.querySelectorAll('.ac-trigger')
      triggers.forEach((trigger) => {
         if (trigger instanceof HTMLElement) {
           // Dispatch a bubbling click event which Svelte listeners should catch
           const clickEvent = new MouseEvent('click', {
             view: window,
             bubbles: true,
             cancelable: true
           });
           trigger.dispatchEvent(clickEvent);
         }
      })
    }
  }

  const setChain = async (chainIdHex: string) => {
     if (!onboard.value) throw new Error('Onboard not initialized')
     await onboard.value.setChain({ chainId: chainIdHex })
  }

  return {
    onboard,
    onboardState,
    wallets,
    connectedWallet,
    connectedChain,
    chainId,
    address,
    isConnected,
    isConnecting,
    alreadyConnectedWallets,
    init,
    connectWallet,
    disconnectWallet,
    setChain,
    openAccountCenter
  }
})
