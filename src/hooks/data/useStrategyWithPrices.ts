'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useStrategiesQuery } from './useStrategiesQuery'
import { groupByStrategies } from '@/utils'
import { fetchStrategyPrices } from '@/services/price/price-fetcher.service'

/**
 * Composite hook that combines strategies with their current prices
 * This replaces the complex useStrategies hook that mixed concerns
 */
export function useStrategyWithPrices() {
    const { data: configurations, ...queryState } = useStrategiesQuery()

    // Group configurations into strategies
    const strategies = useMemo(() => {
        if (!configurations) return []
        return groupByStrategies(configurations)
    }, [configurations])

    // Fetch prices for all strategies in parallel
    const priceQueries = useQueries({
        queries: strategies.map((strategy) => ({
            queryKey: ['strategy-price', strategy.base.symbol, strategy.quote.symbol, strategy.chainId],
            queryFn: async () => {
                const priceMap = await fetchStrategyPrices([
                    {
                        baseSymbol: strategy.base.symbol,
                        quoteSymbol: strategy.quote.symbol,
                        priceFeedConfig: strategy.config.execution.priceFeedConfig,
                        chainId: strategy.chainId,
                    },
                ])
                const priceKey = `${strategy.base.symbol}/${strategy.quote.symbol}`
                return priceMap.get(priceKey) || 0
            },
            staleTime: 30000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes
        })),
    })

    // Combine strategies with their prices
    const strategiesWithPrices = useMemo(() => {
        return strategies.map((strategy, index) => ({
            ...strategy,
            priceUsd: priceQueries[index]?.data || 0,
        }))
    }, [strategies, priceQueries])

    const isPricesLoading = priceQueries.some((q) => q.isLoading)
    const hasPriceError = priceQueries.some((q) => q.error)

    return {
        configurations,
        strategies: strategiesWithPrices,
        isLoading: queryState.isLoading || isPricesLoading,
        isRefetching: queryState.isRefetching,
        error: queryState.error || (hasPriceError ? new Error('Failed to fetch some prices') : null),
        refetch: queryState.refetch,
        hasError: queryState.isError,
    }
}
