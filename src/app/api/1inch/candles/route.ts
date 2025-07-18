import { NextRequest, NextResponse } from 'next/server'
import { fetchWithTimeout } from '@/utils/requests.util'
import { createCachedFunction } from '@/services/cache/shared-cache.service'

// Supported parameters
const SUPPORTED_SECONDS = [300, 900, 3600, 14400, 86400, 604800]
const SUPPORTED_CHAINS = [1, 56, 137, 42161, 43114, 100, 10, 8453, 324, 59144, 146, 130]

// Cache TTL based on period
const CACHE_TTL_MAP: Record<number, number> = {
    300: 15, // 5 min candles -> 15s cache
    900: 15, // 15 min candles -> 15s cache
    3600: 30, // 1 hour candles -> 30s cache
    14400: 30, // 4 hour candles -> 30s cache
    86400: 30, // 1 day candles -> 30s cache
    604800: 30, // 1 week candles -> 30s cache
}

interface CandleData {
    time: number
    open: number
    high: number
    low: number
    close: number
}

interface CandlesResponse {
    data: CandleData[]
}

// Configure route segment config
export const dynamic = 'force-dynamic'

// Base fetch function
async function fetchCandlesBase(token0: string, token1: string, seconds: string, chainId: string): Promise<CandlesResponse> {
    const apiKey = process.env.ONEINCH_API_KEY || 'xiOxR6YUX5KPRsD53kcI10BYj6yrDL8I'
    const apiUrl = `https://api.1inch.dev/charts/v1.0/chart/aggregated/candle/${token0}/${token1}/${seconds}/${chainId}`

    const response = await fetchWithTimeout(apiUrl, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            accept: 'application/json',
            'content-type': 'application/json',
        },
        timeout: 30000, // 30 seconds
        retries: 2, // Retry up to 2 times
    })

    return response.json()
}

// Create cached version of the fetch function
function getCachedFetchCandles(seconds: number) {
    const ttl = CACHE_TTL_MAP[seconds] || 15
    return createCachedFunction(fetchCandlesBase, ['1inch-candles'], {
        tags: ['1inch-candles', `period-${seconds}`],
        revalidate: ttl,
    })
}

export async function GET(request: NextRequest) {
    try {
        // Extract parameters from URL
        const { searchParams } = new URL(request.url)
        const token0 = searchParams.get('token0')
        const token1 = searchParams.get('token1')
        const seconds = searchParams.get('seconds')
        const chainId = searchParams.get('chainId')

        // Validate required parameters
        if (!token0 || !token1 || !seconds || !chainId) {
            return NextResponse.json({ error: 'Missing required parameters: token0, token1, seconds, chainId' }, { status: 400 })
        }

        // Validate parameter values
        const secondsNum = parseInt(seconds)
        const chainIdNum = parseInt(chainId)

        if (!SUPPORTED_SECONDS.includes(secondsNum)) {
            return NextResponse.json({ error: `Invalid seconds value. Supported values: ${SUPPORTED_SECONDS.join(', ')}` }, { status: 400 })
        }

        if (!SUPPORTED_CHAINS.includes(chainIdNum)) {
            return NextResponse.json({ error: `Invalid chainId. Supported chains: ${SUPPORTED_CHAINS.join(', ')}` }, { status: 400 })
        }

        // Validate token addresses (basic Ethereum address validation)
        const addressRegex = /^0x[a-fA-F0-9]{40}$/
        if (!addressRegex.test(token0) || !addressRegex.test(token1)) {
            return NextResponse.json({ error: 'Invalid token address format' }, { status: 400 })
        }

        try {
            // Get cached fetch function with appropriate TTL
            const cachedFetchCandles = getCachedFetchCandles(secondsNum)
            const data = await cachedFetchCandles(token0, token1, seconds, chainId)

            // Get TTL for cache headers
            const ttl = CACHE_TTL_MAP[secondsNum] || 15

            // Return response with cache headers as per guidelines
            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=30`,
                },
            })
        } catch (fetchError) {
            // Handle specific fetch errors
            if (fetchError instanceof Error) {
                if (fetchError.name === 'AbortError') {
                    return NextResponse.json({ error: 'Request timeout - 1inch API took too long to respond' }, { status: 504 })
                } else if (fetchError.message.includes('HTTP error status:')) {
                    const status = parseInt(fetchError.message.match(/\d+/)?.[0] || '500')
                    return NextResponse.json({ error: `1inch API error: ${fetchError.message}` }, { status })
                }
            }
            throw fetchError
        }
    } catch (error) {
        console.error('Error in candles endpoint:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
