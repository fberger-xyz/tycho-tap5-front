'use client'

import { useQuery } from '@tanstack/react-query'
import type { ConfigurationWithInstances, Strategy } from '@/types'
import { AppUrls, ReactQueryKeys } from '@/enums'
import { groupByStrategies } from '@/utils'
import { fetchStrategyPrices } from '@/services/price/price-fetcher.service'
import { useEffect, useState } from 'react'
import { showErrorToast, TOAST_MESSAGES } from '@/utils/toast.util'
import { logger } from '@/utils/logger.util'

interface ApiResponse {
    configurations?: ConfigurationWithInstances[]
    error?: string
}

async function fetchConfigurationsWithInstances(): Promise<ConfigurationWithInstances[]> {
    try {
        const response = await fetch(`${AppUrls.API_STRATEGIES}?limit=100&skip=0`)

        // Handle non-OK responses
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Network error')
            logger.error(`API Error (${response.status}):`, { error: errorText })
            throw new Error(`Failed to fetch configurations: ${response.status} ${response.statusText}`)
        }

        // Parse response safely
        const data = (await response.json()) as ApiResponse

        // Validate response structure
        if (!data.configurations || !Array.isArray(data.configurations)) {
            logger.error('Invalid API response:', { error: data })
            throw new Error('Invalid response format from API')
        }

        return data.configurations
    } catch (error) {
        // Re-throw with more context
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching configurations')
    }
}

export function useStrategies() {
    const [strategiesWithPrices, setStrategiesWithPrices] = useState<Strategy[]>([])
    const [pricesLoading, setPricesLoading] = useState(false)

    const {
        data: configurations,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: [ReactQueryKeys.STRATEGIES],
        queryFn: fetchConfigurationsWithInstances,
        // Retry configuration
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error instanceof Error && error.message.includes('4')) {
                return false
            }
            // Retry up to 3 times for other errors
            return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Aggressive caching for 5 users - strategies don't change often
        refetchInterval: (data) => {
            // Refresh every 60 seconds if we have data
            return data ? 60000 : false
        },
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false, // Don't refetch when component mounts if data exists
        // Data is fresh for 30 seconds (matches server cache)
        staleTime: 30000,
        // Keep data in cache for 30 minutes
        gcTime: 30 * 60 * 1000,
    })

    // Show error toast for configuration fetch errors
    useEffect(() => {
        if (error && !isRefetching) {
            showErrorToast(TOAST_MESSAGES.STRATEGY_LOAD_ERROR)
        }
    }, [error, isRefetching])

    // Fetch prices for all strategies
    useEffect(() => {
        if (!configurations || configurations.length === 0) {
            setStrategiesWithPrices([])
            return
        }

        // Process strategies inside useEffect to avoid dependency issues
        const strategies = groupByStrategies(configurations)

        const fetchPrices = async () => {
            setPricesLoading(true)
            try {
                // Prepare strategy data for price fetching
                const strategyPriceInputs = strategies.map((strategy) => ({
                    baseSymbol: strategy.base.symbol,
                    quoteSymbol: strategy.quote.symbol,
                    priceFeedConfig: strategy.config.execution.priceFeedConfig,
                    chainId: strategy.chainId,
                }))

                // Fetch prices in batches
                const priceMap = await fetchStrategyPrices(strategyPriceInputs)

                // Update strategies with fetched prices
                const updatedStrategies = strategies.map((strategy) => {
                    const priceKey = `${strategy.base.symbol}/${strategy.quote.symbol}`
                    const price = priceMap.get(priceKey) || 0
                    return {
                        ...strategy,
                        priceUsd: price,
                    }
                })

                setStrategiesWithPrices(updatedStrategies)
            } catch (error) {
                logger.error('Failed to fetch strategy prices:', { error: error instanceof Error ? error.message : String(error) })

                // Show a generic error toast
                showErrorToast(TOAST_MESSAGES.PRICE_FETCH_ERROR)

                // Use strategies without prices as fallback
                setStrategiesWithPrices(strategies)
            } finally {
                setPricesLoading(false)
            }
        }

        fetchPrices()
    }, [configurations]) // Re-fetch when configurations change

    return {
        configurations: configurations || [],
        strategies: strategiesWithPrices,
        isLoading: isLoading || pricesLoading,
        isRefetching,
        error,
        refetch,
        // Helper to check if we're in an error state with no data
        hasError: !!error && (!configurations || configurations.length === 0),
    }
}
