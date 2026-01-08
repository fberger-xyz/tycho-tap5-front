# Store-Integrated Hooks Usage Guide

## Overview

The store-integrated hooks combine React Query's data fetching capabilities with Zustand's efficient state management. This provides:

- **Efficient data access**: No prop drilling, direct access to filtered data
- **Built-in caching**: Data persists across component unmounts
- **Optimized re-renders**: Components only re-render when their specific data changes
- **Rich data operations**: Filtering, aggregations, and calculations built-in
- **Type safety**: Full TypeScript support throughout

## Quick Start

### 1. Basic Usage - Strategies

```tsx
import { useStrategiesWithStore } from '@/stores'

function StrategiesOverview() {
    const { 
        strategies, 
        isLoading, 
        getActiveStrategies,
        getStrategiesByChain 
    } = useStrategiesWithStore()
    
    if (isLoading) return <div>Loading...</div>
    
    const activeStrategies = getActiveStrategies()
    const ethereumStrategies = getStrategiesByChain(1) // chainId = 1
    
    return (
        <div>
            <h2>Active Strategies: {activeStrategies.length}</h2>
            <h3>Ethereum: {ethereumStrategies.length}</h3>
        </div>
    )
}
```

### 2. Instance-Specific Data - Trades

```tsx
import { useTradesWithStore } from '@/stores'

function InstanceTrades({ instanceId }: { instanceId: string }) {
    const { 
        trades, 
        getTotalVolume, 
        getSuccessRate,
        isRefetching 
    } = useTradesWithStore({ instanceId, limit: 50 })
    
    const volume = getTotalVolume?.()
    const successRate = getSuccessRate?.()
    
    return (
        <div>
            <h3>Recent Trades {isRefetching && '(updating...)'}</h3>
            <div>Success Rate: {successRate?.toFixed(2)}%</div>
            <div>Volume In: ${volume?.tokenIn.toFixed(2)}</div>
            <div>Volume Out: ${volume?.tokenOut.toFixed(2)}</div>
            
            {trades.map(trade => (
                <TradeCard key={trade.id} trade={trade} />
            ))}
        </div>
    )
}
```

### 3. Price Analysis

```tsx
import { usePricesWithStore } from '@/stores'

function PriceChart({ instanceId }: { instanceId: string }) {
    const { 
        prices, 
        latestPrice, 
        priceChange24h,
        movingAverage,
        volatility 
    } = usePricesWithStore(instanceId)
    
    const ma20 = movingAverage?.(20)
    const vol = volatility?.(20)
    
    return (
        <div>
            <h3>Current Price: ${latestPrice?.price.toFixed(4)}</h3>
            <div>24h Change: {priceChange24h?.changePercent.toFixed(2)}%</div>
            <div>MA(20): ${ma20?.toFixed(4)}</div>
            <div>Volatility: {vol?.toFixed(4)}</div>
            
            <Chart data={prices} />
        </div>
    )
}
```

### 4. Cross-Instance Comparison

```tsx
import { usePriceComparison } from '@/stores'

function SpreadMonitor({ instanceIds }: { instanceIds: string[] }) {
    const { instances, spread, allLoaded } = usePriceComparison(instanceIds)
    
    if (!allLoaded) return <div>Loading price data...</div>
    
    return (
        <div>
            <h3>Price Spread: {spread?.percentage.toFixed(2)}%</h3>
            <div>Range: ${spread?.min.toFixed(4)} - ${spread?.max.toFixed(4)}</div>
            
            {instances.map(({ instanceId, latestPrice, priceChange24h }) => (
                <div key={instanceId}>
                    Instance {instanceId}: ${latestPrice?.price.toFixed(4)}
                    (24h: {priceChange24h?.changePercent.toFixed(2)}%)
                </div>
            ))}
        </div>
    )
}
```

### 5. Global Data Management

```tsx
// In your root layout or app component
import { useDataSync } from '@/stores'

function AppLayout({ children }: { children: React.ReactNode }) {
    const { stores, refreshAll } = useDataSync()
    
    // optional: show data sync status
    console.log('Store status:', stores)
    
    return (
        <div>
            <button onClick={refreshAll}>Refresh All Data</button>
            {children}
        </div>
    )
}
```

## Advanced Patterns

### Custom Filtering

```tsx
const { getTradesByFilters } = useTradesWithStore()

const largeTrades = getTradesByFilters({
    minAmount: 10000,
    status: 'success',
    chainId: 1
})
```

### Real-time Updates

```tsx
import { useTradeUpdates } from '@/stores'

function LiveTradesFeed({ instanceId }: { instanceId: string }) {
    const { trades, addTrade } = useTradeUpdates(instanceId)
    
    // connect to websocket
    useWebSocket({
        onMessage: (trade) => addTrade(trade)
    })
    
    return <TradesList trades={trades} />
}
```

### Performance Monitoring

```tsx
import { useStoreMetrics } from '@/stores'

function DebugPanel() {
    const metrics = useStoreMetrics()
    
    return (
        <pre>{JSON.stringify(metrics, null, 2)}</pre>
    )
}
```

## Benefits

1. **No Prop Drilling**: Access data directly where needed
2. **Automatic Deduplication**: Multiple components using same data share the cache
3. **Optimized Re-renders**: Only components using specific data re-render
4. **Rich Query Capabilities**: Built-in filtering, sorting, and aggregations
5. **Type Safety**: Full TypeScript support with autocompletion
6. **Performance**: Efficient Map-based storage with O(1) lookups
7. **DevTools**: Zustand DevTools integration for debugging

## Migration Guide

Replace direct React Query usage:

```tsx
// Before
const { data: strategies } = useStrategiesQuery()
const activeStrategies = strategies?.filter(s => 
    s.Instance.some(i => !i.endedAt)
)

// After
const { getActiveStrategies } = useStrategiesWithStore()
const activeStrategies = getActiveStrategies()
```

Replace manual filtering:

```tsx
// Before
const ethereumTrades = trades?.filter(t => 
    t.Configuration?.chainId === 1
)

// After
const { getTradesByFilters } = useTradesWithStore()
const ethereumTrades = getTradesByFilters({ chainId: 1 })
```