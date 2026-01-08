import { useEffect, useState } from 'react'
import { useStrategiesStore } from '@/stores/strategies.store'
import { useStrategies } from '@/hooks/fetchs/useStrategies'
import { groupByStrategies } from '@/utils'
import { fetchStrategyPrices } from '@/services/price/price-fetcher.service'
import type { Strategy } from '@/types'
import { showErrorToast, TOAST_MESSAGES } from '@/utils/toast.util'
import { logger } from '@/utils/logger.util'

export function useStrategiesWithStore() {
    const query = useStrategies()
    const store = useStrategiesStore()
    const [strategiesWithPrices, setStrategiesWithPrices] = useState<Strategy[]>([])
    const [pricesLoading, setPricesLoading] = useState(false)

    // sync react query data with zustand store
    useEffect(() => {
        if (query.strategies && query.strategies.length > 0 && store.isStale()) {
            store.setStrategies(query.configurations)
            store.markFetched()
        }
    }, [query.strategies, query.configurations, store])

    // fetch prices for all strategies
    useEffect(() => {
        if (!store.strategies || store.strategies.length === 0) {
            setStrategiesWithPrices([])
            return
        }

        // process strategies inside useEffect to avoid dependency issues
        const strategies = groupByStrategies(store.strategies)

        const fetchPrices = async () => {
            setPricesLoading(true)
            try {
                // prepare strategy data for price fetching
                const strategyPriceInputs = strategies.map((strategy) => ({
                    baseSymbol: strategy.base.symbol,
                    quoteSymbol: strategy.quote.symbol,
                    priceFeedConfig: strategy.config.execution.priceFeedConfig,
                    chainId: strategy.chainId,
                }))

                // fetch prices in batches
                const priceMap = await fetchStrategyPrices(strategyPriceInputs)

                // update strategies with fetched prices
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
                logger.error('Failed to fetch strategy prices', { error })

                // show a generic error toast
                showErrorToast(TOAST_MESSAGES.PRICE_FETCH_ERROR)

                // use strategies without prices as fallback
                setStrategiesWithPrices(strategies)
            } finally {
                setPricesLoading(false)
            }
        }

        fetchPrices()
    }, [store.strategies]) // re-fetch when strategies change

    // combined api
    return {
        // react query state
        data: store.strategies,
        configurations: store.strategies,
        strategies: strategiesWithPrices,
        isLoading: query.isLoading || pricesLoading,
        isError: query.hasError,
        error: query.error,
        refetch: query.refetch,
        isRefetching: query.isRefetching,
        hasError: query.hasError && (!store.strategies || store.strategies.length === 0),
        
        // zustand store methods
        getStrategyById: store.getStrategyById,
        getStrategiesByChain: store.getStrategiesByChain,
        getStrategiesByPair: store.getStrategiesByPair,
        getActiveStrategies: store.getActiveStrategies,
        
        // store state
        lastUpdated: store.lastFetch,
        isStale: store.isStale,
    } as const
}

// selector hook for specific strategy
export function useStrategy(id: string) {
    const store = useStrategiesStore()
    return store.getStrategyById(id)
}

// selector hook for strategies by chain
export function useStrategiesByChain(chainId: number) {
    const store = useStrategiesStore()
    return store.getStrategiesByChain(chainId)
}

// selector hook for strategies by pair
export function useStrategiesByPair(baseToken: string, quoteToken: string) {
    const store = useStrategiesStore()
    return store.getStrategiesByPair(baseToken, quoteToken)
}