# Caching Strategy - Optimized for 5 Concurrent Users

## Overview

This document outlines the caching strategy optimized for a low-concurrency environment with at most 5 concurrent users. This allows for aggressive caching to minimize database load and API calls.

## Server-Side Caching (Edge/CDN)

### API Endpoints

| Endpoint | Cache Duration | Stale-While-Revalidate | Rationale |
|----------|---------------|------------------------|-----------|
| `/api/trades` | 3s | 10s | High-frequency updates, minimal cache |
| `/api/orderbook` | 5s | 15s | Pool data changes less frequently |
| `/api/strategies` | 30s | 60s | Configurations rarely change |
| `/api/binance/price` | 10s | 30s | Reference prices, moderate cache |
| `/api/1inch/candles` | 15-30s | 60s | Historical data, longer cache |
| `/api/debank/*` | 5min | 10min | External API, expensive calls |

### Cache Headers Explained

```typescript
// Example for trades endpoint
headers: {
  'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10'
}
```

- `public`: Response can be cached by CDN/proxy
- `s-maxage=3`: Cache on server/CDN for 3 seconds
- `stale-while-revalidate=10`: Serve stale content while revalidating for up to 10 seconds

## Client-Side Caching (React Query)

### Configuration by Data Type

#### Real-time Data (Trades, Pools)
```typescript
{
  staleTime: 3000,        // Data fresh for 3 seconds
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  refetchInterval: 5000,  // Refetch every 5 seconds
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false
}
```

#### Semi-Static Data (Strategies, Configurations)
```typescript
{
  staleTime: 30000,       // Data fresh for 30 seconds
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  refetchInterval: 60000, // Refetch every minute
  refetchOnWindowFocus: false,
  refetchOnMount: false
}
```

#### External API Data (Debank, Binance)
```typescript
{
  staleTime: 60000,       // Data fresh for 1 minute
  gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  refetchInterval: 300000, // Refetch every 5 minutes
  refetchOnWindowFocus: false
}
```

## Benefits of This Strategy

### 1. Reduced Database Load
- With only 5 users, aggressive caching significantly reduces database queries
- 3-30 second server cache prevents redundant database hits
- 30-minute client cache eliminates unnecessary refetches

### 2. Improved Performance
- Most requests served from cache (CDN or browser)
- Faster response times for users
- Reduced network traffic

### 3. Cost Optimization
- Fewer API calls to external services (Binance, Debank, 1inch)
- Lower database connection pool requirements
- Reduced server processing

## Implementation Details

### Server-Side Implementation
```typescript
// trades/route.ts
return createApiSuccess({ trades }, {
  headers: {
    'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10',
  }
})
```

### Client-Side Implementation
```typescript
// useTradesData.ts
useQuery({
  queryKey: [ReactQueryKeys.TRADES, configurationId],
  queryFn: fetchTrades,
  staleTime: 3000,
  gcTime: 30 * 60 * 1000,
  refetchInterval: 5000,
})
```

## Cache Invalidation Strategy

With only 5 users, we can use simple time-based invalidation:

1. **Time-based**: All caches expire automatically based on configured durations
2. **No manual invalidation**: Not needed for 5 users
3. **Stale-while-revalidate**: Ensures users always see data, even if slightly stale

## Monitoring

### Key Metrics
- Cache hit rate (target: >80%)
- Average response time (target: <100ms for cached)
- Database query rate (should be minimal)

### Debug Headers
```typescript
// Add to responses for debugging
headers: {
  'X-Cache': 'HIT/MISS',
  'X-Cache-Age': '10',
  'X-Cache-TTL': '30'
}
```

## Migration Path

If user count grows beyond 5:

1. **10-50 users**: Reduce cache durations by 50%
2. **50-100 users**: Implement cache tags and selective invalidation
3. **100+ users**: Consider Redis cache layer and WebSocket for real-time data

## Configuration Summary

| Data Type | Server Cache | Client Stale | Client GC | Refetch |
|-----------|-------------|--------------|-----------|---------|
| Trades | 3s | 3s | 30min | 5s |
| Pools | 5s | 5s | 30min | 5-12s |
| Strategies | 30s | 30s | 30min | 60s |
| Prices | 10s | 10s | 30min | 10s |
| Portfolio | 5min | 5min | 1hr | 5min |

## Notes

- All background refetching is disabled to save resources
- Window focus refetching is disabled to prevent unnecessary updates
- Cache durations are optimized for 5 concurrent users
- If latency becomes an issue, increase cache durations further

Last Updated: December 2024