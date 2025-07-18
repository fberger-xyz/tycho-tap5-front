'use client'

import { cn } from '@/utils'
import { InstanceRowLayout, ConfigSection, InstanceDetailsSection, ChainAndPairSection } from '../shared/InstanceRowLayout'
import { memo } from 'react'

// Column headers for market maker dashboard
export const COLUMN_HEADERS = {
    chain: 'Chain',
    pair: 'Pair',
    configurationId: 'Config ID',
    configurationCreatedAt: 'Config Created',
    instanceId: 'Instance ID',
    instanceCreatedAt: 'Instance Created',
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

function HeaderCell({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex justify-center items-center h-full', className)}>
            <p className="py-3 font-medium opacity-60">{children}</p>
        </div>
    )
}

/**
 * Headers
 */

export const TableHeaders = memo(function TableHeaders() {
    return (
        <InstanceRowLayout className="border-b border-milk-200">
            {/* Pair section */}
            <ChainAndPairSection>
                <HeaderCell>{COLUMN_HEADERS.chain}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.pair}</HeaderCell>
            </ChainAndPairSection>

            {/* Config section */}
            <ConfigSection>
                <HeaderCell>{COLUMN_HEADERS.configurationId}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.configurationCreatedAt}</HeaderCell>
            </ConfigSection>

            {/* Instance Details section */}
            <InstanceDetailsSection>
                <HeaderCell>{COLUMN_HEADERS.instanceId}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceCreatedAt}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceStartedAt}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceRunningTime}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceStatus}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceEndedAt}</HeaderCell>
                <HeaderCell>{COLUMN_HEADERS.instanceTradeCount}</HeaderCell>
                {/* <HeaderCell>{COLUMN_HEADERS.instancePricesCountCalled}</HeaderCell> */}
            </InstanceDetailsSection>
        </InstanceRowLayout>
    )
})
