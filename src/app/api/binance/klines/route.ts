import { NextRequest } from 'next/server'
import { fetchWithTimeout } from '@/utils/requests.util'
import { createApiSuccess, createApiError, handleApiError } from '@/utils/api/response.util'
import { createCachedFunction } from '@/services/cache/shared-cache.service'
import { AppUrls } from '@/enums'
import { IS_DEV } from '@/config/app.config'

// Binance API endpoint
const BINANCE_API_URL = IS_DEV ? AppUrls.BINANCE_API_DEV : AppUrls.BINANCE_API_PROD

// Map seconds to Binance interval format
const INTERVAL_MAP: Record<number, string> = {
    300: '5m', // 5 minutes
    900: '15m', // 15 minutes
    3600: '1h', // 1 hour
    14400: '4h', // 4 hours
    86400: '1d', // 1 day
    604800: '1w', // 1 week
}

// Cache TTL based on interval (same as 1inch)
const CACHE_TTL_MAP: Record<number, number> = {
    300: 15, // 5 min candles -> 15s cache
    900: 15, // 15 min candles -> 15s cache
    3600: 30, // 1 hour candles -> 30s cache
    14400: 30, // 4 hour candles -> 30s cache
    86400: 30, // 1 day candles -> 30s cache
    604800: 30, // 1 week candles -> 30s cache
}

interface BinanceKline {
    time: number
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface KlinesResponse {
    data: BinanceKline[]
}

// Convert token symbols to Binance format
function toBinanceSymbol(baseSymbol: string, quoteSymbol: string): string {
    const symbolMap: Record<string, string> = {
        WETH: 'ETH',
        WBTC: 'BTC',
        DAI: 'DAI',
        USDC: 'USDC',
        USDT: 'USDT',
        ETH: 'ETH',
        BTC: 'BTC',
    }

    const base = symbolMap[baseSymbol.toUpperCase()] || baseSymbol.toUpperCase()
    const quote = symbolMap[quoteSymbol.toUpperCase()] || quoteSymbol.toUpperCase()

    return base + quote
}

// Base fetch function
async function fetchBinanceKlines(symbol: string, interval: string, limit: number = 500): Promise<KlinesResponse> {
    const binanceEndpoint = `${BINANCE_API_URL}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`

    const response = await fetchWithTimeout(binanceEndpoint, {
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
        },
        timeout: 10000, // 10 seconds
        retries: 2,
    })

    const data = await response.json()

    // Transform Binance response to our format
    // Binance returns: [[openTime, open, high, low, close, volume, closeTime, ...], ...]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed: BinanceKline[] = data.map((kline: any[]) => ({
        time: kline[0] / 1000, // Convert ms to seconds to match 1inch format
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
    }))

    return { data: transformed }
}

// Create cached version
function getCachedFetchKlines(seconds: number) {
    const ttl = CACHE_TTL_MAP[seconds] || 30
    return createCachedFunction(fetchBinanceKlines, ['binance-klines'], {
        tags: ['binance-klines', `interval-${seconds}`],
        revalidate: ttl,
    })
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const baseSymbol = searchParams.get('base')
        const quoteSymbol = searchParams.get('quote')
        const seconds = searchParams.get('seconds')
        const limit = searchParams.get('limit')

        if (!baseSymbol || !quoteSymbol || !seconds) {
            return createApiError('Missing required parameters: base, quote, seconds', { status: 400 })
        }

        const secondsNum = parseInt(seconds)
        const binanceInterval = INTERVAL_MAP[secondsNum]

        if (!binanceInterval) {
            return createApiError(`Unsupported interval. Supported values: ${Object.keys(INTERVAL_MAP).join(', ')}`, { status: 400 })
        }

        const binanceSymbol = toBinanceSymbol(baseSymbol, quoteSymbol)
        const limitNum = limit ? parseInt(limit) : 500

        console.log(`Fetching Binance klines for ${binanceSymbol} with interval ${binanceInterval}`)

        try {
            const cachedFetchKlines = getCachedFetchKlines(secondsNum)
            const klines = await cachedFetchKlines(binanceSymbol, binanceInterval, limitNum)

            return createApiSuccess({
                ...klines,
                symbol: `${baseSymbol}/${quoteSymbol}`,
                source: 'binance',
                interval: binanceInterval,
                timestamp: new Date().toISOString(),
            })
        } catch (fetchError) {
            console.error(`Failed to fetch klines for ${binanceSymbol}:`, fetchError)

            // Try with USDT pairs if direct pair fails
            if (!binanceSymbol.includes('USDT')) {
                try {
                    console.log(`Trying cross-rate calculation through USDT`)

                    const baseUsdt = toBinanceSymbol(baseSymbol, 'USDT')
                    const quoteUsdt = toBinanceSymbol(quoteSymbol, 'USDT')

                    const cachedFetchKlines = getCachedFetchKlines(secondsNum)
                    const [baseKlines, quoteKlines] = await Promise.all([
                        cachedFetchKlines(baseUsdt, binanceInterval, limitNum),
                        cachedFetchKlines(quoteUsdt, binanceInterval, limitNum),
                    ])

                    // Calculate cross rate
                    const crossRateKlines: BinanceKline[] = []
                    const minLength = Math.min(baseKlines.data.length, quoteKlines.data.length)

                    for (let i = 0; i < minLength; i++) {
                        const baseCandle = baseKlines.data[i]
                        const quoteCandle = quoteKlines.data[i]

                        crossRateKlines.push({
                            time: baseCandle.time,
                            open: baseCandle.open / quoteCandle.open,
                            high: baseCandle.high / quoteCandle.low, // high/low for max price
                            low: baseCandle.low / quoteCandle.high, // low/high for min price
                            close: baseCandle.close / quoteCandle.close,
                            volume: 0, // Can't calculate accurate volume for cross rate
                        })
                    }

                    return createApiSuccess({
                        data: crossRateKlines,
                        symbol: `${baseSymbol}/${quoteSymbol}`,
                        source: 'binance',
                        method: 'usdt-cross',
                        interval: binanceInterval,
                        timestamp: new Date().toISOString(),
                    })
                } catch (crossError) {
                    console.error('Cross-rate calculation failed:', crossError)
                }
            }

            if (fetchError instanceof Error) {
                if (fetchError.message.includes('400')) {
                    return createApiError(`Symbol pair not available on Binance: ${baseSymbol}/${quoteSymbol}`, { status: 400 })
                }
                return createApiError(`Failed to fetch klines: ${fetchError.message}`, { status: 500 })
            }
            throw fetchError
        }
    } catch (error) {
        return handleApiError(error, 'fetch Binance klines')
    }
}
