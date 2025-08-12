'use client'

import { useQuery } from '@tanstack/react-query'
import { ReactQueryKeys } from '@/enums'
import { apiClient } from '@/lib/api-client'
import type { ConfigurationWithInstances } from '@/types'

/**
 * Clean hook for fetching strategies/configurations
 * This replaces the complex useStrategies hook with a simpler approach
 */
export function useStrategiesQuery() {
    return useQuery<ConfigurationWithInstances[]>({
        queryKey: [ReactQueryKeys.STRATEGIES],
        queryFn: () => apiClient.strategies.list(),
        refetchInterval: 45000,
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        staleTime: 40000,
        gcTime: 5 * 60 * 1000,
    })
}

/**
 * Hook for fetching a single configuration by ID
 */
export function useStrategyQuery(configurationId: string) {
    const { data: configurations, ...rest } = useStrategiesQuery()

    const configuration = configurations?.find((c) => c.id === configurationId)

    return {
        data: configuration,
        ...rest,
    }
}
