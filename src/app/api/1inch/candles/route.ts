import { NextRequest, NextResponse } from 'next/server'
import { fetchWithTimeout } from '@/utils/requests.util'

// Supported parameters
const SUPPORTED_SECONDS = [300, 900, 3600, 14400, 86400, 604800]
const SUPPORTED_CHAINS = [1, 56, 137, 42161, 43114, 100, 10, 8453, 324, 59144, 146, 130]

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

// Configure route segment config for caching
export const dynamic = 'force-dynamic'
export const revalidate = 300 // 5 minutes

async function fetchCandles(token0: string, token1: string, seconds: string, chainId: string): Promise<CandlesResponse> {
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
            const data = await fetchCandles(token0, token1, seconds, chainId)

            // Return response with cache headers
            return NextResponse.json(data, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59',
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
