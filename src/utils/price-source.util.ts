import { Strategy } from '@/types'

/**
 * Convert token symbols to Binance format (same logic as in binance API route)
 */
function toBinanceSymbol(baseSymbol: string, quoteSymbol: string): string {
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
    if (quote === 'USDT' || quote === 'USDC' || quote === 'BUSD') {
        return base + quote
    } else if (base === 'USDT' || base === 'USDC' || base === 'BUSD') {
        return quote + base
    } else {
        return base + quote
    }
}

/**
 * Generate a URL to the price source based on the price feed configuration
 */
export function getPriceSourceUrl(strategy: Strategy): string | null {
    const priceFeedType = strategy.config.execution.priceFeedConfig?.type?.toLowerCase()

    switch (priceFeedType) {
        case 'binance':
            // Binance API URL format
            const binanceSymbol = toBinanceSymbol(strategy.base.symbol, strategy.quote.symbol)
            return `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`

        case 'chainlink':
            // Chainlink data feed page
            try {
                const chainName = strategy.chainId === 1 ? 'ethereum/mainnet' : strategy.chainId === 8453 ? 'base/base' : 'ethereum/mainnet' // default

                // Normalize symbols (WETH -> ETH for Chainlink)
                const baseSymbol = strategy.base.symbol.toLowerCase() === 'weth' ? 'eth' : strategy.base.symbol.toLowerCase()
                const quoteSymbol = strategy.quote.symbol.toLowerCase() === 'weth' ? 'eth' : strategy.quote.symbol.toLowerCase()

                // Generate the specific feed URL
                return `https://data.chain.link/feeds/${chainName}/${baseSymbol}-${quoteSymbol}`
            } catch {
                // If anything fails, return the general feeds page
                return 'https://data.chain.link/feeds'
            }

        default:
            // For unknown types, return null (no link)
            return null
    }
}

/**
 * Get a user-friendly label for the price source
 */
export function getPriceSourceLabel(strategy: Strategy): string {
    const priceFeedType = strategy.config.execution.priceFeedConfig?.type?.toLowerCase()

    switch (priceFeedType) {
        case 'binance':
            return 'Binance'
        case 'chainlink':
            return 'Chainlink'
        case 'aggregated':
            return 'Aggregated'
        default:
            return 'Market'
    }
}
