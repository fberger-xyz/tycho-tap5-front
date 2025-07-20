'use client'

import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import superjson from 'superjson'
import type { ConfigurationWithInstances } from '@/types'
import { useAppStore } from '@/stores/app.store'

async function fetchDashboardData(): Promise<ConfigurationWithInstances[]> {
    const response = await fetch('/api/dashboard')
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
    }
    const text = await response.text()
    const data = superjson.parse<{ configurations: ConfigurationWithInstances[] }>(text)
    return data.configurations
}

export function useInstancesData() {
    const { refetchInstancesInterval, setConfigurations } = useAppStore()
    const isFetchingRef = useRef(false)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['instances'],
        queryFn: async () => {
            if (isFetchingRef.current) return null

            try {
                isFetchingRef.current = true
                const fetchedConfigurations = await fetchDashboardData()

                if (fetchedConfigurations) {
                    setConfigurations(fetchedConfigurations)
                }

                return fetchedConfigurations
            } catch (error) {
                console.error('Error fetching instances:', error)
                throw error
            } finally {
                isFetchingRef.current = false
            }
        },
        enabled: !isFetchingRef.current,
        refetchInterval: refetchInstancesInterval,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
    })

    return {
        configurations: data || [],
        isLoading,
        error,
        refetch,
    }
}
