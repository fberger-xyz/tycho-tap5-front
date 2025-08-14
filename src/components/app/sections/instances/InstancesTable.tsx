'use client'

import { InstancesTableHeaders, InstanceRow, LoadingInstanceRows } from './InstancesTableRow'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo } from 'react'
import { EnrichedInstance } from '@/types'

dayjs.extend(relativeTime)

// Simple rows without virtualization
const InstanceRows = memo(function InstanceRows({ data }: { data: EnrichedInstance[] }) {
    return (
        <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex flex-col gap-1 px-4 pb-2">
                {data.map((instance, index) => (
                    <InstanceRow key={instance.instance.id} data={instance} index={index} />
                ))}
            </div>
        </div>
    )
})

export function InstancesTable({ data, isLoading }: { data?: EnrichedInstance[]; isLoading?: boolean }) {
    return (
        <div className="w-full rounded-xl border border-milk-150 pt-4">
            <div className="overflow-x-auto">
                <div className="flex w-full min-w-[1420px] flex-col gap-2 overflow-hidden">
                    <InstancesTableHeaders />
                    {isLoading ? (
                        <LoadingInstanceRows />
                    ) : !data || data.length === 0 ? (
                        <div className="flex items-center justify-center rounded-lg bg-milk-50 px-3 py-8 text-transparent">
                            <p className="m-auto text-folly">No instances</p>
                        </div>
                    ) : (
                        <InstanceRows data={data} />
                    )}
                </div>
            </div>
        </div>
    )
}
