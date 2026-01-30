<script lang="ts" setup>
import { useWeb3Store } from '~/stores/web3'
import { shortenAddress } from '~/utils/string'

const web3Store = useWeb3Store()

const handleClick = (e: MouseEvent) => {
  e.stopPropagation()
  if (web3Store.isConnected) {
    web3Store.openAccountCenter()
  } else {
    web3Store.connectWallet()
  }
}
</script>

<template>
  <ClientOnly>
    <button
      :disabled="web3Store.isConnecting"
      :class="[
        'web3-connect-button',
        web3Store.isConnected ? 'connected' : 'disconnected',
      ]"
      @click="handleClick"
    >
      <span v-if="web3Store.isConnecting">Connecting...</span>
      <span v-else-if="web3Store.isConnected && web3Store.address">
        {{ shortenAddress(web3Store.address) }}
      </span>
      <span v-else>
        Connect Wallet
      </span>
    </button>
  </ClientOnly>
</template>

<style scoped>
.web3-connect-button {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.web3-connect-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.web3-connect-button.disconnected {
  background-color: #3b82f6;
  color: white;
}

.web3-connect-button.disconnected:hover {
  background-color: #2563eb;
}

.web3-connect-button.connected {
  background-color: #f3f4f6;
  color: #374151;
}

.web3-connect-button.connected:hover {
  background-color: #e5e7eb;
}
</style>
