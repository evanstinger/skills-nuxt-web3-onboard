# Examples

## Simple ERC20 Contract Composable
```typescript
// composables/useERC20.ts
import { useContract } from '~/composables/useContract'
import { formatUnits, parseUnits } from 'ethers'

export const useERC20 = (address: string, chainId: number) => {
  const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)'
  ]

  const contract = useContract({
    address,
    abi: ERC20_ABI,
    chainId
  })

  const balance = ref('0')
  const decimals = ref(18)
  const symbol = ref('')
  const name = ref('')

  async function fetchBalance(userAddress: string) {
    try {
      const result = await contract.read('balanceOf', [userAddress])
      balance.value = formatUnits(result, decimals.value)
    } catch (e) {
      console.error('Failed to fetch balance:', e)
    }
  }

  async function fetchTokenInfo() {
    try {
      const [decimalsRes, symbolRes, nameRes] = await Promise.all([
        contract.read('decimals'),
        contract.read('symbol'),
        contract.read('name')
      ])
      decimals.value = Number(decimalsRes)
      symbol.value = symbolRes
      name.value = nameRes
    } catch (e) {
      console.error('Failed to fetch token info:', e)
    }
  }

  async function transfer(to: string, amount: string) {
    return contract.write('transfer', [to, parseUnits(amount, decimals.value)])
  }

  async function approve(spender: string, amount: string) {
    return contract.write('approve', [spender, parseUnits(amount, decimals.value)])
  }

  return {
    balance: readonly(balance),
    decimals: readonly(decimals),
    symbol: readonly(symbol),
    name: readonly(name),
    loading: contract.loading,
    submitting: contract.submitting,
    fetchBalance,
    fetchTokenInfo,
    transfer,
    approve
  }
}
```

## Advanced Staking Contract Composable (with preflight validation)
```typescript
// composables/useStakingContract.ts
import { Contract, ZeroAddress, parseUnits, formatUnits } from 'ethers';
import type { ContractTransactionResponse } from 'ethers';
import { useContract } from '~/composables/useContract';
import { useWeb3Store } from '~/stores/web3';

export const useStakingContract = (config: { address: string, chainId: number }) => {
  const web3Store = useWeb3Store();
  
  const STAKING_ABI = [
    'function createStake(uint256 amount, uint256 epochLength) external',
    'function increaseStake(uint256 amount) external',
    'function unstake() external',
    'function claim() external',
    'function claimUpTo(uint256 toEpoch) external',
    'function getDashboard(address user) view returns (tuple)',
    'function previewUnstakeWithPenalty(address user) view returns (uint256, uint256)'
  ];

  const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)'
  ];

  const contract = useContract({
    address: config.address,
    abi: STAKING_ABI,
    chainId: config.chainId
  });

  const data = ref<any>(undefined);
  const loading = ref(false);
  const submitting = ref(false);
  let latestFetchId = 0;

  // Preflight validation before creating stake
  async function preflightCreateStake(amountWei: bigint, epochLen: number) {
    if (!web3Store.address) throw new Error('Wallet not connected');
    
    // Fetch dashboard data
    await getDashboard(web3Store.address);
    const d = data.value;
    if (!d) throw new Error('Dashboard unavailable');
    if (d.retired) throw new Error('Program is retired');
    if (!d.started) throw new Error('Program not started');
    
    // Validate epoch length
    const minLen = Number(d.minEpochLength ?? 1n);
    const maxLen = Number(d.maxEpochLength ?? 0n);
    if (epochLen < minLen || epochLen > maxLen) throw new Error('Invalid epoch length');
    if (d.hasStake) throw new Error('You already have a stake');
    
    // Check token balance
    const tokenContract = await contract.getReadContract();
    const token = new Contract(
      'TOKEN_ADDRESS_HERE', 
      ERC20_ABI, 
      (await contract.getReadContract()).provider
    );
    const bal = await token.balanceOf(web3Store.address);
    if (typeof bal === 'bigint' && bal < amountWei) {
      throw new Error('Insufficient token balance');
    }
  }

  // Fetch dashboard with race condition handling
  async function getDashboard(userAddress?: string | null) {
    const fetchId = ++latestFetchId;
    loading.value = true;
    try {
      const contract = await contract.getReadContract();
      // Use ZeroAddress if no user address to get clean global state
      const target = userAddress || ZeroAddress;
      
      const resRaw = await contract.getDashboard!(target);
      
      // Race condition check: discard if newer request started
      if (fetchId !== latestFetchId) return;

      // Normalize raw data using helper functions
      const normalized = {
        currentEpoch: contract.asBigInt(resRaw?.currentEpoch ?? resRaw[0]),
        rewardPool: contract.asBigInt(resRaw?.rewardPool ?? resRaw[5]),
        totalStaked: contract.asBigInt(resRaw?.totalStaked ?? resRaw[21]),
        hasStake: contract.asBoolean(resRaw?.hasStake ?? resRaw[26]),
        stakeAmount: contract.asBigInt(resRaw?.stakeAmount ?? resRaw[27]),
        stakeEpochLength: contract.asNumber(resRaw?.stakeEpochLength ?? resRaw[28]),
        minEpochLength: contract.asBigInt(resRaw?.minEpochLength ?? resRaw[16]),
        maxEpochLength: contract.asBigInt(resRaw?.maxEpochLength ?? resRaw[17]),
        retired: contract.asBoolean(resRaw?.retired ?? resRaw[3]),
        started: contract.asBoolean(resRaw?.started ?? resRaw[4]),
      };
      
      // Double check before assignment
      if (fetchId !== latestFetchId) return;

      data.value = normalized;
    } catch (e) {
      if (fetchId === latestFetchId) {
        console.error('Failed to fetch dashboard:', e);
      }
    } finally {
      if (fetchId === latestFetchId) {
        loading.value = false;
      }
    }
  }

  // Preview unstake with penalty
  async function previewUnstakeWithPenaltyValues() {
    if (!web3Store.address) return null;
    try {
      const contractRead = await contract.getReadContract();
      const res = await contractRead.previewUnstakeWithPenalty!(web3Store.address);
      return {
        penaltyAmount: contract.asBigInt(res[0]),
        netReceivedAmount: contract.asBigInt(res[1])
      };
    } catch (e) {
      console.error('Failed to preview unstake penalty:', e);
      return null;
    }
  }

  async function createStake(amount: bigint, epochLength: number) {
    await preflightCreateStake(amount, epochLength);
    return contract.write('createStake', [amount, epochLength]);
  }

  async function increaseStake(amount: bigint) {
    return contract.write('increaseStake', [amount]);
  }

  async function unstake() {
    return contract.write('unstake', []);
  }

  async function claim() {
    try {
      return await contract.write('claim', []);
    } catch (e: unknown) {
      const err = e as Error;
      // Handle "Too Many Epochs" error by using claimUpTo
      if (err.message?.includes('TooManyEpochs') && data.value?.lastClaimedEpoch !== undefined) {
        const toEpoch = data.value.lastClaimedEpoch + 249n;
        return contract.write('claimUpTo', [toEpoch]);
      }
      throw e;
    }
  }

  return {
    data,
    loading,
    submitting,
    getDashboard,
    preflightCreateStake,
    createStake,
    increaseStake,
    unstake,
    previewUnstakeWithPenaltyValues,
    claim,
    config
  };
};
```

## Usage in Component
```vue
<template>
  <div>
    <ConnectButton />
    
    <div v-if="web3Store.isConnected">
      <p>Connected: {{ web3Store.address }}</p>
      <p>Chain: {{ web3Store.chainId }}</p>
      
      <div v-if="staking">
        <p>Total Staked: {{ formatUnits(staking.data?.totalStaked || 0n, 18) }}</p>
        <p>Your Stake: {{ formatUnits(staking.data?.stakeAmount || 0n, 18) }}</p>
        
        <button 
          :disabled="staking.submitting"
          @click="handleCreateStake"
        >
          {{ staking.submitting ? 'Processing...' : 'Create Stake' }}
        </button>
        
        <button 
          :disabled="staking.submitting"
          @click="handleClaim"
        >
          {{ staking.submitting ? 'Processing...' : 'Claim Rewards' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWeb3Store } from '~/stores/web3'
import { useStakingContract } from '~/composables/useStakingContract'
import { parseUnits, formatUnits } from 'ethers'

const web3Store = useWeb3Store()
const staking = ref(null)

watchEffect(() => {
  if (web3Store.isConnected && web3Store.chainId) {
    staking.value = useStakingContract({
      address: '0xYourStakingContractAddress',
      chainId: web3Store.chainId
    })
    staking.value.getDashboard(web3Store.address)
  }
})

async function handleCreateStake() {
  try {
    const amount = parseUnits('1.0', 18)
    const epochLength = 30 // days
    const tx = await staking.value.createStake(amount, epochLength)
    await tx.wait()
    await staking.value.getDashboard(web3Store.address)
  } catch (e) {
    console.error('Create stake failed:', e)
  }
}

async function handleClaim() {
  try {
    const tx = await staking.value.claim()
    await tx.wait()
    await staking.value.getDashboard(web3Store.address)
  } catch (e) {
    console.error('Claim failed:', e)
  }
}

function formatUnits(value: bigint | number, decimals: number) {
  return typeof value === 'bigint' 
    ? parseFloat(formatUnits(value, decimals)).toFixed(2)
    : value.toString()
}
</script>
```

## Type-Safe Contract Calls
```typescript
// Use TypeScript interfaces for contract data
interface StakingDashboard {
  currentEpoch: bigint
  rewardPool: bigint
  totalStaked: bigint
  hasStake: boolean
  stakeAmount: bigint
  // ... other fields
}

const contract = useContract<StakingDashboard>({
  address: '0x...',
  abi: STAKING_ABI,
  chainId: 56
})

// Now data.value will be typed correctly
const data = ref<StakingDashboard | undefined>(undefined)
```