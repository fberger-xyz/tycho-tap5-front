'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { apiClient } from '@/lib/api-client'
import type { TradeWithInstanceAndConfiguration } from '@/types'

interface UseTradesQueryParams {
    configurationId?: string
    instanceId?: string
    limit?: number
}

/**
 * Clean hook for fetching trades
 */
export function useTradesQuery({ configurationId, instanceId, limit = 100 }: UseTradesQueryParams = {}) {
    return useQuery<TradeWithInstanceAndConfiguration[]>({
        queryKey: instanceId ? [ReactQueryKeys.TRADES, 'instance', instanceId] : [ReactQueryKeys.TRADES, configurationId],
        queryFn: () => apiClient.trades.list({ configurationId, instanceId, limit }),
        enabled: instanceId ? !!instanceId : true,
        refetchInterval: 5000,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        staleTime: 2000,
        gcTime: 5 * 60 * 1000,
    })
}
