'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { apiClient } from '@/lib/api-client'

interface PriceData {
    id: string
    instanceId: string
    price: number
    timestamp: Date
}

/**
 * Clean hook for fetching price data
 */
export function usePricesQuery(instanceId?: string) {
    return useQuery<PriceData[]>({
        queryKey: [ReactQueryKeys.PRICES, instanceId || ''],
        queryFn: () => apiClient.prices.byInstance(instanceId!),
        enabled: !!instanceId,
        refetchInterval: 30000,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        staleTime: 10000,
        gcTime: 5 * 60 * 1000,
    })
}
