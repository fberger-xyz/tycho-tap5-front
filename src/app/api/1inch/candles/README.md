# 1inch Candles API Endpoint

This endpoint provides historical candle chart data for specific token pairs using the 1inch Charts API.

## Endpoint

```
GET /api/1inch/candles
```

## Query Parameters

| Parameter | Type   | Required | Description                                                                     |
| --------- | ------ | -------- | ------------------------------------------------------------------------------- |
| token0    | string | Yes      | Base token address (0x...)                                                      |
| token1    | string | Yes      | Quote token address (0x...)                                                     |
| seconds   | number | Yes      | Period in seconds: 300, 900, 3600, 14400, 86400, 604800                         |
| chainId   | number | Yes      | Supported chains: 1, 56, 137, 42161, 43114, 100, 10, 8453, 324, 59144, 146, 130 |

## Example Request

```bash
# Get 5-minute candles for USDC/WETH on Ethereum mainnet
curl "http://localhost:3000/api/1inch/candles?token0=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&token1=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&seconds=300&chainId=1"
```

## Response Format

```json
{
    "data": [
        {
            "time": 1234567890,
            "open": 1234.56,
            "high": 1250.0,
            "low": 1230.0,
            "close": 1245.89
        }
    ]
}
```

## Caching

This endpoint uses Next.js App Router caching best practices:

- **Cache-Control**: `public, s-maxage=300, stale-while-revalidate=59`
- **Revalidation**: Data is cached for 5 minutes (300 seconds)
- **Stale-while-revalidate**: Serves stale data while fetching fresh data in the background
- **Dynamic Route**: Configured as `force-dynamic` to ensure fresh data on each request

## Request Configuration

- **Timeout**: 30 seconds
- **Retries**: Up to 2 automatic retries on failure
- Uses `fetchWithTimeout` utility for reliable API calls

## Environment Variables

```bash
# Optional: Set your own 1inch API key
ONEINCH_API_KEY=your_api_key_here
```

## Period Values

- 300 = 5 minutes
- 900 = 15 minutes
- 3600 = 1 hour
- 14400 = 4 hours
- 86400 = 1 day
- 604800 = 1 week

## Chain IDs

- 1 = Ethereum
- 56 = BSC
- 137 = Polygon
- 42161 = Arbitrum One
- 43114 = Avalanche
- 100 = Gnosis
- 10 = Optimism
- 8453 = Base
- 324 = zkSync Era
- 59144 = Linea
- 146 = Sonic
- 130 = Mode

## Error Responses

### 400 Bad Request

- Missing required parameters
- Invalid parameter values
- Invalid token address format

### 504 Gateway Timeout

- Request timeout (after 30 seconds)

### 500 Internal Server Error

- API communication errors
- Unexpected server errors
