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

This API route uses `cache: 'no-store'` to ensure fresh data on every request. Consider implementing caching at the application level using React Query or similar solutions to minimize API calls to Debank's paid service.
