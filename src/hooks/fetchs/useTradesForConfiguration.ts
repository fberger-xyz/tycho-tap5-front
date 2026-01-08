import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/utils/logger.util'

interface UseTradesForConfigurationOptions {
    configurationId: string
    enabled?: boolean
}

export function useTradesForConfiguration({ configurationId, enabled = true }: UseTradesForConfigurationOptions) {
    return useQuery({
        queryKey: ['trades', 'configuration', configurationId],
        queryFn: async () => {
            try {
                logger.info('Fetching trades for configuration', { configurationId })
                const response = await apiClient.trades.list({ configurationId })
                logger.info('Trades fetched', { configurationId, count: response.length })
                return { success: true, data: response }
            } catch (error) {
                logger.error('Failed to fetch trades', { error, configurationId })
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    data: []
                }
            }
        },
        refetchInterval: 5000, // 5 seconds
        enabled: enabled && !!configurationId,
    })
}