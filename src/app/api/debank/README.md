# Debank API Integration

This API route integrates with Debank's Pro API to fetch user wallet data including net worth and historical net curve data.

## Endpoints

### GET `/api/debank/networth`

Fetches the current net worth and 24-hour net curve for a wallet address on a specific chain.

#### Parameters

- `walletAddress` (required): The user's wallet address
- `chainId` (required): The numeric chain ID (1 for Ethereum, 130 for Unichain, 8453 for Base)

#### Response

```json
{
    "success": true,
    "error": "",
    "data": {
        "networth": {
            "usd_value": 11878.042297007945
        },
        "debankLast24hNetWorth": [
            {
                "timestamp": 1671012000,
                "usd_value": 333318.12768559786
            },
            {
                "timestamp": 1671012300,
                "usd_value": 333319.4193142207
            }
        ]
    }
}
```

## Debank API Documentation

### Get user chain balance

Returns the USD value balance of a given address on a specific chain.

**Method:** GET  
**Path:** `/v1/user/chain_balance`

**Parameters:**

- `id` (required): User address
- `chain_id` (required): Chain identifier (e.g., "eth", "bsc", "base")

**Example Request:**

```bash
curl -X 'GET' \
  'https://pro-openapi.debank.com/v1/user/chain_balance?id=0x5853ed4f26a3fcea565b3fbc698bb19cdf6deb85&chain_id=eth' \
  -H 'accept: application/json' \
  -H 'AccessKey: YOUR_ACCESSKEY'
```

**Example Response:**

```json
{
    "usd_value": 11878.042297007945
}
```

### Get user 24-hour net curve on a single chain

Returns the net worth curve of a user on a single chain over the last 24 hours.

**Method:** GET  
**Path:** `/v1/user/chain_net_curve`

**Parameters:**

- `id` (required): User address
- `chain_id` (required): Chain identifier (e.g., "eth", "bsc", "base")

**Example Request:**

```bash
curl -X 'GET' \
  'https://pro-openapi.debank.com/v1/user/chain_net_curve?id=0x5853ed4f26a3fcea565b3fbc698bb19cdf6deb85&chain_id=eth' \
  -H 'accept: application/json' \
  -H 'AccessKey: YOUR_ACCESSKEY'
```

**Example Response:**

```json
[
    {
        "timestamp": 1671012000,
        "usd_value": 333318.12768559786
    },
    {
        "timestamp": 1671012300,
        "usd_value": 333319.4193142207
    },
    {
        "timestamp": 1671012600,
        "usd_value": 332964.5462521421
    },
    {
        "timestamp": 1671012900,
        "usd_value": 332964.5462521421
    }
]
```

## Chain ID Mapping

Our API accepts numeric chain IDs and converts them to Debank's string format:

| Numeric Chain ID | Debank Chain ID | Chain Name |
| ---------------- | --------------- | ---------- |
| 1                | eth             | Ethereum   |
| 130              | unichain        | Unichain   |
| 8453             | base            | Base       |

## Environment Variables

- `DEBANK_ACCESS_KEY`: Your Debank Pro API access key (required)

## Error Handling

The API returns appropriate error messages for:

- Missing parameters
- Invalid chain IDs
- Debank API errors
- Network timeouts (60 seconds)

## Caching

This API route implements server-side caching to minimize API calls to Debank's paid service:

- **Server-side cache TTL**: 5 minutes (300 seconds)
- **HTTP Cache headers**: `Cache-Control: public, s-maxage=300, stale-while-revalidate=60`
- **Cache implementation**: Uses Next.js `unstable_cache` for edge caching

The combination of server-side caching and React Query's client-side caching (30 minutes stale time) ensures efficient data fetching while preventing excessive API calls.

## Rate Limiting Considerations

Debank's Pro API has rate limits that need to be considered when scaling:

- **API Limits**: Debank Pro API has rate limits based on your subscription tier
- **Mitigation Strategies**:
    1. **Server-side caching**: 5-minute cache reduces repeated calls for same wallet/chain
    2. **Client-side caching**: React Query's 30-minute stale time prevents refetching
    3. **Request deduplication**: Multiple components requesting same data share the cached result
    4. **Parallel request management**: `useAggregatedAUM` fetches all wallet/chain pairs in parallel, which could hit rate limits with many strategies
- **Recommendations**:
    - Monitor API usage in Debank dashboard
    - Consider implementing request queuing for large deployments
    - Increase cache TTL if rate limits are frequently hit
    - Implement exponential backoff for retry logic
