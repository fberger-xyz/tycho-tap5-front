'use client'

import { cn } from '@/utils'
import { InstanceRowLayout, ConfigSection, InstanceDetailsSection, ChainAndPairSection } from './InstancesTableRowLayout'
import { memo } from 'react'
import { FilterArrow } from './FilterArrow'
import { SupportedFilters } from '@/enums'

// Column headers for market maker dashboard
export const COLUMN_HEADERS = {
    chain: 'Chain',
    pair: 'Pair',
    configurationId: 'Config ID',
    configurationCreatedAt: 'Config Created',
    instanceId: 'Instance ID',
    // instanceCreatedAt: 'Instance Created',
    instanceStartedAt: 'Started At',
    instanceRunningTime: 'Running Time',
    instanceStatus: 'Status',
    instanceEndedAt: 'Ended At',
    instanceTradeCount: 'Trade Count',
    instancePricesCountCalled: 'Prices Called',
} as const

/**
 * Header cell
 */

function HeaderCell({ children, className, filter }: { children: React.ReactNode; className?: string; filter?: SupportedFilters }) {
    if (filter) {
        return (
            <div className={cn('flex justify-center items-center h-full', className)}>
                <FilterArrow filter={filter} className="py-2 opacity-60 hover:opacity-100 transition-opacity">
                    {children}
                </FilterArrow>
            </div>
        )
    }

    return (
        <div className={cn('flex justify-center items-center h-full', className)}>
            <p className="py-3 opacity-60">{children}</p>
        </div>
    )
}

/**
 * Headers
 */

export const TableHeaders = memo(function TableHeaders() {
    return (
        <InstanceRowLayout className="border-b border-milk-200 text-xs font-light">
            {/* Pair section */}
            <ChainAndPairSection>
                <HeaderCell>{COLUMN_HEADERS.chain}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.pair}</HeaderCell>
            </ChainAndPairSection>

            {/* Config section */}
            <ConfigSection>
                <HeaderCell>{COLUMN_HEADERS.configurationId}</HeaderCell>
                <HeaderCell filter={SupportedFilters.CONFIGURATION_CREATED}>{COLUMN_HEADERS.configurationCreatedAt}</HeaderCell>
            </ConfigSection>

            {/* Instance Details section */}
            <InstanceDetailsSection>
                <HeaderCell>{COLUMN_HEADERS.instanceId}</HeaderCell>
                <HeaderCell filter={SupportedFilters.INSTANCE_STARTED}>{COLUMN_HEADERS.instanceStartedAt}</HeaderCell>
                <HeaderCell filter={SupportedFilters.RUNNING_TIME}>{COLUMN_HEADERS.instanceRunningTime}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceStatus}</HeaderCell>
                <HeaderCell filter={SupportedFilters.INSTANCE_ENDED}>{COLUMN_HEADERS.instanceEndedAt}</HeaderCell>
                <HeaderCell filter={SupportedFilters.TRADE_COUNT}>{COLUMN_HEADERS.instanceTradeCount}</HeaderCell>
            </InstanceDetailsSection>
        </InstanceRowLayout>
    )
})
