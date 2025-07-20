'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import superjson from 'superjson'
import type { ConfigurationWithInstances } from '@/types'
import { useAppStore } from '@/stores/app.store'
import { ReactQueryKeys } from '@/enums'

async function fetchDashboardData(): Promise<ConfigurationWithInstances[]> {
    const response = await fetch('/api/dashboard')
    if (!response.ok) throw new Error('Failed to fetch dashboard data')
    const text = await response.text()
    const data = superjson.parse<{ configurations: ConfigurationWithInstances[] }>(text)
    return data.configurations
}

export function useInstancesData() {
    const { refetchInstancesInterval, setConfigurations } = useAppStore()
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [ReactQueryKeys.INSTANCES],
        queryFn: fetchDashboardData,
        refetchInterval: refetchInstancesInterval,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
    })

    // Update store when data changes, but only in an effect to avoid render cycle
    useEffect(() => {
        if (data) {
            setConfigurations(data)
        }
    }, [data, setConfigurations])

    return {
        configurations: data || [],
        isLoading,
        error,
        refetch,
    }
}
