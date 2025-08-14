# Data Fetching Flow & Synchronization Guide

## Overview

This document outlines the data fetching architecture, synchronization requirements, and best practices for the Tycho TAP-5 frontend application.

## Data Sources & Refresh Intervals

### 1. Trade Data
- **Source**: PostgreSQL via Prisma
- **Endpoint**: `/api/trades`
- **Hook**: `useTradesData(refreshInterval, strategyId, limit)`
- **Current Refresh**: 5 seconds
- **Components Using**: 
  - StrategyTradesList
  - InventoryChart
  - TradesList
- **Synchronization**: Must sync with "Your Funds" section

### 2. Price Data

#### 2.1 Binance Prices
- **Live Price**: `/api/binance/price` (for SpreadChart)
- **Historical Klines**: `/api/binance/klines` (for CandlestickChart)
- **Cache**: 5 seconds server-side
- **Usage**: Reference price for spread calculations

#### 2.2 1inch Candles
- **Endpoint**: `/api/1inch/candles`
- **Cache**: 15-30 seconds (varies by timeframe)
- **Usage**: Historical price charts

#### 2.3 Pool Prices (Orderbook API)
- **Endpoint**: `/api/orderbook`
- **Refresh**: 
  - Ethereum: 12 seconds (1 block)
  - Unichain/Base: 5 seconds
- **Usage**: Real-time pool state monitoring

### 3. Portfolio Data (Debank)
- **Token List**: `/api/debank/token-list`
- **Net Worth**: `/api/debank/net-worth`
- **Refresh**: 5 seconds (synced with trades)
- **Cache**: 5 minutes server-side
- **Usage**: "Your Funds" section, AUM tracking

### 4. Strategy Configuration
- **Endpoint**: `/api/strategies`
- **Refresh**: 45 seconds
- **Usage**: Strategy list, configuration display

## Component Data Requirements

### SpreadChart
**Requirements**: Real-time price accumulation
```typescript
// Should accumulate data points as they arrive:
- Binance price: Every refresh (5s)
- Pool prices: Every chain-specific interval (5-12s)
- Display: Last 5 minutes rolling window
- Update: Immediate on new data
```

### InventoryChart
**Requirements**: Trade-based snapshots
```typescript
// Updates only on new trades:
- Data source: Trade inventory field
- Display: Last 6 hours by default
- Update: On new trade arrival
- Visualization: Step changes (straight lines)
```

### CandlestickChart
**Requirements**: Historical OHLC data
```typescript
// Historical data with reference price:
- Primary: 1inch candles API
- Reference: Binance klines (same timeframe)
- Update: Based on selected interval
- Display: Candlesticks with spread zones
```

### Your Funds Section
**Requirements**: Current balances
```typescript
// Must sync with trades:
- Refresh: 5 seconds (matches trades)
- Data: Debank token list API
- Display: Current token balances
- Relationship: Shows current state of inventory chart
```

## Synchronization Rules

### Rule 1: Related Data Must Refresh Together
- Trades + Your Funds: Same 5s interval
- Pools + Spread calculations: Chain-specific timing
- Price sources: Coordinate for same timestamp

### Rule 2: Respect Chain Block Times
```typescript
const REFRESH_INTERVALS = {
  1: 12000,    // Ethereum: 12s blocks
  130: 5000,   // Unichain: Faster finality
  8453: 5000,  // Base: Faster finality
}
```

### Rule 3: Cache Coordination
- Server cache TTL should be slightly less than client refresh
- Related data should share cache tags
- Invalidate together when dependencies change

### Rule 4: Progressive Data Loading
1. Show cached/stale data immediately
2. Update with fresh data when available
3. Indicate loading/refresh state to user
4. Handle errors gracefully with fallbacks

## Implementation Best Practices

### 1. Use Shared React Query Keys
```typescript
// Good: Consistent key structure
[ReactQueryKeys.TRADES, strategyId, limit]
[ReactQueryKeys.PRICES, chainId, tokenPair]

// Bad: Inconsistent keys
['trades', id]
['trade-data', strategyId]
```

### 2. Coordinate Refresh Timers
```typescript
// Use a central refresh coordinator
const SYNC_GROUPS = {
  REAL_TIME: ['trades', 'funds', 'active_pools'],
  NEAR_REAL_TIME: ['pools', 'prices'],
  SLOW: ['strategies', 'config']
}
```

### 3. Handle Stale Data Appropriately
```typescript
// Indicate data freshness
interface DataWithFreshness<T> {
  data: T
  lastUpdated: number
  isStale: boolean
  nextRefresh: number
}
```

### 4. Optimize for Performance
- Batch related API calls
- Use request deduplication
- Implement smart caching strategies
- Consider WebSocket for truly real-time needs

## Future Improvements

### Phase 1: Immediate Fixes
- [ ] Fix SpreadChart data accumulation
- [ ] Align pool refresh with block times
- [ ] Add refresh countdown indicators

### Phase 2: Enhanced Synchronization
- [ ] Implement WebSocket for trades
- [ ] Add coordinated cache invalidation
- [ ] Create data sync orchestrator

### Phase 3: Advanced Features
- [ ] Predictive pre-fetching
- [ ] Offline support with sync
- [ ] User-configurable refresh rates
- [ ] Real-time collaboration features

## Monitoring & Debugging

### Key Metrics to Track
1. API response times
2. Cache hit rates
3. Data staleness duration
4. Refresh cycle consistency
5. Error rates by endpoint

### Debug Tools
```typescript
// Enable debug logging
localStorage.setItem('DEBUG_DATA_FLOW', 'true')

// Monitor refresh cycles
window.__REFRESH_STATS__ = {
  trades: { count: 0, lastRefresh: null },
  pools: { count: 0, lastRefresh: null },
  prices: { count: 0, lastRefresh: null }
}
```

## Conclusion

Proper data synchronization is critical for a trading dashboard. This architecture ensures:
- Consistent data across related components
- Optimal performance through smart caching
- Clear mental model for developers
- Scalable patterns for future features

Last Updated: December 2024