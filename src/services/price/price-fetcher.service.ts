import { createRequest } from '@/utils/requests.util'
import { AppSupportedChainIds } from '@/enums'
import { logger } from '@/utils/logger.util'

interface PriceResponse {
    price: number
    symbol: string
    source: string
    timestamp: string
}

export enum PriceFeedType {
    BINANCE = 'binance',
    CHAINLINK = 'chainlink',
    AGGREGATED = 'aggregated',
}

/**
 * Fetches the current price for a trading pair using the configured price feed
 */
export async function fetchPairPrice(
    baseSymbol: string,
    quoteSymbol: string,
    priceFeedConfig?: { type: string; source: string },
    chainId?: number,
): Promise<number> {
    // Determine price feed type from config
    const feedType = priceFeedConfig?.type?.toLowerCase() || PriceFeedType.AGGREGATED

    try {
        switch (feedType) {
            case PriceFeedType.BINANCE:
                return await fetchBinancePrice(baseSymbol, quoteSymbol)

            case PriceFeedType.CHAINLINK:
                return await fetchChainlinkPrice(baseSymbol, quoteSymbol, chainId)

            case PriceFeedType.AGGREGATED:
            default:
                // Try multiple sources with fallback
                return await fetchAggregatedPrice(baseSymbol, quoteSymbol, chainId)
        }
    } catch (error) {
        logger.error(`Failed to fetch price for ${baseSymbol}/${quoteSymbol}:`, { error: error instanceof Error ? error.message : String(error) })
        return 0 // Return 0 if all attempts fail
    }
}

/**
 * Fetch price from Binance API
 */
async function fetchBinancePrice(baseSymbol: string, quoteSymbol: string): Promise<number> {
    const url = `/api/binance/price?base=${encodeURIComponent(baseSymbol)}&quote=${encodeURIComponent(quoteSymbol)}`
    const result = await createRequest<PriceResponse>(url)

    if (result.success && result.data) {
        return result.data.price
    }

    throw new Error(result.error || 'Failed to fetch Binance price')
}

/**
 * Fetch price from Chainlink
 */
async function fetchChainlinkPrice(baseSymbol: string, quoteSymbol: string, chainId?: number): Promise<number> {
    let url = `/api/chainlink/price?base=${encodeURIComponent(baseSymbol)}&quote=${encodeURIComponent(quoteSymbol)}`
    if (chainId) {
        url += `&chainId=${chainId}`
    }
    const result = await createRequest<PriceResponse>(url)

    if (result.success && result.data) {
        return result.data.price
    }

    throw new Error(result.error || 'Failed to fetch Chainlink price')
}

/**
 * Fetch price from 1inch candles (using latest close price)
 */
async function fetch1inchPrice(baseSymbol: string, quoteSymbol: string, chainId: number): Promise<number> {
    // Get token addresses for the symbols
    const { getTokenBySymbol } = await import('@/config/tokens.config')

    const baseToken = getTokenBySymbol(chainId as AppSupportedChainIds, baseSymbol)
    const quoteToken = getTokenBySymbol(chainId as AppSupportedChainIds, quoteSymbol)

    if (!baseToken?.address || !quoteToken?.address) {
        throw new Error('Token addresses not found')
    }

    // Fetch 5-minute candles
    const url = `/api/1inch/candles?token0=${baseToken.address}&token1=${quoteToken.address}&seconds=300&chainId=${chainId}`
    const result = await createRequest<{ data: Array<{ close: number }> }>(url)

    if (result.success && result.data?.data && result.data.data.length > 0) {
        // Return the latest candle's close price
        return result.data.data[result.data.data.length - 1].close
    }

    throw new Error('No candle data available')
}

/**
 * Try multiple price sources with fallback
 */
async function fetchAggregatedPrice(baseSymbol: string, quoteSymbol: string, chainId?: number): Promise<number> {
    const errors: string[] = []

    // Try Binance first (most liquid for many pairs)
    try {
        return await fetchBinancePrice(baseSymbol, quoteSymbol)
    } catch (error) {
        errors.push(`Binance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Try Chainlink (most reliable for major pairs)
    try {
        return await fetchChainlinkPrice(baseSymbol, quoteSymbol, chainId)
    } catch (error) {
        errors.push(`Chainlink: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Try 1inch as last resort
    try {
        return await fetch1inchPrice(baseSymbol, quoteSymbol, chainId || 1)
    } catch (error) {
        errors.push(`1inch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    logger.error('All price sources failed:', { errors })
    throw new Error('Failed to fetch price from all sources')
}

/**
 * Batch fetch prices for multiple strategies
 */
export async function fetchStrategyPrices(
    strategies: Array<{
        baseSymbol: string
        quoteSymbol: string
        priceFeedConfig?: { type: string; source: string }
        chainId?: number
    }>,
): Promise<Map<string, number>> {
    const priceMap = new Map<string, number>()
    const errors: string[] = []

    // Fetch prices in parallel with rate limiting
    const batchSize = 5
    for (let i = 0; i < strategies.length; i += batchSize) {
        const batch = strategies.slice(i, i + batchSize)

        await Promise.all(
            batch.map(async (strategy) => {
                const key = `${strategy.baseSymbol}/${strategy.quoteSymbol}`
                try {
                    const price = await fetchPairPrice(strategy.baseSymbol, strategy.quoteSymbol, strategy.priceFeedConfig, strategy.chainId)
                    priceMap.set(key, price)
                } catch (error) {
                    const errorMsg = `${key}: ${error instanceof Error ? error.message : 'Unknown error'}`
                    logger.error(`Failed to fetch price for ${errorMsg}`, {})
                    errors.push(errorMsg)
                    priceMap.set(key, 0)
                }
            }),
        )

        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < strategies.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
        }
    }

    // If all price fetches failed, throw an error
    if (errors.length === strategies.length && strategies.length > 0) {
        throw new Error(`All price fetches failed. Sample errors: ${errors.slice(0, 3).join('; ')}`)
    }

    return priceMap
}
