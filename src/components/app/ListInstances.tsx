'use client'

import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import { shortenValue } from '@/utils'
import type { Configuration, Instance } from '@prisma/client'
import superjson from 'superjson'
import { getToken } from '@/tokens/list.token'
import { CHAINS_CONFIG } from '@/config/chains.config'
import { AppInstanceStatus } from '@/enums'
import { VirtualizedInstancesTable } from './InstancesTable/VirtualizedInstancesTable'
import { useAppStore } from '@/stores/app.store'
import { useRef } from 'react'

dayjs.extend(relativeTime)
dayjs.extend(duration)

type InstanceWithCounts = Instance & {
    _count: {
        Trade: number
        Price: number
    }
}

type ConfigurationWithInstances = Configuration & {
    Instance: InstanceWithCounts[]
}

async function fetchDashboardData(): Promise<ConfigurationWithInstances[]> {
    const response = await fetch('/api/dashboard')
    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
    }
    const text = await response.text()
    const data = superjson.parse<{ configurations: ConfigurationWithInstances[] }>(text)
    return data.configurations
}

export default function ListInstances() {
    const { refetchInstancesInterval, setConfigurations, getConfigurationsWithInstances } = useAppStore()

    const isFetchingRef = useRef(false)

    const { isLoading, error } = useQuery({
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

    if (error) {
        return (
            <div className="space-y-6">
                <p className="text-red-600">Error listing instances</p>
            </div>
        )
    }

    const configurationsWithInstances = getConfigurationsWithInstances()

    // Transform data for the new table format
    const tableData = configurationsWithInstances.flatMap((config) =>
        config.Instance.map((instance) => {
            const chainConfig = CHAINS_CONFIG[config.chainId]
            const chainName = chainConfig?.name || `Chain ${config.chainId}`
            const baseToken = getToken(config.chainId, config.baseTokenAddress)
            const quoteToken = getToken(config.chainId, config.quoteTokenAddress)
            return {
                chain: config.chainId.toString(),
                chainName: chainName,
                base: baseToken?.symbol || shortenValue(config.baseTokenAddress, 3),
                quote: quoteToken?.symbol || shortenValue(config.quoteTokenAddress, 3),
                configuration: {
                    id: shortenValue(config.id, 4),
                    createdAt: config.createdAt,
                },
                instance: {
                    id: instance.identifier || instance.id,
                    createdAt: instance.createdAt,
                    startedAt: instance.startedAt,
                    endedAt: instance.endedAt,
                    tradeCount: instance._count.Trade,
                    pricesCountCalled: instance._count.Price,
                    status: instance.endedAt ? AppInstanceStatus.STOPPED : AppInstanceStatus.RUNNING,
                },
            }
        }),
    )

    // Show loading state only on initial load when we don't have data
    const showLoading = isLoading && configurationsWithInstances.length === 0

    return (
        <div className="w-full">
            <VirtualizedInstancesTable data={tableData} isLoading={showLoading} />
        </div>
    )
}
