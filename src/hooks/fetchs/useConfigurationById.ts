'use client'

import { useQuery } from '@tanstack/react-query'
import type { ConfigurationWithInstances } from '@/types'
import { AppUrls, ReactQueryKeys } from '@/enums'
import { jsonConfigParser } from '@/utils/data/parser'
import { fetchStrategyPrices } from '@/services/price/price-fetcher.service'

interface ApiResponse {
    configuration?: ConfigurationWithInstances
    error?: string
}

// Fetch a single configuration by ID
async function fetchConfigurationById(configurationId: string): Promise<ConfigurationWithInstances | null> {
    if (!configurationId) return null

    try {
        const response = await fetch(`${AppUrls.API_STRATEGIES}/${configurationId}`)

        if (!response.ok) {
            // Try fallback to fetching all and filtering (for backwards compatibility)
            const allResponse = await fetch(`${AppUrls.API_STRATEGIES}?limit=100&skip=0`)
            if (!allResponse.ok) {
                throw new Error(`Failed to fetch configuration: ${response.status}`)
            }

            const allData = await allResponse.json()
            const configuration = allData.configurations?.find((c: ConfigurationWithInstances) => c.id === configurationId)

            if (!configuration) {
                throw new Error('Configuration not found')
            }

            return configuration
        }

        const data = (await response.json()) as ApiResponse

        if (!data.configuration) {
            throw new Error('Invalid response format from API')
        }

        return data.configuration
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('An unexpected error occurred while fetching configuration')
    }
}

// Optimized hook that only fetches the specific configuration
export function useConfigurationById(configurationId: string | string[]) {
    // Handle array from useParams
    const id = Array.isArray(configurationId) ? configurationId[0] : configurationId

    const {
        data: configuration,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [ReactQueryKeys.STRATEGIES, 'single', id],
        queryFn: () => fetchConfigurationById(id),
        enabled: !!id,
        retry: (failureCount, error) => {
            // Don't retry on 404 errors
            if (error instanceof Error && error.message.includes('not found')) {
                return false
            }
            // Retry up to 2 times for other errors
            return failureCount < 2
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Less aggressive refetch for single configuration
        refetchInterval: 60000, // 1 minute
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        staleTime: 30000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    })

    // Parse configuration if available
    const parsedConfig = configuration ? jsonConfigParser(configuration.id, configuration.values) : null

    // Fetch price for this specific strategy
    const { data: priceData } = useQuery({
        queryKey: ['strategy-price', id],
        queryFn: async () => {
            if (!parsedConfig) return null

            const priceInputs = [
                {
                    baseSymbol: parsedConfig.base.symbol,
                    quoteSymbol: parsedConfig.quote.symbol,
                    priceFeedConfig: parsedConfig.execution.priceFeedConfig,
                    chainId: parsedConfig.chain.id,
                },
            ]

            const priceMap = await fetchStrategyPrices(priceInputs)
            const priceKey = `${parsedConfig.base.symbol}/${parsedConfig.quote.symbol}`
            return priceMap.get(priceKey) || 0
        },
        enabled: !!parsedConfig,
        refetchInterval: 30000, // 30 seconds for price updates
        staleTime: 15000, // 15 seconds
    })

    // Build strategy object with price
    const strategy = parsedConfig
        ? {
              ...parsedConfig,
              config: configuration,
              priceUsd: priceData || 0,
          }
        : null

    // Get instances from configuration
    const instances = configuration?.Instance || []

    // Calculate total trades count
    const totalTradesCount = instances.reduce((total, instance) => total + instance._count.Trade, 0)

    return {
        configuration,
        strategy,
        instances,
        totalTradesCount,
        isLoading,
        error,
        refetch,
        hasError: !!error || (!isLoading && !configuration),
    }
}
