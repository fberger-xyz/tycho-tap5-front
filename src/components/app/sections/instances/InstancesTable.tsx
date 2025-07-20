'use client'

import { InstancesTableHeaders, InstanceRow, LoadingInstanceRows } from './InstancesTableRow'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual'
import { useRef, memo } from 'react'
import { EnrichedInstance } from '@/types'

dayjs.extend(relativeTime)

// Virtualized rows for performance
const InstanceRows = memo(function InstanceRows({
    data,
    virtualizer,
    parentRef,
}: {
    data: EnrichedInstance[]
    virtualizer: ReturnType<typeof useVirtualizer<HTMLDivElement, Element>>
    parentRef: React.RefObject<HTMLDivElement | null>
}) {
    return (
        <div ref={parentRef} className="max-h-[60vh] overflow-y-auto transition-all duration-200 ease-in-out">
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
                    const instance = data[virtualItem.index]
                    const isLast = virtualItem.index === data.length - 1
                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            className="px-4"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                                pointerEvents: 'auto',
                                paddingBottom: isLast ? 0 : 8, // Add 8px gap between rows
                            }}
                        >
                            <InstanceRow data={instance} index={virtualItem.index} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
})

export function InstancesTable({ data, isLoading }: { data?: EnrichedInstance[]; isLoading?: boolean }) {
    const parentRef = useRef<HTMLDivElement>(null)

    const virtualizer = useVirtualizer({
        count: data?.length || 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 68, // 60px for row + 8px for gap
        overscan: 8,
    })

    return (
        <div className="w-full border border-milk-150 py-4 rounded-xl">
            <div className="overflow-x-scroll">
                <div className="flex min-w-[1500px] w-full flex-col overflow-hidden gap-2">
                    <InstancesTableHeaders />
                    {isLoading ? (
                        <LoadingInstanceRows />
                    ) : !data || data.length === 0 ? (
                        <div className="bg-milk-50 px-3 rounded-lg text-transparent flex items-center justify-center py-8">
                            <p className="m-auto text-folly">No instances</p>
                        </div>
                    ) : (
                        <InstanceRows data={data} virtualizer={virtualizer} parentRef={parentRef} />
                    )}
                </div>
            </div>
        </div>
    )
}
