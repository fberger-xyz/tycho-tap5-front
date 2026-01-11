import { NextRequest } from 'next/server'
import { fetchWithTimeout } from '@/utils/requests.util'
import { createApiSuccess, createApiError, handleApiError } from '@/utils/api/response.util'
import { createCachedFunction } from '@/services/cache/shared-cache.service'
import { AppUrls } from '@/enums'
import { IS_DEV } from '@/config/app.config'
import { logger } from '@/utils/logger.util'

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

// Create cached version optimized for 5 concurrent users
const cachedFetchBinancePrice = createCachedFunction(fetchBinancePrice, ['binance-price'], {
    tags: ['binance-price'],
    revalidate: 10, // 10 seconds cache - aggressive for low user count
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
        WMATIC: 'MATIC',
        WBNB: 'BNB',
        WAVAX: 'AVAX',
        USDD: 'USDD',
        TUSD: 'TUSD',
        BUSD: 'BUSD',
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

// Try to get price through USDT pairs if direct pair doesn't exist
async function getPriceThroughUSDT(baseSymbol: string, quoteSymbol: string): Promise<number> {
    const symbolMap: Record<string, string> = {
        WETH: 'ETH',
        WBTC: 'BTC',
        DAI: 'DAI',
        USDC: 'USDC',
        USDT: 'USDT',
    }

    const base = symbolMap[baseSymbol.toUpperCase()] || baseSymbol.toUpperCase()
    const quote = symbolMap[quoteSymbol.toUpperCase()] || quoteSymbol.toUpperCase()

    // If one of them is already USDT, we can't use this method
    if (base === 'USDT' || quote === 'USDT') {
        throw new Error('Cannot use USDT bridge for USDT pairs')
    }

    // Get both prices in USDT
    const baseInUSDT = await cachedFetchBinancePrice(base + 'USDT')
    const quoteInUSDT = await cachedFetchBinancePrice(quote + 'USDT')

    // Calculate the cross rate
    return baseInUSDT / quoteInUSDT
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
        logger.debug(`Binance price request: ${binanceSymbol} (${baseSymbol}/${quoteSymbol})`)

        try {
            // First try direct pair
            const price = await cachedFetchBinancePrice(binanceSymbol)

            return createApiSuccess({
                price,
                symbol: `${baseSymbol}/${quoteSymbol}`,
                source: 'binance',
                method: 'direct',
                timestamp: new Date().toISOString(),
            })
        } catch (fetchError) {
            // If direct pair fails, try through USDT
            logger.info(`Direct pair ${binanceSymbol} failed, trying through USDT`)
            try {
                const price = await getPriceThroughUSDT(baseSymbol, quoteSymbol)

                return createApiSuccess({
                    price,
                    symbol: `${baseSymbol}/${quoteSymbol}`,
                    source: 'binance',
                    method: 'usdt-bridge',
                    timestamp: new Date().toISOString(),
                })
            } catch (bridgeError) {
                logger.error(`Failed to get price through USDT bridge`, { error: String(bridgeError) })

                if (fetchError instanceof Error) {
                    if (fetchError.message.includes('400')) {
                        return createApiError(`Symbol pair not available on Binance: ${baseSymbol}/${quoteSymbol}`, { status: 400 })
                    }
                    return createApiError(`Failed to fetch price: ${fetchError.message}`, { status: 500 })
                }
                throw fetchError
            }
        }
    } catch (error) {
        return handleApiError(error, 'fetch Binance price')
    }
}
