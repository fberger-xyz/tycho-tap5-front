'use client'

import { SectionLayout } from '@/components/app/sections/SectionLayout'
import IconWrapper from '@/components/icons/IconWrapper'
import { IconIds } from '@/enums'
import { useAppStore } from '@/stores/app.store'
import { InstancesTable } from '@/components/app/sections/instances/InstancesTable'
import { useInstancesData } from '@/hooks/fetchs/useInstancesData'
import { useMemo } from 'react'
import { enrichInstanceWithConfig, sortInstances } from '@/utils'
import { useUrlFilters } from '@/hooks/useUrlFilters'
const TITLE = 'Instances'
const DESCRIPTION = 'All instances'

function ListInstances() {
    const { isLoading, error } = useInstancesData()
    const { getConfigurationsWithInstances, instancesSortedBy, instancesSortedByFilterDirection } = useAppStore()
    const { matchesFilters } = useUrlFilters()

    const configurationsWithInstances = getConfigurationsWithInstances()

    // Apply sorting to configurations
    const sortedConfigurations = sortInstances(configurationsWithInstances, instancesSortedBy, instancesSortedByFilterDirection)

    // Transform data for the table format
    const tableData = useMemo(() => {
        // Enrich data with config
        const allData = sortedConfigurations.flatMap((config) => config.Instance.map((instance) => enrichInstanceWithConfig(instance, config)))

        // Apply URL filters
        return allData
        return allData.filter((item) => matchesFilters({ chainId: item.chainId, baseSymbol: item.baseSymbol, quoteSymbol: item.quoteSymbol }))
    }, [sortedConfigurations, matchesFilters])

    // Show loading state only on initial load when we don't have data
    const showLoading = isLoading && configurationsWithInstances.length === 0

    if (error) {
        return (
            <div className="w-full border border-red-200 bg-red-50 p-4 rounded-xl">
                <p className="text-red-600 text-sm">Failed to load instances. Please try again later.</p>
            </div>
        )
    }

    return <InstancesTable data={tableData} isLoading={showLoading} />
}

export default function InstancesSection() {
    const { showInstancesSection, setShowInstancesSection } = useAppStore()

    return (
        <SectionLayout
            title={
                <div className="w-full flex justify-between">
                    <button
                        onClick={() => setShowInstancesSection(!showInstancesSection)}
                        className="flex gap-1 items-center rounded-lg px-2.5 py-1.5 hover:bg-milk-100 transition-colors duration-300 -ml-1 w-fit"
                        aria-expanded={showInstancesSection}
                        aria-label={`${showInstancesSection ? 'Collapse' : 'Expand'} instances section`}
                    >
                        <p className="text-milk text-base font-semibold">{TITLE}</p>
                        <IconWrapper id={showInstancesSection ? IconIds.TRIANGLE_UP : IconIds.TRIANGLE_DOWN} className="size-5" />
                    </button>
                </div>
            }
            content={
                showInstancesSection ? (
                    <div className="flex flex-col gap-2">
                        <p className="text-milk-400">{DESCRIPTION}</p>
                        <ListInstances />
                    </div>
                ) : null
            }
        />
    )
}
