import { NextRequest } from 'next/server'
import { createApiSuccess, createApiError, handleApiError } from '@/utils/api/response.util'
import { createCachedFunction } from '@/services/cache/shared-cache.service'
import { fetchWithTimeout } from '@/utils/requests.util'
import { env } from '@/env/t3-env'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AppSupportedChainIds } from '@/enums'

// ABI for Chainlink Aggregator V3 Interface would be needed for direct contract calls
// Currently using RPC eth_call with function selector

interface ChainlinkResponse {
    answer: string
    updatedAt: string
}

// Get RPC URL for a specific chain
function getRpcUrl(chainId: number): string | null {
    switch (chainId) {
        case AppSupportedChainIds.ETHEREUM:
            return env.ALCHEMY_API_KEY
                ? `https://eth-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`
                : env.INFURA_API_KEY
                  ? `https://mainnet.infura.io/v3/${env.INFURA_API_KEY}`
                  : null
        case AppSupportedChainIds.BASE:
            return env.ALCHEMY_API_KEY
                ? `https://base-mainnet.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`
                : env.INFURA_API_KEY
                  ? `https://base-mainnet.infura.io/v3/${env.INFURA_API_KEY}`
                  : null
        case AppSupportedChainIds.UNICHAIN:
            // Unichain RPC URL would go here when available
            return null
        default:
            return null
    }
}

// Fetch price from Chainlink using Alchemy/Infura
async function fetchChainlinkPrice(feedAddress: string, chainId: number): Promise<ChainlinkResponse> {
    const rpcUrl = getRpcUrl(chainId)

    if (!rpcUrl) {
        throw new Error(`No RPC provider configured for chain ${chainId}`)
    }

    const response = await fetchWithTimeout(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
                {
                    to: feedAddress,
                    data: '0xfeaf968c', // Function selector for latestRoundData()
                },
                'latest',
            ],
            id: 1,
        }),
        timeout: 10000,
        retries: 2,
    })

    const data = await response.json()

    if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`)
    }

    // Decode the response (returns tuple of 5 values)
    const result = data.result
    if (!result || result === '0x') {
        throw new Error('Empty response from Chainlink feed')
    }

    // Remove 0x prefix and split into 32-byte chunks
    const hex = result.slice(2)
    const chunks = hex.match(/.{1,64}/g) || []

    if (chunks.length < 5) {
        throw new Error('Invalid response format from Chainlink feed')
    }

    // Extract answer (2nd value) and updatedAt (4th value)
    const answer = BigInt('0x' + chunks[1]).toString()
    const updatedAt = BigInt('0x' + chunks[3]).toString()

    return { answer, updatedAt }
}

// Calculate cross rate if direct feed not available
async function calculateCrossRate(baseSymbol: string, quoteSymbol: string, chainId: number): Promise<number | null> {
    const chainConfig = CHAINS_CONFIG[chainId]
    if (!chainConfig?.chainlinkFeeds) {
        return null
    }

    // Try to calculate cross rate through USD
    const baseUsdFeed = chainConfig.chainlinkFeeds[`${baseSymbol}/USD`]
    const quoteUsdFeed = chainConfig.chainlinkFeeds[`${quoteSymbol}/USD`]

    if (baseUsdFeed && quoteUsdFeed) {
        try {
            const [baseUsdData, quoteUsdData] = await Promise.all([
                cachedFetchChainlinkPrice(baseUsdFeed, chainId),
                cachedFetchChainlinkPrice(quoteUsdFeed, chainId),
            ])

            const baseUsdPrice = parseFloat(baseUsdData.answer) / 1e8
            const quoteUsdPrice = parseFloat(quoteUsdData.answer) / 1e8

            return baseUsdPrice / quoteUsdPrice
        } catch {
            return null
        }
    }

    return null
}

// Create cached version
const cachedFetchChainlinkPrice = createCachedFunction(fetchChainlinkPrice, ['chainlink-price'], {
    tags: ['chainlink-price'],
    revalidate: 60, // 60 seconds cache
})

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const baseSymbol = searchParams.get('base')
        const quoteSymbol = searchParams.get('quote')
        const chainIdParam = searchParams.get('chainId')

        if (!baseSymbol || !quoteSymbol) {
            return createApiError('Missing required parameters: base, quote', { status: 400 })
        }

        // Default to Ethereum mainnet if no chainId provided
        const chainId = chainIdParam ? parseInt(chainIdParam) : AppSupportedChainIds.ETHEREUM
        const chainConfig = CHAINS_CONFIG[chainId]

        if (!chainConfig) {
            return createApiError(`Unsupported chain ID: ${chainId}`, { status: 400 })
        }

        if (!chainConfig.chainlinkFeeds || Object.keys(chainConfig.chainlinkFeeds).length === 0) {
            return createApiError(`No Chainlink feeds available for ${chainConfig.name}`, { status: 404 })
        }

        // Normalize symbols
        const base = baseSymbol.toUpperCase() === 'WETH' ? 'ETH' : baseSymbol.toUpperCase()
        const quote = quoteSymbol.toUpperCase()

        // Check for direct feed
        const directFeed = chainConfig.chainlinkFeeds[`${base}/${quote}`]

        if (directFeed) {
            try {
                const data = await cachedFetchChainlinkPrice(directFeed, chainId)
                const price = parseFloat(data.answer) / 1e8 // Chainlink uses 8 decimals

                return createApiSuccess({
                    price,
                    symbol: `${baseSymbol}/${quoteSymbol}`,
                    source: 'chainlink',
                    chainId,
                    feedAddress: directFeed,
                    timestamp: new Date(parseInt(data.updatedAt) * 1000).toISOString(),
                })
            } catch (error) {
                return createApiError(`Failed to fetch from Chainlink: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
            }
        }

        // Try reverse feed
        const reverseFeed = chainConfig.chainlinkFeeds[`${quote}/${base}`]
        if (reverseFeed) {
            try {
                const data = await cachedFetchChainlinkPrice(reverseFeed, chainId)
                const price = 1 / (parseFloat(data.answer) / 1e8) // Invert for reverse pair

                return createApiSuccess({
                    price,
                    symbol: `${baseSymbol}/${quoteSymbol}`,
                    source: 'chainlink',
                    chainId,
                    feedAddress: reverseFeed,
                    reversed: true,
                    timestamp: new Date(parseInt(data.updatedAt) * 1000).toISOString(),
                })
            } catch {
                // Continue to cross rate calculation
            }
        }

        // Try cross rate calculation
        const crossRate = await calculateCrossRate(base, quote, chainId)
        if (crossRate !== null) {
            return createApiSuccess({
                price: crossRate,
                symbol: `${baseSymbol}/${quoteSymbol}`,
                source: 'chainlink',
                chainId,
                crossRate: true,
                timestamp: new Date().toISOString(),
            })
        }

        return createApiError(`No Chainlink price feed available for ${baseSymbol}/${quoteSymbol} on ${chainConfig.name}`, { status: 404 })
    } catch (error) {
        return handleApiError(error, 'fetch Chainlink price')
    }
}
