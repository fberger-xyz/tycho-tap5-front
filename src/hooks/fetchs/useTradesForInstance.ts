import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/utils/logger.util'

interface UseTradesForInstanceOptions {
    instanceId: string
    enabled?: boolean
}

export function useTradesForInstance({ instanceId, enabled = true }: UseTradesForInstanceOptions) {
    return useQuery({
        queryKey: ['trades', 'instance', instanceId],
        queryFn: async () => {
            try {
                logger.info('Fetching trades for instance', { instanceId })
                const response = await apiClient.trades.list({ instanceId })
                logger.info('Trades fetched', { instanceId, count: response.length })
                return { success: true, data: response }
            } catch (error) {
                logger.error('Failed to fetch trades', { error, instanceId })
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    data: []
                }
            }
        },
        refetchInterval: 5000, // 5 seconds
        enabled: enabled && !!instanceId,
    })
}