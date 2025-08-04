import { NextRequest } from 'next/server'
import { fetchWithTimeout } from '@/utils/requests.util'
import { createApiSuccess, createApiError, handleApiError } from '@/utils/api/response.util'
import { createCachedFunction } from '@/services/cache/shared-cache.service'
import { AppUrls } from '@/enums'
import { IS_DEV } from '@/config/app.config'

// Binance API endpoint
const BINANCE_API_URL = IS_DEV ? AppUrls.BINANCE_API_DEV : AppUrls.BINANCE_API_PROD

interface BinancePriceResponse {
    symbol: string
    price: string
}

// Base fetch function
async function fetchBinancePrice(symbol: string): Promise<number> {
    try {
        const binanceEndpoint = `${BINANCE_API_URL}/api/v3/ticker/price?symbol=${symbol}`
        const response = await fetchWithTimeout(binanceEndpoint, {
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
            },
            timeout: 10000, // 10 seconds
            retries: 2,
        })

        const data: BinancePriceResponse = await response.json()
        return parseFloat(data.price)
    } catch (error) {
        // Try with reversed pair if direct pair fails
        const reversedSymbol = reverseSymbol(symbol)
        if (reversedSymbol && reversedSymbol !== symbol) {
            try {
                const response = await fetchWithTimeout(`${BINANCE_API_URL}?symbol=${reversedSymbol}`, {
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                    },
                    timeout: 10000,
                    retries: 1,
                })

                const data: BinancePriceResponse = await response.json()
                return 1 / parseFloat(data.price) // Invert price for reversed pair
            } catch {
                // Both attempts failed
                throw error
            }
        }
        throw error
    }
}

// Helper function to reverse trading pair
function reverseSymbol(symbol: string): string | null {
    // Common base currencies to try reversing
    const baseCurrencies = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BNB']

    for (const base of baseCurrencies) {
        if (symbol.endsWith(base)) {
            const quote = symbol.substring(0, symbol.length - base.length)
            return base + quote
        }
        if (symbol.startsWith(base)) {
            const quote = symbol.substring(base.length)
            return quote + base
        }
    }

    return null
}

// Create cached version
const cachedFetchBinancePrice = createCachedFunction(fetchBinancePrice, ['binance-price'], {
    tags: ['binance-price'],
    revalidate: 30, // 30 seconds cache
})

// Convert token symbols to Binance format
function toBinanceSymbol(baseSymbol: string, quoteSymbol: string): string {
    // Map common token symbols to Binance format
    const symbolMap: Record<string, string> = {
        WETH: 'ETH',
        WBTC: 'BTC',
        DAI: 'DAI',
        USDC: 'USDC',
        USDT: 'USDT',
    }

    const base = symbolMap[baseSymbol.toUpperCase()] || baseSymbol.toUpperCase()
    const quote = symbolMap[quoteSymbol.toUpperCase()] || quoteSymbol.toUpperCase()

    // Binance typically uses USDT as the quote currency
    // Try common patterns
    if (quote === 'USDT' || quote === 'USDC' || quote === 'BUSD') {
        return base + quote
    } else if (base === 'USDT' || base === 'USDC' || base === 'BUSD') {
        return quote + base
    } else {
        // Default to base+quote
        return base + quote
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const baseSymbol = searchParams.get('base')
        const quoteSymbol = searchParams.get('quote')

        if (!baseSymbol || !quoteSymbol) {
            return createApiError('Missing required parameters: base, quote', { status: 400 })
        }

        const binanceSymbol = toBinanceSymbol(baseSymbol, quoteSymbol)

        try {
            const price = await cachedFetchBinancePrice(binanceSymbol)

            return createApiSuccess({
                price,
                symbol: `${baseSymbol}/${quoteSymbol}`,
                source: 'binance',
                timestamp: new Date().toISOString(),
            })
        } catch (fetchError) {
            if (fetchError instanceof Error) {
                if (fetchError.message.includes('400')) {
                    return createApiError(`Invalid symbol pair: ${baseSymbol}/${quoteSymbol}`, { status: 400 })
                }
                return createApiError(`Failed to fetch price: ${fetchError.message}`, { status: 500 })
            }
            throw fetchError
        }
    } catch (error) {
        return handleApiError(error, 'fetch Binance price')
    }
}
