'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'

interface PriceData {
    id: string
    instanceId: string
    price: number
    timestamp: Date
}

async function fetchPrices(instanceId: string): Promise<PriceData[]> {
    const response = await fetch(`/api/prices?instanceId=${instanceId}`)
    if (!response.ok) {
        throw new Error('Failed to fetch prices')
    }
    return response.json()
}

export function usePricesData(instanceId?: string) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [ReactQueryKeys.PRICES, instanceId],
        queryFn: () => fetchPrices(instanceId!),
        enabled: !!instanceId,
        refetchInterval: 30000, // 30 seconds
        refetchOnWindowFocus: true,
    })

    return {
        data: data || [],
        isLoading,
        error,
        refetch,
    }
}
