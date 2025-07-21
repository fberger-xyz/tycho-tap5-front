'use client'

import { ReactQueryKeys } from '@/enums'
import { useFetchData } from '@/hooks/useGenericFetch'

interface PriceData {
    id: string
    instanceId: string
    price: number
    timestamp: Date
}

export function usePricesData(instanceId?: string) {
    return useFetchData<PriceData[]>({
        queryKey: [ReactQueryKeys.PRICES, instanceId ?? ''],
        endpoint: `/api/prices?instanceId=${instanceId}`,
        enabled: !!instanceId,
        refetchInterval: 30000, // 30 seconds
    })
}
