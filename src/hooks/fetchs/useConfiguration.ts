'use client'

import { useMemo } from 'react'
import { useStrategies } from './useStrategies'

export function useConfiguration(configurationId: string | string[]) {
    const { configurations, isLoading, error, refetch } = useStrategies()

    // Handle array from useParams
    const id = Array.isArray(configurationId) ? configurationId[0] : configurationId

    const configuration = useMemo(() => {
        if (!configurations || !id) return null
        return configurations.find((config) => config.id === id) || null
    }, [configurations, id])

    // Get all instances across all configurations for this strategy
    const instances = useMemo(() => {
        if (!configuration) return []
        return configuration.Instance || []
    }, [configuration])

    // Calculate total trades count
    const totalTradesCount = useMemo(() => {
        return instances.reduce((total, instance) => total + instance._count.Trade, 0)
    }, [instances])

    return {
        configuration,
        instances,
        totalTradesCount,
        isLoading,
        error,
        refetch,
        hasError: !!error || (!isLoading && !configuration),
    }
}
