# Dos and Don'ts

## ✅ Dos

### Client-Side Only
- Use `.client.ts` plugin suffix for Web3Onboard initialization
- Wrap wallet-dependent components in `<ClientOnly>`
- Use `import.meta.client` checks for browser APIs

### State Management
- Use Pinia composables for wallet state
- Persist connection preferences in localStorage
- Implement reactive getters for derived state
- Use `shallowRef` for Web3Onboard instances (prevents deep reactivity)

### Error Handling
- Validate wallet connection before contract calls
- Check chain ID matches contract requirements
- Implement try/catch with user-friendly messages
- Decode contract errors using `Interface.parseError`

### Contract Interactions
- Separate read and write contract instances
- Use static calls for pre-flight validation
- Parse and format units properly with `formatUnits`/`parseUnits`
- Implement race condition handling with fetch IDs

### Auto-Connection
- Implement wallet label persistence
- Auto-connect on page load with `disableModals: true`
- Handle connection failures gracefully
- Use `alreadyConnectedWallets` state for reconnection

### RPC Fallbacks
- Use public RPC providers when wallet not connected
- Implement multiple RPC endpoints for redundancy
- Cache working providers to avoid re-initialization
- Test RPC connections before using them

## ❌ Don'ts

### Server-Side Code
- Don't initialize Web3Onboard on server
- Don't use `window` or `document` outside client checks
- Don't store provider instances in SSR context

### State Pitfalls
- Don't use `localStorage` without `import.meta.client` check
- Don't mutate state directly in components
- Don't forget to handle wallet disconnection
- Don't use `ref` instead of `shallowRef` for large objects

### Contract Calls
- Don't mix provider types (use `BrowserProvider` consistently)
- Don't skip chain validation before transactions
- Don't ignore gas estimation failures
- Don't forget to handle revert data extraction

### Memory Leaks
- Don't create multiple contract instances unnecessarily
- Don't store raw provider instances long-term
- Don't forget to handle race conditions in async operations

### Type Safety
- Don't skip TypeScript types for contract interactions
- Don't use `any` for contract data
- Don't forget to import proper types from ethers.js
- Don't ignore BigInt vs number distinctions