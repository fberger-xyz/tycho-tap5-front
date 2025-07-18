'use client'

import { TableHeaders } from './InstancesTableHeader'
import { InstanceRow } from './InstancesTableRow'
import { LoadingRows } from './InstancesTableLoadingRow'
import { GroupedInstancesView } from './GroupedInstancesView'
import { DisplayModeToggle } from './DisplayModeToggle'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { getDurationBetween } from '@/utils'
import { AppInstanceStatus, InstanceDisplayMode } from '@/enums'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import { useRef, useMemo, memo } from 'react'
import { useAppStore } from '@/stores/app.store'

dayjs.extend(relativeTime)

interface InstanceData {
    chain: string
    chainName?: string
    base: string
    quote: string
    configuration: {
        id: string
        createdAt: Date | string
    }
    instance: {
        id: string
        createdAt: Date | string
        startedAt: Date | string
        endedAt?: Date | string | null
        tradeCount: number
        pricesCountCalled: number
        status?: AppInstanceStatus
    }
}

interface FormattedRow extends InstanceData {
    formattedConfiguration: {
        id: string
        createdAt: string
    }
    formattedInstance: {
        id: string
        createdAt: string
        startedAt: string
        runningTime: string
        status: AppInstanceStatus
        endedAt?: string
        tradeCount: number
        pricesCountCalled: number
    }
}

// Memoized table content to prevent unnecessary re-renders (virtualized for list view)
const InstanceRows = memo(function InstanceRows({
    rows,
    virtualizer,
    parentRef,
}: {
    rows: FormattedRow[]
    virtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>
    parentRef: React.RefObject<HTMLDivElement | null>
}) {
    return (
        <div ref={parentRef} className="max-h-[70vh] overflow-y-auto transition-all duration-200 ease-in-out">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
                    const row = rows[virtualItem.index]
                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            <InstanceRow
                                chain={row.chain}
                                base={row.base}
                                quote={row.quote}
                                configuration={row.formattedConfiguration}
                                instance={row.formattedInstance}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

const EmptyState = memo(function EmptyState({ message }: { message: string }) {
    return (
        <div className="overflow-hidden transition-all duration-200">
            <div className="flex h-32 w-full items-center justify-center p-2">
                <div className="flex size-full items-center justify-center rounded-xl bg-milk-100">
                    <p className="m-auto text-sm text-milk">{message}</p>
                </div>
            </div>
        </div>
    )
})

export function InstancesTable({ data, isLoading }: { data?: InstanceData[]; isLoading?: boolean }) {
    const parentRef = useRef<HTMLDivElement>(null)
    const { instanceDisplayMode } = useAppStore()

    // Transform data to include formatted values (only used in list view)
    const rows = useMemo((): FormattedRow[] => {
        if (!data || data.length === 0) return []

        return data.map((row): FormattedRow => {
            const startTime = new Date(row.instance.startedAt).getTime()
            const endTime = row.instance.endedAt ? new Date(row.instance.endedAt).getTime() : Date.now()
            const runningTime = getDurationBetween({ startTs: startTime, endTs: endTime }).oneLiner

            return {
                ...row,
                formattedConfiguration: {
                    id: row.configuration.id,
                    createdAt: dayjs(row.configuration.createdAt).format('MMM D, HH:mm'),
                },
                formattedInstance: {
                    id: row.instance.id,
                    createdAt: dayjs(row.instance.createdAt).format('MMM D, HH:mm'),
                    startedAt: dayjs(row.instance.startedAt).format('MMM D, HH:mm'),
                    runningTime,
                    status: row.instance.status || (row.instance.endedAt ? AppInstanceStatus.STOPPED : AppInstanceStatus.RUNNING),
                    endedAt: row.instance.endedAt ? dayjs(row.instance.endedAt).format('MMM D, HH:mm') : undefined,
                    tradeCount: row.instance.tradeCount,
                    pricesCountCalled: row.instance.pricesCountCalled,
                },
            }
        })
    }, [data])

    // Virtualizer is only used for list view (not for grouped view)
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50, // Row height
        overscan: 8, // More overscan for smoother scrolling
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex justify-end px-4">
                <DisplayModeToggle />
            </div>

            <div className="overflow-x-scroll px-4">
                <div className="flex min-w-[1200px] w-full flex-col overflow-hidden bg-milk-50 border-milk-200 text-xs">
                    {isLoading ? (
                        <>
                            <TableHeaders />
                            <LoadingRows />
                        </>
                    ) : !data || data.length === 0 ? (
                        <>
                            <TableHeaders />
                            <EmptyState message="No instances found" />
                        </>
                    ) : instanceDisplayMode === InstanceDisplayMode.GROUPED ? (
                        <GroupedInstancesView data={data} />
                    ) : (
                        <>
                            <TableHeaders />
                            <InstanceRows rows={rows} virtualizer={virtualizer} parentRef={parentRef} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
