# Data Fetching Architecture Migration Guide

## Overview

This guide documents the migration from the old scattered data fetching pattern to the new centralized, composable architecture.

## Key Improvements

### 1. **Centralized Query Configuration** (`/src/lib/query-factory.ts`)
- Single source of truth for all query configurations
- Consistent retry logic, refetch intervals, and cache settings
- Named constants for intervals and timeouts
- Type-safe query key generation

### 2. **Unified API Client** (`/src/lib/api-client.ts`)
- Type-safe API methods
- Consistent error handling with `ApiError` class
- Automatic timeout and retry support
- Response validation

### 3. **Composable Data Hooks** (`/src/hooks/data/`)
- Single responsibility principle - each hook does one thing
- Cleaner separation of concerns
- Easier to test and maintain
- Better TypeScript inference

## Migration Steps

### Old Pattern → New Pattern

#### 1. Simple Data Fetching

**Before:**
```typescript
// useStrategies.ts - Mixed concerns, complex logic
export function useStrategies() {
    const [strategiesWithPrices, setStrategiesWithPrices] = useState<Strategy[]>([])
    const [pricesLoading, setPricesLoading] = useState(false)
    
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [ReactQueryKeys.STRATEGIES],
        queryFn: fetchConfigurationsWithInstances,
        retry: (failureCount, error) => { /* custom logic */ },
        refetchInterval: 45000,
        // ... many more options
    })
    
    // Complex price fetching logic in useEffect
    useEffect(() => { /* ... */ }, [configurations])
    
    return { /* ... */ }
}
```

**After:**
```typescript
// useStrategiesQuery.ts - Simple, focused
export function useStrategiesQuery() {
    return useQuery({
        ...queryFactory.strategies.all(),
        queryFn: () => apiClient.strategies.list(),
    })
}

// useStrategyWithPrices.ts - Composition for complex needs
export function useStrategyWithPrices() {
    const { data: configurations } = useStrategiesQuery()
    // Price fetching logic separated
}
```

#### 2. Replacing Existing Hooks

**useStrategies** → `useStrategyWithPrices` (for components needing prices) or `useStrategiesQuery` (for simple lists)

**useConfiguration** → `useStrategyQuery(id)`

**useTradesData** → `useTradesQuery({ configurationId })`

**usePricesData** → `usePricesQuery(instanceId)`

**usePoolsData** → `usePoolsQuery({ chain, token0, token1 })`

**useInventories** → `useBalancesQuery({ walletAddress, tokenAddresses, chainId })`

**useEthBalance** → `useNativeBalanceQuery({ walletAddress, chainId })`

### Component Migration Example

**Before:**
```tsx
import { useStrategies } from '@/hooks/fetchs/useStrategies'
import { useTradesData } from '@/hooks/fetchs/useTradesData'

function MyComponent() {
    const { strategies, isLoading } = useStrategies()
    const { trades } = useTradesData(5000) // magic number
    // ...
}
```

**After:**
```tsx
import { useStrategyWithPrices } from '@/hooks/data/useStrategyWithPrices'
import { useTradesQuery } from '@/hooks/data/useTradesQuery'

function MyComponent() {
    const { strategies, isLoading } = useStrategyWithPrices()
    const { data: trades } = useTradesQuery() // uses centralized config
    // ...
}
```

## Benefits

1. **Consistency**: All queries follow the same patterns
2. **Maintainability**: Changes to retry logic or intervals happen in one place
3. **Performance**: Better cache management and coordinated refetch intervals
4. **Type Safety**: Full TypeScript support with better inference
5. **Testing**: Easier to mock and test individual hooks
6. **Debugging**: Clearer data flow and error boundaries

## Gradual Migration

You don't need to migrate everything at once. The new hooks can coexist with the old ones:

1. Start with new features using the new pattern
2. Migrate existing components when you touch them
3. Keep old hooks working until fully migrated
4. Remove old hooks once no longer used

## Query Factory Intervals

- **CRITICAL**: 5s - Real-time data (trades)
- **ETHEREUM_BLOCKS**: 12s - Ethereum mainnet block time
- **FREQUENT**: 15s - Frequently changing data
- **STANDARD**: 30s - Standard data
- **SLOW**: 45s - Rarely changing data
- **MINUTE**: 60s - Slow-changing data

## Error Handling

The new `ApiError` class provides consistent error handling:

```typescript
import { isApiError, getErrorMessage } from '@/lib/api-client'

// In your component
if (error) {
    if (isApiError(error) && error.status === 404) {
        // Handle 404 specifically
    }
    const message = getErrorMessage(error)
    // Show toast or error boundary
}
```

## Next Steps

1. Review and test the new hooks in development
2. Update components incrementally
3. Monitor performance improvements
4. Remove old hooks once migration is complete