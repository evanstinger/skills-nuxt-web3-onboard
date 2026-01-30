# Common Issues & Solutions

## Wallet Not Auto-Connecting
**Problem**: Wallet doesn't reconnect on page refresh
**Solution**: Check localStorage persistence and disable modals in auto-connect options. Verify `alreadyConnectedWallets` state is properly managed.

## Wrong Chain Error
**Problem**: Contract calls fail with wrong network
**Solution**: Add chain switching logic before contract interactions using `web3Store.setChain()` or prompt user to switch.

## Provider Undefined
**Problem**: `connectedWallet.provider` is undefined
**Solution**: Ensure Web3Onboard is fully initialized before accessing provider. Check for race conditions in plugin initialization.

## SSR Hydration Mismatches
**Problem**: Server-rendered content differs from client
**Solution**: Wrap wallet-dependent UI in `<ClientOnly>` components. Ensure no wallet state is accessed during SSR.

## Memory Leaks
**Problem**: Multiple contract instances created
**Solution**: Use composables with proper cleanup and avoid manual provider storage. Reuse contract instances within composables.

## Type Errors
**Problem**: TypeScript errors for Web3Onboard types
**Solution**: Install `@types/web3-onboard/core` and update tsconfig. Ensure proper type imports from `@web3-onboard/core`.

## Gas Estimation Fails
**Problem**: Static calls revert during validation
**Solution**: Handle revert reasons and provide user-friendly error messages. Use `Interface.parseError` to decode error data.

## RPC Provider Failures
**Problem**: All RPC endpoints fail
**Solution**: Implement fallback logic with multiple endpoints. Use `getRpcProvider` utility which tries each endpoint sequentially.

## Race Conditions
**Problem**: Stale data overwrites fresh data
**Solution**: Implement fetch ID pattern to discard results from outdated requests. See `useContract` for example implementation.

## Contract Reverts
**Problem**: Transaction fails with unclear error message
**Solution**: Extract revert data using `extractRevertData` helper and decode with `Interface.parseError`. Display user-friendly messages.

## Decimal Precision
**Problem**: Token amounts displayed incorrectly
**Solution**: Always use `formatUnits` and `parseUnits` from ethers. Respect token decimals (not always 18).