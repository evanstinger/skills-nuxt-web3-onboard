import { Contract, ZeroAddress, BrowserProvider, Interface, formatUnits } from 'ethers';
import type { ContractTransactionResponse } from 'ethers';
import { getRpcProvider } from '~/utils/rpc-provider';
import { useWeb3Store } from '~/stores/web3';

interface ContractConfig {
  address: string
  abi: any[]
  chainId: number
}

export const useContract = (config: ContractConfig) => {
  const web3Store = useWeb3Store();
  const loading = ref(false);
  const submitting = ref(false);
  let latestFetchId = 0;

  // Type conversion helpers
  type RawTuple = Record<number | string, unknown>;
  const asBigInt = (v: unknown, fallback: bigint = 0n): bigint => {
    if (typeof v === 'bigint') return v;
    if (typeof v === 'number') return BigInt(v);
    if (typeof v === 'string') {
      try { return BigInt(v); } catch { return fallback; }
    }
    return fallback;
  };
  const asBoolean = (v: unknown, fallback = false): boolean => {
    if (typeof v === 'boolean') return v;
    if (typeof v === 'bigint') return v !== 0n;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') return v === 'true' || v === '1';
    return fallback;
  };
  const asNumber = (v: unknown, fallback = 0): number => {
    if (typeof v === 'number') return v;
    if (typeof v === 'bigint') return Number(v);
    if (typeof v === 'string') return Number(v);
    return fallback;
  };
  const asString = (v: unknown, fallback = ''): string => {
    if (typeof v === 'string') return v;
    return fallback;
  };

  // Helper to extract revert data from errors
  function extractRevertData(err: unknown): string | undefined {
    const e = err as { data?: string; error?: { data?: string }; info?: { error?: { data?: string } } }
    return e?.data || e?.error?.data || e?.info?.error?.data
  }

  /**
   * Get a read-only contract instance.
   * Prefers connected wallet provider if available and on correct chain for "read-your-writes" consistency.
   * Fallbacks to public RPC provider.
   */
  async function getReadContract() {
    if (web3Store.isConnected && web3Store.chainId === config.chainId && web3Store.connectedWallet?.provider) {
      try {
        const provider = new BrowserProvider(web3Store.connectedWallet.provider);
        return new Contract(config.address, config.abi, provider);
      } catch (e) {
        console.warn('[useContract] Failed to use wallet provider, falling back to RPC', e);
      }
    }
    const provider = await getRpcProvider(config.chainId);
    return new Contract(config.address, config.abi, provider);
  }

  /**
   * Get a write-capable contract instance using the user's wallet
   * Throws if not connected or on wrong chain
   */
  async function getWriteContract() {
    if (!web3Store.isConnected || !web3Store.connectedWallet?.provider) {
      throw new Error('Wallet not connected');
    }
    if (web3Store.chainId !== config.chainId) {
      throw new Error(`Wrong network. Please switch to chain ${config.chainId}`);
    }
    
    // Get signer from the web3-onboard provider
    const ethersProvider = new BrowserProvider(web3Store.connectedWallet.provider);
    const signer = await ethersProvider.getSigner();
    return new Contract(config.address, config.abi, signer);
  }

  /**
   * Fetch data with race condition handling
   * If multiple fetches are called, only the latest result is used
   */
  async function fetchData<T>(fetcher: () => Promise<T>): Promise<T> {
    const fetchId = ++latestFetchId;
    loading.value = true;
    try {
      const result = await fetcher();
      
      // Race condition check: discard if newer request started
      if (fetchId !== latestFetchId) {
        throw new Error('Stale fetch result');
      }
      
      return result;
    } catch (e) {
      if (fetchId === latestFetchId) {
        throw e;
      }
      // Silently ignore stale fetch errors
      throw new Error('Stale fetch result');
    } finally {
      if (fetchId === latestFetchId) {
        loading.value = false;
      }
    }
  }

  // Read contract method with automatic fallback
  async function read(method: string, args: unknown[] = []) {
    return fetchData(async () => {
      const contract = await getReadContract();
      return await contract[method](...args);
    });
  }

  // Write contract method with preflight validation and error decoding
  async function write(method: string, args: unknown[] = []): Promise<ContractTransactionResponse> {
    submitting.value = true;
    try {
      const contract = await getWriteContract();

      // Preflight check: static call to validate transaction will succeed
      try {
        const fn = contract.getFunction(method);
        await fn.staticCall(...(args as []));
      } catch (preflightErr: unknown) {
        const iface = new Interface(config.abi);
        const data = extractRevertData(preflightErr);
        if (data) {
          try {
            const decoded = iface.parseError(data);
            const msg = decoded?.name === 'Error' ? String(decoded?.args?.[0]) : `${decoded?.name}`;
            throw new Error(msg);
          } catch {
            throw preflightErr;
          }
        } else {
          throw preflightErr;
        }
      }

      // Execute the transaction
      const fn = contract.getFunction(method);
      const tx = await fn(...(args as []));
      return tx;
    } catch (e: unknown) {
      // Decode error if possible
      const iface = new Interface(config.abi);
      const data = extractRevertData(e);
      if (data) {
        try {
          const decoded = iface.parseError(data);
          const msg = decoded?.name === 'Error' ? String(decoded?.args?.[0]) : `${decoded?.name}`;
          console.error(`[useContract] ${method} reverted: ${msg}`);
          throw new Error(msg);
        } catch {
          console.error(`[useContract] Write error (${method}):`, e);
          throw e;
        }
      } else {
        console.error(`[useContract] Write error (${method}):`, e);
        throw e;
      }
    } finally {
      submitting.value = false;
    }
  }

  return {
    loading: readonly(loading),
    submitting: readonly(submitting),
    read,
    write,
    getReadContract,
    getWriteContract,
    asBigInt,
    asBoolean,
    asNumber,
    asString,
  };
}
