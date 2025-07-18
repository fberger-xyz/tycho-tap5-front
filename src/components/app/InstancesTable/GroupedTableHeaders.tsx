'use client'

import { cn } from '@/utils'
import { InstanceRowLayout } from './InstancesTableRowLayout'
import { memo } from 'react'
import { FilterArrow } from './FilterArrow'
import { SupportedFilters } from '@/enums'
import { COLUMN_HEADERS } from './InstancesTableHeader'

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
 * Grouped Headers - Only shows instance details headers
 */
export const GroupedTableHeaders = memo(function GroupedTableHeaders() {
    return (
        <InstanceRowLayout className="pl-4 border-b border-milk-200 text-xs font-light">
            <HeaderCell className="col-span-4 justify-start">{COLUMN_HEADERS.instanceId}</HeaderCell>
            <HeaderCell className="col-span-1">{COLUMN_HEADERS.instanceStartedAt}</HeaderCell>
            <HeaderCell className="col-span-3">{COLUMN_HEADERS.instanceRunningTime}</HeaderCell>
            <HeaderCell className="col-span-1">{COLUMN_HEADERS.instanceStatus}</HeaderCell>
            <HeaderCell className="col-span-1">{COLUMN_HEADERS.instanceEndedAt}</HeaderCell>
            <HeaderCell className="col-span-1">{COLUMN_HEADERS.instanceTradeCount}</HeaderCell>
        </InstanceRowLayout>
    )
})
