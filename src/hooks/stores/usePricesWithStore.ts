import { useEffect } from 'react'
import { usePricesStore } from '@/stores/prices.store'
import { usePricesData } from '@/hooks/fetchs/usePricesData'

export function usePricesWithStore(instanceId: string) {
    const store = usePricesStore()
    
    // get prices data
    const { prices, isLoading, error } = usePricesData(instanceId)
    
    // sync with store
    useEffect(() => {
        if (!instanceId) return
        
        if (isLoading) {
            store.setLoading(instanceId, true)
        } else {
            store.setLoading(instanceId, false)
        }
        
        if (error) {
            store.setError(instanceId, error.message)
        } else {
            store.setError(instanceId, null)
        }
        
        if (prices && prices.length > 0) {
            store.setPrices(instanceId, prices)
            store.markFetched(instanceId)
        }
    }, [instanceId, prices, isLoading, error, store])
    
    // return combined data
    return {
        prices: store.getPricesByInstance(instanceId),
        latestPrice: store.getLatestPrice(instanceId),
        isLoading: store.isLoading.get(instanceId) || false,
        error: store.error.get(instanceId) || null,
        isStale: store.isStale(instanceId),
    }
}

// selector hook for latest price
export function usePriceWithStore(instanceId: string) {
    const store = usePricesStore()
    return store.getLatestPrice(instanceId)
}

// selector hook for price history
export function usePriceHistory(instanceId: string, from: Date, to: Date) {
    const store = usePricesStore()
    return store.getPriceRange(instanceId, from, to)
}

// selector hook for average price
export function useAveragePrice(instanceId: string, periods: number) {
    const store = usePricesStore()
    return store.getMovingAverage(instanceId, periods)
}

// selector hook for price volatility
export function usePriceVolatility(instanceId: string, periods: number) {
    const store = usePricesStore()
    return store.getVolatility(instanceId, periods)
}