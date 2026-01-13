import { useTradesStore } from '@/stores/trades.store'
import { useTradesForConfiguration } from '@/hooks/fetchs/useTradesForConfiguration'
import { useTradesForInstance } from '@/hooks/fetchs/useTradesForInstance'
import type { TradeWithInstanceAndConfiguration } from '@/types'
import { useEffect } from 'react'
import { logger } from '@/utils/logger.util'

interface UseTradesWithStoreOptions {
    configurationId?: string
    instanceId?: string
}

export function useTradesWithStore(options?: UseTradesWithStoreOptions) {
    const { configurationId, instanceId } = options || {}
    
    // get store methods
    const { setTrades, getTradesByConfiguration, getTradesByInstance, isStale, markFetched, setLoading, setError } = useTradesStore()
    
    // determine which hook to use
    const configQuery = useTradesForConfiguration({
        configurationId: configurationId || '',
        enabled: !!configurationId,
    })
    
    const instanceQuery = useTradesForInstance({
        instanceId: instanceId || '',
        enabled: !!instanceId && !configurationId,
    })
    
    // choose the active query
    const activeQuery = configurationId ? configQuery : instanceQuery
    const queryKey = configurationId ? `config-${configurationId}` : instanceId ? `instance-${instanceId}` : 'all'
    
    // sync with store
    useEffect(() => {
        if (!activeQuery.data || !activeQuery.isFetched) return
        
        const trades = activeQuery.data.data || []
        const isStaleData = isStale(queryKey)
        
        // update store if we have new data
        if (trades.length > 0 && isStaleData) {
            logger.info('Setting trades in store', { count: trades.length, queryKey })
            setTrades(trades as TradeWithInstanceAndConfiguration[], queryKey)
            markFetched(queryKey)
        } else if (!isStaleData) {
            logger.info('Found fresh trades in store', { queryKey, isStale: isStaleData })
        }
        
        // sync loading and error states
        setLoading(activeQuery.isFetching)
        setError(activeQuery.error?.message || null)
    }, [activeQuery.data, activeQuery.isFetched, activeQuery.isFetching, activeQuery.error, queryKey, isStale, markFetched, setError, setLoading, setTrades])
    
    // get cached data from store
    const cached = configurationId ? getTradesByConfiguration(configurationId) : instanceId ? getTradesByInstance(instanceId) : []

    // return combined data - prefer cache if available
    return {
        data: cached.length > 0 ? cached : activeQuery.data?.data || [],
        isLoading: activeQuery.isLoading,
        isFetching: activeQuery.isFetching,
        isError: activeQuery.isError,
        error: activeQuery.error,
        refetch: activeQuery.refetch,
    }
}

// helper hook to get a single trade from store
export function useTradeWithStore(tradeId: string) {
    const getTradeById = useTradesStore((state) => state.getTradeById)
    return getTradeById(tradeId)
}